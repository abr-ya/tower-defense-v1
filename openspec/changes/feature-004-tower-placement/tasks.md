# Tasks

## 1. Pure placement model

- [ ] 1.1 Add prototype-level placement configuration for grid size, tower footprint, and route exclusion radius; implement pure world-position snapping to cell centres and verify focused unit tests cover stable snapping.
- [ ] 1.2 Implement pure placement validation against bounds, route segments, and occupied tower footprints with typed rejection reasons; verify unit tests cover every accepted and rejected candidate.

## 2. Simulation placement state

- [ ] 2.1 Extend typed simulation commands and immutable snapshots with placement attempts, placed towers, and the latest inspectable rejection; verify tests prove valid commands add one snapped tower and invalid commands leave tower state unchanged.
- [ ] 2.2 Preserve lifecycle and deterministic session behavior with placement state; verify restart clears towers and equivalent sessions receiving identical placement inputs retain identical snapshots.

## 3. Phaser interaction and rendering

- [ ] 3.1 Add resize-safe inverse world conversion and unified Phaser pointer handling for mouse and touch; verify a pointer position maps to the same cell used by pure validation.
- [ ] 3.2 Render a snapped valid/invalid preview and committed placeholder towers from snapshots without duplicating validation rules; verify the development server opens with no application console errors.
- [ ] 3.3 Mark feature 004 IN PROGRESS in `docs/BACKLOG.md`; verify its status remains IN PROGRESS until all checks, sync, and archive complete.

## 4. Integration verification

- [ ] 4.1 Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` using the LTS Node environment; verify all commands pass.
- [ ] 4.2 Perform a user-confirmed manual smoke check in desktop and landscape touch viewport: hover/tap shows a snapped preview, valid cells place a tower, and route/occupied/out-of-bounds cells remain visibly invalid; record the result before marking complete.

## Workflow follow-up

- Sync the approved placement delta specification to the main OpenSpec specifications after implementation and verification.
- Archive the completed change, then mark feature 004 DONE in `docs/BACKLOG.md` and create the final documentation commit.
