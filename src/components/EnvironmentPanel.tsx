import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Thermometer, Droplets, Sun } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export function EnvironmentPanel() {
  const { environmentalData, baseline } = useMetrics();

  const chartData = environmentalData.slice(-60).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    temperature: point.temperature,
    humidity: point.humidity,
    light: point.light / 10
  }));

  const latest = environmentalData[environmentalData.length - 1];

  const getHumidityStatus = () => {
    if (!latest) return 'normal';
    if (latest.humidity < 30) return 'low';
    if (latest.humidity > 60) return 'high';
    return 'normal';
  };

  const getHumidityColor = () => {
    const status = getHumidityStatus();
    if (status === 'low') return 'text-yellow-600 dark:text-yellow-400';
    if (status === 'high') return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Environmental Conditions</h2>

      {latest && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Thermometer className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {latest.temperature.toFixed(1)}°C
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Temperature</div>
            {baseline?.environmental.temperature && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ~{baseline.environmental.temperature.mean.toFixed(1)}°C
              </div>
            )}
          </div>

          <div className="text-center">
            <Droplets className={`w-6 h-6 mx-auto mb-2 ${getHumidityColor()}`} />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {latest.humidity.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Humidity</div>
            {baseline?.environmental.humidity && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ~{baseline.environmental.humidity.mean.toFixed(0)}%
              </div>
            )}
          </div>

          <div className="text-center">
            <Sun className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {latest.light.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Light (lux)</div>
            {baseline?.environmental.light && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ~{baseline.environmental.light.mean.toFixed(0)}
              </div>
            )}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            domain={[15, 30]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'temperature') return [`${value.toFixed(1)}°C`, 'Temperature'];
              if (name === 'humidity') return [`${value.toFixed(0)}%`, 'Humidity'];
              if (name === 'light') return [`${(value * 10).toFixed(0)} lux`, 'Light'];
              return [value, name];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#F97316"
            strokeWidth={2}
            dot={false}
            name="Temperature"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name="Humidity"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="light"
            stroke="#FBBF24"
            strokeWidth={2}
            dot={false}
            name="Light (×10)"
          />
        </LineChart>
      </ResponsiveContainer>

      {getHumidityStatus() !== 'normal' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {getHumidityStatus() === 'low'
              ? 'Low humidity detected. This can cause eye dryness and irritation. Consider using a humidifier.'
              : 'High humidity detected. Ensure proper ventilation.'}
          </p>
        </div>
      )}
    </div>
  );
}
