import React from 'react';
import { ArbitrageOpportunity } from '../types/types';
import { ArrowRightLeft, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArbitrageListProps {
  opportunities: ArbitrageOpportunity[];
}

export function ArbitrageList({ opportunities }: ArbitrageListProps) {
  if (opportunities.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-lg">
        <p className="text-gray-600 text-center text-lg font-medium">No arbitrage opportunities found</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-7 h-7 text-indigo-600" />
        <h3 className="text-2xl font-bold text-gray-800">Arbitrage Opportunities</h3>
      </div>
      <div className="space-y-4">
        {opportunities.map((opp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg text-gray-800">
                    {opp.buySource} <ArrowRightLeft className="w-4 h-4 inline mx-1 text-indigo-500" /> {opp.sellSource}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Buy at <span className="font-medium text-green-600">${opp.buyPrice.toFixed(2)}</span> - 
                    Sell at <span className="font-medium text-red-600">${opp.sellPrice.toFixed(2)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <motion.div
                    className="flex items-center gap-1 text-green-600"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span className="font-bold text-xl">{opp.potentialProfit.toFixed(2)}</span>
                  </motion.div>
                  <p className="text-sm text-gray-500">Potential Profit</p>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 px-4 py-2">
              <p className="text-xs text-indigo-600 font-medium">
                Spread: ${(opp.sellPrice - opp.buyPrice).toFixed(2)} ({((opp.sellPrice / opp.buyPrice - 1) * 100).toFixed(2)}%)
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

