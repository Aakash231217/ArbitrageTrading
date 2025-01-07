import React, { useState } from 'react';
import { PriceData } from '../types/types';

interface PriceChartProps {
  data: PriceData[];
  source: string;
}

export function PriceChart({ data, source }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="text-center text-gray-500">No data available to display.</p>
      </div>
    );
  }

  const maxPrice = Math.max(...data.map(d => d.price));
  const minPrice = Math.min(...data.map(d => d.price));
  const height = 300;
  const width = 600;
  const padding = 40;

  const normalizedData = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);
    return { x, y, price: d.price };
  });

  const points = normalizedData.map(d => `${d.x},${d.y}`).join(' ');

  // State for tooltip
  const [tooltip, setTooltip] = useState<{ x: number; y: number; price: number } | null>(null);

  // Handlers for mouse events
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = (event.target as SVGSVGElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left - padding;
    const index = Math.round((mouseX / (width - 2 * padding)) * (data.length - 1));
    if (index >= 0 && index < data.length) {
      const d = normalizedData[index];
      setTooltip({ x: d.x, y: d.y, price: d.price });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <section
      className="bg-white p-6 rounded-lg shadow-md"
      aria-labelledby="price-chart-title"
    >
      <header className="flex items-center gap-2 mb-4">
        {/* Line Chart SVG Icon */}
        <svg
          aria-hidden="true"
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9" />
        </svg>
        <h2 id="price-chart-title" className="text-xl font-semibold text-gray-800">
          {source} Price History
        </h2>
      </header>
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="bg-gray-50 rounded"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label={`${source} price history chart`}
        >
          {/* X and Y Axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#4B5563" // Gray-700
            strokeWidth="2"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#4B5563"
            strokeWidth="2"
          />

          {/* Y-Axis Labels */}
          <text
            x={padding - 10}
            y={padding}
            textAnchor="end"
            fill="#6B7280" // Gray-500
            fontSize="12"
          >
            ${maxPrice.toFixed(2)}
          </text>
          <text
            x={padding - 10}
            y={height - padding}
            textAnchor="end"
            fill="#6B7280"
            fontSize="12"
          >
            ${minPrice.toFixed(2)}
          </text>

          {/* X-Axis Labels */}
          <text
            x={padding}
            y={height - padding + 20}
            textAnchor="middle"
            fill="#6B7280"
            fontSize="12"
          >
            Start
          </text>
          <text
            x={width - padding}
            y={height - padding + 20}
            textAnchor="middle"
            fill="#6B7280"
            fontSize="12"
          >
            End
          </text>

          {/* Price Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3B82F6" // Blue-500
            strokeWidth="2"
          />

          {/* Data Points */}
          {normalizedData.map((d, index) => (
            <circle
              key={index}
              cx={d.x}
              cy={d.y}
              r="3"
              fill="#3B82F6"
              className="hover:fill-blue-700 transition-colors duration-200"
            />
          ))}

          {/* Tooltip */}
          {tooltip && (
            <>
              {/* Tooltip Line */}
              <line
                x1={tooltip.x}
                y1={padding}
                x2={tooltip.x}
                y2={height - padding}
                stroke="#9CA3AF" // Gray-400
                strokeDasharray="4"
              />
              {/* Tooltip Circle */}
              <circle
                cx={tooltip.x}
                cy={tooltip.y}
                r="5"
                fill="#10B981" // Green-500
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Tooltip Text */}
              <rect
                x={tooltip.x + 10}
                y={tooltip.y - 30}
                width="80"
                height="30"
                fill="#1F2937" // Gray-800
                rx="4"
                ry="4"
              />
              <text
                x={tooltip.x + 14}
                y={tooltip.y - 15}
                fill="#FFFFFF"
                fontSize="12"
              >
                ${tooltip.price.toFixed(2)}
              </text>
            </>
          )}
        </svg>
        {/* Additional Information */}
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <div>
            <strong>Highest:</strong> ${maxPrice.toFixed(2)}
          </div>
          <div>
            <strong>Lowest:</strong> ${minPrice.toFixed(2)}
          </div>
          <div>
            <strong>Current:</strong> ${data[data.length - 1]?.price.toFixed(2)}
          </div>
        </div>
      </div>
      {/* Trend Indicator */}
      <div className="mt-4 flex items-center gap-1 text-gray-700">
        {/* Trending Up SVG Icon */}
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Current: ${data[data.length - 1]?.price.toFixed(2)}</span>
      </div>
    </section>
  );
}
