import axios from 'axios';

const ROBOFLOW_API_URL = 'https://serverless.roboflow.com/facial-emotion-detection-mlrex/1';
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
      url: ROBOFLOW_API_URL,
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