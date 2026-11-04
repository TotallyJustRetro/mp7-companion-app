# Companion App Roadmap

## Milestone 0.1 — UI + Windows test bench (this build)

- [x] Responsive companion dashboard and desktop layout
- [x] Player state model and draft message types
- [x] Optional phone status and controller fallback preview
- [x] Minigame UI simulations: drawing, trivia, rhythm, tilt, microphone permission
- [x] Desktop game-event simulator and event log
- [x] Harbor ID / rewards / Workshop sample pages
- [x] Electron Windows wrapper and Capacitor configuration

## Milestone 0.2 — Real local connection

- [ ] Agree the protocol contract with the Recomp project
- [ ] Implement local WebSocket host in the game or companion bridge
- [ ] Real pairing tokens, QR flow, player-slot assignment, and reconnects
- [ ] Feed actual `PLAYER_STATE` and minigame events into the app
- [ ] Send validated input events back to the game
- [ ] Native microphone, motion, haptics, and camera permission flows

## Milestone 0.3 — Online companion sessions

- [ ] Online relay service with authenticated session routing
- [ ] Account / lobby / player-slot binding
- [ ] Reconnect and network transition handling
- [ ] Mixed phone/controller player testing

## Milestone 0.4 — Harbor ID + rewards

- [ ] Community Harbor account integration and secure sign-in
- [ ] Cloud profile, achievements, XP, and statistics
- [ ] Offline progress queue and safe synchronization
- [ ] No-paid-content policy enforced in the product design
- [ ] Permanent rewards (no limited-time exclusive unlocks)

## Milestone 0.5 — Workshop + session content

- [ ] Workshop API and creator attribution
- [ ] Content package manifest and game-version compatibility
- [ ] Package integrity checks, moderation, and safe asset validation
- [ ] User confirmation before session download
- [ ] Temporary session cache and cleanup
- [ ] Custom character compatibility handshake across online players

## Milestone 1.0 — Release candidate

- [ ] Accessibility and localization review
- [ ] Privacy / security review
- [ ] Windows, Android, and iOS device testing
- [ ] Network loss / reconnect / app suspend testing
- [ ] Full integration test with Recomp and online service
