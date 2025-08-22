import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, statSync } from 'fs';

// File cache for read-file API
interface FileCacheEntry {
  content: string;
  mtime: number;
}

const fileCache = new Map<string, FileCacheEntry>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return new NextResponse('0', { status: 200 });
    }

    // Try cache first
    try {
      const stat = statSync(filePath);
      const mtime = stat.mtimeMs;
      const cached = fileCache.get(filePath);
      
      if (cached && cached.mtime === mtime) {
        return new NextResponse(cached.content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
      
      // Read file and cache
      const content = readFileSync(filePath, 'utf-8').trim();
      fileCache.set(filePath, { content, mtime });
      
      // Clean cache if too large
      if (fileCache.size > 50) {
        const firstKey = fileCache.keys().next().value;
        if (firstKey) fileCache.delete(firstKey);
      }
      
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
    } catch (readError) {
      // File doesn't exist or can't be read
      return new NextResponse('0', { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
  } catch (error) {
    // Return 0 on any error for score files
    return new NextResponse('0', { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}