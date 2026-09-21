const ALLOWED_COINS = [
  { id: 'bitcoin', name: 'Bitcoin' },
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'solana', name: 'Solana' },
  { id: 'binancecoin', name: 'BNB' },
  { id: 'ripple', name: 'XRP' },
  { id: 'cardano', name: 'Cardano' },
  { id: 'dogecoin', name: 'Dogecoin' },
  { id: 'tron', name: 'TRON' },
  { id: 'chainlink', name: 'Chainlink' },
  { id: 'avalanche-2', name: 'Avalanche' },
  { id: 'polkadot', name: 'Polkadot' },
  { id: 'litecoin', name: 'Litecoin' },
  { id: 'stellar', name: 'Stellar' },
  { id: 'cosmos', name: 'Cosmos' },
  { id: 'near', name: 'NEAR Protocol' },
  { id: 'uniswap', name: 'Uniswap' },
  { id: 'shiba-inu', name: 'Shiba Inu' },
  { id: 'bitcoin-cash', name: 'Bitcoin Cash' },
  { id: 'monero', name: 'Monero' }
];

const ALLOWED_IDS = new Set(ALLOWED_COINS.map((coin) => coin.id));

function isAllowed(id) {
  return ALLOWED_IDS.has(id);
}

module.exports = { ALLOWED_COINS, isAllowed };
