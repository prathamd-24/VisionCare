export interface MetricDataPoint {
  timestamp: number;
  value: number;
}

export interface EmotionDataPoint {
  timestamp: number;
  happy: number;
  sad: number;
  neutral: number;
  surprised: number;
  angry: number;
}

export interface EnvironmentalDataPoint {
  timestamp: number;
  temperature: number;
  humidity: number;
  light: number;
}

export interface AnomalyEvent {
  timestamp: number;
  type: 'blink_rate' | 'emotion' | 'eye_redness' | 'environmental';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

const now = Date.now();
const HOUR = 60 * 60 * 1000;

export const demoBlinkRateData: MetricDataPoint[] = Array.from({ length: 120 }, (_, i) => {
  const base = 15 + Math.sin(i / 10) * 3;
  const anomaly = i > 80 && i < 90 ? 10 : 0;
  return {
    timestamp: now - (120 - i) * 30000,
    value: Math.max(0, base + anomaly + (Math.random() - 0.5) * 2)
  };
});

export const demoEyeRednessData: MetricDataPoint[] = Array.from({ length: 120 }, (_, i) => {
  const base = 0.3 + Math.sin(i / 15) * 0.1;
  const anomaly = i > 95 && i < 105 ? 0.25 : 0;
  return {
    timestamp: now - (120 - i) * 30000,
    value: Math.min(1, Math.max(0, base + anomaly + (Math.random() - 0.5) * 0.05))
  };
});

export const demoEmotionData: EmotionDataPoint[] = Array.from({ length: 120 }, (_, i) => {
  const sadSpike = i > 70 && i < 85 ? 0.3 : 0;
  return {
    timestamp: now - (120 - i) * 30000,
    happy: Math.max(0, 0.5 + (Math.random() - 0.5) * 0.2 - sadSpike),
    sad: Math.max(0, 0.1 + sadSpike + (Math.random() - 0.5) * 0.1),
    neutral: Math.max(0, 0.3 + (Math.random() - 0.5) * 0.15),
    surprised: Math.max(0, 0.05 + (Math.random() - 0.5) * 0.05),
    angry: Math.max(0, 0.05 + (Math.random() - 0.5) * 0.05)
  };
});

export const demoEnvironmentalData: EnvironmentalDataPoint[] = Array.from({ length: 120 }, (_, i) => {
  const humidityDrop = i > 60 && i < 75 ? -15 : 0;
  return {
    timestamp: now - (120 - i) * 30000,
    temperature: 22 + Math.sin(i / 20) * 2 + (Math.random() - 0.5),
    humidity: Math.max(20, 45 + humidityDrop + (Math.random() - 0.5) * 3),
    light: 300 + Math.sin(i / 25) * 100 + (Math.random() - 0.5) * 50
  };
});

export const demoAnomalies: AnomalyEvent[] = [
  {
    timestamp: now - 50 * 30000,
    type: 'blink_rate',
    severity: 'high',
    message: 'Increased blink rate detected (25 blinks/min)',
    suggestion: 'Take a 20-second eye break. Look at something 20 feet away.'
  },
  {
    timestamp: now - 40 * 30000,
    type: 'emotion',
    severity: 'medium',
    message: 'Elevated sadness levels detected',
    suggestion: 'Consider taking a break. Try a 2-minute breathing exercise.'
  },
  {
    timestamp: now - 30 * 30000,
    type: 'environmental',
    severity: 'medium',
    message: 'Low humidity detected (30%)',
    suggestion: 'Low humidity can cause eye dryness. Consider using a humidifier.'
  },
  {
    timestamp: now - 15 * 30000,
    type: 'eye_redness',
    severity: 'high',
    message: 'High eye redness detected (0.68)',
    suggestion: 'Your eyes may be strained. Reduce screen brightness and take a 5-minute break.'
  }
];

export const baselineCalibrationDuration = 90000;
