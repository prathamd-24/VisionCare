import React, { useState } from 'react';
import { Settings as SettingsIcon, RefreshCw, Trash2, Download, Moon, Sun, Bell, BellOff, Volume2, VolumeX, Sliders } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';
import { exportToCSV } from '../utils/export';

export function Settings() {
  const {
    baseline,
    isCalibrating,
    calibrationProgress,
    startCalibration,
    saveCurrentBaseline,
    deleteBaseline,
    anomalyThresholds,
    setAnomalyThresholds,
    alertConfig,
    setAlertConfig,
    environmentalUrl,
    setEnvironmentalUrl,
    fetchEnvironmentalData,
    blinkRateData,
    eyeRednessData,
    emotionData,
    environmentalData,
    isDarkMode,
    toggleDarkMode
  } = useMetrics();

  const [localUrl, setLocalUrl] = useState(environmentalUrl);
  const [showThresholds, setShowThresholds] = useState(false);
  const [localThresholds, setLocalThresholds] = useState(anomalyThresholds);

  const handleSaveUrl = () => {
    setEnvironmentalUrl(localUrl);
    if (localUrl) {
      fetchEnvironmentalData();
    }
  };

  const handleCalibrate = () => {
    startCalibration();
    setTimeout(() => {
      saveCurrentBaseline();
    }, 90000);
  };

  const handleExport = () => {
    exportToCSV(blinkRateData, eyeRednessData, emotionData, environmentalData);
  };

  const handleSaveThresholds = () => {
    setAnomalyThresholds(localThresholds);
    setShowThresholds(false);
  };

  const toggleAlerts = () => {
    setAlertConfig({ ...alertConfig, enabled: !alertConfig.enabled });
  };

  const toggleSound = () => {
    setAlertConfig({ ...alertConfig, soundEnabled: !alertConfig.soundEnabled });
  };

  const snoozeAlerts = (minutes: number) => {
    setAlertConfig({
      ...alertConfig,
      snoozeUntil: Date.now() + minutes * 60000
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Baseline Calibration
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              {baseline ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Calibrated on:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(baseline.calibratedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCalibrate}
                      disabled={isCalibrating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${isCalibrating ? 'animate-spin' : ''}`} />
                      {isCalibrating ? `Calibrating... ${calibrationProgress.toFixed(0)}%` : 'Recalibrate'}
                    </button>
                    <button
                      onClick={deleteBaseline}
                      disabled={isCalibrating}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {isCalibrating && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${calibrationProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No baseline configured. Run calibration to establish your personalized baseline for anomaly detection.
                  </p>
                  <button
                    onClick={handleCalibrate}
                    disabled={isCalibrating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCalibrating ? 'animate-spin' : ''}`} />
                    {isCalibrating ? `Calibrating... ${calibrationProgress.toFixed(0)}%` : 'Start Calibration (90s)'}
                  </button>
                  {isCalibrating && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${calibrationProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Settings
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable alerts</span>
                <button
                  onClick={toggleAlerts}
                  className={`p-2 rounded-lg transition-colors ${
                    alertConfig.enabled
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {alertConfig.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Sound notifications</span>
                <button
                  onClick={toggleSound}
                  className={`p-2 rounded-lg transition-colors ${
                    alertConfig.soundEnabled
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  disabled={!alertConfig.enabled}
                >
                  {alertConfig.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Snooze alerts</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => snoozeAlerts(15)}
                    disabled={!alertConfig.enabled}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded disabled:opacity-50 transition-colors"
                  >
                    15 min
                  </button>
                  <button
                    onClick={() => snoozeAlerts(30)}
                    disabled={!alertConfig.enabled}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded disabled:opacity-50 transition-colors"
                  >
                    30 min
                  </button>
                  <button
                    onClick={() => snoozeAlerts(60)}
                    disabled={!alertConfig.enabled}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded disabled:opacity-50 transition-colors"
                  >
                    1 hour
                  </button>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowThresholds(!showThresholds)}
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Sliders className="w-4 h-4" />
                  Advanced: Anomaly thresholds
                </button>

                {showThresholds && (
                  <div className="mt-3 space-y-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Blink Rate (σ)</label>
                      <input
                        type="number"
                        value={localThresholds.blinkRate}
                        onChange={(e) => setLocalThresholds({ ...localThresholds, blinkRate: parseFloat(e.target.value) })}
                        step="0.1"
                        min="0.5"
                        max="5"
                        className="w-full mt-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Eye Redness (σ)</label>
                      <input
                        type="number"
                        value={localThresholds.eyeRedness}
                        onChange={(e) => setLocalThresholds({ ...localThresholds, eyeRedness: parseFloat(e.target.value) })}
                        step="0.1"
                        min="0.5"
                        max="5"
                        className="w-full mt-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Emotion (σ)</label>
                      <input
                        type="number"
                        value={localThresholds.emotion}
                        onChange={(e) => setLocalThresholds({ ...localThresholds, emotion: parseFloat(e.target.value) })}
                        step="0.1"
                        min="0.5"
                        max="5"
                        className="w-full mt-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Environmental (σ)</label>
                      <input
                        type="number"
                        value={localThresholds.environmental}
                        onChange={(e) => setLocalThresholds({ ...localThresholds, environmental: parseFloat(e.target.value) })}
                        step="0.1"
                        min="0.5"
                        max="5"
                        className="w-full mt-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={handleSaveThresholds}
                      className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                    >
                      Save Thresholds
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Environmental Data Source</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter a URL to fetch live environmental data. Leave empty to use demo data.
              </p>
              <input
                type="url"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                placeholder="https://api.example.com/environmental"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSaveUrl}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Save & Fetch
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Export all collected metrics to CSV format for analysis or backup.
              </p>
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export to CSV
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Appearance</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Dark mode</span>
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-yellow-400'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
