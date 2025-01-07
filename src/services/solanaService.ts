import { Connection, PublicKey } from '@solana/web3.js';
import { Jupiter } from '@jup-ag/core';
import Decimal from 'decimal.js';
import { MarketPrice } from '../types/arbitrage';

export class SolanaService {
  private connection: Connection;
  private jupiter: Jupiter | null = null;

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com');
  }

  async initialize() {
    if (!this.jupiter) {
      this.jupiter = await Jupiter.load({
        connection: this.connection,
        cluster: 'mainnet-beta',
      });
    }
  }

  async getPrice(inputMint: string, amount: number = 1): Promise<MarketPrice | null> {
    try {
      await this.initialize();
      
      if (!this.jupiter) throw new Error('Jupiter not initialized');

      // USDC mint address on Solana
      const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      const tokenMint = new PublicKey(inputMint);

      const routes = await this.jupiter.computeRoutes({
        inputMint: tokenMint,
        outputMint: usdcMint,
        amount: new Decimal(amount).mul(1e9).toNumber(), // Convert to token decimals
        slippageBps: 50, // 0.5% slippage
      });

      if (routes.routesInfos.length === 0) {
        return null;
      }

      // Get best route
      const bestRoute = routes.routesInfos[0];
      const outAmount = new Decimal(bestRoute.outAmount.toString())
        .div(1e6) // Convert from USDC decimals
        .toNumber();

      return {
        exchange: 'SOLANA_DEX',
        symbol: inputMint,
        price: outAmount / amount,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching Solana price:', error);
      return null;
    }
  }

  async subscribeToPrice(
    inputMint: string,
    callback: (price: MarketPrice) => void,
    interval: number = 10000 // 10 seconds
  ) {
    const updatePrice = async () => {
      const price = await this.getPrice(inputMint);
      if (price) {
        callback(price);
      }
    };

    // Initial price update
    await updatePrice();

    // Set up interval for price updates
    const intervalId = setInterval(updatePrice, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

export const solanaService = new SolanaService();