const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Obiščemo glavno stran
    await page.goto('https://www.visit-sevnica.com/kulinarika-ponudba.html', {
        waitUntil: 'domcontentloaded',
    });

    // Poiščemo vse članke znotraj <article> in njihove povezave (seznam gostiln)
    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('article .bg a')).map((el) => el.href);
    });

    const results = [];

    // Obdelamo vsako povezavo iz seznama gostiln
    for (const link of links) {
        try {
            await page.goto(link, { waitUntil: 'domcontentloaded' });

            // Počakamo na nalaganje vsebine posamezne strani
            await page.waitForSelector('article .bg a', { timeout: 3000 });

            // Poiščemo povezave za posamezne gostilne na tej strani
            const individualLinks = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('article .bg a')).map((el) => el.href);
            });

            // Obdelamo posamezne gostilne
            for (const individualLink of individualLinks) {
                try {
                    await page.goto(individualLink, { waitUntil: 'domcontentloaded' });

                    // Počakamo, da so vsi podatki naloženi
                    await page.waitForSelector('.col-md-4', { timeout: 3000 });

                    // Pridobimo podatke iz posamezne gostilne
                    const data = await page.evaluate(() => {
                        const name = document.querySelector('h1')?.innerText || 'Ni imena';
                        const location = document.querySelector('.col-md-4 p')?.innerText || 'Ni lokacije';
                        const contact = document.querySelector('.col-md-4 ul.contact-info a')?.innerText || 'Ni kontakta';
                        const imageUrl = document.querySelector('img') ? document.querySelector('img').src : 'Ni slike';

                        return { name, location, contact, imageUrl }; // Brez delovnega časa
                    });

                    results.push({ url: individualLink, ...data });
                } catch (error) {
                    console.error(`Napaka pri obdelavi gostilne ${individualLink}:`, error);
                }
            }
        } catch (error) {
            console.error(`Napaka pri obdelavi povezave ${link}:`, error);
        }
    }

    // Shranimo rezultate v JSON datoteko
    fs.writeFileSync('gostisce_data.json', JSON.stringify(results, null, 2), 'utf-8');

    console.log('Podatki uspešno pridobljeni in shranjeni!');
    await browser.close();
})();