const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { startPoller } = require('./poller');
const { getHistory } = require('./priceStore');
const { ALLOWED_COINS, isAllowed } = require('./coins');
const { addAlert, removeSocketAlerts } = require('./alerts');

const PORT = process.env.PORT || 4000;
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 20000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const MAX_SUBSCRIPTIONS_PER_SOCKET = 10;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: CLIENT_ORIGIN }));

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get('/coins', (req, res) => {
  res.json(ALLOWED_COINS);
});

// Counts current subscribers per coin room, for the live viewer count feature.
function getViewerCounts() {
  const counts = {};
  for (const room of io.sockets.adapter.rooms.keys()) {
    if (room.startsWith('coin:')) {
      counts[room.slice('coin:'.length)] = io.sockets.adapter.rooms.get(room).size;
    }
  }
  return counts;
}

function broadcastViewerCounts() {
  io.emit('viewerCounts', getViewerCounts());
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('subscribe', (coinId) => {
    if (!isAllowed(coinId)) return;

    const activeSubscriptions = [...socket.rooms].filter((room) => room.startsWith('coin:'));
    if (activeSubscriptions.length >= MAX_SUBSCRIPTIONS_PER_SOCKET) return;

    socket.join(`coin:${coinId}`);
    socket.emit('history', { [coinId]: getHistory(coinId) });
    broadcastViewerCounts();
  });

  socket.on('unsubscribe', (coinId) => {
    socket.leave(`coin:${coinId}`);
    broadcastViewerCounts();
  });

  socket.on('setAlert', ({ coin, direction, price } = {}) => {
    if (!isAllowed(coin)) return;
    if (direction !== 'above' && direction !== 'below') return;
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return;

    addAlert(socket.id, { coin, direction, price });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    removeSocketAlerts(socket.id);
    broadcastViewerCounts();
  });
});


let stopPoller;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  stopPoller = startPoller(io, { intervalMs: POLL_INTERVAL_MS });
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  if (stopPoller) stopPoller();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
