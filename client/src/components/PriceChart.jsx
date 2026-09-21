import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
}

function formatDollars(value) {
  return `$${Number(value).toLocaleString()}`;
}

export function PriceChart({ coin, data }) {
  if (!data || data.length < 2) {
    return <p className="loading">Collecting data...</p>;
  }

  return (
    <div className="price-chart">
      <h3>{coin.charAt(0).toUpperCase() + coin.slice(1)} price history</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <XAxis dataKey="timestamp" tickFormatter={formatTime} />
          <YAxis domain={['auto', 'auto']} tickFormatter={formatDollars} />
          <Tooltip labelFormatter={formatTime} formatter={(value) => formatDollars(value)} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#4ade80"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
