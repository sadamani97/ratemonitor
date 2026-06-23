import puppeteer from 'puppeteer';

async function testRemitly() {
  const browser = await puppeteer.launch({ headless: 'shell' });
  const page = await browser.newPage();
  // We can pass user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  await page.goto('https://www.remitly.com/ca/en/india/pricing', { waitUntil: 'domcontentloaded' });
  
  const rate = await page.evaluate(() => {
    const text = document.body.innerText;
    const match = text.match(/([0-9.]+)\s*INR/i);
    if (match) return parseFloat(match[1]);
    return null;
  });
  
  console.log("Remitly Rate:", rate);
  await browser.close();
}

testRemitly();
