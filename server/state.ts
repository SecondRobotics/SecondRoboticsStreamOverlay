import { OverlayState, DEFAULT_STATE } from './types.js';

type StateListener = (state: OverlayState) => void;

class StateManager {
  private state: OverlayState = { ...DEFAULT_STATE };
  private listeners: Set<StateListener> = new Set();

  getState(): OverlayState {
    return { ...this.state };
  }

  updateState(updates: Partial<OverlayState>): void {
    const newState: OverlayState = {
      ...this.state,
      ...updates,
      lastUpdated: Date.now(),
    };

    // Only notify if state actually changed
    if (!this.isEqual(this.state, newState)) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    // Send current state immediately
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  private isEqual(a: OverlayState, b: OverlayState): boolean {
    // Quick check on primitives
    if (
      a.mode !== b.mode ||
      a.matchTitle !== b.matchTitle ||
      a.matchTime !== b.matchTime ||
      a.gameFileLocation !== b.gameFileLocation ||
      a.redScore !== b.redScore ||
      a.blueScore !== b.blueScore
    ) {
      return false;
    }

    // Check OPR arrays
    if (!this.isOPREqual(a.redOPR, b.redOPR)) return false;
    if (!this.isOPREqual(a.blueOPR, b.blueOPR)) return false;

    return true;
  }

  private isOPREqual(
    a: { username: string; score: number }[],
    b: { username: string; score: number }[]
  ): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].username !== b[i].username || a[i].score !== b[i].score) {
        return false;
      }
    }
    return true;
  }
}

export const stateManager = new StateManager();
