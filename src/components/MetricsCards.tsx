
import { Eye, Activity, Thermometer, Brain } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export function MetricsCards() {
  const { liveMetrics, baseline } = useMetrics();

  const getDominantEmotion = () => {
    const emotions = liveMetrics.emotion;
    const entries = Object.entries(emotions) as [string, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: 'text-green-600 dark:text-green-400',
      sad: 'text-blue-600 dark:text-blue-400',
      neutral: 'text-gray-600 dark:text-gray-400',
      surprised: 'text-yellow-600 dark:text-yellow-400',
      angry: 'text-red-600 dark:text-red-400'
    };
    return colors[emotion] || 'text-gray-600';
  };

  const getBlinkRateStatus = () => {
    if (!baseline?.blinkRate) return 'normal';
    const diff = liveMetrics.blinkRate - baseline.blinkRate.mean;
    const threshold = baseline.blinkRate.std * 2;

    if (Math.abs(diff) > threshold) return 'warning';
    return 'normal';
  };

  const getEyeRednessStatus = () => {
    if (!baseline?.eyeRedness) return 'normal';
    const diff = liveMetrics.eyeRedness - baseline.eyeRedness.mean;
    const threshold = baseline.eyeRedness.std * 2;

    if (diff > threshold) return 'warning';
    return 'normal';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 transition-colors ${
        getBlinkRateStatus() === 'warning' ? 'border-yellow-500' : 'border-blue-500'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Blink Rate</h3>
          </div>
          {getBlinkRateStatus() === 'warning' && (
            <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
              Anomaly
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {liveMetrics.blinkRate.toFixed(1)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">blinks per minute</div>
        {baseline?.blinkRate && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Baseline: {baseline.blinkRate.mean.toFixed(1)} ± {baseline.blinkRate.std.toFixed(1)}
          </div>
        )}
      </div>

      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 transition-colors ${
        getEyeRednessStatus() === 'warning' ? 'border-yellow-500' : 'border-red-500'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Eye Redness</h3>
          </div>
          <div className="flex items-center gap-2">
            {getEyeRednessStatus() === 'warning' && (
              <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                Anomaly
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full">
              Live
            </span>
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {(liveMetrics.eyeRedness * 100).toFixed(0)}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">AI-detected redness level</div>
        {baseline?.eyeRedness && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Baseline: {(baseline.eyeRedness.mean * 100).toFixed(0)}%
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-green-500 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Emotion</h3>
          </div>
          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
            Live
          </span>
        </div>
        <div className={`text-3xl font-bold capitalize ${getEmotionColor(getDominantEmotion())}`}>
          {getDominantEmotion()}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {(liveMetrics.emotion[getDominantEmotion() as keyof typeof liveMetrics.emotion] * 100).toFixed(1)}% confidence
        </div>
        <div className="space-y-1">
          {Object.entries(liveMetrics.emotion)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([emotion, value]) => (
              <div key={emotion} className="flex justify-between text-xs">
                <span className="capitalize opacity-70">{emotion}:</span>
                <span className="font-semibold">{(value * 100).toFixed(0)}%</span>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-orange-500 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Thermometer className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Environment</h3>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {liveMetrics.environmental.temperature.toFixed(1)}°C
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Humidity:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {liveMetrics.environmental.humidity.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Light:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {liveMetrics.environmental.light.toFixed(0)} lux
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
