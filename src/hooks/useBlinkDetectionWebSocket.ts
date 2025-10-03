import { useRef, useState, useCallback, useEffect } from 'react';

export interface BlinkStats {
  total_blinks: number;
  overall_bpm: number;
  recent_bpm: number;
  elapsed_time: number;
}

export interface WebSocketMessage {
  blink_stats: BlinkStats;
}

export function useBlinkDetectionWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [blinkStats, setBlinkStats] = useState<BlinkStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const frameQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      // Use the proxy path for local development, direct URL for production
      const wsUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? `ws://${window.location.host}/ws`
        : 'wss://8000-01k2wc4qdjsxmy0567fc8s9c2k.cloudspaces.litng.ai/ws';
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected for blink detection');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (data.blink_stats) {
            setBlinkStats(data.blink_stats);
            setIsAnalyzing(false);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection error');
        setIsAnalyzing(false);
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsAnalyzing(false);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setConnectionError('Failed to connect after multiple attempts');
        }
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setBlinkStats(null);
    setIsAnalyzing(false);
    frameQueueRef.current = [];
    isProcessingRef.current = false;
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendFrame = useCallback((base64Frame: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    // Add to queue if not currently processing
    frameQueueRef.current.push(base64Frame);
    
    // Process queue if not already processing
    if (!isProcessingRef.current && frameQueueRef.current.length > 0) {
      isProcessingRef.current = true;
      setIsAnalyzing(true);
      
      // Get the most recent frame and clear the queue
      const latestFrame = frameQueueRef.current.pop();
      frameQueueRef.current = [];
      
      try {
        wsRef.current.send(JSON.stringify({
          frame: latestFrame
        }));
        
        // Reset processing flag after a delay to allow for response
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 100);
        
      } catch (error) {
        console.error('Error sending frame:', error);
        isProcessingRef.current = false;
        setIsAnalyzing(false);
        return false;
      }
    }
    
    return true;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    blinkStats,
    isAnalyzing,
    connect,
    disconnect,
    sendFrame
  };
}