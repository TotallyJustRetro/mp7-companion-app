# Starboard — MP7 Companion

Starboard is the cross-platform companion app for the Mario Party 7 Recomp project and Community Harbor. The same React/TypeScript interface is used by the Windows desktop test bench and the mobile app shell.

> **Current status: prototype / demo simulator.** This source archive does not include a precompiled `.exe`. It includes the Windows desktop wrapper and scripts to run the test bench or build an installer/portable executable on a Windows PC. The app is not connected to the Recomp executable, a real online session service, or Community Harbor accounts yet.

## What is in this first build

- Responsive player dashboard with character, coins, Stars, board position, turn, and inventory.
- Optional phone status per player: connected, not connected, disconnected, and reconnecting.
- Toadsworth-style fallback behavior when a player has not connected a phone.
- Local / online mode selector (visual preview; online transport is not live yet).
- Five simulated phone minigame interfaces: drawing, trivia, rhythm taps, tilt controls, and microphone permission.
- A desktop Game Event Simulator for changing player state, sending notifications, launching minigames, and testing connection changes.
- Harbor ID, Rewards, and Workshop sample screens that establish the free-to-play, no-limited-rewards direction.
- A temporary-content confirmation flow (sample data only; it does not download executable game content).
- Shared TypeScript protocol definitions in `src/domain/protocol.ts`.
- Electron Windows desktop wrapper and Capacitor Android/iOS project configuration.

## Requirements

- Node.js 22.12 or newer (Node 24 recommended for the desktop build).
- npm.
- For Android packaging: Android Studio + Android SDK.
- For iOS packaging: macOS + Xcode.
- For Windows packaging: Windows is recommended. The included GitHub Actions workflow builds the Windows installers on a Windows runner.

## Run on your PC

```bash
npm install
npm run dev:desktop
```

This opens the Electron desktop test bench. To run the same interface in a browser:

```bash
npm run dev
```

Use the **Overview** page's Game Event Simulator to test state updates and events. Use **Companion view** to inspect the player-facing dashboard and minigame interfaces. The player selector allows you to test connected and non-connected players.

You can also double-click `RUN-WINDOWS.bat` to install dependencies (if needed) and launch the PC test bench.

## Build a Windows app

On Windows:

```bash
npm install
npm run dist:win
```

Installers and the portable executable are written to `release/`. You can also double-click `BUILD-WINDOWS.bat`.

A Windows build workflow is included at `.github/workflows/windows-build.yml`. It can be run manually from GitHub Actions and uploads the NSIS installer and portable build as workflow artifacts.

## Prepare Android / iOS shells

After installing the relevant native toolchains:

```bash
npm install
npx cap add android
npx cap add ios
npm run cap:sync
npm run cap:android
# On macOS, use: npm run cap:ios
```

The native shells currently host the responsive web UI. Native motion-sensor, haptic, camera, and background networking integrations still need to be added and permission-tested. The microphone demo uses the browser media permission API when available.

## Architecture

```text
Community Harbor account / content services (planned)
                 │
        Companion transport (planned)
          Local WebSocket / online relay
                 │
       Shared Companion protocol
                 │
       MP7 Recomp game integration (planned)
                 │
          Player-state events
```

The game must remain authoritative for coins, Stars, inventory, board position, minigame outcomes, and character availability. The companion sends player input; it must not award game state itself.

The protocol currently defines:

- `PLAYER_STATE`
- `MINIGAME_START`
- `MINIGAME_INPUT`
- `MINIGAME_END`
- `PLAYER_NOTIFICATION`
- `PHONE_STATUS`

See [docs/PROTOCOL.md](docs/PROTOCOL.md), [docs/ONLINE.md](docs/ONLINE.md), and [docs/ROADMAP.md](docs/ROADMAP.md).

## Project principles

- Phone controls are optional. Traditional controllers remain supported.
- No Harbor ID is required to play the game.
- No microtransactions, paid unlocks, premium currency, or pay-to-win features.
- No limited-edition or permanently missable cosmetics/rewards.
- Community content must carry creator attribution and pass compatibility / package checks before a real game downloads it.
- A custom character can only be offered when the connected game supports its package format and required assets.

## Current limitations

This is a front-end and desktop test harness milestone. The following are intentionally not represented as finished features:

- Real phone-to-PC pairing / QR session joining.
- Real local network transport or online relay service.
- Recomp game plugin / Mod API integration.
- Harbor ID sign-in, server-side profiles, cloud XP, achievements, or account linking.
- Real Workshop downloads, package signing, malware scanning, moderation, or temporary game asset loading.
- Native sensor / camera / haptic integrations.

These require the companion server contract, Recomp-side implementation, and platform permission work. Do not enter real account credentials into this demo.


## Visual identity

The interface uses the supplied **Mario Party Hudson** display font for selected headings and Starboard branding, with a colorful cruise-inspired palette and ocean backdrop. The font is credited to its creator, Danny Kidd. The current prototype loads the font from a hosted web-font copy, so the first font load requires an internet connection; a bundled local font asset is planned for the next packaging pass.
