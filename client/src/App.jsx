import { useEffect, useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { PriceCard } from './components/PriceCard';
import { PriceChart } from './components/PriceChart';
import { StatusBanner } from './components/StatusBanner';
import { Watchlist } from './components/Watchlist';
import { AlertToasts } from './components/AlertToasts';
import './App.css';

function App() {
  const {
    latest,
    history,
    connectionStatus,
    serverStatus,
    coinIds,
    addCoin,
    removeCoin,
    viewerCounts,
    alerts,
    setAlert,
    dismissAlert
  } = useSocket();
  const [selectedCoin, setSelectedCoin] = useState(coinIds[0] || null);

  useEffect(() => {
    if (selectedCoin && !coinIds.includes(selectedCoin)) {
      setSelectedCoin(coinIds[0] || null);
    }
  }, [coinIds, selectedCoin]);

  return (
    <main className="dashboard">
      <h1>Crypto Live Feed</h1>
      <StatusBanner connectionStatus={connectionStatus} serverStatus={serverStatus} latest={latest} />
      <AlertToasts alerts={alerts} onDismiss={dismissAlert} />

      {coinIds.length === 0 ? (
        <p className="loading">Your watchlist is empty. Add a coin below to start tracking it.</p>
      ) : (
        <>
          <div className="card-grid">
            {coinIds.map((coin) => (
              <PriceCard
                key={coin}
                coin={coin}
                latest={latest[coin]}
                selected={coin === selectedCoin}
                onSelect={() => setSelectedCoin(coin)}
                onRemove={() => removeCoin(coin)}
                viewerCount={viewerCounts[coin] || 0}
                onSetAlert={setAlert}
              />
            ))}
          </div>

          {selectedCoin && <PriceChart coin={selectedCoin} data={history[selectedCoin]} />}
        </>
      )}

      <Watchlist watchedIds={coinIds} onAdd={addCoin} />
    </main>
  );
}

export default App;
