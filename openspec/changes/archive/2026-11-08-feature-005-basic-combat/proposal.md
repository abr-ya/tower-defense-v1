# Proposal

## Why

Players can place towers but they do not yet protect the route. A minimal deterministic combat loop makes placement meaningful and provides the first observable defence outcome.

## What Changes

- Add prototype tower and enemy combat statistics, including range, cooldown, projectile speed, damage, and enemy health.
- Add pure nearest-target acquisition, fixed-step firing, projectile travel, damage, and removal of a defeated enemy.
- Expose read-only tower, enemy-health, and projectile snapshots for rendering.
- Render range, firing projectiles, enemy health, and defeat in Phaser.
- Test targeting, cooldown, projectile hit, health reduction, removal, and deterministic equivalent sessions.
- Do not add currency, rewards, waves, base health, multiple tower/enemy types, upgrades, or UI controls.

## Capabilities

### New Capabilities

- `basic-combat`: Deterministic prototype targeting, projectile damage, and enemy defeat.

### Modified Capabilities

None.

## Impact

Adds pure combat state and systems to the simulation plus Phaser-only visualisation, with no new dependencies.
