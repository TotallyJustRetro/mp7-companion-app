# Local and online connection plan

The mobile app and Windows simulator should share one transport interface. Only the transport implementation changes between local and online sessions.

## Local session

- The game exposes a local pairing endpoint on the host network.
- A QR code contains a short-lived pairing token and local endpoint discovery hint, not a permanent account secret.
- Phone and game authenticate, agree on protocol version, and bind the phone to one player slot.
- If local discovery fails, the user can enter a short pairing code manually.

## Online session

- The player joins the game's online lobby first.
- A companion connection service issues a one-time pairing token scoped to the lobby, account, and player slot.
- The phone connects to an authenticated relay (WebSocket over TLS) and receives only the state/events for its player.
- The game remains authoritative; the relay routes messages and enforces session boundaries but does not decide gameplay outcomes.
- The phone can reconnect after brief network loss. A lost phone never pauses or invalidates the match.

## Shared requirements

- Explicit player consent for pairing.
- Short-lived tokens, token rotation, and revocation on leave/disconnect.
- Heartbeats and timeout handling.
- Version negotiation and compatibility checks.
- Rate limiting and payload validation.
- A clear local / online indicator in the app.

The `Online` selector in v0.1 is a UI preview only. No production endpoint or relay is configured. A reusable WebSocket client scaffold is in `src/lib/transports/WebSocketCompanionTransport.ts`; it is not wired into the demo until the server contract and endpoint exist.
