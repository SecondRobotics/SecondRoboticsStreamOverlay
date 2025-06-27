import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ScoreData {
  redScore: number;
  blueScore: number;
  error?: string;
}

// Cache for file stats and scores to reduce file system calls
const scoreCache = new Map<string, {
  redScore: number;
  blueScore: number;
  redMtime: number;
  blueMtime: number;
  error?: string;
}>();

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