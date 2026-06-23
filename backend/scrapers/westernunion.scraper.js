export async function scrapeWesternUnion(context, fromCur, toCur) {
  let page;
  try {
    page = await context.newPage();
    await page.setDefaultNavigationTimeout(60000);
    
    // Catch navigation errors gracefully in playwright without breaking the whole execution
    await page.goto(`https://www.westernunion.com/ca/en/currency-converter/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}-rate.html`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("WU Nav Error:", e.message));
    
    const wuData = await page.evaluate(({from, to}) => {
      const bodyText = document.body.innerText;
      const regex = new RegExp(`1\\.?0*\\s*${from}\\s*[=\\-]\\s*([0-9.]+)\\s*${to}|([0-9.]+)\\s*${to}`, 'i');
      const match = bodyText.match(regex);
      const rate = match ? parseFloat(match[1] || match[2]) : null;
      
      const feeRegex = new RegExp(`([0-9.]+)\\s*${from}\\s*fee|fee[^0-9]*([0-9.]+)`, 'i');
      const feeMatch = bodyText.match(feeRegex);
      const fee = feeMatch ? parseFloat(feeMatch[1] || feeMatch[2]) : 0;
      
      return rate ? { rate, fee } : null;
    }, { from: fromCur, to: toCur });
    
    return wuData;
  } catch (err) {
    console.error("Western Union scraper error:", err.message);
    return null;
  } finally {
    if (page) await page.close().catch(e => {});
  }
}
