# Companion Protocol (draft v0)

The protocol is game-authoritative. The game decides what is happening and sends state/events to the companion. The companion returns input events for the assigned player.

## Session identity

Every message belongs to a `sessionId` and includes `sentAt` (Unix milliseconds). Messages are JSON objects. The first prototype types are in `src/domain/protocol.ts`.

## Message types

### `PLAYER_STATE` — game → phone

Carries the selected player's public match state: player ID, display name, character ID/name, coins, Stars, board position, current turn, total turns, inventory, and phone status.

### `MINIGAME_START` — game → phone

Carries the minigame descriptor and target `playerId`. The phone automatically switches from the player dashboard to the matching controller UI. The minigame descriptor declares input kind and whether a traditional-controller fallback exists.

### `MINIGAME_INPUT` — phone → game

Carries input scoped to `playerId` and `minigameId`. Payloads are minigame-specific. The game validates all inputs and determines outcomes.

### `MINIGAME_END` — game → phone

Ends the phone interface and returns to the player's dashboard.

### `PLAYER_NOTIFICATION` — game → phone

Private notification for one player. Do not broadcast private messages to other players' phones.

### `PHONE_STATUS` — phone / session service → game

Reports connected, not-connected, disconnected, or reconnecting status. `not_connected` is a normal choice, not an error.

## Optional device rule

A disconnected or absent phone must never block a match. If the phone is unavailable, Toadsworth (or equivalent game UI) informs the player and the game continues with the traditional controller. A minigame that requires a phone can only be selected when every required participant is compatible, unless a supported controller alternative exists.

## Custom minigame metadata (planned extension)

Each custom minigame should declare supported player counts, supported controller types, phone input modes, permission requirements (microphone, motion, camera), and whether a controller alternative exists. The game sends `MINIGAME_START`; the phone must not guess which interface to display.

## Security notes for implementation

- Pair devices using short-lived, single-session pairing tokens.
- Authenticate every socket to a session and player slot.
- Validate player IDs, minigame IDs, payload schemas, size limits, rate limits, and event ordering on the game/server side.
- Do not accept gameplay-state changes from the companion.
- Do not place permanent account secrets in QR codes or deep links.
- Reconnects must revalidate the pairing token and slot assignment.
