export interface MarketPrice {
  exchange: 'BINANCE' | 'SOLANA_DEX';
  symbol: string;
  price: number;
  timestamp: number;
}

export interface ArbitrageOpportunity {
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  profitPercentage: number;
  estimatedProfit: number;
  timestamp: number;
  fees: {
    buyFee: number;
    sellFee: number;
    networkFee: number;
    totalFees: number;
  };
}