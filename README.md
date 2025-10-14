# Backend (Auction Platform)

This backend provides REST APIs and real-time updates for auction bidding using Socket.IO.

## Real-time bidding
- Server namespace: default
- Rooms: `auction:<auctionId>`
- Events (server -> client):
  - `bid:update` { auctionId, currentBid, highestBidder }
  - `auction:status` { auctionId, status: "ended", winner, finalAmount }
  - `user:notify` { type, message, ... } (sent to room `user:<userId>` when applicable)
- Events (client -> server):
  - `join-auction` (auctionId, ack?) -> ack: { ok: boolean, error?: string }
  - `leave-auction` (auctionId, ack?) -> ack: { ok: boolean, error?: string }

Auth (optional): If the browser has an httpOnly JWT cookie named `token`, the server will decode it during the Socket.IO handshake and place `socket.data.userId`. Authenticated sockets automatically join their private room `user:<userId>`. Unauthenticated sockets are allowed and can still join rooms to receive updates.

### Client example (React/Vite)
```js
import { io } from 'socket.io-client';

const socket = io('https://mern-auction-platform-backend-1-kpby.onrender.com', { withCredentials: true });

export function subscribeToAuction(auctionId, onBid, onStatus) {
  socket.emit('join-auction', auctionId, (res) => {
    if (!res?.ok) {
      console.warn('Failed to join auction room', res?.error);
    }
  });
  const bidHandler = (payload) => {
    if (payload.auctionId === auctionId) onBid?.(payload);
  };
  const statusHandler = (payload) => {
    if (payload.auctionId === auctionId) onStatus?.(payload);
  };
  socket.on('bid:update', bidHandler);
  socket.on('auction:status', statusHandler);
  return () => {
    socket.emit('leave-auction', auctionId, (res) => {
      if (!res?.ok) {
        console.warn('Failed to leave auction room', res?.error);
      }
    });
    socket.off('bid:update', bidHandler);
    socket.off('auction:status', statusHandler);
  };
}
```

## Run locally
1. Create `config/config.env` and fill env vars (see `config/config.env`).
2. Install dependencies: `npm install`
3. Start dev: `npm run dev`

## Notes
- CORS and Socket.IO origins are allowed for localhost:5173/5174/5175 and `FRONTEND_URL`.
- WebSocket server is initialized in `server.js`. See `socket/index.js` for helpers.
