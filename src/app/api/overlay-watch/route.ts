import { NextRequest, NextResponse } from 'next/server';
import { watch, FSWatcher } from 'fs';
import path from 'path';

// Store active watchers and clients
const watchers = new Map<string, FSWatcher>();
const clients = new Set<ReadableStreamDefaultController>();

let isWatchingEnabled = false;

export async function GET(request: NextRequest) {
  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
      
      // Handle client disconnection
      request.signal?.addEventListener('abort', () => {
        clients.delete(controller);
        if (clients.size === 0) {
          stopAllWatchers();
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action, paths } = await request.json();
    
    if (action === 'start' && paths) {
      startWatching(paths);
      return NextResponse.json({ status: 'watching started', paths });
    } else if (action === 'stop') {
      stopAllWatchers();
      return NextResponse.json({ status: 'watching stopped' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

function startWatching(paths: { field1?: string, field2?: string }) {
  stopAllWatchers();
  isWatchingEnabled = true;
  
  const filesToWatch = [
    'Score_R.txt',
    'Score_B.txt', 
    'Timer.txt',
    'OPR.txt',
    'GameState.txt'
  ];
  
  // Watch Field 1 files
  if (paths.field1) {
    filesToWatch.forEach(fileName => {
      const filePath = path.join(paths.field1!, fileName);
      try {
        const watcher = watch(filePath, (eventType) => {
          if (eventType === 'change' || eventType === 'rename') {
            broadcastChange('field1', fileName, filePath);
          }
        });
        
        watchers.set(`field1_${fileName}`, watcher);
      } catch (error) {
        console.error(`Failed to watch ${filePath}:`, error);
      }
    });
  }
  
  // Watch Field 2 files
  if (paths.field2) {
    filesToWatch.forEach(fileName => {
      const filePath = path.join(paths.field2!, fileName);
      try {
        const watcher = watch(filePath, (eventType) => {
          if (eventType === 'change' || eventType === 'rename') {
            broadcastChange('field2', fileName, filePath);
          }
        });
        
        watchers.set(`field2_${fileName}`, watcher);
      } catch (error) {
        console.error(`Failed to watch ${filePath}:`, error);
      }
    });
  }
}

function stopAllWatchers() {
  watchers.forEach((watcher) => {
    try {
      watcher.close();
    } catch (error) {
      console.error('Error closing watcher:', error);
    }
  });
  watchers.clear();
  isWatchingEnabled = false;
}

function broadcastChange(field: string, fileName: string, filePath: string) {
  const message = {
    type: 'file_changed',
    field,
    fileName,
    filePath,
    timestamp: Date.now()
  };
  
  const data = `data: ${JSON.stringify(message)}\n\n`;
  
  // Broadcast to all connected clients
  clients.forEach(controller => {
    try {
      controller.enqueue(data);
    } catch (error) {
      // Client disconnected, remove from set
      clients.delete(controller);
    }
  });
}