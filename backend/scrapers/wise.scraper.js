export async function scrapeWise(browser, fromCur, toCur) {
  try {
    const pageWise = await browser.newPage();
    await pageWise.setDefaultNavigationTimeout(60000);
    await pageWise.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await pageWise.goto(`https://wise.com/in/currency-converter/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}-rate`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("Wise Nav Error:", e));
    
    const wiseRate = await pageWise.evaluate((from, to) => {
      const bodyText = document.body.innerText;
      const regex = new RegExp(`1\\s*${from}\\s*=\\s*([0-9.]+)\\s*${to}`, 'i');
      const match = bodyText.match(regex);
      return match ? parseFloat(match[1]) : null;
    }, fromCur, toCur);
    
    await pageWise.close();
    return wiseRate;
  } catch (err) {
    console.error("Wise scraper error:", err);
    return null;
  }
}
