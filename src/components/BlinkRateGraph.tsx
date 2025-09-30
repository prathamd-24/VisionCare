import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export function BlinkRateGraph() {
  const { blinkRateData, baseline } = useMetrics();

  const chartData = blinkRateData.slice(-60).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    value: point.value,
    baselineMean: baseline?.blinkRate.mean || null,
    baselineUpper: baseline ? baseline.blinkRate.mean + baseline.blinkRate.std * 2 : null,
    baselineLower: baseline ? Math.max(0, baseline.blinkRate.mean - baseline.blinkRate.std * 2) : null
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Blink Rate Over Time</h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
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
            domain={[0, 'auto']}
            label={{ value: 'Blinks/min', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value: number) => [value.toFixed(1), 'Blinks/min']}
          />

          {baseline && (
            <>
              <Area
                type="monotone"
                dataKey="baselineUpper"
                stroke="none"
                fill="#3B82F6"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="baselineLower"
                stroke="none"
                fill="#3B82F6"
                fillOpacity={0.1}
              />
              <Line
                type="monotone"
                dataKey="baselineMean"
                stroke="#3B82F6"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </>
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {baseline && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Blue shaded area represents ±2σ baseline range</p>
        </div>
      )}
    </div>
  );
}
