import { useState, useEffect, useRef } from 'react';

interface ScoreData {
  redScore: number;
  blueScore: number;
}

interface DualFieldScores {
  field1: ScoreData;
  field2: ScoreData;
}

export const useDualFieldScores = (field1Location: string, field2Location: string, pollInterval: number = 100) => {
  const [scores, setScores] = useState<DualFieldScores>({
    field1: { redScore: 0, blueScore: 0 },
    field2: { redScore: 0, blueScore: 0 }
  });
  
  // Use refs to track previous values and avoid unnecessary state updates
  const prevScoresRef = useRef<DualFieldScores>(scores);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Don't poll if neither field has a location
    if ((!field1Location || field1Location.trim() === '') && 
        (!field2Location || field2Location.trim() === '')) {
      setScores({
        field1: { redScore: 0, blueScore: 0 },
        field2: { redScore: 0, blueScore: 0 }
      });
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
        
        // Only update state if values actually changed
        const newScores: DualFieldScores = {
          field1: data.field1 || { redScore: 0, blueScore: 0 },
          field2: data.field2 || { redScore: 0, blueScore: 0 }
        };
        
        const prev = prevScoresRef.current;
        if (
          prev.field1.redScore !== newScores.field1.redScore ||
          prev.field1.blueScore !== newScores.field1.blueScore ||
          prev.field2.redScore !== newScores.field2.redScore ||
          prev.field2.blueScore !== newScores.field2.blueScore
        ) {
          prevScoresRef.current = newScores;
          setScores(newScores);
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

    // Set up interval for polling
    const interval = setInterval(pollScores, pollInterval);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [field1Location, field2Location, pollInterval]);

  return scores;
};