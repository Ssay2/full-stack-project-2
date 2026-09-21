import { useEffect, useState } from 'react';

const STALE_THRESHOLD_MS = 60000;

function mostRecentTimestamp(latest) {
  const timestamps = Object.values(latest)
    .map((tick) => (tick ? new Date(tick.timestamp).getTime() : 0))
    .filter(Boolean);
  return timestamps.length > 0 ? Math.max(...timestamps) : null;
}

export function StatusBanner({ connectionStatus, serverStatus, latest }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (connectionStatus === 'reconnecting' || connectionStatus === 'disconnected') {
    return <div className="status-banner status-banner--error">Connection lost, reconnecting...</div>;
  }

  if (serverStatus?.rateLimitedUntil) {
    const secondsLeft = Math.ceil((new Date(serverStatus.rateLimitedUntil).getTime() - now) / 1000);
    if (secondsLeft > 0) {
      return (
        <div className="status-banner status-banner--warning">
          Rate limited by data provider. Retrying in {secondsLeft}s
        </div>
      );
    }
  }

  const lastTick = mostRecentTimestamp(latest);
  if (lastTick && now - lastTick > STALE_THRESHOLD_MS) {
    return <div className="status-banner status-banner--warning">Data may be stale</div>;
  }

  return <div className="status-banner status-banner--ok">● Live</div>;
}
