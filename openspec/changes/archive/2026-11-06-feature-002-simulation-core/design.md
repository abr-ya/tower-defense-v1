# Design

## Context

The repository has a React/Phaser browser shell but no gameplay state. The architecture requires a deterministic fixed-step simulation that never imports rendering, UI, DOM, or persistence APIs. See `proposal.md` for motivation and `specs/deterministic-simulation/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Provide a small, pure `src/game/core` API that later features can call from any adapter.
- Make tick progression and lifecycle state easy to test with exact snapshots.
- Bound work per update to avoid a slow frame causing an unbounded simulation loop.

**Non-Goals:**

- No game entities, maps, movement, targeting, combat, waves, economy, random seed, rendering bridge, or browser controls.
- No general-purpose ECS, event bus, or plugin architecture.
- No interpolation or speed controls; adapters will choose when to call the session.

## Decisions

### Represent the session with a small state machine

The core will expose a session factory with `update(elapsedSeconds)`, `dispatch(command)`, and `getSnapshot()`. Its lifecycle phase is `running` or `paused`; `Pause`, `Resume`, and `Restart` are a discriminated union. `Restart` recreates the configured initial running state, including clearing accumulated time.

An object-oriented class is preferred here because it owns the accumulator privately while exposing immutable snapshots. A reducer-only API was considered, but would force each future adapter to manage clock state and makes incorrect mutation easier.

### Use a 1/60-second fixed timestep with capped catch-up

The session will accumulate non-negative elapsed seconds and process ticks of `1 / 60` seconds. Each `update` processes at most five ticks; elapsed time above that bounded window is discarded before processing so a stalled browser cannot create a persistent catch-up spiral.

Tick count is the source of truth for simulation time, calculated from tick count and fixed step. This avoids drift from repeatedly adding fractional time. Variable timestep simulation was rejected because frame cadence would influence future movement and combat rules.

### Keep snapshots as values, not mutable references

`getSnapshot()` returns only primitive lifecycle and clock fields. The core neither accepts nor returns entity collections in this increment, preventing consumers from mutating private state and leaving an explicit extension point for later features.

### Test behavior at the public API boundary

Vitest tests will create sessions directly and cover partial accumulation, one/multiple ticks, capped catch-up, pause/resume, restart, and matching input sequences. Tests will not mount React, Phaser, or a DOM.

## Risks / Trade-offs

- [Discarded stalled-frame time can make wall-clock progress lag] → This is intentional for the first core; future gameplay favors stable bounded simulation over a catch-up spiral.
- [Floating-point comparisons around one timestep] → Derive public simulation time from integer tick count and test exact tick counts.
- [The minimal snapshot requires extension later] → Add only fields demanded by the next gameplay feature and retain the current session API.
- [Adapters call update with inconsistent units] → Name the parameter `elapsedSeconds`, document the unit, and cover it in tests.

## Migration Plan

1. Add the pure core types, session implementation, and public barrel export.
2. Add focused unit tests without browser imports.
3. Run lint, typecheck, test, and build.
4. Later Phaser or UI work imports the core through its public API; rollback only requires removing the new core directory because no existing runtime behavior changes.
