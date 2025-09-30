import React from 'react';
import { AlertTriangle, X, Clock, TrendingUp, Eye, Activity, Frown, CloudRain } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';

export function AlertsPanel() {
  const { anomalies, dismissAnomaly, alertConfig } = useMetrics();

  if (!alertConfig.enabled || anomalies.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">All systems normal</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">No anomalies detected</p>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'blink_rate':
        return <Activity className="w-5 h-5" />;
      case 'eye_redness':
        return <Eye className="w-5 h-5" />;
      case 'emotion':
        return <Frown className="w-5 h-5" />;
      case 'environmental':
        return <CloudRain className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts</h2>
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 text-xs font-semibold rounded-full">
            {anomalies.length}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.timestamp}
            className={`p-4 border rounded-lg transition-colors ${getSeverityColor(anomaly.severity)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 flex-1">
                <div className="mt-0.5">
                  {getIcon(anomaly.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSeverityBadgeColor(anomaly.severity)}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                    <span className="text-xs flex items-center gap-1 opacity-70">
                      <Clock className="w-3 h-3" />
                      {formatTime(anomaly.timestamp)}
                    </span>
                  </div>
                  <p className="font-semibold mb-2 text-sm">
                    {anomaly.message}
                  </p>
                  <div className="bg-white/50 dark:bg-black/20 rounded p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">Suggestion: </span>
                        {anomaly.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dismissAnomaly(anomaly.timestamp)}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
