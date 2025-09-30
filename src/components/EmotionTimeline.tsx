import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Smile, Brain } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export function EmotionTimeline() {
  const { emotionData, liveMetrics } = useMetrics();

  const chartData = emotionData.slice(-60).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    Happy: point.happy,
    Sad: point.sad,
    Neutral: point.neutral,
    Surprised: point.surprised,
    Angry: point.angry
  }));

  // Get the dominant emotion and its confidence
  const getDominantEmotion = () => {
    const emotions = liveMetrics.emotion;
    const entries = Object.entries(emotions) as [string, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return { emotion: sorted[0][0], confidence: sorted[0][1] };
  };

  const dominant = getDominantEmotion();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Emotion Analysis</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">
            Current: <span className="font-semibold capitalize text-gray-900 dark:text-white">
              {dominant.emotion}
            </span> ({(dominant.confidence * 100).toFixed(0)}%)
          </span>
        </div>
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
            domain={[0, 1]}
            label={{ value: 'Confidence', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value: number, name: string) => [
              (value * 100).toFixed(1) + '%', 
              name
            ]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />

          <Area
            type="monotone"
            dataKey="Happy"
            stackId="1"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Neutral"
            stackId="1"
            stroke="#6B7280"
            fill="#6B7280"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Sad"
            stackId="1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Surprised"
            stackId="1"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Angry"
            stackId="1"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
