# Design

## Context

The prototype level already supplies logical world bounds and a route, while the pure simulation only advances one enemy. The Phaser adapter owns the current viewport transform. See `proposal.md` and `specs/tower-placement/spec.md` for scope and behavioral requirements.

## Goals / Non-Goals

**Goals:**

- Represent placement candidates, validation results, and placed towers in pure TypeScript.
- Use one grid conversion and one validation path for preview and committed placement.
- Keep screen-to-world conversion in Phaser while keeping all placement rules in the simulation layer.

**Non-Goals:**

- Tower cost, selection UI, removal, combat statistics, targeting, or combat behavior.
- A generic tile-map system, arbitrary tower shapes, drag placement, or viewport-dependent logical coordinates.

## Decisions

### Use centre-based, fixed-size square cells

The prototype level will define a grid size, a square tower footprint, and a route exclusion radius. Input rounds to a cell centre; validation uses the footprint rectangle against bounds, route segments, and placed tower rectangles. Centre-based cells make the preview position identical to the committed position and are simpler than introducing a tile-map model before one is needed.

### Keep validation and commit in the session

A pure placement module will return a discriminated valid/rejected result. `PlaceTower` dispatch will call that same module, append an immutable tower snapshot only when valid, and retain the latest rejection reason for inspection. The Phaser preview will call the pure validator using the same level and snapshot towers; it will not duplicate collision rules.

### Share a world transform inside the Phaser scene

The scene will derive a world-to-screen transform for drawing and its inverse for pointer coordinates. Resize recalculates the transform, so mouse and touch positions map to the same logical cells regardless of viewport size. Phaser's unified pointer events provide the common input path rather than separate browser listeners.

## Risks / Trade-offs

- [Route exclusion feels too broad or narrow] → keep its radius as explicit prototype-level data for later tuning.
- [Pointer lies in letterboxed padding] → reject the resulting out-of-bounds candidate and render an invalid preview.
- [Preview validation diverges from commit] → both paths call the same exported pure validator and have focused tests.
- [No currency gates placements] → the prototype permits valid placements without cost until the economy feature defines spending rules.

## Migration Plan

1. Add placement configuration, pure grid conversion, validation, and unit tests.
2. Extend the session command/snapshot contract and test accepted and rejected commands.
3. Add Phaser preview, unified pointer interaction, and resize-safe coordinate conversion.
4. Roll back by removing placement state and input rendering; no persistence or external data migration is involved.
