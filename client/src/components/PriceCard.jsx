import { useEffect, useRef, useState } from 'react';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

export function PriceCard({ coin, latest, selected, onSelect, onRemove, viewerCount, onSetAlert }) {
  const changePositive = latest && latest.change24h >= 0;
  const previousPrice = useRef(null);
  const [flash, setFlash] = useState(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertDirection, setAlertDirection] = useState('above');

  useEffect(() => {
    if (!latest) return;
    const prev = previousPrice.current;
    previousPrice.current = latest.price;

    if (prev === null || latest.price === prev) return;

    setFlash(latest.price > prev ? 'flash-up' : 'flash-down');
    const timeout = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(timeout);
  }, [latest]);

  function handleSetAlert(event) {
    event.stopPropagation();
    const price = Number(alertPrice);
    if (!price || price <= 0) return;
    onSetAlert(coin, alertDirection, price);
    setAlertPrice('');
  }

  return (
    <div className={`price-card${selected ? ' price-card--selected' : ''}${flash ? ` ${flash}` : ''}`}>
      <button
        className="price-card__remove"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${coin}`}
      >
        ×
      </button>
      <button className="price-card__body" onClick={onSelect}>
        <h2>{coin.charAt(0).toUpperCase() + coin.slice(1)}</h2>
        {latest ? (
          <>
            <p className="price">{currencyFormatter.format(latest.price)}</p>
            <p className={changePositive ? 'change change--up' : 'change change--down'}>
              {changePositive ? '+' : ''}{latest.change24h.toFixed(2)}% (24h)
            </p>
          </>
        ) : (
          <p className="loading">Waiting for data...</p>
        )}
        {viewerCount > 0 && (
          <p className="viewer-count">{viewerCount} {viewerCount === 1 ? 'person' : 'people'} watching</p>
        )}
      </button>
      <div className="alert-form" onClick={(event) => event.stopPropagation()}>
        <select value={alertDirection} onChange={(event) => setAlertDirection(event.target.value)}>
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <input
          type="number"
          placeholder="Price"
          value={alertPrice}
          onChange={(event) => setAlertPrice(event.target.value)}
        />
        <button onClick={handleSetAlert}>Alert</button>
      </div>
    </div>
  );
}

