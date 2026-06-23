export async function scrapeRia(context, fromCur, toCur) {
  let page;
  try {
    page = await context.newPage();
    await page.setDefaultNavigationTimeout(60000);
    
    await page.goto(`https://www.riamoneytransfer.com/en-in/rates-conversion/?From=${fromCur}&To=${toCur}&Amount=1`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("Ria Nav Error:", e.message));
    
    const riaData = await page.evaluate(({from, to}) => {
      const bodyText = document.body.innerText;
      // Search for something like "1 CAD = 65.5 INR" or "65.5 INR" near the exchange rate text
      const regex = new RegExp(`1\\.?0*\\s*${from}\\s*[=\\-]\\s*([0-9.]+)\\s*${to}`, 'i');
      const match = bodyText.match(regex);
      const rate = match ? parseFloat(match[1]) : null;
      
      const feeRegex = new RegExp(`([0-9.]+)\\s*${from}\\s*fee|fee[^0-9]*([0-9.]+)`, 'i');
      const feeMatch = bodyText.match(feeRegex);
      const fee = feeMatch ? parseFloat(feeMatch[1] || feeMatch[2]) : 0;
      
      return rate ? { rate, fee } : null;
    }, { from: fromCur, to: toCur });
    
    return riaData;
  } catch (err) {
    console.error("Ria scraper error:", err.message);
    return null;
  } finally {
    if (page) await page.close().catch(e => {});
  }
}
