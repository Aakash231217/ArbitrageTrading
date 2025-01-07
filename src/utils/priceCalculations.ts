import { PriceData, ArbitrageOpportunity, PricePrediction } from '../types/types';

export function findArbitrageOpportunities(prices: Record<string, PriceData[]>): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  const sources = Object.keys(prices);

  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const source1 = sources[i];
      const source2 = sources[j];
      
      const price1 = prices[source1][prices[source1].length - 1].price;
      const price2 = prices[source2][prices[source2].length - 1].price;

      if (Math.abs(price1 - price2) > 0.01) { // Minimum difference threshold
        const buySource = price1 < price2 ? source1 : source2;
        const sellSource = price1 < price2 ? source2 : source1;
        const buyPrice = Math.min(price1, price2);
        const sellPrice = Math.max(price1, price2);
        
        opportunities.push({
          buySource,
          sellSource,
          priceDifference: sellPrice - buyPrice,
          potentialProfit: (sellPrice - buyPrice) * 100, // Example quantity
          buyPrice,
          sellPrice,
        });
      }
    }
  }

  return opportunities.sort((a, b) => b.potentialProfit - a.potentialProfit);
}

export function predictPrice(priceHistory: PriceData[]): PricePrediction {
  if (priceHistory.length < 2) {
    return {
      source: priceHistory[0]?.source || 'unknown',
      currentPrice: priceHistory[0]?.price || 0,
      predictedPrice: priceHistory[0]?.price || 0,
      confidence: 0,
    };
  }

  // Simple moving average prediction
  const periods = Math.min(10, priceHistory.length);
  const recentPrices = priceHistory.slice(-periods);
  const avgPrice = recentPrices.reduce((sum, data) => sum + data.price, 0) / periods;
  
  // Calculate trend
  const lastPrice = recentPrices[recentPrices.length - 1].price;
  const priceChange = lastPrice - recentPrices[0].price;
  const predictedChange = priceChange / periods;
  
  // Predict next price
  const predictedPrice = avgPrice + predictedChange;
  
  // Calculate confidence based on price volatility
  const volatility = Math.sqrt(
    recentPrices.reduce((sum, data) => 
      sum + Math.pow(data.price - avgPrice, 2), 0) / periods
  );
  const confidence = Math.max(0, Math.min(100, 100 - (volatility / avgPrice * 100)));

  return {
    source: priceHistory[0].source,
    currentPrice: lastPrice,
    predictedPrice,
    confidence,
  };
}