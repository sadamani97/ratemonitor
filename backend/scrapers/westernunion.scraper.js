export async function scrapeWesternUnion(browser, fromCur, toCur) {
  try {
    const pageWU = await browser.newPage();
    await pageWU.setDefaultNavigationTimeout(60000);
    await pageWU.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await pageWU.goto(`https://www.westernunion.com/ca/en/currency-converter/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}-rate.html`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("WU Nav Error:", e));
    
    const wuRate = await pageWU.evaluate((from, to) => {
      const bodyText = document.body.innerText;
      const regex = new RegExp(`1\\.?0*\\s*${from}\\s*[=\\-]\\s*([0-9.]+)\\s*${to}`, 'i');
      const match = bodyText.match(regex);
      return match ? parseFloat(match[1]) : null;
    }, fromCur, toCur);
    
    await pageWU.close();
    return wuRate;
  } catch (err) {
    console.error("Western Union scraper error:", err);
    return null;
  }
}
