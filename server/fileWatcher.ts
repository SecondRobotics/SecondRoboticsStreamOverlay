import { watch, FSWatcher } from 'chokidar';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { stateManager } from './state.js';
import { PlayerOPR } from './types.js';

let currentWatcher: FSWatcher | null = null;
let currentWatchPath: string = '';

function readScore(filePath: string): number {
  try {
    if (!existsSync(filePath)) return 0;
    const content = readFileSync(filePath, 'utf-8');
    return parseInt(content.trim()) || 0;
  } catch {
    return 0;
  }
}

function readTimer(filePath: string): string {
  try {
    if (!existsSync(filePath)) return '00:00';
    const content = readFileSync(filePath, 'utf-8');
    return content.trim() || '00:00';
  } catch {
    return '00:00';
  }
}

function readOPR(filePath: string): { red: PlayerOPR[]; blue: PlayerOPR[] } {
  const defaultOPR = {
    red: [
      { username: '', score: 0 },
      { username: '', score: 0 },
      { username: '', score: 0 },
    ],
    blue: [
      { username: '', score: 0 },
      { username: '', score: 0 },
      { username: '', score: 0 },
    ],
  };

  try {
    if (!existsSync(filePath)) return defaultOPR;
    const content = readFileSync(filePath, 'utf-8');
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    if (lines.length >= 6) {
      const parseOPRLine = (line: string): PlayerOPR => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const username = line.substring(0, colonIndex).trim();
          const scoreStr = line.substring(colonIndex + 1).trim();
          return { username, score: parseFloat(scoreStr) || 0 };
        }
        return { username: line, score: 0 };
      };

      return {
        red: [parseOPRLine(lines[0]), parseOPRLine(lines[1]), parseOPRLine(lines[2])],
        blue: [parseOPRLine(lines[3]), parseOPRLine(lines[4]), parseOPRLine(lines[5])],
      };
    }
  } catch {
    // Return defaults on error
  }

  return defaultOPR;
}

function readAllGameFiles(gameFileLocation: string): void {
  if (!gameFileLocation || !existsSync(gameFileLocation)) return;

  const redScorePath = path.join(gameFileLocation, 'Score_R.txt');
  const blueScorePath = path.join(gameFileLocation, 'Score_B.txt');
  const timerPath = path.join(gameFileLocation, 'Timer.txt');
  const oprPath = path.join(gameFileLocation, 'OPR.txt');

  const redScore = readScore(redScorePath);
  const blueScore = readScore(blueScorePath);
  const matchTime = readTimer(timerPath);
  const opr = readOPR(oprPath);

  stateManager.updateState({
    redScore,
    blueScore,
    matchTime,
    redOPR: opr.red,
    blueOPR: opr.blue,
  });
}

export function setupFileWatcher(gameFileLocation: string): void {
  // Don't re-watch if already watching the same path
  if (currentWatchPath === gameFileLocation && currentWatcher) {
    return;
  }

  // Close existing watcher
  if (currentWatcher) {
    currentWatcher.close();
    currentWatcher = null;
  }

  currentWatchPath = gameFileLocation;

  if (!gameFileLocation || !existsSync(gameFileLocation)) {
    console.log('[FileWatcher] No valid game file location to watch');
    return;
  }

  console.log(`[FileWatcher] Watching directory: ${gameFileLocation}`);

  // Do an initial read
  readAllGameFiles(gameFileLocation);

  // Set up watcher for .txt files in the directory
  currentWatcher = watch(path.join(gameFileLocation, '*.txt'), {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  currentWatcher.on('change', (filePath) => {
    console.log(`[FileWatcher] File changed: ${filePath}`);
    readAllGameFiles(gameFileLocation);
  });

  currentWatcher.on('add', (filePath) => {
    console.log(`[FileWatcher] File added: ${filePath}`);
    readAllGameFiles(gameFileLocation);
  });

  currentWatcher.on('error', (error) => {
    console.error('[FileWatcher] Error:', error);
  });
}

export function stopFileWatcher(): void {
  if (currentWatcher) {
    currentWatcher.close();
    currentWatcher = null;
    currentWatchPath = '';
  }
}
