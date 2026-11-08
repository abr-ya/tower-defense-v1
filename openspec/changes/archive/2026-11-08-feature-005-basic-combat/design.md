# Design

## Context

The pure session already has one route enemy and placed-tower snapshots. See `proposal.md` and `specs/basic-combat/spec.md` for the required combat behaviour.

## Goals / Non-Goals

**Goals:** deterministic targeting, cooldown, projectile travel, damage, and defeat in the existing fixed-step session.

**Non-Goals:** rewards/currency, waves, base health, multi-targeting, tower variety, status effects, or new controls.

## Decisions

### Use one prototype combat definition

One authored statistics object supplies tower range/cooldown/damage/projectile speed and enemy health. This enables visible combat without prematurely defining a general content catalogue.

### Update combat after route movement each fixed tick

The session will move the enemy, acquire nearest targets, advance cooldowns and projectiles, apply hits, then remove defeated enemies. Stable IDs and ordered arrays preserve determinism.

### Snapshot-driven Phaser rendering

Phaser will draw combat state from snapshots only. It will not decide targets, hit timing, or health; preview/placement remains unchanged.

## Risks / Trade-offs

- [Enemy reaches the endpoint before defeat] → tune prototype values for a readable initial interaction; base outcomes remain deferred.
- [Projectile target disappears] → remove its projectile deterministically on the next combat tick.
- [Combat visuals obscure placement] → keep simple placeholder colours and draw placement previews above range circles.

## Migration Plan

1. Add pure combat data and tests.
2. Extend session snapshots and combat fixed-tick ordering.
3. Render combat state and perform desktop/touch smoke checks.
