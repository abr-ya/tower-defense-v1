# Tasks

## 1. Tower content and simulation state

- [ ] 1.1 Add validated data-defined Basic, Rapid, and Slow tower definitions with base and one upgrade tier; verify unit tests reject invalid definitions and expose distinct statistics.
- [ ] 1.2 Extend pure commands, tower/projectile/enemy snapshots, placement, and restart for typed towers and one-tier upgrades; verify unit tests cover valid typed placement, upgrade idempotence, and deterministic equivalent sessions.

## 2. Combat variety

- [ ] 2.1 Resolve target range, cooldown, projectile speed, damage, and effects from each tower's type and tier; verify focused unit tests distinguish Basic, Rapid, and Slow firing behavior.
- [ ] 2.2 Add the deterministic non-stacking Slow duration and movement multiplier; verify focused unit tests cover effect application, refresh, expiry, and restored normal speed.

## 3. Browser interaction

- [ ] 3.1 Add compact Phaser controls to select each tower type and render type/tier distinctions; verify the development server loads without application console errors.
- [ ] 3.2 Add placed-tower selection and an eligible-only free Upgrade control without currency display or deduction; verify interaction does not place an unintended tower and hides the action after upgrade.
- [ ] 3.3 Mark feature 007 IN PROGRESS in `docs/BACKLOG.md`; verify it remains so until archive.

## 4. Integration verification

- [ ] 4.1 Run lint, typecheck, test, and build under LTS Node; verify all pass.
- [ ] 4.2 Perform user-confirmed desktop and landscape touch smoke checks: select and place all three types, observe Slow, upgrade each eligible type once, and verify no currency is displayed or spent.

## Workflow follow-up

- Sync the approved delta specifications, archive the change, mark feature 007 DONE, and create the final documentation commit after the implementation commit.
