export async function scrapeInstarem(fromCur, toCur) {
  try {
    const res = await fetch(`https://www.instarem.com/wp-json/instarem/v2/chart-data/${fromCur.toLowerCase()}-to-${toCur.toLowerCase()}/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.status && data.data) {
      const dates = Object.keys(data.data);
      if (dates.length > 0) {
        // The dates are usually sorted, get the last one
        const latestDate = dates[dates.length - 1];
        const rateObj = data.data[latestDate];
        if (rateObj && rateObj[toCur]) {
          return parseFloat(rateObj[toCur]);
        }
      }
    }
    return null;
  } catch (err) {
    console.error("Instarem scraper error:", err.message);
    return null;
  }
}
