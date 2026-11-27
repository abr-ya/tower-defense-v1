# Proposal

## Why

The prototype still fights a single enemy that walks one route with one speed and one health value, and its five-wave loop ends long before the browser MVP target. The MVP needs three readable enemy families and a full ten-wave difficulty curve so the player meets the threat mix the three tower types were designed against.

## What Changes

- Add data-defined Normal, Fast, and Armored enemy types with distinct movement speed, health, and armor.
- Move enemy speed and health from one global level value to per-type content, and report every enemy's type, armor, and effective speed in its snapshot.
- Reduce incoming projectile damage by the target's armor with a one-damage floor, so no enemy can become immune to all towers.
- Extend wave definitions to ordered spawn groups that mix enemy types, and author ten waves of increasing difficulty for the MVP level.
- Expose the authored wave count in the snapshot and show the current wave against it instead of a hardcoded five.
- Render each enemy family with a distinct color and size so the mix is readable in the browser.
- Keep the simulation framework-independent: enemy types, armor, and mixed spawn groups stay pure TypeScript.

## Capabilities

### New Capabilities

- `enemy-variety`: Data-defined enemy families (Normal, Fast, Armored), per-enemy statistics and snapshots, armor damage reduction, and readable per-family rendering.

### Modified Capabilities

- `waves-and-outcomes`: Authored waves become ordered mixed-family spawn groups, the MVP level defines ten waves of increasing difficulty, and the snapshot exposes the authored wave count.
- `basic-combat`: Projectile damage is reduced by the target's armor with a one-damage floor, and target selection stays deterministic when several living enemies are in range.
- `level-route-traversal`: Enemies traverse the route at their own family's speed instead of one shared level speed, and one spawn produces one enemy of the requested family.

## Impact

The level content schema changes: `LevelDefinition` drops its global enemy speed and enemy health values and its wave entries become spawn groups, while enemy type definitions become new content. The pure simulation gains per-enemy type, armor, and health state, armor-aware damage application, and multi-group wave scheduling; wave count becomes part of the read-only snapshot. The Phaser adapter renders per-family colors and sizes and shows the authored wave count. Unit tests, content validation, and the existing wave, combat, and traversal expectations are updated together. No dependencies, currency, rewards, new commands, or HUD framework are added.
