import { useEffect, useState } from 'react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export function Watchlist({ watchedIds, onAdd }) {
  const [allCoins, setAllCoins] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    fetch(`${SERVER_URL}/coins`)
      .then((res) => res.json())
      .then(setAllCoins)
      .catch(() => setAllCoins([]));
  }, []);

  const available = allCoins.filter((coin) => !watchedIds.includes(coin.id));

  useEffect(() => {
    if (available.length > 0 && !available.some((coin) => coin.id === selected)) {
      setSelected(available[0].id);
    }
  }, [available, selected]);

  if (available.length === 0) {
    return <p className="loading">All available coins are already on your watchlist.</p>;
  }

  return (
    <div className="watchlist-controls">
      <select value={selected} onChange={(event) => setSelected(event.target.value)}>
        {available.map((coin) => (
          <option key={coin.id} value={coin.id}>
            {coin.name}
          </option>
        ))}
      </select>
      <button onClick={() => selected && onAdd(selected)}>Add</button>
    </div>
  );
}
