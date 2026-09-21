const { fetchPrices } = require('./coingecko');
const { addPoint } = require('./priceStore');

const MAX_BACKOFF_MS = 5 * 60 * 1000;

// Coins with at least one subscriber, derived from Socket.io room membership.
function getActiveCoins(io) {
  const coins = [];
  for (const room of io.sockets.adapter.rooms.keys()) {
    if (room.startsWith('coin:') && io.sockets.adapter.rooms.get(room).size > 0) {
      coins.push(room.slice('coin:'.length));
    }
  }
  return coins;
}

// Self-scheduling loop so a slow fetch can't overlap the next one.
function startPoller(io, { intervalMs = 20000 } = {}) {
  let backoffMs = intervalMs;
  let lastSuccess = null;
  let rateLimitedUntil = null;
  let timer = null;

  async function poll() {
    let delay = intervalMs;
    const activeCoins = getActiveCoins(io);

    if (activeCoins.length === 0) {
      timer = setTimeout(poll, delay);
      return;
    }

    try {
      const prices = await fetchPrices(activeCoins);

      for (const coin of activeCoins) {
        const data = prices[coin];
        if (!data) continue;

        const point = {
          price: data.usd,
          change24h: data.usd_24h_change,
          timestamp: new Date().toISOString()
        };

        addPoint(coin, point);
        io.to(`coin:${coin}`).emit('price', { coin, ...point });
      }

      console.log(`Fetched prices for ${activeCoins.join(', ')}`);
      backoffMs = intervalMs;
      lastSuccess = new Date().toISOString();
      rateLimitedUntil = null;
    } catch (error) {
      if (error.retryAfter) {
        console.error(`Rate limited, waiting ${error.retryAfter}s`, error.message);
        delay = error.retryAfter * 1000;
        rateLimitedUntil = new Date(Date.now() + delay).toISOString();
      } else {
        console.error('Poll failed:', error.message);
        backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
        delay = backoffMs;
      }
    }

    io.emit('status', {
      ok: !!lastSuccess,
      lastSuccess,
      rateLimitedUntil
    });

    timer = setTimeout(poll, delay);
  }

  poll();

  return () => clearTimeout(timer);
}

module.exports = { startPoller };


