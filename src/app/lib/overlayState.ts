export type OverlayMode = 'match' | 'starting-soon' | 'results';

export interface OverlayState {
  mode: OverlayMode;
  matchTitle: string;
  matchTime: string;
  gameFileLocation: string;
  redScore: number;
  blueScore: number;
  redOPR: { username: string; score: number }[];
  blueOPR: { username: string; score: number }[];
  lastUpdated: number;
}

const defaultState: OverlayState = {
  mode: 'starting-soon',
  matchTitle: 'FRC Stream Overlay',
  matchTime: '00:00',
  gameFileLocation: '',
  redScore: 0,
  blueScore: 0,
  redOPR: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
  blueOPR: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
  lastUpdated: Date.now(),
};

export const getOverlayState = async (): Promise<OverlayState> => {
  if (typeof window === 'undefined') return defaultState;
  
  try {
    const response = await fetch('/api/overlay-state');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to load overlay state:', error);
  }
  
  return defaultState;
};

export const setOverlayState = async (state: Partial<OverlayState>): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const response = await fetch('/api/overlay-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update overlay state');
    }
  } catch (error) {
    console.error('Failed to save overlay state:', error);
  }
};

export const useOverlayState = (callback: (state: OverlayState) => void) => {
  if (typeof window === 'undefined') return;
  
  // Poll for state changes every 500ms
  const interval = setInterval(async () => {
    try {
      const state = await getOverlayState();
      callback(state);
    } catch (error) {
      console.error('Failed to poll overlay state:', error);
    }
  }, 500);
  
  return () => {
    clearInterval(interval);
  };
};