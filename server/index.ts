import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { stateManager } from './state.js';
import { setupFileWatcher } from './fileWatcher.js';
import { WebSocketMessage, OverlayState } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Track connected clients
const clients = new Set<WebSocket>();

// Broadcast state to all connected clients
function broadcast(state: OverlayState): void {
  const message: WebSocketMessage = {
    type: 'state',
    payload: state,
  };
  const data = JSON.stringify(message);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Subscribe to state changes and broadcast
stateManager.subscribe((state) => {
  broadcast(state);
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');
  clients.add(ws);

  // Send current state immediately
  const message: WebSocketMessage = {
    type: 'state',
    payload: stateManager.getState(),
  };
  ws.send(JSON.stringify(message));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;

      if (message.type === 'update') {
        const updates = message.payload as Partial<OverlayState>;

        // If gameFileLocation changed, update file watcher
        if (updates.gameFileLocation !== undefined) {
          setupFileWatcher(updates.gameFileLocation);
        }

        stateManager.updateState(updates);
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error);
    clients.delete(ws);
  });
});

// In production, serve the static files
if (!isDev) {
  const clientPath = path.join(__dirname, '../client');
  app.use(express.static(clientPath));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', clients: clients.size });
});

server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] WebSocket available at ws://localhost:${PORT}/ws`);

  // Set up file watcher if there's an existing gameFileLocation
  const state = stateManager.getState();
  if (state.gameFileLocation) {
    setupFileWatcher(state.gameFileLocation);
  }
});
