import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';
import { OverlayState } from '../../lib/overlayState';

let overlayState: OverlayState = {
  mode: 'starting-soon',
  matchTitle: 'FRC Stream Overlay',
  matchTime: '00:00',
  startingTime: '',
  gameFileLocation: '',
  gameState: '',
  redScore: 0,
  blueScore: 0,
  redOPR: [],
  blueOPR: [],
  lastUpdated: Date.now(),
  seriesEnabled: false,
  seriesType: 'bo3',
  redAllianceName: 'Red Alliance',
  blueAllianceName: 'Blue Alliance',
  redSeriesScore: 0,
  blueSeriesScore: 0,
  allianceBranding: false,
  // Field 2 properties
  field2Enabled: false,
  field2MatchTime: '00:00',
  field2GameFileLocation: '',
  field2RedScore: 0,
  field2BlueScore: 0,
  field2RedOPR: [],
  field2BlueOPR: [],
  field2SeriesEnabled: false,
  field2SeriesType: 'bo3',
  field2RedAllianceName: 'Red Alliance',
  field2BlueAllianceName: 'Blue Alliance',
  field2RedSeriesScore: 0,
  field2BlueSeriesScore: 0,
  field2AllianceBranding: false,
};

const readScore = (filePath: string): number => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return parseInt(content.trim()) || 0;
  } catch {
    return 0;
  }
};

const readTimer = (filePath: string): string => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.trim() || '00:00';
  } catch {
    return '00:00';
  }
};

const readOPR = (filePath: string): { red: { username: string; score: number }[], blue: { username: string; score: number }[] } => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length > 0) {
      const parseOPRLine = (line: string): { username: string; score: number } => {
        // Parse "username: score" format
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const username = line.substring(0, colonIndex).trim();
          const scoreStr = line.substring(colonIndex + 1).trim();
          return { username, score: parseFloat(scoreStr) || 0 };
        }
        // Fallback - treat whole line as username with score 0
        return { username: line, score: 0 };
      };

      // Split lines between red and blue teams dynamically
      const midpoint = Math.ceil(lines.length / 2);
      const red = lines.slice(0, midpoint).map(line => parseOPRLine(line));
      const blue = lines.slice(midpoint).map(line => parseOPRLine(line));
      
      return { red, blue };
    }
  } catch {
    // Return defaults on error
  }
  
  return { 
    red: [], 
    blue: [] 
  };
};

export async function GET() {
  let hasChanges = false;
  
  // Auto-update data from files for Field 1
  if (overlayState.gameFileLocation) {
    try {
      const redScorePath = path.join(overlayState.gameFileLocation, 'Score_R.txt');
      const blueScorePath = path.join(overlayState.gameFileLocation, 'Score_B.txt');
      const timerPath = path.join(overlayState.gameFileLocation, 'Timer.txt');
      const oprPath = path.join(overlayState.gameFileLocation, 'OPR.txt');
      const gameStatePath = path.join(overlayState.gameFileLocation, 'GameState.txt');
      
      // Read new values from files
      const newRedScore = readScore(redScorePath);
      const newBlueScore = readScore(blueScorePath);
      const newMatchTime = readTimer(timerPath);
      const newOPR = readOPR(oprPath);
      const newGameState = readTimer(gameStatePath); // Use readTimer since it reads text
      
      // Check if values actually changed
      if (
        overlayState.redScore !== newRedScore ||
        overlayState.blueScore !== newBlueScore ||
        overlayState.matchTime !== newMatchTime ||
        overlayState.gameState !== newGameState ||
        JSON.stringify(overlayState.redOPR) !== JSON.stringify(newOPR.red) ||
        JSON.stringify(overlayState.blueOPR) !== JSON.stringify(newOPR.blue)
      ) {
        hasChanges = true;
        overlayState = {
          ...overlayState,
          redScore: newRedScore,
          blueScore: newBlueScore,
          matchTime: newMatchTime,
          gameState: newGameState,
          redOPR: newOPR.red,
          blueOPR: newOPR.blue,
        };
      }
    } catch {
      // Keep existing values if file reading fails
    }
  }
  
  // Auto-update data from files for Field 2
  if (overlayState.field2GameFileLocation) {
    try {
      const redScorePath = path.join(overlayState.field2GameFileLocation, 'Score_R.txt');
      const blueScorePath = path.join(overlayState.field2GameFileLocation, 'Score_B.txt');
      const timerPath = path.join(overlayState.field2GameFileLocation, 'Timer.txt');
      const oprPath = path.join(overlayState.field2GameFileLocation, 'OPR.txt');
      
      // Read new values from files
      const newRedScore = readScore(redScorePath);
      const newBlueScore = readScore(blueScorePath);
      const newMatchTime = readTimer(timerPath);
      const newOPR = readOPR(oprPath);
      const newGameState = readTimer(gameStatePath); // Use readTimer since it reads text
      
      // Check if values actually changed
      if (
        overlayState.field2RedScore !== newRedScore ||
        overlayState.field2BlueScore !== newBlueScore ||
        overlayState.field2MatchTime !== newMatchTime ||
        overlayState.field2GameState !== newGameState ||
        JSON.stringify(overlayState.field2RedOPR) !== JSON.stringify(newOPR.red) ||
        JSON.stringify(overlayState.field2BlueOPR) !== JSON.stringify(newOPR.blue)
      ) {
        hasChanges = true;
        overlayState = {
          ...overlayState,
          field2RedScore: newRedScore,
          field2BlueScore: newBlueScore,
          field2MatchTime: newMatchTime,
          field2GameState: newGameState,
          field2RedOPR: newOPR.red,
          field2BlueOPR: newOPR.blue,
        };
      }
    } catch {
      // Keep existing values if file reading fails
    }
  }
  
  // Update lastUpdated only if there were changes
  if (hasChanges) {
    overlayState = {
      ...overlayState,
      lastUpdated: Date.now()
    };
  }
  
  return NextResponse.json(overlayState);
}

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    overlayState = {
      ...overlayState,
      ...updates,
      lastUpdated: Date.now(),
    };
    return NextResponse.json(overlayState);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}