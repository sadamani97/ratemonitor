export async function scrapeTransferGo(fromCur, toCur) {
  try {
    const res = await fetch(`https://api.transfergo.com/remittance/fx-rates/stats?from=${fromCur}&to=${toCur}&unit=day&length=1`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.current && data.current[toCur] ? parseFloat(data.current[toCur]) : null;
  } catch (err) {
    console.error("TransferGo scraper error:", err.message);
    return null;
  }
}
