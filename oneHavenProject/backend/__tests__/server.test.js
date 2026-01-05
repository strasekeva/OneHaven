const path = require('path');
const fs = require('fs');
const request = require('supertest');

// poskrbimo, da se server ne bo dejansko zagnal
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';

// POZOR: pred importom nastavimo env, da se connect zgodi na test DB
process.env.MONGODB_URI = process.env.MONGODB_URI;

const { app, User, Reservation } = require('../server');

describe('API: naprave (device states)', () => {
  test('POST /api/naprave/stanja shrani stanje naprav', async () => {
    const res = await request(app)
      .post('/api/naprave/stanja')
      .send({
        reservationId: 'res123',
        rooms: [
          { name: 'Kuhinja', devices: [{ type: 'light', state: 'on' }] }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/uspešno shranjeni/i);
  });

  test('POST /api/naprave/stanja brez reservationId vrne 400', async () => {
    const res = await request(app)
      .post('/api/naprave/stanja')
      .send({
        rooms: [{ name: 'Dnevna', devices: [] }]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/reservationId/i);
  });

  test('POST /api/naprave/stanja brez rooms vrne 400', async () => {
    const res = await request(app)
      .post('/api/naprave/stanja')
      .send({
        reservationId: 'res123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/rooms/i);
  });

  test('GET /api/naprave/stanja/:id vrne 404, če ni podatkov', async () => {
    const res = await request(app).get('/api/naprave/stanja/neobstojec');
    expect(res.statusCode).toBe(404);
  });
});

describe('API: uporabniki (register + login + me)', () => {
  let testUserEmail = `testuser_${Date.now()}@example.com`;
  let token;

  test('POST /api/uporabniki/register registrira novega uporabnika', async () => {
    const res = await request(app)
      .post('/api/uporabniki/register')
      .send({
        email: testUserEmail,
        geslo: 'Geslo123!',
        ime: 'Test',
        priimek: 'Uporabnik'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Registracija uspešna/i);
  });

  test('POST /api/uporabniki/register z istim emailom vrne 400', async () => {
    const res = await request(app)
      .post('/api/uporabniki/register')
      .send({
        email: testUserEmail,
        geslo: 'Geslo123!',
        ime: 'Test',
        priimek: 'Uporabnik'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Uporabnik že obstaja/i);
  });

  test('POST /api/uporabniki/login z napačnim geslom vrne 401', async () => {
    const res = await request(app)
      .post('/api/uporabniki/login')
      .send({
        email: testUserEmail,
        geslo: 'napačno'
      });

    expect(res.statusCode).toBe(401);
  });

  test('POST /api/uporabniki/login z veljavnimi podatki vrne token', async () => {
    const res = await request(app)
      .post('/api/uporabniki/login')
      .send({
        email: testUserEmail,
        geslo: 'Geslo123!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('GET /api/uporabniki/me vrne podatke o prijavljenem uporabniku', async () => {
    const res = await request(app)
      .get('/api/uporabniki/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUserEmail);
    expect(res.body.geslo).toBeUndefined(); // ker select('-geslo')
  });
});

describe('API: rezervacije', () => {
  let token;
  let userId;

  // ustvarimo novega uporabnika + token samo za te teste
  beforeAll(async () => {
    const email = `rez_test_${Date.now()}@example.com`;
    await request(app)
      .post('/api/uporabniki/register')
      .send({
        email,
        geslo: 'Geslo123!',
        ime: 'Rez',
        priimek: 'Test'
      });

    const loginRes = await request(app)
      .post('/api/uporabniki/login')
      .send({ email, geslo: 'Geslo123!' });

    token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/uporabniki/me')
      .set('Authorization', `Bearer ${token}`);

    userId = meRes.body._id;
  });

  test('POST /api/rezervacije z neveljavnimi datumi vrne 400', async () => {
    const res = await request(app)
      .post('/api/rezervacije')
      .set('Authorization', `Bearer ${token}`)
      .send({
        checkIn: '2025-01-10',
        checkOut: '2025-01-05',
        adults: 2,
        children: 1
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Datum odhoda/i);
  });

  test('POST /api/rezervacije ustvari rezervacijo in izračuna ceno', async () => {
    const res = await request(app)
      .post('/api/rezervacije')
      .set('Authorization', `Bearer ${token}`)
      .send({
        checkIn: '2025-01-01',
        checkOut: '2025-01-04', // 3 noči
        adults: 2,
        children: 1
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.reservation).toBeDefined();

    const reservation = res.body.reservation;
    expect(reservation.price).toBe(3 * (2 * 50 + 1 * 25)); // 3 * (100 + 25) = 375
  });

  test('GET /api/rezervacije vrne rezervacije prijavljenega uporabnika', async () => {
    const res = await request(app)
      .get('/api/rezervacije')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // vsaj ena rezervacija bi morala obstajati
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/rezervacije/zasedeni-datumi vrne seznam datumov', async () => {
    const res = await request(app).get('/api/rezervacije/zasedeni-datumi');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('API: gostilne (branje iz lokalne datoteke)', () => {
  const scrapingDir = path.join(__dirname, '..', 'scraping');
  const dataFile = path.join(scrapingDir, 'gostisce_data.json');

  beforeAll(() => {
    if (!fs.existsSync(scrapingDir)) {
      fs.mkdirSync(scrapingDir);
    }

    fs.writeFileSync(
      dataFile,
      JSON.stringify([{ name: 'Gostilna Test', location: 'Test kraj' }], null, 2)
    );
  });

  afterAll(() => {
    if (fs.existsSync(dataFile)) {
      fs.unlinkSync(dataFile);
    }
  });

  test('GET /api/gostilne vrne podatke iz datoteke', async () => {
    const res = await request(app).get('/api/gostilne');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Gostilna Test');
  });
});