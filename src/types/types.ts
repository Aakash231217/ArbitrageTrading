export interface PriceData {
  source: string;
  price: number;
  timestamp: number;
}

export interface ArbitrageOpportunity {
  buySource: string;
  sellSource: string;
  priceDifference: number;
  potentialProfit: number;
  buyPrice: number;
  sellPrice: number;
}

export interface PricePrediction {
  source: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
}