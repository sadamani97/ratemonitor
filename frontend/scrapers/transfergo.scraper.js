export async function scrapeTransferGo(context, fromCur, toCur) {
  let page;
  try {
    page = await context.newPage();
    await page.goto(`https://www.transfergo.com/currency-converter/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("TransferGo Nav Error:", e.message));
    
    // Wait slightly to let React hydrate the exchange rate value
    await page.waitForTimeout(2000);

    const tgoData = await page.evaluate(() => {
      const el = document.querySelector('.currency-converter-calculator__exchange-rate-value');
      if (el && el.innerText) {
        return {
          rate: parseFloat(el.innerText),
          fee: 0
        };
      }
      return null;
    });

    return tgoData;
  } catch (err) {
    console.error("TransferGo scraper error:", err.message);
    return null;
  } finally {
    if (page) await page.close().catch(e => {});
  }
}
