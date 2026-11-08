# Tasks

## 1. Pure combat model

- [ ] 1.1 Add validated prototype combat statistics for tower range, cooldown, projectile speed, damage, and enemy health; verify unit tests reject invalid values.
- [ ] 1.2 Implement pure nearest-target acquisition, fixed-step cooldowns, projectile travel, damage, and defeated-enemy removal; verify focused tests cover range, firing order, hit damage, removal, and equivalent sessions.

## 2. Session integration

- [ ] 2.1 Extend immutable simulation snapshots with living enemy health, tower combat state, and projectile snapshots; verify restart restores the initial combat state.
- [ ] 2.2 Keep route traversal and placement behavior compatible with combat; verify existing tests remain green alongside new combat tests.

## 3. Browser visualization

- [ ] 3.1 Render range indicators, projectiles, and enemy health from snapshots without duplicating combat rules; verify the development server opens without application console errors.
- [ ] 3.2 Mark feature 005 IN PROGRESS in `docs/BACKLOG.md`; verify its status remains IN PROGRESS until all checks, sync, and archive complete.

## 4. Integration verification

- [ ] 4.1 Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` with LTS Node; verify all commands pass.
- [ ] 4.2 Perform a user-confirmed desktop and landscape touch smoke check: place an in-range tower, observe target/projectile/health loss/enemy defeat, and verify out-of-range towers do not fire.

## Workflow follow-up

- Sync the approved combat delta specification to main OpenSpec specifications after implementation and verification.
- Archive the completed change, mark feature 005 DONE in `docs/BACKLOG.md`, and create the final documentation commit.
