export async function scrapeXE(context, fromCur, toCur) {
  let page;
  try {
    page = await context.newPage();
    await page.setDefaultNavigationTimeout(60000);
    
    await page.goto(`https://www.xe.com/currencyconverter/convert/?Amount=1&From=${fromCur}&To=${toCur}`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("XE Nav Error:", e.message));
    
    const xeData = await page.evaluate(({from, to}) => {
      const text = document.body.innerText;
      const regex = new RegExp(`1\\s*${from}\\s*=\\s*([0-9.]+)\\s*${to}`, 'i');
      let match = text.match(regex);
      if (!match) match = text.match(/([0-9.]+)\s*(Indian Rupees|Philippine Pesos|US Dollars)/i);
      const rate = match ? parseFloat(match[1]) : null;
      
      const feeRegex = new RegExp(`([0-9.]+)\\s*${from}\\s*fee|fee[^0-9]*([0-9.]+)`, 'i');
      const feeMatch = text.match(feeRegex);
      const fee = feeMatch ? parseFloat(feeMatch[1] || feeMatch[2]) : 0;
      
      return rate ? { rate, fee } : null;
    }, { from: fromCur, to: toCur });
    
    return xeData;
  } catch (err) {
    console.error("XE scraper error:", err.message);
    return null;
  } finally {
    if (page) await page.close().catch(e => {});
  }
}
