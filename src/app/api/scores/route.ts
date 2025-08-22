import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, statSync } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';

interface ScoreData {
  redScore: number;
  blueScore: number;
  error?: string;
}

interface BothFieldsScoreData {
  field1?: ScoreData;
  field2?: ScoreData;
}

// Cache for file stats and scores to reduce file system calls
const scoreCache = new Map<string, {
  redScore: number;
  blueScore: number;
  redMtime: number;
  blueMtime: number;
  error?: string;
}>();

// Optimized GET endpoint for both fields at once
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const field1Path = searchParams.get('field1');
  const field2Path = searchParams.get('field2');
  
  const response: BothFieldsScoreData = {};
  
  if (field1Path && field1Path.trim() !== '') {
    response.field1 = getScoresForField(field1Path);
  }
  
  if (field2Path && field2Path.trim() !== '') {
    response.field2 = getScoresForField(field2Path);
  }
  
  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

function getScoresForField(gameFileLocation: string): ScoreData {
  try {
    const redScorePath = path.join(gameFileLocation, 'Score_R.txt');
    const blueScorePath = path.join(gameFileLocation, 'Score_B.txt');
    const cacheKey = gameFileLocation;
    
    // Try to get file stats
    let redMtime = 0;
    let blueMtime = 0;
    
    try {
      const redStat = statSync(redScorePath);
      redMtime = redStat.mtimeMs;
    } catch {}
    
    try {
      const blueStat = statSync(blueScorePath);
      blueMtime = blueStat.mtimeMs;
    } catch {}
    
    // Check cache
    const cached = scoreCache.get(cacheKey);
    if (cached && cached.redMtime === redMtime && cached.blueMtime === blueMtime) {
      return {
        redScore: cached.redScore,
        blueScore: cached.blueScore
      };
    }
    
    // Read scores
    let redScore = 0;
    let blueScore = 0;
    
    try {
      const redContent = readFileSync(redScorePath, 'utf-8').trim();
      redScore = parseInt(redContent) || 0;
    } catch {}
    
    try {
      const blueContent = readFileSync(blueScorePath, 'utf-8').trim();
      blueScore = parseInt(blueContent) || 0;
    } catch {}
    
    // Update cache
    scoreCache.set(cacheKey, {
      redScore,
      blueScore,
      redMtime,
      blueMtime
    });
    
    // Clean cache if too large
    if (scoreCache.size > 50) {
      const firstKey = scoreCache.keys().next().value;
      if (firstKey) {
        scoreCache.delete(firstKey);
      }
    }
    
    return { redScore, blueScore };
  } catch {
    return { redScore: 0, blueScore: 0 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gameFileLocation } = await request.json();
    
    if (!gameFileLocation) {
      return NextResponse.json({ 
        redScore: 0, 
        blueScore: 0, 
        error: 'No game file location specified' 
      });
    }

    // Check if it's a URL or local path
    if (gameFileLocation.startsWith('http://') || gameFileLocation.startsWith('https://')) {
      return NextResponse.json({ 
        redScore: 0, 
        blueScore: 0, 
        error: 'URL-based file locations not supported for scores' 
      });
    }

    const redScorePath = path.join(gameFileLocation, 'Score_R.txt');
    const blueScorePath = path.join(gameFileLocation, 'Score_B.txt');
    const cacheKey = gameFileLocation;

    let redScore = 0;
    let blueScore = 0;
    const errors: string[] = [];

    try {
      // Get file modification times
      const [redStat, blueStat] = await Promise.all([
        fs.stat(redScorePath).catch(() => null),
        fs.stat(blueScorePath).catch(() => null)
      ]);

      const redMtime = redStat?.mtimeMs || 0;
      const blueMtime = blueStat?.mtimeMs || 0;

      // Check cache
      const cached = scoreCache.get(cacheKey);
      const redChanged = !cached || cached.redMtime !== redMtime;
      const blueChanged = !cached || cached.blueMtime !== blueMtime;

      if (cached && !redChanged && !blueChanged) {
        // Use cached values
        return NextResponse.json({
          redScore: cached.redScore,
          blueScore: cached.blueScore,
          error: cached.error
        });
      }

      // Read only changed files
      if (redChanged && redStat) {
        try {
          const redScoreContent = await fs.readFile(redScorePath, 'utf-8');
          const parsedRedScore = parseInt(redScoreContent.trim());
          if (!isNaN(parsedRedScore)) {
            redScore = parsedRedScore;
          } else {
            errors.push('Score_R.txt contains invalid number');
          }
        } catch (error) {
          errors.push(`Failed to read Score_R.txt: ${error}`);
        }
      } else if (cached) {
        redScore = cached.redScore;
      }

      if (blueChanged && blueStat) {
        try {
          const blueScoreContent = await fs.readFile(blueScorePath, 'utf-8');
          const parsedBlueScore = parseInt(blueScoreContent.trim());
          if (!isNaN(parsedBlueScore)) {
            blueScore = parsedBlueScore;
          } else {
            errors.push('Score_B.txt contains invalid number');
          }
        } catch (error) {
          errors.push(`Failed to read Score_B.txt: ${error}`);
        }
      } else if (cached) {
        blueScore = cached.blueScore;
      }

      // Update cache
      scoreCache.set(cacheKey, {
        redScore,
        blueScore,
        redMtime,
        blueMtime,
        error: errors.length > 0 ? errors.join('; ') : undefined
      });

    } catch (error) {
      errors.push(`Failed to access score files: ${error}`);
    }

    const response: ScoreData = {
      redScore,
      blueScore
    };

    if (errors.length > 0) {
      response.error = errors.join('; ');
    }

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error reading scores:', error);
    return NextResponse.json({ 
      redScore: 0, 
      blueScore: 0, 
      error: 'Invalid request' 
    }, { status: 400 });
  }
}