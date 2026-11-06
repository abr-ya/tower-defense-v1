# Proposal

## Why

The browser shell can render a game surface, but it has no platform-independent game state to advance. A deterministic simulation core is needed now so future route, placement, combat, and wave features can add rules without coupling them to Phaser or React.

## What Changes

- Add a pure TypeScript simulation session with explicit state, typed commands, snapshots, and a stable update interface.
- Advance simulation time using a fixed timestep with bounded catch-up so outcomes do not depend on render-frame timing.
- Support pause, resume, and restart commands; pausing prevents simulation time and ticks from advancing.
- Add unit tests that prove fixed-step, pause, restart, catch-up, and deterministic behavior without a browser or Phaser runtime.
- Do not add enemies, routes, tower placement, combat, waves, persistence, or Phaser/React integration.

## Capabilities

### New Capabilities

- `deterministic-simulation`: A framework-independent game session that applies typed lifecycle commands and advances state deterministically through fixed simulation ticks.

### Modified Capabilities

None.

## Impact

- Adds pure modules under `src/game/core/` and their Vitest coverage.
- Establishes the command, snapshot, and lifecycle seam that future UI and Phaser adapters will consume.
- Does not change the existing browser-game-shell behavior or add runtime dependencies.
