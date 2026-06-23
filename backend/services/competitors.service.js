import { scrapeWesternUnion } from '../scrapers/westernunion.scraper.js';
import { scrapeWise } from '../scrapers/wise.scraper.js';
import { scrapeXE } from '../scrapers/xe.scraper.js';
import { scrapeRia } from '../scrapers/ria.scraper.js';
import { scrapeRemitBee } from '../scrapers/remitbee.scraper.js';
import { scrapeTransferGo } from '../scrapers/transfergo.scraper.js';
import { scrapeInstarem } from '../scrapers/instarem.scraper.js';
import { scrapeOFX } from '../scrapers/ofx.scraper.js';

export async function getAllCompetitorRates(fromCur, toCur) {
  const results = {};

  try {
    // Run all fetches concurrently
    const [
      remitbee, wise, xe, ria,
      wu, transfergo, instarem, ofx
    ] = await Promise.all([
      scrapeRemitBee(fromCur, toCur),
      scrapeWise(fromCur, toCur),
      scrapeXE(fromCur, toCur),
      scrapeRia(fromCur, toCur),
      scrapeWesternUnion(fromCur, toCur),
      scrapeTransferGo(fromCur, toCur),
      scrapeInstarem(fromCur, toCur),
      scrapeOFX(fromCur, toCur)
    ]);

    results["RemitBee"] = remitbee;
    results["Wise"] = wise;
    results["XE"] = xe;
    results["Ria"] = ria;
    results["WesternUnion"] = wu;
    results["TransferGo"] = transfergo;
    results["Instarem"] = instarem;
    results["OFX"] = ofx;
  } catch (err) {
    console.error("API Fetch Error:", err);
  }

  // Filter out any failed scrapes
  for (const key in results) {
    if (!results[key]) {
      delete results[key];
    }
  }

  return results;
}
