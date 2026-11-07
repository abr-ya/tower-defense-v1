# Proposal

## Why

The prototype now shows an enemy route but the player cannot yet affect the game world. Grid-snapped tower placement is the first interactive gameplay action and establishes the validation boundary needed before combat.

## What Changes

- Add a logical placement grid for the prototype level and one placeholder tower footprint.
- Add pure validation for in-bounds cells, route exclusion, and occupied cells, with typed rejection reasons.
- Extend the simulation with a typed placement command and immutable placed-tower snapshots; a valid command creates one tower and an invalid command leaves state unchanged.
- Add Phaser pointer handling for mouse and touch, plus a snapped preview that visibly distinguishes valid and invalid placement.
- Add tests for grid snapping, every rejection reason, successful placement, and deterministic command outcomes.
- Do not add currency, tower selection/shop UI, targeting, combat, projectiles, waves, base damage, upgrades, or mobile portrait support.

## Capabilities

### New Capabilities

- `tower-placement`: Deterministic grid-based tower placement validation and browser preview/commit interaction.

### Modified Capabilities

None.

## Impact

- Adds pure placement types, grid conversion, validation, and simulation commands/snapshots.
- Updates the Phaser adapter with shared screen-to-world input conversion and placeholder preview/tower rendering.
- Extends prototype-level content with placement configuration, without new dependencies or browser APIs in simulation rules.
