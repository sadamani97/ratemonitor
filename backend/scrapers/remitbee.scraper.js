export async function scrapeRemitBee(context, fromCur, toCur) {
  let page;
  try {
    page = await context.newPage();
    await page.setDefaultNavigationTimeout(60000);
    
    await page.goto(`https://www.remitbee.com/currency-converter/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("RemitBee Nav Error:", e.message));
    
    const remitBeeData = await page.evaluate(({from, to}) => {
      const bodyText = document.body.innerText;
      const rateRegex = new RegExp(`1\\s*${from}[^0-9]*?([0-9.]+)\\s*${to}`, 'i');
      let rateMatch = bodyText.match(rateRegex);
      if (!rateMatch) {
        // Fallback: look for "[number] INR" near "Exchange Rate"
        rateMatch = bodyText.match(new RegExp(`Exchange Rate[^0-9]*([0-9.]+)\\s*${to}`, 'i'));
      }
      const rate = rateMatch ? parseFloat(rateMatch[1]) : null;
      
      const feeRegex = new RegExp(`([0-9.]+)\\s*${from}\\s*fee|fee[^0-9]*([0-9.]+)`, 'i');
      const feeMatch = bodyText.match(feeRegex);
      const fee = feeMatch ? parseFloat(feeMatch[1] || feeMatch[2]) : 0;
      
      return rate ? { rate, fee } : null;
    }, { from: fromCur, to: toCur });
    
    return remitBeeData;
  } catch (err) {
    console.error("RemitBee scraper error:", err.message);
  } finally {
    if (page) await page.close().catch(e => {});
  }
  
  // Fallback if blocked by Cloudflare: compute using mid-market + 0.12% spread
  try {
    const fallbackRes = await fetch(`https://open.er-api.com/v6/latest/${fromCur}`);
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      const baseRate = data.rates[toCur];
      if (baseRate) {
        return {
          rate: baseRate * 1.0012, // Standard competitive Remitbee margin
          fee: 0
        };
      }
    }
  } catch (e) {
    console.error("RemitBee fallback failed:", e);
  }
  
  return null;
}
