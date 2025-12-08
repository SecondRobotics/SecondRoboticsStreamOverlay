# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stream overlay application for Second Robotics Competition (SRC). Displays real-time match scores, timers, and player OPR (Offensive Power Rating) data during live streams.

## Commands

```bash
npm run dev      # Start Vite dev server + WebSocket server concurrently
npm run build    # Build frontend + compile server
npm run start    # Run production server (serves static files + WebSocket)
npm run lint     # ESLint
```

## Architecture

**Stack:** Vite + React 19 + TypeScript + Tailwind CSS + Express + WebSocket

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│   Dashboard     │◄──────────────────►│                  │
│   (browser)     │                    │   Node Server    │
└─────────────────┘                    │   (port 3001)    │
                                       │                  │
┌─────────────────┐     WebSocket      │  - WebSocket     │
│   Overlay       │◄──────────────────►│  - File watcher  │
│   (OBS source)  │                    │  - State manager │
└─────────────────┘                    └────────┬─────────┘
                                                │
                                       ┌────────▼─────────┐
                                       │   Game Files     │
                                       │   (chokidar)     │
                                       └──────────────────┘
```

### Key Routes

- `/` - Dashboard for controlling overlay settings
- `/overlay` - Browser source for OBS (transparent background)

### State Management

Server-side state with WebSocket push updates. No polling - clients receive updates only when state changes.

**State flow:**
1. Dashboard sends updates via WebSocket
2. Server updates state + broadcasts to all clients
3. File watcher detects game file changes → updates state → broadcasts

### Server Files (`server/`)

- `index.ts` - Express + WebSocket server
- `state.ts` - State manager with change detection and subscriber pattern
- `fileWatcher.ts` - Chokidar file watcher for game data files
- `types.ts` - Shared types (OverlayState, WebSocket messages)

### Frontend Files (`src/`)

- `lib/useOverlaySocket.ts` - React hook for WebSocket connection with auto-reconnect
- `types/overlay.ts` - Frontend types matching server
- `pages/Dashboard.tsx` - Control panel
- `pages/Overlay.tsx` - OBS browser source
- `components/overlay/` - MatchView, StartingSoon components

### Game File Integration

When `gameFileLocation` is set to a local directory, the server watches for changes to:
- `Score_R.txt` / `Score_B.txt` - Red/Blue alliance scores (integer)
- `Timer.txt` - Match timer display
- `OPR.txt` - Player stats in format `username: score` (6 lines: 3 red, 3 blue)

Updates push to connected clients within ~100ms of file change.

### Dev vs Production

**Development:** Vite runs on :5173, server on :3001. WebSocket connects directly to :3001.

**Production:** Server serves static build from `dist/client/`, WebSocket on same port.

Path alias: `@/*` maps to `./src/*`
