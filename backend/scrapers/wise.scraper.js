export async function scrapeWise(context, fromCur, toCur) {
  let page;
  try {
    page = await context.newPage();
    await page.setDefaultNavigationTimeout(60000);
    
    await page.goto(`https://wise.com/in/currency-converter/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}-rate`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("Wise Nav Error:", e.message));
    
    const wiseData = await page.evaluate(({from, to}) => {
      const bodyText = document.body.innerText;
      
      const rateRegex = new RegExp(`1\\s*${from}\\s*=\\s*([0-9.]+)\\s*${to}`, 'i');
      const rateMatch = bodyText.match(rateRegex);
      const rate = rateMatch ? parseFloat(rateMatch[1]) : null;
      
      // Try to find fee like "3.50 CAD fee" or "Fee: 3.50"
      const feeRegex = new RegExp(`([0-9.]+)\\s*${from}\\s*fee|fee[^0-9]*([0-9.]+)`, 'i');
      const feeMatch = bodyText.match(feeRegex);
      const fee = feeMatch ? parseFloat(feeMatch[1] || feeMatch[2]) : 0;
      
      return rate ? { rate, fee } : null;
    }, { from: fromCur, to: toCur });
    
    return wiseData;
  } catch (err) {
    console.error("Wise scraper error:", err.message);
    return null;
  } finally {
    if (page) await page.close().catch(e => {});
  }
}
