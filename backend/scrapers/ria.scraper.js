export async function scrapeRia(browser, fromCur, toCur) {
  try {
    const pageRia = await browser.newPage();
    await pageRia.setDefaultNavigationTimeout(60000);
    await pageRia.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await pageRia.goto(`https://www.riamoneytransfer.com/en-in/rates-conversion/?From=${fromCur}&To=${toCur}&Amount=1`, { waitUntil: 'domcontentloaded' }).catch(e => console.error("Ria Nav Error:", e));
    
    const riaRate = await pageRia.evaluate((from, to) => {
      const bodyText = document.body.innerText;
      // Search for something like "1 CAD = 65.5 INR" or "65.5 INR" near the exchange rate text
      const regex = new RegExp(`1\\.?0*\\s*${from}\\s*[=\\-]\\s*([0-9.]+)\\s*${to}`, 'i');
      const match = bodyText.match(regex);
      return match ? parseFloat(match[1]) : null;
    }, fromCur, toCur);
    
    await pageRia.close();
    return riaRate;
  } catch (err) {
    console.error("Ria scraper error:", err.message);
    return null;
  }
}
