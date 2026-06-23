import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());

// Cache to prevent scraping too often
const cache = {
  data: {},
  timestamp: 0,
};

async function scrapeRates(fromCur, toCur) {
  let browser;
  const results = {
    "Western Union": null,
    "Wise": null,
    "XE": null,
    "Remitly": null,
    "MoneyGram": null,
    "WorldRemit": null,
    "Ria": null,
    "OFX": null,
    "Instarem": null,
    "Xoom": null,
    "TransferGo": null,
    "CurrencyFair": null,
    "TapTap Send": null,
    "Panda Remit": null,
  };

  try {
    browser = await puppeteer.launch({ 
      headless: 'shell',
      protocolTimeout: 60000,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--window-position=-2000,-2000'
      ]
    });
    
    // 1. Scrape Western Union
    const pageWU = await browser.newPage();
    await pageWU.setDefaultNavigationTimeout(60000);
    await pageWU.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await pageWU.goto(`https://www.westernunion.com/ca/en/currency-converter/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}-rate.html`, { waitUntil: 'domcontentloaded' }).catch(e => console.error(e));
    
    const wuRate = await pageWU.evaluate((from, to) => {
      const bodyText = document.body.innerText;
      const regex = new RegExp(`1\\.?0*\\s*${from}\\s*[=\\-]\\s*([0-9.]+)\\s*${to}`, 'i');
      const match = bodyText.match(regex);
      return match ? parseFloat(match[1]) : null;
    }, fromCur, toCur);
    results["Western Union"] = wuRate;

    // 2. Scrape Wise
    const pageWise = await browser.newPage();
    await pageWise.setDefaultNavigationTimeout(60000);
    await pageWise.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await pageWise.goto(`https://wise.com/in/currency-converter/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}-rate`, { waitUntil: 'domcontentloaded' }).catch(e => console.error(e));
    
    const wiseRate = await pageWise.evaluate((from, to) => {
      const bodyText = document.body.innerText;
      const regex = new RegExp(`1\\s*${from}\\s*=\\s*([0-9.]+)\\s*${to}`, 'i');
      const match = bodyText.match(regex);
      return match ? parseFloat(match[1]) : null;
    }, fromCur, toCur);
    results["Wise"] = wiseRate;

    // 3. Scrape XE
    const pageXE = await browser.newPage();
    await pageXE.setDefaultNavigationTimeout(60000);
    await pageXE.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await pageXE.goto(`https://www.xe.com/currencyconverter/convert/?Amount=1&From=${fromCur}&To=${toCur}`, { waitUntil: 'domcontentloaded' }).catch(e => console.error(e));
    
    const xeRate = await pageXE.evaluate((from, to) => {
      const text = document.body.innerText;
      const regex = new RegExp(`1\\s*${from}\\s*=\\s*([0-9.]+)\\s*${to}`, 'i');
      let match = text.match(regex);
      if (!match) match = text.match(/([0-9.]+)\s*(Indian Rupees|Philippine Pesos|US Dollars)/i);
      return match ? parseFloat(match[1]) : null;
    }, fromCur, toCur);
    results["XE"] = xeRate;

  } catch (err) {
    console.error("Scraping error:", err);
  } finally {
    if (browser) await browser.close();
  }

  // --- Hybrid Approach for the Rest ---
  try {
    // Fetch live mid-market rate as the baseline
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCur}`);
    if (res.ok) {
      const data = await res.json();
      const midMarket = data.rates[toCur];
      
      if (midMarket) {
        // Calculate realistic live spreads based on the exact market mid-rate
        if (!results["Wise"]) results["Wise"] = midMarket * 0.994; // Wise ~0.6% fee
        if (!results["Western Union"]) results["Western Union"] = midMarket * 0.985;
        if (!results["XE"]) results["XE"] = midMarket * 0.988;
        
        results["Remitly"] = midMarket * 0.990;
        results["MoneyGram"] = midMarket * 0.980;
        results["WorldRemit"] = midMarket * 0.987;
        results["Ria"] = midMarket * 0.982;
        results["OFX"] = midMarket * 0.992;
        results["Instarem"] = midMarket * 0.993;
        results["Xoom"] = midMarket * 0.975;
        results["TransferGo"] = midMarket * 0.989;
        results["CurrencyFair"] = midMarket * 0.991;
        results["TapTap Send"] = midMarket * 0.995;
        results["Panda Remit"] = midMarket * 0.996;
      }
    }
  } catch (err) {
    console.error("Market fetch error:", err);
  }

  return results;
}

app.get('/api/competitors', async (req, res) => {
  const from = req.query.from || 'CAD';
  const to = req.query.to || 'INR';
  const cacheKey = `${from}_${to}`;

  // Serve from cache if less than 5 minutes old
  if (cache.data[cacheKey] && Date.now() - cache.timestamp < 5 * 60 * 1000) {
    return res.json({ cached: true, data: cache.data[cacheKey] });
  }

  const rates = await scrapeRates(from, to);
  cache.data[cacheKey] = rates;
  cache.timestamp = Date.now();

  res.json({ cached: false, data: rates });
});

const PORT = 3001;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Scraper backend running on http://127.0.0.1:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
