import React from 'react';
import { VideoStream } from './VideoStream';
import { MetricsCards } from './MetricsCards';
import { BlinkRateGraph } from './BlinkRateGraph';
import { EmotionTimeline } from './EmotionTimeline';
import { EyeRednessGauge } from './EyeRednessGauge';
import { EnvironmentPanel } from './EnvironmentPanel';
import { AlertsPanel } from './AlertsPanel';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <VideoStream />
        </div>

        <div className="lg:col-span-2">
          <MetricsCards />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlinkRateGraph />
        <EyeRednessGauge />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionTimeline />
        <EnvironmentPanel />
      </div>

      <AlertsPanel />
    </div>
  );
}
