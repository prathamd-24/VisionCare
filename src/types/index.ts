export interface BaselineMetrics {
  blinkRate: { mean: number; std: number };
  eyeRedness: { mean: number; std: number };
  emotions: {
    happy: { mean: number; std: number };
    sad: { mean: number; std: number };
    neutral: { mean: number; std: number };
  };
  environmental: {
    temperature: { mean: number; std: number };
    humidity: { mean: number; std: number };
    light: { mean: number; std: number };
  };
  calibratedAt: number;
}

export interface AnomalyThresholds {
  blinkRate: number;
  eyeRedness: number;
  emotion: number;
  environmental: number;
}

export interface LiveMetrics {
  blinkRate: number;
  eyeRedness: number;
  emotion: {
    happy: number;
    sad: number;
    neutral: number;
    surprised: number;
    angry: number;
  };
  environmental: {
    temperature: number;
    humidity: number;
    light: number;
  };
}

export interface AlertConfig {
  enabled: boolean;
  soundEnabled: boolean;
  snoozeUntil: number | null;
}
