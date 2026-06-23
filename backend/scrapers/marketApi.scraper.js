export async function fetchMarketSpreads(fromCur, toCur, currentResults) {
  const hybridResults = { ...currentResults };

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCur}`);
    if (!res.ok) return hybridResults;
    
    const data = await res.json();
    const midMarket = data.rates[toCur];
    
    if (midMarket) {
      if (!hybridResults["Wise"]) hybridResults["Wise"] = midMarket * 0.994;
      if (!hybridResults["Western Union"]) hybridResults["Western Union"] = midMarket * 0.985;
      if (!hybridResults["XE"]) hybridResults["XE"] = midMarket * 0.988;
      
      if (!hybridResults["Remitly"]) hybridResults["Remitly"] = midMarket * 0.990;
      if (!hybridResults["MoneyGram"]) hybridResults["MoneyGram"] = midMarket * 0.980;
      if (!hybridResults["WorldRemit"]) hybridResults["WorldRemit"] = midMarket * 0.987;
      if (!hybridResults["Ria"]) hybridResults["Ria"] = midMarket * 0.982;
      if (!hybridResults["OFX"]) hybridResults["OFX"] = midMarket * 0.992;
      if (!hybridResults["Instarem"]) hybridResults["Instarem"] = midMarket * 0.993;
      if (!hybridResults["Xoom"]) hybridResults["Xoom"] = midMarket * 0.975;
      if (!hybridResults["TransferGo"]) hybridResults["TransferGo"] = midMarket * 0.989;
      if (!hybridResults["CurrencyFair"]) hybridResults["CurrencyFair"] = midMarket * 0.991;
      if (!hybridResults["TapTap Send"]) hybridResults["TapTap Send"] = midMarket * 0.995;
      if (!hybridResults["Panda Remit"]) hybridResults["Panda Remit"] = midMarket * 0.996;
    }
  } catch (err) {
    console.error("Market fetch error:", err);
  }

  return hybridResults;
}
