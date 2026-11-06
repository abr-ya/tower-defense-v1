# Tasks

## 1. Authored level and pure route traversal

- [x] 1.1 Add typed level and waypoint definitions plus one prototype level with logical bounds, a winding route, and an authored movement speed. Verify that route validation accepts the prototype and rejects fewer than two waypoints, out-of-bounds waypoints, and zero-length segments.
- [x] 1.2 Implement pure cumulative-distance traversal that maps elapsed travel distance to an enemy position and completion state. Extend the simulation session and immutable snapshot to expose the prototype enemy while preserving pause, resume, and restart behavior. Verify focused unit tests cover stable speed, waypoint crossing, completion clamping, restart, and deterministic equivalent sessions.

## 2. Phaser visualization

- [ ] 2.1 Update the Phaser bootstrap scene to create a session from the prototype level, advance it from Phaser frame deltas, and render the route and enemy solely from simulation snapshots. Verify the development server loads without browser console errors.
- [ ] 2.2 Fit logical map coordinates into the renderer and update drawing on resize. Verify desktop and landscape browser views keep the route and enemy visible without horizontal overflow.

## 3. Integration verification

- [ ] 3.1 Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` using the project LTS Node environment; verify all commands pass.
- [ ] 3.2 Perform a manual smoke check in desktop Chromium or Firefox: open the game, observe the visible route and stable moving enemy, then resize the window. Repeat in a landscape touch-device viewport and verify no horizontal overflow. Record the user-provided result before marking these tasks complete.
- [ ] 3.3 Keep feature 003 marked IN PROGRESS in `docs/BACKLOG.md` until automated checks, the user-confirmed smoke check, specification sync, and archive are complete.

## 4. Completion workflow

- [ ] 4.1 Sync the approved route-traversal delta specification to the main OpenSpec specifications after implementation and verification.
- [ ] 4.2 Archive the completed OpenSpec change, then mark feature 003 DONE in `docs/BACKLOG.md`.
