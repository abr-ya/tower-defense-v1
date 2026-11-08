# Tasks

## 1. Wave and outcome simulation

- [ ] 1.1 Add validated five-wave prototype content and deterministic spawn scheduling; verify unit tests cover authored ordering and timing.
- [ ] 1.2 Extend pure simulation with multiple enemy snapshots, base health, escape removal, win/loss phases, and restart; verify focused tests cover escapes, both outcomes, and deterministic equivalent sessions.

## 2. Browser state

- [ ] 2.1 Render wave number, base health, and victory/loss state from snapshots; verify the development server loads without application console errors.
- [ ] 2.2 Mark feature 006 IN PROGRESS in `docs/BACKLOG.md`; verify it remains so until archive.

## 3. Integration verification

- [ ] 3.1 Run lint, typecheck, test, and build under LTS Node; verify all pass.
- [ ] 3.2 Perform user-confirmed desktop and landscape touch smoke checks: observe five waves, escape damage, victory and loss/restart scenarios.

## Workflow follow-up

- Sync the approved delta specification, archive the change, mark feature 006 DONE, and create the final documentation commit.
