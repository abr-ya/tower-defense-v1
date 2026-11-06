# Tasks

## 1. Core session and fixed clock

- [ ] 1.1 Add pure simulation types, fixed-step constants, a session factory, and a public `src/game/core` export; verify `npm run typecheck` succeeds without imports from Phaser, React, DOM, or platform modules.
- [ ] 1.2 Implement accumulator-based advancement at 1/60 second with a five-tick catch-up cap and integer tick-derived simulation time; verify focused Vitest cases cover partial elapsed time, a single tick, multiple ticks, and capped long frames.

## 2. Lifecycle and deterministic behavior

- [ ] 2.1 Implement typed pause, resume, and restart commands; verify tests prove pause halts ticks, resume continues advancement, and restart restores the initial running snapshot.
- [ ] 2.2 Return immutable value snapshots and verify two sessions receiving identical ordered commands and elapsed updates produce equal snapshots without browser or Phaser setup.

## 3. Integration verification

- [ ] 3.1 Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`; verify every command exits successfully.
- [ ] 3.2 Update `docs/BACKLOG.md` to `IN PROGRESS` after the automated checks pass; verify it remains `IN PROGRESS` until the OpenSpec change is archived.

## Workflow follow-up

- Review the completed implementation and tests.
- Sync the `deterministic-simulation` spec, archive the change, then mark `feature-002` as `DONE`.
