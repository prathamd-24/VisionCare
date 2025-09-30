import axios from 'axios';

const EMOTION_API_URL = 'https://serverless.roboflow.com/facial-emotion-detection-mlrex/1';
const EYE_REDNESS_API_URL = 'https://serverless.roboflow.com/redness-of-eyes-aju4x/1';
const API_KEY = 'kOWULMB6FHfmvByp1uU6';

export interface EmotionPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
  detection_id: string;
}

export interface EmotionDetectionResponse {
  predictions: EmotionPrediction[];
}

export interface EyeRednessDetectionResponse {
  predictions: EmotionPrediction[];
}

export interface CombinedDetectionResult {
  emotions: {
    happy: number;
    sad: number;
    neutral: number;
    surprised: number;
    angry: number;
  };
  eyeRedness: number;
}

/**
 * Captures a frame from the video element and converts it to base64
 */
export function captureFrameAsBase64(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  ctx.drawImage(videoElement, 0, 0);
  
  // Convert to base64, removing the data URL prefix
  const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  return base64Data;
}

/**
 * Sends a base64 image to Roboflow for emotion detection
 */
export async function detectEmotionFromImage(base64Image: string): Promise<EmotionDetectionResponse> {
  try {
    const response = await axios({
      method: 'POST',
      url: EMOTION_API_URL,
      params: {
        api_key: API_KEY
      },
      data: base64Image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error detecting emotion:', error);
    throw error;
  }
}

/**
 * Sends a base64 image to Roboflow for eye redness detection
 */
export async function detectEyeRednessFromImage(base64Image: string): Promise<EyeRednessDetectionResponse> {
  try {
    const response = await axios({
      method: 'POST',
      url: EYE_REDNESS_API_URL,
      params: {
        api_key: API_KEY
      },
      data: base64Image,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error detecting eye redness:', error);
    throw error;
  }
}

/**
 * Performs both emotion and eye redness detection simultaneously
 */
export async function performCombinedDetection(base64Image: string): Promise<CombinedDetectionResult> {
  try {
    // Run both detections in parallel for better performance
    const [emotionResponse, eyeRednessResponse] = await Promise.all([
      detectEmotionFromImage(base64Image),
      detectEyeRednessFromImage(base64Image)
    ]);

    const emotions = mapRoboflowToEmotions(emotionResponse.predictions);
    const eyeRedness = mapEyeRednessToValue(eyeRednessResponse.predictions);

    return {
      emotions,
      eyeRedness
    };
  } catch (error) {
    console.error('Error in combined detection:', error);
    throw error;
  }
}

/**
 * Converts Roboflow emotion class to our emotion format
 */
export function mapRoboflowToEmotions(predictions: EmotionPrediction[]) {
  // Initialize all emotions to 0
  const emotions = {
    happy: 0,
    sad: 0,
    neutral: 0,
    surprised: 0,
    angry: 0
  };

  if (predictions.length === 0) {
    // If no face detected, default to neutral
    emotions.neutral = 1;
    return emotions;
  }

  // Find the prediction with highest confidence
  const bestPrediction = predictions.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );

  // Map Roboflow classes to our emotion format
  const classMapping: Record<string, keyof typeof emotions> = {
    'happy': 'happy',
    'joy': 'happy',
    'happiness': 'happy',
    'sad': 'sad',
    'sadness': 'sad',
    'neutral': 'neutral',
    'surprise': 'surprised',
    'surprised': 'surprised',
    'anger': 'angry',
    'angry': 'angry',
    'fear': 'sad', // Map fear to sad for simplicity
    'disgust': 'angry' // Map disgust to angry for simplicity
  };

  const emotionKey = classMapping[bestPrediction.class.toLowerCase()];
  
  if (emotionKey) {
    emotions[emotionKey] = bestPrediction.confidence;
    
    // Distribute remaining confidence to neutral
    const remainingConfidence = 1 - bestPrediction.confidence;
    emotions.neutral = remainingConfidence;
  } else {
    // Unknown emotion, default to neutral
    emotions.neutral = 1;
  }

  return emotions;
}

/**
 * Converts Roboflow eye redness predictions to a normalized redness value
 */
export function mapEyeRednessToValue(predictions: EmotionPrediction[]): number {
  if (predictions.length === 0) {
    // No red eyes detected, return low redness value
    return 0.1;
  }

  // Find the prediction with highest confidence for red-eyes class
  const redEyesPrediction = predictions.find(pred => 
    pred.class.toLowerCase().includes('red') || 
    pred.class.toLowerCase().includes('redness')
  );

  if (redEyesPrediction) {
    // Map confidence to redness level (0.0 to 1.0)
    // Higher confidence means more redness detected
    return Math.min(1.0, redEyesPrediction.confidence);
  }

  // If no red-eyes class found but predictions exist, 
  // assume low redness based on detection confidence
  const bestPrediction = predictions.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );

  // Inverse relationship - high confidence in non-red detection = low redness
  return Math.max(0.1, 1 - bestPrediction.confidence);
}