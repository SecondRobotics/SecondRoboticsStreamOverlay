import { NextRequest, NextResponse } from 'next/server';

export type OverlayMode = 'match' | 'starting-soon';

export interface OverlayState {
  mode: OverlayMode;
  matchTitle: string;
  matchTime: string;
  alliance1Score: number;
  alliance2Score: number;
  lastUpdated: number;
}

let overlayState: OverlayState = {
  mode: 'starting-soon',
  matchTitle: 'FRC Stream Overlay',
  matchTime: '00:00',
  alliance1Score: 0,
  alliance2Score: 0,
  lastUpdated: Date.now(),
};

export async function GET() {
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