const BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';
const REQUEST_TIMEOUT_MS = 10000;

// Fetches USD price + 24h change for the given coin ids from CoinGecko.
async function fetchPrices(coinIds) {
  const url = `${BASE_URL}?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

  if (response.status === 429) {
    const header = response.headers.get('Retry-After');
    const error = new Error('CoinGecko rate limit hit');
    error.retryAfter = header ? Number(header) : 60;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`CoinGecko request failed with status ${response.status}`);
  }

  return response.json();
}

module.exports = { fetchPrices };
