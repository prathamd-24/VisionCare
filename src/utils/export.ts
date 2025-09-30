import { MetricDataPoint, EmotionDataPoint, EnvironmentalDataPoint } from '../data/demoData';

export function exportToCSV(
  blinkRateData: MetricDataPoint[],
  eyeRednessData: MetricDataPoint[],
  emotionData: EmotionDataPoint[],
  environmentalData: EnvironmentalDataPoint[],
  startTime?: number,
  endTime?: number
): void {
  const filteredBlinkRate = filterByTimeRange(blinkRateData, startTime, endTime);
  const filteredEyeRedness = filterByTimeRange(eyeRednessData, startTime, endTime);
  const filteredEmotion = filterByTimeRange(emotionData, startTime, endTime);
  const filteredEnvironmental = filterByTimeRange(environmentalData, startTime, endTime);

  const rows: string[] = [
    'Timestamp,DateTime,BlinkRate,EyeRedness,Happy,Sad,Neutral,Surprised,Angry,Temperature,Humidity,Light'
  ];

  const allTimestamps = new Set([
    ...filteredBlinkRate.map(d => d.timestamp),
    ...filteredEyeRedness.map(d => d.timestamp),
    ...filteredEmotion.map(d => d.timestamp),
    ...filteredEnvironmental.map(d => d.timestamp)
  ]);

  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  sortedTimestamps.forEach(timestamp => {
    const blinkRate = filteredBlinkRate.find(d => d.timestamp === timestamp);
    const eyeRedness = filteredEyeRedness.find(d => d.timestamp === timestamp);
    const emotion = filteredEmotion.find(d => d.timestamp === timestamp);
    const environmental = filteredEnvironmental.find(d => d.timestamp === timestamp);

    const dateTime = new Date(timestamp).toISOString();

    rows.push([
      timestamp,
      dateTime,
      blinkRate?.value.toFixed(2) || '',
      eyeRedness?.value.toFixed(3) || '',
      emotion?.happy.toFixed(3) || '',
      emotion?.sad.toFixed(3) || '',
      emotion?.neutral.toFixed(3) || '',
      emotion?.surprised.toFixed(3) || '',
      emotion?.angry.toFixed(3) || '',
      environmental?.temperature.toFixed(1) || '',
      environmental?.humidity.toFixed(1) || '',
      environmental?.light.toFixed(0) || ''
    ].join(','));
  });

  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `webcam_metrics_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function filterByTimeRange<T extends { timestamp: number }>(
  data: T[],
  startTime?: number,
  endTime?: number
): T[] {
  if (!startTime && !endTime) return data;

  return data.filter(item => {
    if (startTime && item.timestamp < startTime) return false;
    if (endTime && item.timestamp > endTime) return false;
    return true;
  });
}
