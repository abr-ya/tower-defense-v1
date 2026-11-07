# Proposal

## Why

The simulation can advance time but has no gameplay content for a player to observe. An authored level route and one moving enemy create the first visible game behavior while preserving the separation between simulation and rendering.

## What Changes

- Add one data-defined level with logical world bounds and an ordered, winding route made from waypoints.
- Add one route-traversing enemy to the pure simulation; it moves at a stable authored speed through segments without Phaser or browser dependencies.
- Extend the Phaser adapter to render the level route and its current enemy snapshot, demonstrating movement in the existing browser game surface.
- Add unit tests for route validation, traversal across waypoints, stable speed, and route completion.
- Do not add waves, spawning controls, towers, placement, combat, rewards, base damage, or new UI controls.

## Capabilities

### New Capabilities

- `level-route-traversal`: An authored level route and deterministic enemy traversal that provide renderable position snapshots for the browser adapter.

### Modified Capabilities

None.

## Impact

- Adds level definition content, route validation/traversal modules, simulation snapshot fields, and Phaser rendering for the prototype route/enemy.
- Extends the simulation core without introducing framework imports into pure gameplay rules.
- Makes the browser shell visibly demonstrate movement, while retaining its existing responsive behavior.
