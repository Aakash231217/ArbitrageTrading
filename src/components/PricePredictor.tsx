import React from 'react';
import { PricePrediction } from '../types/types';

interface PricePredictorProps {
  prediction: PricePrediction;
}

export function PricePredictor({ prediction }: PricePredictorProps) {
  const trend = prediction.predictedPrice > prediction.currentPrice ? 'up' : 'down';
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
  const trendIcon = trend === 'up' ? (
    // Up Arrow SVG
    <svg
      aria-hidden="true"
      className={`w-5 h-5 ${trendColor}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7M5 19h14" />
    </svg>
  ) : (
    // Down Arrow SVG
    <svg
      aria-hidden="true"
      className={`w-5 h-5 ${trendColor}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7M19 5H5" />
    </svg>
  );

  // Calculate percentage change
  const percentageChange = ((prediction.predictedPrice - prediction.currentPrice) / prediction.currentPrice) * 100;

  return (
    <section
      className="bg-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
      aria-labelledby="price-prediction-title"
    >
      <header className="flex items-center gap-2 mb-4">
        {trendIcon}
        <h2 id="price-prediction-title" className="text-xl font-semibold text-gray-800">
          Price Prediction
        </h2>
      </header>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Price</p>
            <p className="text-2xl font-bold text-gray-800">${prediction.currentPrice.toFixed(2)}</p>
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-1 text-sm font-semibold rounded ${trendColor} bg-opacity-10`}>
              {trend === 'up' ? 'Rising' : 'Falling'}
            </span>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Predicted Price</p>
            <p className={`text-2xl font-bold ${trendColor}`}>${prediction.predictedPrice.toFixed(2)}</p>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded">
              {percentageChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Confidence Icon (Inline SVG) */}
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
            <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-sm text-gray-600">
            Confidence: {prediction.confidence.toFixed(1)}%
          </span>
        </div>
      </div>
    </section>
  );
}
