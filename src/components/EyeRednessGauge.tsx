import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export function EyeRednessGauge() {
  const { eyeRednessData, baseline } = useMetrics();

  const chartData = eyeRednessData.slice(-60).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    value: point.value,
    baselineMean: baseline?.eyeRedness.mean || null,
    threshold: baseline ? baseline.eyeRedness.mean + baseline.eyeRedness.std * 2 : null
  }));

  const currentValue = eyeRednessData[eyeRednessData.length - 1]?.value || 0;

  const getStatusColor = () => {
    if (currentValue < 0.3) return 'text-green-600 dark:text-green-400';
    if (currentValue < 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusLabel = () => {
    if (currentValue < 0.3) return 'Normal';
    if (currentValue < 0.5) return 'Moderate';
    return 'High';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Eye Redness</h2>
        </div>
        <span className={`text-sm font-semibold ${getStatusColor()}`}>
          {getStatusLabel()}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {(currentValue * 100).toFixed(0)}%
          </span>
          {baseline && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Baseline: {(baseline.eyeRedness.mean * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, currentValue * 100)}%`,
              backgroundColor: currentValue < 0.3 ? '#10B981' : currentValue < 0.5 ? '#F59E0B' : '#EF4444'
            }}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            domain={[0, 1]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Redness']}
          />

          {baseline && (
            <>
              <Line
                type="monotone"
                dataKey="baselineMean"
                stroke="#3B82F6"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="#F59E0B"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            </>
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
