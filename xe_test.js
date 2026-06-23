import puppeteer from 'puppeteer';

async function testXE() {
  const browser = await puppeteer.launch({ headless: 'shell' });
  const page = await browser.newPage();
  await page.goto('https://www.xe.com/currencyconverter/convert/?Amount=1&From=CAD&To=INR', { waitUntil: 'domcontentloaded' });
  
  const rate = await page.evaluate(() => {
    const text = document.body.innerText;
    const match = text.match(/1\s*CAD\s*=\s*([0-9.]+)\s*INR/i) || text.match(/([0-9.]+)\s*Indian Rupees/i);
    if (match) return parseFloat(match[1]);
    return null;
  });
  
  console.log("XE Rate:", rate);
  await browser.close();
}

testXE();
