export async function scrapeXE(browser, fromCur, toCur) {
  try {
    const pageXE = await browser.newPage();
    await pageXE.setDefaultNavigationTimeout(60000);
    await pageXE.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await pageXE.goto(`https://www.xe.com/currencyconverter/convert/?Amount=1&From=${fromCur}&To=${toCur}`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("XE Nav Error:", e));
    
    const xeRate = await pageXE.evaluate((from, to) => {
      const text = document.body.innerText;
      const regex = new RegExp(`1\\s*${from}\\s*=\\s*([0-9.]+)\\s*${to}`, 'i');
      let match = text.match(regex);
      if (!match) match = text.match(/([0-9.]+)\s*(Indian Rupees|Philippine Pesos|US Dollars)/i);
      return match ? parseFloat(match[1]) : null;
    }, fromCur, toCur);
    
    await pageXE.close();
    return xeRate;
  } catch (err) {
    console.error("XE scraper error:", err);
    return null;
  }
}
