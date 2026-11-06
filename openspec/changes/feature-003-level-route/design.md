# Design

## Context

The current project has a responsive Phaser shell and a pure fixed-step session with lifecycle commands, but no level data or visible simulation state. See `proposal.md` and `specs/level-route-traversal/spec.md`.

## Goals / Non-Goals

**Goals:**

- Introduce one small data-defined prototype level with world dimensions, waypoints, and one enemy speed.
- Keep route validation and traversal in pure TypeScript and expose position/completion through snapshots.
- Render snapshots in Phaser without allowing the adapter to mutate simulation state.

**Non-Goals:**

- No dynamic pathfinding, multiple enemies, waves, towers, collision, combat, economy, base health, or controls.
- No viewport-dependent world coordinates or authored art assets.

## Decisions

### Use cumulative route distance

The route module will validate authored points and precompute segment lengths. The simulation will advance a scalar travelled distance at constant speed, then derive an interpolated world position. This avoids frame-dependent segment transitions and naturally clamps at the endpoint.

### Keep the level definition small and explicit

One exported content definition will contain logical bounds, waypoints, and enemy speed. Validation runs before creating the route state. A general map format or content loader is deferred until more levels exist.

### Extend snapshots and render them in Phaser

The core snapshot will gain route-enemy data sourced only from pure modules. The Phaser scene will call `session.update` from its update loop and redraw/update simple graphics from snapshots. React remains only the host; Phaser does not own rules or route state.

### Fit logical world into the existing canvas

The adapter will transform logical route coordinates to the current renderer size, preserving the authored route independently of browser viewport dimensions. Placeholder line/circle graphics keep the change asset-free.

## Risks / Trade-offs

- [Phaser render cadence differs from simulation cadence] → Advance only through the existing fixed-step session and render snapshots separately.
- [Degenerate waypoint segments] → Reject duplicate consecutive points during validation.
- [Browser resize distorts the route] → Recalculate only render transforms; never alter logical simulation coordinates.
- [One enemy completes too quickly for visual inspection] → Use a deliberately readable authored speed and restart its route automatically only if the spec is amended later; this increment stops at completion.

## Migration Plan

1. Add level definition, validation, and pure traversal tests.
2. Extend the simulation snapshot/session with level route state while preserving pause/restart semantics.
3. Render the route and enemy in the existing Phaser adapter, then run desktop and landscape smoke checks.
4. Roll back by removing the new content/traversal modules and adapter rendering; no persistent data is introduced.
