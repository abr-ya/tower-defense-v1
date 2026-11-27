# Design

## Context

See proposal.md for motivation and the delta specifications for requirements.

The pure simulation currently knows a single enemy: the level carries one `enemySpeed` and one `combat.enemyHealth`, waves are flat `{ enemyCount, spawnIntervalSeconds }` entries that the code hard-validates to exactly five, and the browser adapter draws every enemy as the same amber circle. The tower content already follows a core-module plus content-file pattern (`core/towers.ts` holds the typed definitions and validation, `content/prototypeTowers.ts` holds the authored values, and the session receives them as a parameter), so the same shape fits enemies.

## Goals / Non-Goals

**Goals:** give the simulation per-family enemy identity, make armor a first-class combat rule, replace the flat wave list with mixed-family spawn groups, and extend the shipped level to ten authored waves of increasing difficulty.

**Non-Goals:** currency, tower or upgrade costs, enemy bounties and rewards, boss enemies, branching waves, status-effect combinations beyond the existing Slow effect, new player commands, and the React HUD. Final numeric balance stays with feature-012 once the economy from feature-009 makes tower placement cost-limited.

## Decisions

- **Enemy definitions mirror the tower pattern.** A new core module owns the typed `EnemyDefinition` and its validation, a content file owns the authored Normal, Fast, and Armored values, and the session takes the definitions as a parameter defaulting to the prototype set. Keeping them in the level file was rejected because enemy families are reusable content independent of a map, and because the level already delegates towers the same way.
- **The level schema changes.** `LevelDefinition` drops its global enemy speed and enemy health values, and each wave becomes a list of spawn groups that declare an enemy family, a count, a spawn interval, and a start offset. A flat wave entry with a single family was rejected because mixed waves and staggered arrivals are the point of the feature. This is a breaking change to the content schema only; level content, validation, and the affected tests move together in one stage.
- **Groups spawn concurrently, computed from wave elapsed time.** A group's next enemy is due when the wave's elapsed time reaches the group's start offset plus the number of enemies it already spawned times its interval. Strictly sequential groups were rejected because they remove the interleaving that makes a wave feel like a mix, and per-group timers were rejected because deriving due spawns from one elapsed counter keeps determinism obvious.
- **Armor is a flat reduction with a floor of one damage.** A projectile that reaches a target deals its configured damage minus the target's armor, never less than one. Percentage reduction was rejected because it blurs the difference between the tower types and hides the effect in a fraction, and damage-type tags were rejected as machinery for three towers. The one-damage floor is a hard requirement: without it a heavily armored enemy could become immune to every tower and the wave would never end.
- **Target selection breaks ties by the lower enemy identifier.** With several enemy families on the route, two enemies can be equidistant from a tower, so the nearest-enemy rule needs a stable tie-break to keep two identical sessions in step. Distance order alone was rejected as under-specified.
- **The snapshot grows instead of the UI guessing.** Enemy snapshots report family, armor, and effective speed, and the session snapshot reports the authored wave count. The browser HUD then renders `wave / waveCount` instead of a hardcoded five. Keeping the count in the UI was rejected because a second level would immediately show a wrong total.
- **Family visuals stay in the browser adapter.** The adapter maps each family to a color and a radius, the same way it already maps tower types to colors, so the core content stays free of rendering data.
- **Difficulty is authored, not generated.** The ten waves mix families and grow in enemy count per wave, with Fast joining at wave three and Armored at wave five. Generating waves from a formula was rejected because authored content is inspectable and matches the project's data-driven content principle.

## Risks / Trade-offs

- [The wave scheduler rework can break the existing spawn-timing expectations] → keep the group model expressive enough to express the previous single-group waves, and update the affected unit tests in the same stage.
- [Armor-heavy waves can drag out the level or make it trivial once tower costs arrive] → authored values are explicitly provisional; balance belongs to feature-012, and a full playthrough is part of the manual smoke check.
- [Removing the level-level enemy speed and health touches every content and test file] → land the schema change and the test updates in one commit so the tree never holds a half-migrated level.
- [Many simultaneous enemies can cost rendering time on mobile] → keep the existing reusable enemy graphics pool and avoid per-enemy allocations; profiling stays with feature-012 and feature-013.
- [Free placement during this feature removes the real cost pressure from difficulty] → accepted and stated here; economy arrives with feature-009.

## Migration Plan

1. Add the enemy definition module, the authored enemy content, the reworked level content, and the updated validation with their unit tests.
2. Rework the simulation to carry per-enemy family, armor, and health state, apply armor-aware damage, schedule mixed spawn groups, and expose the new snapshot fields; update the simulation and combat tests.
3. Update the browser adapter to draw family colors and sizes and to show the authored wave count, then run the browser smoke checks.
4. Rollback is safe by reverting the implementation commits; no persisted run state, no migrations, and no external API are involved.

## Open Questions

- The exact numeric balance of the ten waves, enemy health, and armor values is provisional and will be tuned during feature-012 without changing the authored structure.
