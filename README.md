# Grand Star Cruise — MP7 Companion

Grand Star Cruise is the cross-platform companion app for the Mario Party 7 Recomp project and Community Harbor. The same React/TypeScript interface is used by the Windows desktop test bench and the mobile app shell.

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

## Optional local Mario Party 7 artwork

The companion app supports the images supplied in the restyle handoff ZIP without adding them to the public Git repository.

1. Extract the local artwork pack so the PNG files land in `public/assets/mp7-local/` at the project root.
2. Keep that folder in place when running or building the app. It is intentionally listed in `.gitignore`.
3. The app loads the eight supplied character portraits, P1–P4 markers, the Mario Party 7 logo, and the microphone sprite. Missing files use text/icon fallbacks.

The artwork is local to your working copy; it is not published by the repository's CI build.

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


## Visual identity and reference board

The current Grand Star Cruise refresh takes its direction from the concept art and reference material supplied for this project:

- `Colorful Online Cruise Menu Board` and `Online Cruise Lobby Menu` inform the bright aqua/mint environment, cream-and-gold trim, pastel menu tiles, and rounded arcade-like panels.
- `Colorful Game Settings Menu` and `Mods and Achievements Arcade Hub` inform the badge treatment, icon scale, and color-coded destinations.
- `Colorful Sky Garden Board Maker UI` informs the bold framed-panel treatment and layered tool-card presentation.
- `Star Showdown: Mario Party Map` and `Star Showdown: Mario Party Standings` inform the player color system, star motifs, and event presentation. They are visual references only; the phone app remains a player controller/dashboard, not a duplicate of the television scoreboard.
- The MarioWiki and Spriters Resource pages are used for visual study of Mario Party 7's UI language and icon conventions.

The shipped interface is original CSS/React styling. Optional Mario Party 7 artwork from the supplied handoff pack can be loaded from `public/assets/mp7-local/`; that folder is Git-ignored and is not included in public source commits. The project is an unofficial fan-made companion and is not affiliated with or endorsed by Nintendo.

Selected headings use **Mario Party Hudson**, credited to Danny Kidd. The font is currently loaded from a hosted web-font copy, so the first font load requires an internet connection.

Reference links:
- [Mario Party 7 — MarioWiki](https://www.mariowiki.com/Mario_Party_7)
- [Mario Party 7 assets — MarioWiki](https://www.mariowiki.com/Category:Mario_Party_7_assets)
- [Mario Party 7 models — The Models Resource](https://models.spriters-resource.com/gamecube/marioparty7/)
- [Mario Party 7 sprites — The Spriters Resource](https://www.spriters-resource.com/gamecube/marioparty7/)



## Grand Star Cruise visual system v2

The current interface follows a warm MP7-inspired design direction: peach and golden ambient backgrounds, teal menu surfaces, pink panel frames, cream cards, and separate P1–P4 color identities. Overview, Rewards, Profile, Workshop, Controller, and Settings each receive a coordinated page background.

The Overview includes the six-board tile selector, turn progress tracker, expandable Bowser event history, character-selection modal, and per-player coin/Star controls. Character labels and slot badges are rendered with original app styling; the public repository does not bundle Nintendo game logos, character portraits, or other copyrighted game artwork.

The player-facing phone dashboard and minigame preview remain in place. When the local handoff pack is installed, the app displays its available character portraits, P1–P4 selection markers, Mario Party 7 logo, and microphone sprite. Characters without supplied portraits, or missing local files, fall back gracefully to initials. Live Recomp transport, Community Harbor account services, and real Workshop downloads are still separate integration work.


## Local Mario Party 7 artwork

The companion UI reads its artwork from `public/assets/` via the path constants in `src/lib/demoSession.ts`. Place the supplied local asset pack in the repository root so the files land at paths such as `public/assets/face-mario.png` and `public/assets/panel-pagoda-peak.png`.

These game artwork files are intentionally excluded from the public Git repository by `.gitignore`; keep them local to your own checkout. Vite serves them at `/assets/<filename>`, and the Windows app bundles local `public/` assets during its build.
