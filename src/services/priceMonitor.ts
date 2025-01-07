import { binanceService } from './binanceService';
import { solanaService } from './solanaService';
import { arbitrageService } from './arbitrageService';
import { MarketPrice } from '../types/arbitrage';

// Token mint addresses on Solana
const SOLANA_TOKEN_MINTS: Record<string, string> = {
  'BTC': '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
  'ETH': '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
  'SOL': 'So11111111111111111111111111111111111111112',
  // Add more tokens as needed
};

class PriceMonitor {
  private activeSymbols: Set<string> = new Set();
  private cleanupFunctions: Map<string, () => void> = new Map();
  private priceCallbacks: ((opportunity: any) => void)[] = [];

  async start(callback: (opportunity: any) => void) {
    this.priceCallbacks.push(callback);
    
    // Get available USDC pairs from Binance
    const symbols = await binanceService.getUSDCPairs();
    
    // Filter for symbols we have Solana mint addresses for
    const validSymbols = symbols.filter((symbol: string | number) => SOLANA_TOKEN_MINTS[symbol]);
    
    // Start monitoring each symbol
    validSymbols.forEach((symbol: string) => this.monitorSymbol(symbol));
  }

  private async monitorSymbol(symbol: string) {
    if (this.activeSymbols.has(symbol)) return;
    this.activeSymbols.add(symbol);

    const solanaTokenMint = SOLANA_TOKEN_MINTS[symbol];
    let lastBinancePrice: MarketPrice | null = null;
    let lastSolanaPrice: MarketPrice | null = null;

    // Subscribe to Binance WebSocket
    binanceService.subscribeToTicker(symbol, (binancePrice) => {
      lastBinancePrice = {
        exchange: 'BINANCE',
        symbol,
        price: binancePrice,
        timestamp: Date.now()
      };

      this.checkArbitrageOpportunity(lastBinancePrice, lastSolanaPrice);
    });

    // Subscribe to Solana price updates
    const cleanup = await solanaService.subscribeToPrice(
      solanaTokenMint,
      (solanaPrice) => {
        lastSolanaPrice = solanaPrice;
        this.checkArbitrageOpportunity(lastBinancePrice, lastSolanaPrice);
      }
    );

    this.cleanupFunctions.set(symbol, () => {
      binanceService.unsubscribeFromTicker(symbol);
      cleanup();
    });
  }

  private checkArbitrageOpportunity(
    binancePrice: MarketPrice | null,
    solanaPrice: MarketPrice | null
  ) {
    if (!binancePrice || !solanaPrice) return;

    arbitrageService.monitorArbitrageOpportunities(
      [{ binance: binancePrice, solana: solanaPrice }],
      (opportunity) => {
        this.priceCallbacks.forEach(callback => callback(opportunity));
      }
    );
  }

  stop() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions.clear();
    this.activeSymbols.clear();
    this.priceCallbacks = [];
  }
}

export const priceMonitor = new PriceMonitor();