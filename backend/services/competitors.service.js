import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
chromium.use(stealth());

import { scrapeWesternUnion } from '../scrapers/westernunion.scraper.js';
import { scrapeWise } from '../scrapers/wise.scraper.js';
import { scrapeXE } from '../scrapers/xe.scraper.js';
import { scrapeRia } from '../scrapers/ria.scraper.js';
import { scrapeRemitBee } from '../scrapers/remitbee.scraper.js';
import { scrapeTransferGo } from '../scrapers/transfergo.scraper.js';
import { scrapeInstarem } from '../scrapers/instarem.scraper.js';
import { scrapeOFX } from '../scrapers/ofx.scraper.js';

export async function getAllCompetitorRates(fromCur, toCur) {
  let browser;
  let context;
  let results = {};

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--window-position=-2000,-2000'
      ]
    });
    
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    });
    
    // Scrape exact DOM rates sequentially or concurrently
    results["RemitBee"] = await scrapeRemitBee(context, fromCur, toCur);
    results["Western Union"] = await scrapeWesternUnion(context, fromCur, toCur);
    results["Wise"] = await scrapeWise(context, fromCur, toCur);
    results["XE"] = await scrapeXE(context, fromCur, toCur);
    results["Ria"] = await scrapeRia(context, fromCur, toCur);

    results["TransferGo"] = await scrapeTransferGo(context, fromCur, toCur);

  } catch (err) {
    console.error("Playwright orchestration error:", err);
  } finally {
    if (context) await context.close().catch(e => {});
    if (browser) await browser.close().catch(e => {});
  }

  // Fetch Direct APIs
  results["Instarem"] = await scrapeInstarem(fromCur, toCur);
  results["OFX"] = await scrapeOFX(fromCur, toCur);

  // We are removing the simulated fallback math entirely!
  // If a company's scraper returns null, it remains null/undefined, and the frontend will simply not display it.
  
  // Filter out any failed scrapes
  for (const key in results) {
    if (!results[key]) {
      delete results[key];
    }
  }

  return results;
}
