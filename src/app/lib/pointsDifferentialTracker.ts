export interface PointsDifferentialData {
  timestamp: number;
  redScore: number;
  blueScore: number;
  differential: number; // red - blue
  gameTime: string;
}

class PointsDifferentialTracker {
  private data: PointsDifferentialData[] = [];
  private isLogging = false;
  private gameFileLocation = '';

  startLogging(gameFileLocation: string) {
    this.gameFileLocation = gameFileLocation;
    this.isLogging = true;
    this.data = [];
    console.log('Points differential logging started');
  }

  stopLogging() {
    this.isLogging = false;
    console.log('Points differential logging stopped. Total data points:', this.data.length);
  }

  logPoint(redScore: number, blueScore: number, gameTime: string, gameState: string) {
    if (!this.isLogging || gameState === 'FINISHED') {
      return;
    }

    const differential = redScore - blueScore;
    const dataPoint: PointsDifferentialData = {
      timestamp: Date.now(),
      redScore,
      blueScore,
      differential,
      gameTime
    };

    // Only add if it's different from the last data point
    const lastPoint = this.data[this.data.length - 1];
    if (!lastPoint || 
        lastPoint.redScore !== redScore || 
        lastPoint.blueScore !== blueScore ||
        lastPoint.gameTime !== gameTime) {
      this.data.push(dataPoint);
    }
  }

  getData(): PointsDifferentialData[] {
    return [...this.data];
  }

  clear() {
    this.data = [];
    this.isLogging = false;
  }

  isActive(): boolean {
    return this.isLogging;
  }
}

export const pointsDifferentialTracker = new PointsDifferentialTracker();