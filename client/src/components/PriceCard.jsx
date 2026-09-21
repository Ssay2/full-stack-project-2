const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

export function PriceCard({ coin, latest, selected, onSelect, onRemove }) {
  const changePositive = latest && latest.change24h >= 0;

  return (
    <div className={`price-card${selected ? ' price-card--selected' : ''}`}>
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
      </button>
    </div>
  );
}
