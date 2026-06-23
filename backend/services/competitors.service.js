import puppeteer from 'puppeteer';
import { getPuppeteerConfig } from '../utils/puppeteerConfig.js';
import { scrapeWesternUnion } from '../scrapers/westernunion.scraper.js';
import { scrapeWise } from '../scrapers/wise.scraper.js';
import { scrapeXE } from '../scrapers/xe.scraper.js';
import { scrapeRia } from '../scrapers/ria.scraper.js';
import { scrapeTransferGo } from '../scrapers/transfergo.scraper.js';
import { scrapeInstarem } from '../scrapers/instarem.scraper.js';
import { scrapeOFX } from '../scrapers/ofx.scraper.js';
import { fetchMarketSpreads } from '../scrapers/marketApi.scraper.js';

export async function getAllCompetitorRates(fromCur, toCur) {
  let browser;
  let results = {
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
    browser = await puppeteer.launch(getPuppeteerConfig());
    
    // Scrape exact rates concurrently where possible (or sequentially to save memory)
    results["Western Union"] = await scrapeWesternUnion(browser, fromCur, toCur);
    results["Wise"] = await scrapeWise(browser, fromCur, toCur);
    results["XE"] = await scrapeXE(browser, fromCur, toCur);
    results["Ria"] = await scrapeRia(browser, fromCur, toCur);

  } catch (err) {
    console.error("Puppeteer orchestration error:", err);
  } finally {
    if (browser) await browser.close();
  }

  // Fetch Direct APIs
  results["TransferGo"] = await scrapeTransferGo(fromCur, toCur);
  results["Instarem"] = await scrapeInstarem(fromCur, toCur);
  results["OFX"] = await scrapeOFX(fromCur, toCur);

  // Fill in the rest using the live market spread hybrid approach
  results = await fetchMarketSpreads(fromCur, toCur, results);

  return results;
}
