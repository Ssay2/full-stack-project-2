# Real-Time Crypto Price Dashboard

A live cryptocurrency price dashboard built with Node/Express, Socket.io, and React.
A single shared server-side poller tracks whichever coins clients are actively
watching and broadcasts live price updates over WebSockets, with a rolling
price history chart per coin.

**Live demo:** _TODO: add Render URL once deployed_

## Features

- Real-time price cards for a customizable watchlist of cryptocurrencies (19-coin allowlist)
- Live-updating line chart (Recharts) showing recent price history per coin
- Add/remove coins from your watchlist; persisted in `localStorage`
- Connection status banner: live indicator, "reconnecting...", rate-limit countdown, and stale-data warning
- Automatic reconnect handling — the client resubscribes to its watchlist after a dropped connection
- Exponential backoff on the server when the price API is unavailable, with graceful rate-limit handling
- `/health` endpoint for uptime checks
- Unit tests for the price buffer, CoinGecko client, and coin allowlist (Node's built-in test runner, no extra dependencies)

## Architecture

```
                 ┌─────────────────┐
                 │   CoinGecko API  │
                 └────────┬─────────┘
                          │ polls every ~20s
                          │ (only coins with active subscribers)
                 ┌────────▼─────────┐        ┌───────────────┐
                 │   Single Poller   │───────▶│  Ring Buffer  │
                 │  (server/poller)  │        │ (50 pts/coin) │
                 └────────┬─────────┘        └───────────────┘
                          │ emits 'price' to room `coin:<id>`
                 ┌────────▼─────────┐
                 │   Socket.io       │
                 │  (rooms per coin) │
                 └────────┬─────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ React     │ │ React     │ │ React     │
        │ Client 1  │ │ Client 2  │ │ Client N  │
        └──────────┘ └──────────┘ └──────────┘
```

- **One shared poller**, not one poller per client — keeps CoinGecko usage low regardless of how many browser tabs are connected.
- **Room-based broadcasting** — each coin has its own Socket.io room (`coin:<id>`); clients subscribe only to the coins on their watchlist, and the poller only fetches coins that currently have at least one subscriber.
- **In-memory ring buffer** — the last 50 price points per coin are kept server-side so a newly connected (or reconnecting) client gets instant history instead of waiting for the next poll cycle.

## Design decisions and tradeoffs

- **Single shared poller vs. one poller per client:** a shared poller keeps API usage constant regardless of user count, which matters a lot against CoinGecko's free-tier rate limits. The tradeoff is that all clients share the same poll cadence — no per-user refresh rate customization.
- **Room-based broadcasting:** rather than broadcasting every price to every client, coins are only fetched and pushed to clients that actually asked for them. This keeps the app usable with a large coin allowlist without wasting bandwidth or API quota on unwatched coins.
- **In-memory ring buffer, not a database:** simplest way to give new/reconnecting clients instant chart history. The obvious tradeoff: history is lost on server restart, and it isn't shared across multiple server instances.
- **Coin allowlist:** a fixed list of ~19 coin ids the server accepts, plus a per-socket cap of 10 subscriptions. This prevents a client from asking the server to spam CoinGecko with arbitrary or junk ids.
- **Exponential backoff:** on repeated fetch failures the poll interval doubles (capped at 5 minutes) instead of hammering a failing upstream API; it resets to the normal interval on the next success. 429 responses are handled separately, honoring the `Retry-After` header when present.

## What I'd do in production

- Move the ring buffer to Redis (or a time-series DB) so history survives restarts and can be shared across multiple server instances.
- Add authentication so watchlists are tied to a user account instead of `localStorage`.
- Horizontally scale the Socket.io server using the Socket.io Redis adapter, so room broadcasts work correctly across multiple server processes.
- Use a paid CoinGecko plan (or a dedicated market-data provider) for higher rate limits and more reliable uptime.

## Local setup

**Server:**
```bash
cd server
npm install
cp .env.example .env   # adjust values if needed
npm start
```

**Client** (separate terminal):
```bash
cd client
npm install
cp .env.example .env   # adjust values if needed
npm run dev
```

The client runs at `http://localhost:5173` and expects the server at
`http://localhost:4000` by default (configurable via `VITE_SERVER_URL`).

**Run server tests:**
```bash
cd server
npm test
```

## Note on the free Render tier

This project is deployed on Render's free tier, which spins down services
after a period of inactivity. The first request after idle can take up to
about 30 seconds to respond while the service wakes up.
