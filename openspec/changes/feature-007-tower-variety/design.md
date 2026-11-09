# Design

## Context

The current pure simulation stores only positions for placed towers and uses one global combat configuration. Phaser places that single tower directly from pointer input. See proposal.md and the tower-variety delta specification.

## Goals / Non-Goals

**Goals:** introduce immutable tower definitions and per-tower runtime type/tier state; apply their attacks in the existing fixed-step simulation; add one predictable non-stacking slow state per enemy; and expose the minimal Phaser controls required to select and upgrade towers.

**Non-Goals:** currency, placement or upgrade costs, rewards, targeting modes, stacking effect combinations, a reusable UI framework, or additional enemy families.

## Decisions

- Store three prototype tower definitions in content and resolve attack statistics from a tower's type and tier. This replaces the global tower combat values while keeping enemy and projectile data in the pure core. A general behavior engine is deferred because the three authored types need only direct, typed fields.
- Extend placement commands with a tower type and tower snapshots with type and upgrade tier. The upgrade command targets a tower ID and is ignored after tier one. This makes replayed command sequences deterministic and keeps UI selection outside simulation state.
- Represent slowing as one remaining-duration and multiplier state on an enemy. Slow projectile hits refresh that state rather than stack it; movement reads the multiplier before decrementing duration. This delivers a clear Slow role without introducing the advanced effect-combination system reserved for later work.
- Use compact Phaser text controls for type selection and the selected tower's upgrade. Pointer interaction first checks controls and existing towers before dispatching placement, so a control click cannot place a tower underneath it. React HUD is deferred to feature-009.
- Upgrade only combat statistics already defined by each type. It is free in this increment, but definitions may retain a future cost field only when it is not read by simulation or UI.

## Risks / Trade-offs

- [Temporary Phaser controls may need replacement by the HUD] → keep their state local to the adapter and communicate only typed commands.
- [Slow refreshes can make balance too strong] → use visible, authored prototype values and cover expiry/refresh with fixed-step unit tests.
- [Changing placement command shape affects existing tests and adapters] → update all callers together and retain validation behavior for every tower type.

## Migration Plan

1. Add and validate tower content, runtime fields, commands, and deterministic simulation tests.
2. Replace global tower combat calculations with resolved type/tier statistics and add Slow movement effects.
3. Add Phaser selection, tower rendering, and upgrade controls; run browser smoke checks for mouse and touch.
4. Rollback is safe by reverting the implementation commit; no persisted run state or migrations are involved.
