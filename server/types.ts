export type OverlayMode = 'match' | 'starting-soon';

export interface PlayerOPR {
  username: string;
  score: number;
}

export interface OverlayState {
  mode: OverlayMode;
  matchTitle: string;
  matchTime: string;
  gameFileLocation: string;
  redScore: number;
  blueScore: number;
  redOPR: PlayerOPR[];
  blueOPR: PlayerOPR[];
  lastUpdated: number;
}

export type WebSocketMessageType =
  | 'state'           // Full state update
  | 'update'          // Partial state update from dashboard
  | 'subscribe'       // Client subscribing to updates
  | 'file-update';    // File change detected

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: Partial<OverlayState> | OverlayState;
}

export const DEFAULT_STATE: OverlayState = {
  mode: 'starting-soon',
  matchTitle: 'SRC Stream Overlay',
  matchTime: '00:00',
  gameFileLocation: '',
  redScore: 0,
  blueScore: 0,
  redOPR: [
    { username: '', score: 0 },
    { username: '', score: 0 },
    { username: '', score: 0 },
  ],
  blueOPR: [
    { username: '', score: 0 },
    { username: '', score: 0 },
    { username: '', score: 0 },
  ],
  lastUpdated: Date.now(),
};
