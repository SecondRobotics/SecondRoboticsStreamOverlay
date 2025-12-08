import { useState, useEffect, useCallback, useRef } from 'react';
import { OverlayState, WebSocketMessage, DEFAULT_STATE } from '../types/overlay';

const WS_URL = import.meta.env.DEV
  ? 'ws://localhost:3001/ws'
  : `ws://${window.location.host}/ws`;

interface UseOverlaySocketReturn {
  state: OverlayState;
  updateState: (updates: Partial<OverlayState>) => void;
  isConnected: boolean;
}

export function useOverlaySocket(): UseOverlaySocketReturn {
  const [state, setState] = useState<OverlayState>(DEFAULT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('[WebSocket] Connecting to', WS_URL);
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        if (message.type === 'state') {
          setState(message.payload as OverlayState);
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
      wsRef.current = null;

      // Reconnect after 1 second
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 1000);
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const updateState = useCallback((updates: Partial<OverlayState>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'update',
        payload: updates,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { state, updateState, isConnected };
}
