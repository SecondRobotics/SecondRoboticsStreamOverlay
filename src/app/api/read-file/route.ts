import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return new NextResponse('0', { status: 200 });
    }

    // Use synchronous read for maximum speed
    const content = readFileSync(filePath, 'utf-8');
    
    return new NextResponse(content.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch {
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