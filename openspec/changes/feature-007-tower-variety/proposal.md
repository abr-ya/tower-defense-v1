# Proposal

## Why

The prototype currently places one identical tower, so players cannot make tactical choices or improve a placement. Three differentiated tower types and one upgrade tier establish the MVP's core tower variety before economy and additional enemy types are introduced.

## What Changes

- Add data-defined Basic, Rapid, and Slow tower definitions with distinct combat behavior.
- Allow a player to choose a tower type before placement through a compact temporary Phaser control.
- Add one free upgrade tier for a selected placed tower; costs and currency remain out of scope.
- Apply slow effects deterministically to affected enemies and render type and upgrade distinctions from snapshots.
- Preserve pointer placement validation and framework-independent simulation rules.

## Capabilities

### New Capabilities

- `tower-variety`: Data-defined tower types, selection, one-tier upgrades, and deterministic slowing behavior.

### Modified Capabilities

- `basic-combat`: Tower-specific attack statistics and slowing effects change combat behavior.
- `tower-placement`: Typed placement and selected-tower upgrade interaction extend placement behavior.

## Impact

Updates pure simulation state, level content, combat and placement commands, Phaser rendering and controls, and unit tests. No dependencies, currency, rewards, or HUD framework are added.
