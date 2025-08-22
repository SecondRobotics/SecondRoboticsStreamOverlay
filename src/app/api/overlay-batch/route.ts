import { NextRequest, NextResponse } from 'next/server';
import { setOverlayState } from '../../lib/overlayState';

// Batch update endpoint for multiple overlay state properties
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    
    // Validate that updates is an object
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid updates object' }, { status: 400 });
    }
    
    // Apply updates
    await setOverlayState(updates);
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Error in batch update:', error);
    return NextResponse.json({ error: 'Failed to update overlay state' }, { status: 500 });
  }
}