import { Spot } from '@binance/connector';
import { BINANCE_CONFIG } from '../config/binance';
import WebSocket from 'ws';

class BinanceService {
  private client: Spot;
  private websockets: Map<string, WebSocket>;

  constructor() {
    this.client = new Spot(BINANCE_CONFIG.apiKey);
    this.websockets = new Map();
  }

  async getUSDCPairs() {
    try {
      const { data } = await this.client.exchangeInfo();
      return data.symbols
        .filter((symbol: { quoteAsset: string; status: string; }) => symbol.quoteAsset === 'USDC' && symbol.status === 'TRADING')
        .map((symbol: { baseAsset: any; }) => symbol.baseAsset);
    } catch (error) {
      console.error('Error fetching USDC pairs:', error);
      return [];
    }
  }

  async getPrice(symbol: string) {
    try {
      const { data } = await this.client.tickerPrice(symbol + 'USDC');
      return parseFloat(data.price);
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  subscribeToTicker(symbol: string, callback: (price: number) => void) {
    const ws = new WebSocket(`${BINANCE_CONFIG.wsURL}/${symbol.toLowerCase()}usdc@ticker`);
    
    ws.on('message', (data) => {
      const ticker = JSON.parse(data.toString());
      callback(parseFloat(ticker.c)); // Current price
    });

    this.websockets.set(symbol, ws);
  }

  unsubscribeFromTicker(symbol: string) {
    const ws = this.websockets.get(symbol);
    if (ws) {
      ws.close();
      this.websockets.delete(symbol);
    }
  }
}

export const binanceService = new BinanceService();