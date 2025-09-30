import { BaselineMetrics } from '../types';
import { MetricDataPoint, EmotionDataPoint, EnvironmentalDataPoint } from '../data/demoData';

const BASELINE_KEY = 'webcam_monitor_baseline';

export function calculateMeanAndStd(values: number[]): { mean: number; std: number } {
  if (values.length === 0) return { mean: 0, std: 0 };

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  return { mean, std };
}

export function calculateBaseline(
  blinkRateData: MetricDataPoint[],
  eyeRednessData: MetricDataPoint[],
  emotionData: EmotionDataPoint[],
  environmentalData: EnvironmentalDataPoint[]
): BaselineMetrics {
  const blinkRateValues = blinkRateData.map(d => d.value);
  const eyeRednessValues = eyeRednessData.map(d => d.value);
  const happyValues = emotionData.map(d => d.happy);
  const sadValues = emotionData.map(d => d.sad);
  const neutralValues = emotionData.map(d => d.neutral);
  const tempValues = environmentalData.map(d => d.temperature);
  const humidityValues = environmentalData.map(d => d.humidity);
  const lightValues = environmentalData.map(d => d.light);

  return {
    blinkRate: calculateMeanAndStd(blinkRateValues),
    eyeRedness: calculateMeanAndStd(eyeRednessValues),
    emotions: {
      happy: calculateMeanAndStd(happyValues),
      sad: calculateMeanAndStd(sadValues),
      neutral: calculateMeanAndStd(neutralValues),
    },
    environmental: {
      temperature: calculateMeanAndStd(tempValues),
      humidity: calculateMeanAndStd(humidityValues),
      light: calculateMeanAndStd(lightValues),
    },
    calibratedAt: Date.now()
  };
}

export function saveBaseline(baseline: BaselineMetrics): void {
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
  } catch (error) {
    console.error('Failed to save baseline:', error);
  }
}

export function loadBaseline(): BaselineMetrics | null {
  try {
    const stored = localStorage.getItem(BASELINE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load baseline:', error);
    return null;
  }
}

export function clearBaseline(): void {
  try {
    localStorage.removeItem(BASELINE_KEY);
  } catch (error) {
    console.error('Failed to clear baseline:', error);
  }
}

export function detectAnomaly(
  currentValue: number,
  baseline: { mean: number; std: number },
  threshold: number = 2
): boolean {
  if (baseline.std === 0) return false;
  const zScore = Math.abs((currentValue - baseline.mean) / baseline.std);
  return zScore > threshold;
}

export function getAnomalySeverity(
  currentValue: number,
  baseline: { mean: number; std: number }
): 'low' | 'medium' | 'high' {
  if (baseline.std === 0) return 'low';
  const zScore = Math.abs((currentValue - baseline.mean) / baseline.std);

  if (zScore > 3) return 'high';
  if (zScore > 2) return 'medium';
  return 'low';
}
