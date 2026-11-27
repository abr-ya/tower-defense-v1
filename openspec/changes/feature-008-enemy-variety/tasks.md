# Tasks

## 1. Enemy content and level schema

- [x] 1.1 Add a core enemy definition module with Normal, Fast, and Armored families and validation that rejects non-positive speed, non-positive health, and negative armor; verify unit tests accept the prototype families and reject invalid ones.
- [x] 1.2 Rework the level definition to drop the global enemy speed and health values and to define each wave as ordered spawn groups that declare an enemy family, count, spawn interval, and start offset; verify validation accepts the shipped level and rejects an empty wave list or malformed groups.
- [x] 1.3 Author the shipped level with ten waves of growing enemy counts, Fast enemies from wave three and Armored enemies from wave five; verify a unit test asserts the wave count, the growing count per wave, and the family mix of the first and last waves.

## 2. Simulation: families, armor, and grouped waves

- [x] 2.1 Carry the enemy family, armor, and health per enemy in the simulation and report them in read-only snapshots; verify unit tests cover family identity, reported armor, and effective speed while a Slow effect is active.
- [x] 2.2 Apply the target's armor to incoming projectile damage with a one-damage floor; verify unit tests cover the reduced damage, the one-damage floor, and enemy defeat at zero health.
- [x] 2.3 Schedule mixed-family spawn groups from the wave's elapsed time and expose the authored wave count in the snapshot; verify unit tests cover group start offsets, group spawn intervals, wave completion, and victory after the last authored wave.
- [x] 2.4 Break target-selection ties between equally distant enemies by the lower enemy identifier; verify a unit test covers two equidistant enemies.

## 3. Browser rendering

- [x] 3.1 Draw each enemy family with its own color and size and show the authored wave count next to the current wave; verify the development server loads without application console errors.
- [x] 3.2 Mark feature 008 IN PROGRESS in `docs/BACKLOG.md`; verify it remains IN PROGRESS until the change is archived.

## 4. Integration verification

- [x] 4.1 Run lint, typecheck, test, and build under LTS Node; verify all four pass.
- [ ] 4.2 Perform user-confirmed browser smoke checks: observe all three enemy families, confirm a mixed-family wave, and play the level through all ten waves to a win or a loss followed by a restart. Move any check that cannot be confirmed on the target platform to `docs/VERIFICATION-BACKLOG.md` by an explicit user decision and keep a pointer here.

## Workflow follow-up

- Sync the approved delta specifications, archive the change, mark feature 008 DONE in `docs/BACKLOG.md`, and create the final documentation commit after the implementation commit.
