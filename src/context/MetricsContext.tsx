import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BaselineMetrics, AnomalyThresholds, LiveMetrics, AlertConfig } from '../types';
import { MetricDataPoint, EmotionDataPoint, EnvironmentalDataPoint, AnomalyEvent, demoBlinkRateData, demoEyeRednessData, demoEmotionData, demoEnvironmentalData, demoAnomalies } from '../data/demoData';
import { loadBaseline, saveBaseline, clearBaseline, detectAnomaly, getAnomalySeverity } from '../utils/baseline';

interface FlaskSensorData {
  timestamp: string;
  temperature: string;
  humidity: string;
  ldr: string;
}

interface FlaskApiResponse {
  status: string;
  data: FlaskSensorData[];
}

interface MetricsContextType {
  blinkRateData: MetricDataPoint[];
  eyeRednessData: MetricDataPoint[];
  emotionData: EmotionDataPoint[];
  environmentalData: EnvironmentalDataPoint[];
  anomalies: AnomalyEvent[];
  baseline: BaselineMetrics | null;
  liveMetrics: LiveMetrics;
  isCalibrating: boolean;
  calibrationProgress: number;
  anomalyThresholds: AnomalyThresholds;
  alertConfig: AlertConfig;
  environmentalUrl: string;
  isDarkMode: boolean;
  flaskSensorData: FlaskSensorData[];
  isFlaskDataLoading: boolean;
  flaskDataError: string | null;

  setBaseline: (baseline: BaselineMetrics | null) => void;
  addBlinkRatePoint: (value: number) => void;
  addEyeRednessPoint: (value: number) => void;
  addEmotionPoint: (emotions: LiveMetrics['emotion']) => void;
  addEnvironmentalPoint: (env: LiveMetrics['environmental']) => void;
  updateLiveMetrics: (metrics: Partial<LiveMetrics>) => void;
  startCalibration: () => void;
  saveCurrentBaseline: () => void;
  deleteBaseline: () => void;
  setAnomalyThresholds: (thresholds: AnomalyThresholds) => void;
  setAlertConfig: (config: AlertConfig) => void;
  dismissAnomaly: (timestamp: number) => void;
  setEnvironmentalUrl: (url: string) => void;
  fetchEnvironmentalData: () => Promise<void>;
  fetchFlaskData: () => Promise<void>;
  toggleDarkMode: () => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

const THRESHOLDS_KEY = 'webcam_monitor_thresholds';
const ALERT_CONFIG_KEY = 'webcam_monitor_alert_config';
const ENV_URL_KEY = 'webcam_monitor_env_url';
const DARK_MODE_KEY = 'webcam_monitor_dark_mode';

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [blinkRateData, setBlinkRateData] = useState<MetricDataPoint[]>(demoBlinkRateData);
  const [eyeRednessData, setEyeRednessData] = useState<MetricDataPoint[]>(demoEyeRednessData);
  const [emotionData, setEmotionData] = useState<EmotionDataPoint[]>(demoEmotionData);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalDataPoint[]>(demoEnvironmentalData);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(demoAnomalies);
  const [baseline, setBaselineState] = useState<BaselineMetrics | null>(loadBaseline());
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [environmentalUrl, setEnvUrl] = useState(() => localStorage.getItem(ENV_URL_KEY) || '');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  // Flask data state
  const [flaskSensorData, setFlaskSensorData] = useState<FlaskSensorData[]>([]);
  const [isFlaskDataLoading, setIsFlaskDataLoading] = useState(false);
  const [flaskDataError, setFlaskDataError] = useState<string | null>(null);

  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    blinkRate: 15,
    eyeRedness: 0.3,
    emotion: { happy: 0.5, sad: 0.1, neutral: 0.3, surprised: 0.05, angry: 0.05 },
    environmental: { temperature: 22, humidity: 45, light: 300 }
  });

  const [anomalyThresholds, setThresholds] = useState<AnomalyThresholds>(() => {
    const stored = localStorage.getItem(THRESHOLDS_KEY);
    return stored ? JSON.parse(stored) : {
      blinkRate: 2,
      eyeRedness: 2,
      emotion: 2,
      environmental: 2
    };
  });

  const [alertConfig, setAlert] = useState<AlertConfig>(() => {
    const stored = localStorage.getItem(ALERT_CONFIG_KEY);
    return stored ? JSON.parse(stored) : {
      enabled: true,
      soundEnabled: false,
      snoozeUntil: null
    };
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const setBaseline = useCallback((newBaseline: BaselineMetrics | null) => {
    setBaselineState(newBaseline);
    if (newBaseline) {
      saveBaseline(newBaseline);
    } else {
      clearBaseline();
    }
  }, []);

  const checkForAnomalies = useCallback((
    type: AnomalyEvent['type'],
    value: number,
    baselineMetric: { mean: number; std: number } | undefined,
    threshold: number
  ) => {
    if (!baseline || !baselineMetric || !alertConfig.enabled) return;
    if (alertConfig.snoozeUntil && Date.now() < alertConfig.snoozeUntil) return;

    if (detectAnomaly(value, baselineMetric, threshold)) {
      const severity = getAnomalySeverity(value, baselineMetric);
      let message = '';
      let suggestion = '';

      switch (type) {
        case 'blink_rate':
          if (value > baselineMetric.mean) {
            message = `Increased blink rate detected (${value.toFixed(1)} blinks/min)`;
            suggestion = 'Take a 20-second eye break. Look at something 20 feet away.';
          } else {
            message = `Decreased blink rate detected (${value.toFixed(1)} blinks/min)`;
            suggestion = 'Remember to blink regularly. Try the 20-20-20 rule.';
          }
          break;
        case 'eye_redness':
          message = `High eye redness detected (${value.toFixed(2)})`;
          suggestion = 'Your eyes may be strained. Reduce screen brightness and take a 5-minute break.';
          break;
        case 'emotion':
          message = 'Elevated stress or sadness levels detected';
          suggestion = 'Consider taking a break. Try a 2-minute breathing exercise.';
          break;
        case 'environmental':
          message = 'Environmental factors outside normal range';
          suggestion = 'Check room humidity and lighting conditions.';
          break;
      }

      const newAnomaly: AnomalyEvent = {
        timestamp: Date.now(),
        type,
        severity,
        message,
        suggestion
      };

      setAnomalies(prev => [newAnomaly, ...prev].slice(0, 50));
    }
  }, [baseline, alertConfig]);

  const addBlinkRatePoint = useCallback((value: number) => {
    const point: MetricDataPoint = { timestamp: Date.now(), value };
    setBlinkRateData(prev => [...prev, point].slice(-120));
    setLiveMetrics(prev => ({ ...prev, blinkRate: value }));
    checkForAnomalies('blink_rate', value, baseline?.blinkRate, anomalyThresholds.blinkRate);
  }, [baseline, anomalyThresholds, checkForAnomalies]);

  const addEyeRednessPoint = useCallback((value: number) => {
    const point: MetricDataPoint = { timestamp: Date.now(), value };
    setEyeRednessData(prev => [...prev, point].slice(-120));
    setLiveMetrics(prev => ({ ...prev, eyeRedness: value }));
    checkForAnomalies('eye_redness', value, baseline?.eyeRedness, anomalyThresholds.eyeRedness);
  }, [baseline, anomalyThresholds, checkForAnomalies]);

  const addEmotionPoint = useCallback((emotions: LiveMetrics['emotion']) => {
    const point: EmotionDataPoint = { timestamp: Date.now(), ...emotions };
    setEmotionData(prev => [...prev, point].slice(-120));
    setLiveMetrics(prev => ({ ...prev, emotion: emotions }));

    if (baseline?.emotions.sad) {
      checkForAnomalies('emotion', emotions.sad, baseline.emotions.sad, anomalyThresholds.emotion);
    }
  }, [baseline, anomalyThresholds, checkForAnomalies]);

  const addEnvironmentalPoint = useCallback((env: LiveMetrics['environmental']) => {
    const point: EnvironmentalDataPoint = { timestamp: Date.now(), ...env };
    setEnvironmentalData(prev => [...prev, point].slice(-120));
    setLiveMetrics(prev => ({ ...prev, environmental: env }));

    if (baseline?.environmental.humidity) {
      checkForAnomalies('environmental', env.humidity, baseline.environmental.humidity, anomalyThresholds.environmental);
    }
  }, [baseline, anomalyThresholds, checkForAnomalies]);

  const updateLiveMetrics = useCallback((metrics: Partial<LiveMetrics>) => {
    setLiveMetrics(prev => ({ ...prev, ...metrics }));
  }, []);

  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setCalibrationProgress(0);

    const duration = 90000;
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setCalibrationProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        clearInterval(timer);
        setIsCalibrating(false);
        setCalibrationProgress(100);
      }
    }, interval);
  }, []);

  const saveCurrentBaseline = useCallback(() => {
    const recentBlinkRate = blinkRateData.slice(-30);
    const recentEyeRedness = eyeRednessData.slice(-30);
    const recentEmotion = emotionData.slice(-30);
    const recentEnvironmental = environmentalData.slice(-30);

    const newBaseline: BaselineMetrics = {
      blinkRate: {
        mean: recentBlinkRate.reduce((sum, d) => sum + d.value, 0) / recentBlinkRate.length,
        std: Math.sqrt(recentBlinkRate.reduce((sum, d) => sum + Math.pow(d.value - (recentBlinkRate.reduce((s, x) => s + x.value, 0) / recentBlinkRate.length), 2), 0) / recentBlinkRate.length)
      },
      eyeRedness: {
        mean: recentEyeRedness.reduce((sum, d) => sum + d.value, 0) / recentEyeRedness.length,
        std: Math.sqrt(recentEyeRedness.reduce((sum, d) => sum + Math.pow(d.value - (recentEyeRedness.reduce((s, x) => s + x.value, 0) / recentEyeRedness.length), 2), 0) / recentEyeRedness.length)
      },
      emotions: {
        happy: {
          mean: recentEmotion.reduce((sum, d) => sum + d.happy, 0) / recentEmotion.length,
          std: 0.1
        },
        sad: {
          mean: recentEmotion.reduce((sum, d) => sum + d.sad, 0) / recentEmotion.length,
          std: 0.1
        },
        neutral: {
          mean: recentEmotion.reduce((sum, d) => sum + d.neutral, 0) / recentEmotion.length,
          std: 0.1
        }
      },
      environmental: {
        temperature: {
          mean: recentEnvironmental.reduce((sum, d) => sum + d.temperature, 0) / recentEnvironmental.length,
          std: 2
        },
        humidity: {
          mean: recentEnvironmental.reduce((sum, d) => sum + d.humidity, 0) / recentEnvironmental.length,
          std: 5
        },
        light: {
          mean: recentEnvironmental.reduce((sum, d) => sum + d.light, 0) / recentEnvironmental.length,
          std: 50
        }
      },
      calibratedAt: Date.now()
    };

    setBaseline(newBaseline);
  }, [blinkRateData, eyeRednessData, emotionData, environmentalData, setBaseline]);

  const deleteBaseline = useCallback(() => {
    setBaseline(null);
  }, [setBaseline]);

  const setAnomalyThresholds = useCallback((thresholds: AnomalyThresholds) => {
    setThresholds(thresholds);
    localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
  }, []);

  const setAlertConfig = useCallback((config: AlertConfig) => {
    setAlert(config);
    localStorage.setItem(ALERT_CONFIG_KEY, JSON.stringify(config));
  }, []);

  const dismissAnomaly = useCallback((timestamp: number) => {
    setAnomalies(prev => prev.filter(a => a.timestamp !== timestamp));
  }, []);

  const setEnvironmentalUrl = useCallback((url: string) => {
    setEnvUrl(url);
    localStorage.setItem(ENV_URL_KEY, url);
  }, []);

  const fetchEnvironmentalData = useCallback(async () => {
    if (!environmentalUrl) return;

    try {
      const response = await fetch(environmentalUrl);
      const data = await response.json();

      if (Array.isArray(data)) {
        setEnvironmentalData(data);
      }
    } catch (error) {
      console.error('Failed to fetch environmental data:', error);
    }
  }, [environmentalUrl]);

  const fetchFlaskData = useCallback(async () => {
    setIsFlaskDataLoading(true);
    setFlaskDataError(null);

    try {
      const response = await fetch('/getdata');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: FlaskApiResponse = await response.json();
      
      if (result.status === 'ok' && Array.isArray(result.data)) {
        setFlaskSensorData(result.data);
        
        // Update environmental data with latest Flask data
        const latestData = result.data[result.data.length - 1];
        if (latestData) {
          const envData: EnvironmentalDataPoint = {
            timestamp: new Date(latestData.timestamp).getTime(),
            temperature: parseFloat(latestData.temperature),
            humidity: parseFloat(latestData.humidity),
            light: parseFloat(latestData.ldr)
          };
          
          setEnvironmentalData(prev => [...prev, envData].slice(-120));
          setLiveMetrics(prev => ({
            ...prev,
            environmental: {
              temperature: envData.temperature,
              humidity: envData.humidity,
              light: envData.light
            }
          }));
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      setFlaskDataError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching Flask data:', err);
    } finally {
      setIsFlaskDataLoading(false);
    }
  }, []);

  // Auto-fetch Flask data every 5 seconds
  useEffect(() => {
    fetchFlaskData(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchFlaskData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchFlaskData]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem(DARK_MODE_KEY, JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const value: MetricsContextType = {
    blinkRateData,
    eyeRednessData,
    emotionData,
    environmentalData,
    anomalies,
    baseline,
    liveMetrics,
    isCalibrating,
    calibrationProgress,
    anomalyThresholds,
    alertConfig,
    environmentalUrl,
    isDarkMode,
    flaskSensorData,
    isFlaskDataLoading,
    flaskDataError,
    setBaseline,
    addBlinkRatePoint,
    addEyeRednessPoint,
    addEmotionPoint,
    addEnvironmentalPoint,
    updateLiveMetrics,
    startCalibration,
    saveCurrentBaseline,
    deleteBaseline,
    setAnomalyThresholds,
    setAlertConfig,
    dismissAnomaly,
    setEnvironmentalUrl,
    fetchEnvironmentalData,
    fetchFlaskData,
    toggleDarkMode
  };

  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within MetricsProvider');
  }
  return context;
}
