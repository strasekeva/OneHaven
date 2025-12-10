require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');
const fs = require('fs');
const cors = require('cors');
//const { connectRabbitMQ, sendToQueue, startQueueListener, broadcastToClients } = require("./rabbitmq.js");

const app = express();
const port = 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Poveži RabbitMQ ob zagonu strežnika
//connectRabbitMQ();

let lastDeviceStates = null;

// Povezava z MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Povezava z MongoDB uspešna.'))
  .catch(err => console.error('Napaka pri povezavi z MongoDB:', err));

// Tajni ključ za JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tajni_kljuc';

// Shema in model za uporabnike
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    geslo: { type: String, required: true },
    ime: {type: String, required: true},
    priimek: {type: String, required: true},
    isAdmin: { type: Boolean, default: false }, // Novo polje za administratorske pravice
});
const User = mongoose.model('User', userSchema, 'users'); // Zbirka 'users'

// Shema in model za rezervacije
const reservationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    price: { type: Number, required: true }, // Dodano polje za ceno rezervacije
    createdAt: { type: Date, default: Date.now },
  });
  
const Reservation = mongoose.model('Reservation', reservationSchema, 'reservations'); // Zbirka 'reservations'

// Middleware za preverjanje JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Ni avtorizacije' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Neveljaven token' });
    }
};

// API za shranjevanje stanj naprav
app.post('/api/naprave/stanja', (req, res) => {
    try {
        console.log('Prejeti podatki:', JSON.stringify(req.body, null, 2));
      const { reservationId, rooms } = req.body;
  
      if (!reservationId || reservationId.trim() === '') {
        return res.status(400).json({ message: 'Manjka reservationId.' });
      }
      if (!rooms || rooms.length === 0) {
        return res.status(400).json({ message: 'Manjka seznam prostorov (rooms).' });
      }
  
      // Shranimo podatke v spomin strežnika
      lastDeviceStates = {
        reservationId,
        rooms,
        updatedAt: new Date(),
      };
  
      res.status(201).json({ message: 'Podatki o napravah uspešno shranjeni.' });
    } catch (err) {
      console.error('Napaka pri shranjevanju podatkov:', err);
      res.status(500).json({ message: 'Napaka pri shranjevanju podatkov.' });
    }
  });

// API za pridobivanje stanj naprav glede na ID rezervacije
app.get('/api/naprave/stanja/:reservationId',  (req, res) => {
    try {
      const { reservationId } = req.params;
  
      // Preverimo, ali so podatki na voljo
      if (!lastDeviceStates || lastDeviceStates.reservationId !== reservationId) {
        return res.status(404).json({ message: 'Ni shranjenih podatkov za to rezervacijo.' });
      }
  
      // Vrni podatke za rezervacijo
      res.status(200).json(lastDeviceStates);
    } catch (err) {
      console.error('Napaka pri pridobivanju podatkov:', err);
      res.status(500).json({ message: 'Napaka pri pridobivanju podatkov.' });
    }
  });
  

// API za registracijo uporabnika
app.post('/api/uporabniki/register', async (req, res) => {
    try {
        const { email, geslo, ime, priimek } = req.body;

        // Preveri, ali uporabnik že obstaja
        const obstaja = await User.findOne({ email });
        if (obstaja) {
            return res.status(400).json({ message: 'Uporabnik že obstaja.' });
        }

        // Hashiraj geslo
        const hashedPassword = await bcrypt.hash(geslo, 10);

        // Shrani novega uporabnika
        const noviUporabnik = new User({ email, geslo: hashedPassword, ime, priimek });
        await noviUporabnik.save();

        res.status(201).json({ message: 'Registracija uspešna.' });
    } catch (err) {
        console.error('Napaka pri registraciji:', err);
        res.status(500).json({ message: 'Napaka pri registraciji.' });
    }
});

// API za prijavo uporabnika
app.post('/api/uporabniki/login', async (req, res) => {
    try {
        const { email, geslo } = req.body;

        // Preveri uporabnika v bazi
        const uporabnik = await User.findOne({ email });
        if (!uporabnik) {
            return res.status(401).json({ message: 'Neveljavna prijava.' });
        }

        // Preveri geslo
        const validPassword = await bcrypt.compare(geslo, uporabnik.geslo);
        if (!validPassword) {
            return res.status(401).json({ message: 'Neveljavna prijava.' });
        }

        // Ustvari JWT
        const token = jwt.sign({ id: uporabnik._id, email: uporabnik.email, isAdmin: uporabnik.isAdmin, }, JWT_SECRET, { expiresIn: '1h' });

        // Če je uporabnik admin, zaženemo poslušalca
    if (uporabnik.isAdmin) {
        await startQueueListener(broadcastToClients);
      }

        res.status(200).json({ message: 'Prijava uspešna.', token });
    } catch (err) {
        console.error('Napaka pri prijavi:', err);
        res.status(500).json({ message: 'Napaka pri prijavi.' });
    }
});

// API za pridobivanje informacij o trenutno prijavljenem uporabniku
app.get('/api/uporabniki/me', authenticate, async (req, res) => {
    try {
      // Pridobimo podatke o uporabniku na podlagi ID-ja iz JWT
      const user = await User.findById(req.user.id).select('-geslo'); // Izključimo geslo iz odziva
      if (!user) {
        return res.status(404).json({ message: 'Uporabnik ni najden.' });
      }
      res.status(200).json(user);
    } catch (err) {
      console.error('Napaka pri pridobivanju podatkov o uporabniku:', err);
      res.status(500).json({ message: 'Napaka pri pridobivanju podatkov o uporabniku.' });
    }
  });

// API za shranjevanje rezervacij
app.post('/api/rezervacije', authenticate, async (req, res) => {
    try {
      const { checkIn, checkOut, adults, children } = req.body;
  
      if (!checkIn || !checkOut || !adults) {
        return res.status(400).json({ message: 'Manjkajo obvezni podatki za rezervacijo.' });
      }
  
      // Preverimo, če je datum veljaven
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (checkInDate >= checkOutDate) {
        return res.status(400).json({ message: 'Datum odhoda mora biti po datumu prihoda.' });
      }
  
      // Izračun trajanja bivanja (število dni)
      const durationInDays = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );
  
      // Izračun cene
      const pricePerAdultPerNight = 50; // Cena za odraslo osebo na noč
      const pricePerChildPerNight = 25; // Cena za otroka na noč
      const totalPrice =
        durationInDays * (adults * pricePerAdultPerNight + children * pricePerChildPerNight);
  
      // Ustvarimo novo rezervacijo
      const newReservation = new Reservation({
        userId: req.user.id, // ID prijavljenega uporabnika iz JWT
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults,
        children,
        price: totalPrice, // Shrani izračunano ceno
      });
  
      await newReservation.save();

      // Debugging: logirajte podatke, ki jih pošiljate
    const reservationMessage = {
        reservationId: newReservation._id,
        userId: req.user.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults,
        children,
        price: totalPrice,
      };
  
      console.log('Sporočilo poslano v RabbitMQ:', reservationMessage);
  
      // Pošljite podatke v RabbitMQ
      //await sendToQueue(reservationMessage);
  
  
      res.status(201).json({ message: 'Rezervacija uspešno shranjena.', reservation: newReservation });
    } catch (err) {
      console.error('Napaka pri shranjevanju rezervacije:', err);
      res.status(500).json({ message: 'Napaka pri shranjevanju rezervacije.' });
    }
  });

  app.get("/api/rezervacije/zasedeni-datumi", async (req, res) => {
    try {
      const reservations = await Reservation.find({});
      const occupiedDates = [];
  
      reservations.forEach((reservation) => {
        const currentDate = new Date(reservation.checkIn);
        const endDate = new Date(reservation.checkOut);
  
        while (currentDate <= endDate) {
          occupiedDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1); // Premaknemo na naslednji dan
        }
      });
  
      res.status(200).json(occupiedDates);
    } catch (err) {
      console.error("Napaka pri pridobivanju zasedenih datumov:", err);
      res.status(500).json({ message: "Napaka pri pridobivanju zasedenih datumov." });
    }
  });

// Middleware za preverjanje, ali je uporabnik admin
const checkAdmin = (req, res, next) => {
  // Preveri, ali je uporabnik avtenticiran
  if (!req.user) {
      return res.status(401).json({ message: 'Dostop zavrnjen. Najprej se prijavite.' });
  }

  // Preveri, ali ima uporabnik administratorske pravice
  if (!req.user.isAdmin) {
    console.log("nimaš dostopa")
      return res.status(403).json({ message: 'Dostop zavrnjen. Samo administratorji imajo dostop.' });
  }

  // Uporabnik je administrator, nadaljuj z naslednjo funkcijo
  next();
};


// API za pridobivanje vseh rezervacij (samo za admina)
app.get('/api/admin/rezervacije', authenticate, checkAdmin, async (req, res) => {
  try {
      // Pridobimo vse rezervacije in povežemo podatke o uporabniku
      const reservations = await Reservation.find().populate('userId', 'ime email priimek');

      res.status(200).json(reservations);
  } catch (err) {
      console.error('Napaka pri pridobivanju vseh rezervacij:', err);
      res.status(500).json({ message: 'Napaka pri pridobivanju vseh rezervacij.' });
  }
});

// API za pridobivanje uporabnikovih rezervacij
app.get('/api/rezervacije', authenticate, async (req, res) => {
    try {
        const reservations = await Reservation.find({ userId: req.user.id });
        res.status(200).json(reservations);
    } catch (err) {
        console.error('Napaka pri pridobivanju rezervacij:', err);
        res.status(500).json({ message: 'Napaka pri pridobivanju rezervacij.' });
    }
});

// API za pridobivanje podatkov o gostilnah
app.get('/api/gostilne', (req, res) => {
    try {
        if (!fs.existsSync('gostisce_data.json')) {
            return res.status(404).json({ message: 'Podatki niso na voljo' });
        }

        const data = fs.readFileSync('gostisce_data.json', 'utf-8');
        res.status(200).json(JSON.parse(data));
    } catch (error) {
        console.error('Napaka pri branju podatkov:', error);
        res.status(500).json({ message: 'Napaka pri branju podatkov' });
    }
});

// API za scraping gostiln
app.post('/api/gostilne/scrape', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://www.visit-sevnica.com/kulinarika-ponudba.html', {
            waitUntil: 'domcontentloaded',
        });

        const mainLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article .bg a')).map((el) => el.href);
        });

        const results = [];
        const processedUrls = new Set();

        for (const mainLink of mainLinks) {
            await page.goto(mainLink, { waitUntil: 'domcontentloaded' });

            const detailLinks = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('article .bg a')).map((el) => el.href);
            });

            for (const detailLink of detailLinks) {
                if (processedUrls.has(detailLink)) continue;

                await page.goto(detailLink, { waitUntil: 'domcontentloaded' });

                const hasDetails = await page.$('.col-md-4');
                if (!hasDetails) continue;

                const data = await page.evaluate(() => {
                    const name = document.querySelector('h1')?.innerText || 'Ni imena';
                    const location = document.querySelector('.col-md-4 p')?.innerText || 'Ni lokacije';
                    const contact = document.querySelector('.col-md-4 ul.contact-info a')?.innerText || 'Ni kontakta';
                    const imageUrl = document.querySelector('div.col-md-12 img')?.src || 'Ni slike';

                    return { name, location, contact, imageUrl };
                });

                results.push(data);
                processedUrls.add(detailLink);
            }
        }

        fs.writeFileSync('gostisce_data.json', JSON.stringify(results, null, 2));
        res.status(201).json(results);
    } catch (err) {
        console.error('Napaka pri scraping-u:', err);
        res.status(500).json({ message: 'Napaka pri scraping-u.' });
    }
});

// Zaženemo strežnik
app.listen(port, () => console.log(`Strežnik zagnan na http://localhost:${port}`));