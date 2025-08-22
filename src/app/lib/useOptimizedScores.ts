import { useState, useEffect, useRef } from 'react';
import { OverlayState, getOverlayState } from './overlayState';
import { useFileWatcher } from './useFileWatcher';

interface UseOptimizedScoresOptions {
  enableFileWatcher?: boolean;
  pollInterval?: number;
  onStateChange?: (state: OverlayState) => void;
}

export const useOptimizedScores = (options: UseOptimizedScoresOptions = {}) => {
  const {
    enableFileWatcher = false,
    pollInterval = 100,
    onStateChange
  } = options;

  const [overlayState, setOverlayState] = useState<OverlayState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdatedRef = useRef(0);

  // File watcher for real-time updates
  const { isConnected } = useFileWatcher({
    field1Path: overlayState?.gameFileLocation,
    field2Path: overlayState?.field2GameFileLocation,
    enabled: enableFileWatcher,
    onFileChange: (event) => {
      if (event.type === 'file_changed') {
        // Immediately fetch new state when file changes
        fetchState();
      }
    }
  });

  const fetchState = async () => {
    try {
      const state = await getOverlayState();
      
      // Only update if state actually changed
      if (!overlayState || state.lastUpdated !== lastUpdatedRef.current) {
        setOverlayState(state);
        lastUpdatedRef.current = state.lastUpdated || 0;
        setIsLoading(false);
        
        if (onStateChange) {
          onStateChange(state);
        }
      }
    } catch (error) {
      console.error('Failed to fetch overlay state:', error);
    }
  };

  // Polling fallback and initial load
  useEffect(() => {
    // Initial load
    fetchState();

    // Set up polling if file watcher is disabled or not connected
    if (!enableFileWatcher || !isConnected) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }

      pollTimerRef.current = setInterval(() => {
        fetchState();
      }, pollInterval);
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [enableFileWatcher, isConnected, pollInterval]);

  // Adaptive polling rate based on game state
  useEffect(() => {
    if (!enableFileWatcher && overlayState && pollTimerRef.current) {
      const field1Active = overlayState.gameState && 
                          overlayState.gameState.trim() !== '' && 
                          overlayState.gameState.trim() !== 'FINISHED';
      
      const field2Active = overlayState.field2Enabled && 
                          overlayState.field2GameState && 
                          overlayState.field2GameState.trim() !== '' && 
                          overlayState.field2GameState.trim() !== 'FINISHED';

      const shouldBeHighSpeed = field1Active || field2Active || overlayState.mode === 'match';
      const newInterval = shouldBeHighSpeed ? 50 : 1000; // 50ms when active, 1s when idle

      if (newInterval !== pollInterval) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(fetchState, newInterval);
      }
    }
  }, [overlayState?.gameState, overlayState?.field2GameState, overlayState?.mode, enableFileWatcher, pollInterval]);

  return {
    overlayState,
    isLoading,
    isFileWatcherConnected: enableFileWatcher ? isConnected : null,
    refetch: fetchState
  };
};