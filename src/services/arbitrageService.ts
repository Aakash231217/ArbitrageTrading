import { MarketPrice, ArbitrageOpportunity } from '../types/arbitrage';
import { BINANCE_CONFIG } from '../config/binance';

export class ArbitrageService {
  private static MINIMUM_PROFIT_THRESHOLD = 0.5; // 0.5%
  private static SOLANA_NETWORK_FEE = 0.000005; // In SOL
  private static SOLANA_DEX_FEE = 0.003; // 0.3%
  ArbitrageService: any;

  calculateArbitrageOpportunity(
    binancePrice: MarketPrice,
    solanaPrice: MarketPrice,
    tradingAmount: number = 1000 // Default trading amount in USDC
  ): ArbitrageOpportunity | null {
    const timestamp = Date.now();
    const priceDifference = Math.abs(binancePrice.price - solanaPrice.price);
    const spread = (priceDifference / Math.min(binancePrice.price, solanaPrice.price)) * 100;

    const [buyExchange, sellExchange, buyPrice, sellPrice] = 
      binancePrice.price < solanaPrice.price
        ? ['BINANCE', 'SOLANA_DEX', binancePrice.price, solanaPrice.price]
        : ['SOLANA_DEX', 'BINANCE', solanaPrice.price, binancePrice.price];

    // Calculate fees
    const binanceFee = tradingAmount * BINANCE_CONFIG.fees.taker;
    const solanaDexFee = tradingAmount * this.ArbitrageService.SOLANA_DEX_FEE;
    const networkFee = this.ArbitrageService.SOLANA_NETWORK_FEE * sellPrice; // Convert SOL fee to USDC

    const totalFees = binanceFee + solanaDexFee + networkFee;
    const grossProfit = (sellPrice - buyPrice) * tradingAmount;
    const netProfit = grossProfit - totalFees;
    const profitPercentage = (netProfit / tradingAmount) * 100;

    // Check if opportunity is profitable after fees
    if (profitPercentage < this.ArbitrageService.MINIMUM_PROFIT_THRESHOLD) {
      return null;
    }

    return {
      symbol: binancePrice.symbol,
      buyExchange,
      sellExchange,
      buyPrice,
      sellPrice,
      spread,
      profitPercentage,
      estimatedProfit: netProfit,
      timestamp,
      fees: {
        buyFee: buyExchange === 'BINANCE' ? binanceFee : solanaDexFee,
        sellFee: sellExchange === 'BINANCE' ? binanceFee : solanaDexFee,
        networkFee,
        totalFees
      }
    };
  }

  async monitorArbitrageOpportunities(
    prices: { binance: MarketPrice; solana: MarketPrice }[],
    callback: (opportunity: ArbitrageOpportunity) => void
  ) {
    for (const { binance, solana } of prices) {
      const opportunity = this.calculateArbitrageOpportunity(binance, solana);
      if (opportunity) {
        callback(opportunity);
      }
    }
  }
}

export const arbitrageService = new ArbitrageService();