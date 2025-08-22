import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { playersPath, team, players } = await request.json();
    
    if (!playersPath || !team || !Array.isArray(players)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (team !== 'red' && team !== 'blue') {
      return NextResponse.json({ error: 'Team must be "red" or "blue"' }, { status: 400 });
    }

    // Ensure directory exists
    try {
      mkdirSync(playersPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Determine filename
    const filename = team === 'red' ? 'RedPlayers.txt' : 'BluePlayers.txt';
    const filePath = path.join(playersPath, filename);

    // Write players to file (one per line)
    const content = players.join('\n');
    writeFileSync(filePath, content, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: `${filename} updated successfully`,
      filePath 
    });

  } catch (error) {
    console.error('Error writing tournament players file:', error);
    return NextResponse.json({ 
      error: 'Failed to write players file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playersPath = searchParams.get('path');
    const team = searchParams.get('team');
    
    if (!playersPath || !team) {
      return NextResponse.json({ error: 'Missing path or team parameter' }, { status: 400 });
    }

    if (team !== 'red' && team !== 'blue') {
      return NextResponse.json({ error: 'Team must be "red" or "blue"' }, { status: 400 });
    }

    const filename = team === 'red' ? 'RedPlayers.txt' : 'BluePlayers.txt';
    const filePath = path.join(playersPath, filename);

    try {
      const { readFileSync } = await import('fs');
      const content = readFileSync(filePath, 'utf-8');
      const players = content.split('\n').filter(line => line.trim());
      
      return NextResponse.json({ 
        success: true,
        players,
        filePath 
      });
    } catch (error) {
      // File doesn't exist or can't be read
      return NextResponse.json({ 
        success: true,
        players: [],
        filePath,
        message: 'File not found, returning empty player list'
      });
    }

  } catch (error) {
    console.error('Error reading tournament players file:', error);
    return NextResponse.json({ 
      error: 'Failed to read players file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}