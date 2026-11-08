# Proposal

## Why

Combat currently has no sequence, consequence for escaped enemies, or terminal outcome. Five authored waves and base health make the prototype a playable defence loop.

## What Changes

- Add five data-defined prototype waves with ordered enemy spawns.
- Add base health; escaped enemies reduce it and are removed.
- Add deterministic wave progression plus won and lost terminal states.
- Extend restart to restore waves, enemies, base health, and outcome.
- Render wave/base/outcome state and a terminal-only restart button in the browser with placeholder presentation.
- Exclude currency, rewards, wave controls, tower variety, upgrades, and additional enemy types.

## Capabilities

### New Capabilities

- `waves-and-outcomes`: Deterministic prototype wave spawning, base health, and terminal game outcomes.

### Modified Capabilities

None.

## Impact

Adds pure wave/outcome state and browser rendering without new dependencies.
