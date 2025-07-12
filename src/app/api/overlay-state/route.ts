import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

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
}

let overlayState: OverlayState = {
  mode: 'starting-soon',
  matchTitle: 'FRC Stream Overlay',
  matchTime: '00:00',
  startingTime: '',
  gameFileLocation: '',
  redScore: 0,
  blueScore: 0,
  redOPR: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
  blueOPR: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }],
  lastUpdated: Date.now(),
};

const readScore = (filePath: string): number => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return parseInt(content.trim()) || 0;
  } catch (error) {
    return 0;
  }
};

const readTimer = (filePath: string): string => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.trim() || '00:00';
  } catch (error) {
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

      const red = [
        lines[0] ? parseOPRLine(lines[0]) : { username: '', score: 0 },
        lines[1] ? parseOPRLine(lines[1]) : { username: '', score: 0 },
        lines[2] ? parseOPRLine(lines[2]) : { username: '', score: 0 }
      ];
      const blue = [
        lines[3] ? parseOPRLine(lines[3]) : { username: '', score: 0 },
        lines[4] ? parseOPRLine(lines[4]) : { username: '', score: 0 },
        lines[5] ? parseOPRLine(lines[5]) : { username: '', score: 0 }
      ];
      return { red, blue };
    }
  } catch (error) {
    // Return defaults on error
  }
  
  return { 
    red: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }], 
    blue: [{ username: '', score: 0 }, { username: '', score: 0 }, { username: '', score: 0 }] 
  };
};

export async function GET() {
  // Auto-update data from files if gameFileLocation is set
  if (overlayState.gameFileLocation) {
    try {
      const redScorePath = path.join(overlayState.gameFileLocation, 'Score_R.txt');
      const blueScorePath = path.join(overlayState.gameFileLocation, 'Score_B.txt');
      const timerPath = path.join(overlayState.gameFileLocation, 'Timer.txt');
      const oprPath = path.join(overlayState.gameFileLocation, 'OPR.txt');
      
      overlayState.redScore = readScore(redScorePath);
      overlayState.blueScore = readScore(blueScorePath);
      overlayState.matchTime = readTimer(timerPath);
      
      const opr = readOPR(oprPath);
      overlayState.redOPR = opr.red;
      overlayState.blueOPR = opr.blue;
    } catch (error) {
      // Keep existing values if file reading fails
    }
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