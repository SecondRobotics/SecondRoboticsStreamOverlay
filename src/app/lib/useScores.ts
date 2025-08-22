import { useState, useEffect, useRef } from 'react';
import { setOverlayState } from './overlayState';

interface ScoreData {
  redScore: number;
  blueScore: number;
  error?: string;
}

interface FieldScores {
  field1: ScoreData;
  field2: ScoreData;
}

// Optimized hook that fetches scores for both fields in a single API call
export const useOptimizedScores = (field1Location: string, field2Location: string, updateOverlayState = true, pollInterval = 100) => {
  const [scores, setScores] = useState<FieldScores>({
    field1: { redScore: 0, blueScore: 0 },
    field2: { redScore: 0, blueScore: 0 }
  });
  
  const prevScoresRef = useRef<FieldScores>(scores);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Don't poll if neither field has a location
    if ((!field1Location || field1Location.trim() === '') && 
        (!field2Location || field2Location.trim() === '')) {
      const emptyScores = {
        field1: { redScore: 0, blueScore: 0 },
        field2: { redScore: 0, blueScore: 0 }
      };
      setScores(emptyScores);
      prevScoresRef.current = emptyScores;
      return;
    }

    const pollScores = async () => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      try {
        // Build query params
        const params = new URLSearchParams();
        if (field1Location && field1Location.trim() !== '') {
          params.append('field1', field1Location);
        }
        if (field2Location && field2Location.trim() !== '') {
          params.append('field2', field2Location);
        }
        
        const response = await fetch(`/api/scores?${params}`, {
          signal: abortController.signal,
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Build new scores object
        const newScores: FieldScores = {
          field1: data.field1 || { redScore: 0, blueScore: 0 },
          field2: data.field2 || { redScore: 0, blueScore: 0 }
        };
        
        // Only update state if values actually changed
        const prev = prevScoresRef.current;
        if (
          prev.field1.redScore !== newScores.field1.redScore ||
          prev.field1.blueScore !== newScores.field1.blueScore ||
          prev.field2.redScore !== newScores.field2.redScore ||
          prev.field2.blueScore !== newScores.field2.blueScore
        ) {
          prevScoresRef.current = newScores;
          setScores(newScores);
          
          // Optionally update the global overlay state
          if (updateOverlayState) {
            const updates: Partial<{
              redScore: number;
              blueScore: number;
              field2RedScore: number;
              field2BlueScore: number;
            }> = {};
            
            // Update Field 1 scores if changed
            if (prev.field1.redScore !== newScores.field1.redScore || 
                prev.field1.blueScore !== newScores.field1.blueScore) {
              updates.redScore = newScores.field1.redScore;
              updates.blueScore = newScores.field1.blueScore;
            }
            
            // Update Field 2 scores if changed  
            if (prev.field2.redScore !== newScores.field2.redScore || 
                prev.field2.blueScore !== newScores.field2.blueScore) {
              updates.field2RedScore = newScores.field2.redScore;
              updates.field2BlueScore = newScores.field2.blueScore;
            }
            
            if (Object.keys(updates).length > 0) {
              setOverlayState(updates);
            }
          }
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to fetch scores:', error);
        }
      }
    };

    // Initial poll
    pollScores();

    // Set up simple interval for polling - let overlay state handle adaptive polling
    const interval = setInterval(pollScores, pollInterval);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [field1Location, field2Location, updateOverlayState, pollInterval]);

  return scores;
};

// Legacy single-field hook for backwards compatibility
export const useScores = (gameFileLocation: string) => {
  const dualScores = useOptimizedScores(gameFileLocation, '', false);
  return { scores: dualScores.field1 };
};