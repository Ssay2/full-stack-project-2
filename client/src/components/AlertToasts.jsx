export function AlertToasts({ alerts, onDismiss }) {
  if (alerts.length === 0) return null;

  return (
    <div className="toast-stack">
      {alerts.map((alert) => (
        <div className="toast" key={alert.id}>
          <span>
            {alert.coin.charAt(0).toUpperCase() + alert.coin.slice(1)} went {alert.direction}{' '}
            ${alert.threshold} — now ${alert.price.toFixed(2)}
          </span>
          <button onClick={() => onDismiss(alert.id)} aria-label="Dismiss alert">×</button>
        </div>
      ))}
    </div>
  );
}
