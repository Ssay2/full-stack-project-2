import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const MAX_POINTS = 50;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
const STORAGE_KEY = 'watchlist';
const DEFAULT_WATCHLIST = ['bitcoin', 'ethereum', 'solana'];

function loadWatchlist() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

function saveWatchlist(watchlist) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

// Connects to the Socket.io server and tracks price history + latest price per watched coin.
export function useSocket() {
  const [history, setHistory] = useState({});
  const [latest, setLatest] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [serverStatus, setServerStatus] = useState(null);
  const [watchlist, setWatchlist] = useState(loadWatchlist);
  const [viewerCounts, setViewerCounts] = useState({});
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);
  const watchlistRef = useRef(watchlist);
  watchlistRef.current = watchlist;

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    function subscribeAll() {
      for (const coin of watchlistRef.current) {
        socket.emit('subscribe', coin);
      }
    }

    socket.on('connect', () => {
      setConnectionStatus('connected');
      subscribeAll();
    });
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.io.on('reconnect_attempt', () => setConnectionStatus('reconnecting'));

    socket.on('status', (payload) => setServerStatus(payload));
    socket.on('viewerCounts', (payload) => setViewerCounts(payload));

    socket.on('alert', (payload) => {
      const id = `${payload.coin}-${Date.now()}`;
      setAlerts((prev) => [...prev, { id, ...payload }]);
    });

    socket.on('history', (payload) => {
      setHistory((prev) => ({ ...prev, ...payload }));

      setLatest((prev) => {
        const next = { ...prev };
        for (const coin of Object.keys(payload)) {
          const points = payload[coin];
          if (points.length > 0) {
            next[coin] = { coin, ...points[points.length - 1] };
          }
        }
        return next;
      });
    });

    socket.on('price', (tick) => {
      const { coin, ...point } = tick;

      setHistory((prev) => {
        const coinHistory = [...(prev[coin] || []), point];
        if (coinHistory.length > MAX_POINTS) {
          coinHistory.shift();
        }
        return { ...prev, [coin]: coinHistory };
      });

      setLatest((prev) => ({ ...prev, [coin]: tick }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function addCoin(coinId) {
    setWatchlist((prev) => {
      if (prev.includes(coinId)) return prev;
      const next = [...prev, coinId];
      saveWatchlist(next);
      socketRef.current?.emit('subscribe', coinId);
      return next;
    });
  }

  function removeCoin(coinId) {
    setWatchlist((prev) => {
      const next = prev.filter((id) => id !== coinId);
      saveWatchlist(next);
      socketRef.current?.emit('unsubscribe', coinId);
      return next;
    });
  }

  function setAlert(coin, direction, price) {
    socketRef.current?.emit('setAlert', { coin, direction, price });
  }

  function dismissAlert(id) {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }

  return {
    history,
    latest,
    connectionStatus,
    serverStatus,
    coinIds: watchlist,
    addCoin,
    removeCoin,
    viewerCounts,
    alerts,
    setAlert,
    dismissAlert
  };
}

