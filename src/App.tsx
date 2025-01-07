import React, { useState, useEffect } from 'react';
import { PriceData, ArbitrageOpportunity, PricePrediction } from './types/types';
import { findArbitrageOpportunities, predictPrice } from './utils/priceCalculations';
import { PriceChart } from './components/PriceChart';
import { ArbitrageList } from './components/ArbitrageList';
import { PricePredictor } from './components/PricePredictor';
import { RefreshCw } from 'lucide-react';

// Simulate price data for demonstration
const generateMockPrices = (source: string, basePrice: number): PriceData[] => {
  const prices: PriceData[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < 20; i++) {
    currentPrice += (Math.random() - 0.5) * 2; // Random price movement
    prices.push({
      source,
      price: Math.max(0.01, currentPrice),
      timestamp: Date.now() - (20 - i) * 60000,
    });
  }
  return prices;
};

function App() {
  const [priceData, setPriceData] = useState<Record<string, PriceData[]>>({
    'Exchange A': generateMockPrices('Exchange A', 100),
    'Exchange B': generateMockPrices('Exchange B', 101),
    'Exchange C': generateMockPrices('Exchange C', 99),
  });

  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [predictions, setPredictions] = useState<Record<string, PricePrediction>>({});

  const updatePrices = () => {
    const newPriceData: Record<string, PriceData[]> = {};
    
    Object.entries(priceData).forEach(([source, prices]) => {
      const lastPrice = prices[prices.length - 1].price;
      const newPrice = lastPrice + (Math.random() - 0.5) * 0.5;
      
      newPriceData[source] = [
        ...prices.slice(-19),
        {
          source,
          price: Math.max(0.01, newPrice),
          timestamp: Date.now(),
        },
      ];
    });

    setPriceData(newPriceData);
  };

  useEffect(() => {
    const opportunities = findArbitrageOpportunities(priceData);
    setOpportunities(opportunities);

    const newPredictions: Record<string, PricePrediction> = {};
    Object.entries(priceData).forEach(([source, prices]) => {
      newPredictions[source] = predictPrice(prices);
    });
    setPredictions(newPredictions);
  }, [priceData]);

  useEffect(() => {
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, [priceData]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Price Arbitrage Scanner
          </h1>
          <button
            onClick={updatePrices}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Prices
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(priceData).map(([source, prices]) => (
            <PriceChart key={source} data={prices} source={source} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ArbitrageList opportunities={opportunities} />
          <div className="space-y-6">
            {Object.values(predictions).map((prediction) => (
              <PricePredictor
                key={prediction.source}
                prediction={prediction}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;