const MAX_POINTS = 50;

const store = {};

// Adds a price point for a coin, dropping the oldest once over MAX_POINTS.
function addPoint(coin, point) {
  if (!store[coin]) {
    store[coin] = [];
  }

  store[coin].push(point);

  if (store[coin].length > MAX_POINTS) {
    store[coin].shift();
  }
}

function getHistory(coin) {
  return store[coin] ? [...store[coin]] : [];
}

function getAllHistory(coinIds) {
  const result = {};
  for (const coin of coinIds) {
    result[coin] = getHistory(coin);
  }
  return result;
}

module.exports = { addPoint, getHistory, getAllHistory, MAX_POINTS };
