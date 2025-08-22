export type OverlayMode = 'match' | 'starting-soon' | 'results';

export interface OverlayState {
  mode: OverlayMode;
  matchTitle: string;
  matchTime: string;
  startingTime?: string;
  gameFileLocation: string;
  redScore: number;
  blueScore: number;
  redOPR: { username: string; score: number }[];
  blueOPR: { username: string; score: number }[];
  lastUpdated: number;
  seriesEnabled: boolean;
  seriesType: 'bo3' | 'bo5' | 'bo7';
  redAllianceName: string;
  blueAllianceName: string;
  redSeriesScore: number;
  blueSeriesScore: number;
  redTeamId?: string;
  blueTeamId?: string;
  redPrimaryColor?: string;
  redSecondaryColor?: string;
  bluePrimaryColor?: string;
  blueSecondaryColor?: string;
  allianceBranding: boolean;
  flippedTeams?: boolean;
  // Field 2 properties
  field2Enabled?: boolean;
  field2MatchTime?: string;
  field2GameFileLocation?: string;
  field2RedScore?: number;
  field2BlueScore?: number;
  field2RedOPR?: { username: string; score: number }[];
  field2BlueOPR?: { username: string; score: number }[];
  field2SeriesEnabled?: boolean;
  field2SeriesType?: 'bo3' | 'bo5' | 'bo7';
  field2RedAllianceName?: string;
  field2BlueAllianceName?: string;
  field2RedSeriesScore?: number;
  field2BlueSeriesScore?: number;
  field2RedTeamId?: string;
  field2BlueTeamId?: string;
  field2RedPrimaryColor?: string;
  field2RedSecondaryColor?: string;
  field2BluePrimaryColor?: string;
  field2BlueSecondaryColor?: string;
  field2AllianceBranding?: boolean;
  field2FlippedTeams?: boolean;
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
  seriesEnabled: false,
  seriesType: 'bo3',
  redAllianceName: 'Red Alliance',
  blueAllianceName: 'Blue Alliance',
  redSeriesScore: 0,
  blueSeriesScore: 0,
  allianceBranding: false,
  flippedTeams: false,
  // Field 2 defaults
  field2Enabled: false,
  field2MatchTime: '00:00',
  field2GameFileLocation: '',
  field2RedScore: 0,
  field2BlueScore: 0,
  field2RedOPR: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
  field2BlueOPR: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
  field2SeriesEnabled: false,
  field2SeriesType: 'bo3',
  field2RedAllianceName: 'Red Alliance',
  field2BlueAllianceName: 'Blue Alliance',
  field2RedSeriesScore: 0,
  field2BlueSeriesScore: 0,
  field2AllianceBranding: false,
  field2FlippedTeams: false,
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

export const subscribeToOverlayState = (callback: (state: OverlayState) => void) => {
  if (typeof window === 'undefined') return;
  
  let lastUpdated = 0;
  let isFirstCall = true;
  
  // Poll for state changes every 500ms
  const interval = setInterval(async () => {
    try {
      const state = await getOverlayState();
      // Call callback on first call or if state has actually changed
      if (isFirstCall || (state.lastUpdated && state.lastUpdated !== lastUpdated)) {
        lastUpdated = state.lastUpdated || 0;
        isFirstCall = false;
        callback(state);
      }
    } catch (error) {
      console.error('Failed to poll overlay state:', error);
    }
  }, 500);
  
  return () => {
    clearInterval(interval);
  };
};