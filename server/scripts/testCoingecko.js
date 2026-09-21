const URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true';

async function main() {
  const response = await fetch(URL);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error('CoinGecko request failed:', error);
  process.exit(1);
});
