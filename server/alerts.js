const MAX_ALERTS_PER_SOCKET = 10;

// socketId -> array of { coin, direction, price }
const alertsBySocket = new Map();

function addAlert(socketId, alert) {
  const existing = alertsBySocket.get(socketId) || [];
  if (existing.length >= MAX_ALERTS_PER_SOCKET) return false;

  existing.push(alert);
  alertsBySocket.set(socketId, existing);
  return true;
}

function removeSocketAlerts(socketId) {
  alertsBySocket.delete(socketId);
}

// Checks all sockets' rules for a coin against its latest price, firing
// (and removing) any that match. One-shot alerts, not repeating.
function checkAlerts(io, coin, price) {
  for (const [socketId, rules] of alertsBySocket) {
    const remaining = [];

    for (const rule of rules) {
      if (rule.coin !== coin) {
        remaining.push(rule);
        continue;
      }

      const triggered = rule.direction === 'above' ? price >= rule.price : price <= rule.price;
      if (triggered) {
        io.to(socketId).emit('alert', { coin, price, direction: rule.direction, threshold: rule.price });
      } else {
        remaining.push(rule);
      }
    }

    alertsBySocket.set(socketId, remaining);
  }
}

module.exports = { addAlert, removeSocketAlerts, checkAlerts };
