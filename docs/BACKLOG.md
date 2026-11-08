# Tower Defence — Product Backlog

Status: initial planning | Updated: 2026-11-04

## Working agreement
- This file is the ordered source of truth for priorities and status; OpenSpec is the source of truth for the requirements/design of each active change.
- Status: `TODO`, `READY`, `IN PROGRESS`, `BLOCKED`, `DONE`. Priority: `High`, `Medium`, `Low`.
- Work-item types are `feature`, `fix`, `research`, and `refactoring`. Each type has an independent sequential number, formatted as `<type>-<number>`, for example `feature-001`.
- Name a work branch `<type>-<number>-<short-kebab-slug>` and use the same work-item ID in its OpenSpec change.
- Each implementation item maps to one OpenSpec change in `openspec/changes/<slug>/` and a PR/commit. Keep change scope reviewable (ideally one playable increment).
- Do not mark DONE until acceptance criteria, tests and manual smoke check pass, and the OpenSpec change is archived.
- Only one active implementation change at a time at the start; reorder as learning changes.

## Milestones
- M0 — Project foundation and development workflow.
- M1 — Playable vertical slice (one tower, one enemy, five waves).
- M2 — Full browser MVP (three towers/enemies, ten waves, upgrades, save progress).
- M3 — Mobile polish and optional PWA.
- M4 — New content/mechanics and desktop packaging.

## Prioritized backlog
| ID | Milestone | Priority | Status | Item / OpenSpec change | Acceptance criteria |
|---|---|---|---|---|---|
| feature-001 | M0 | High | DONE | Bootstrap Vite/React/Phaser/TS and OpenSpec (`feature-001-bootstrap-game`) | Local browser shows responsive game canvas; scripts for lint, typecheck, test, build work |
| feature-002 | M0 | High | DONE | Pure TS simulation loop (`feature-002-simulation-core`) | Fixed-step update, state/commands, pause; unit tests independent of Phaser |
| feature-003 | M1 | High | DONE | Level and route loading (`feature-003-level-route`) | One authored map; enemy follows waypoints at stable speed |
| feature-004 | M1 | High | DONE | Placement preview and validation (`feature-004-tower-placement`) | Valid cells highlighted; invalid cells rejected; mouse/touch input |
| feature-005 | M1 | High | IN PROGRESS | Targeting and projectile damage (`feature-005-basic-combat`) | Tower attacks enemies in range; death/reward logic tested |
| feature-006 | M1 | High | TODO | Waves and base health (`feature-006-waves-and-outcomes`) | Five prototype waves; escapes reduce health; win/lose/restart |
| feature-007 | M2 | Medium | TODO | Three towers and upgrade (`feature-007-tower-variety`) | Basic, rapid, slow towers and one upgrade tier; data-driven stats |
| feature-008 | M2 | Medium | TODO | Three enemies and ten waves (`feature-008-enemy-variety`) | Normal, fast, armored enemies; 10 waves with increasing difficulty |
| feature-009 | M2 | Medium | TODO | Game HUD, economy, controls (`feature-009-game-hud`) | Currency, health, wave, selection, upgrade, pause, restart accessible |
| feature-010 | M2 | Medium | TODO | Cartoon visual pass and audio (`feature-010-cartoon-art-pass`) | Consistent legible assets, effects, sound toggle; licensed/owned assets |
| feature-011 | M2 | Medium | TODO | Local settings/progression (`feature-011-local-progress`) | Versioned persistence, graceful recovery, completion retained |
| feature-012 | M2 | Medium | TODO | Browser MVP QA and balancing (`feature-012-mvp-qa`) | End-to-end playthrough, mobile/desktop checks, no blocking bugs |
| feature-013 | M3 | Low | TODO | Mobile usability polish (`feature-013-mobile-polish`) | Touch targets, camera/layout, safe areas, landscape testing |
| feature-014 | M3 | Low | TODO | PWA offline mode (`feature-014-pwa-offline`) | Installable; cached gameplay works offline after first load |
| feature-015 | M4 | Low | TODO | More maps and campaign (`feature-015-campaign-levels`) | Level selection and independently configured levels |
| feature-016 | M4 | Low | TODO | Bosses and effect system (`feature-016-advanced-enemies`) | Composable status effects and boss mechanics |
| feature-017 | M4 | Low | TODO | Windows/Linux desktop packaging (`feature-017-desktop-tauri`) | Shared web code; Windows build and smoke test; Linux packaging |
| feature-018 | M4 | Low | TODO | Level editor (`feature-018-level-editor`) | Create, validate and export playable level data |

## Definition of Ready
- Clear player/developer outcome, acceptance criteria, known dependencies, and bounded scope.
- OpenSpec proposal, requirements/scenarios, design and tasks reviewed before implementation.

## Definition of Done
- Acceptance scenarios pass; unit tests cover game rules affected.
- `lint`, `typecheck`, `test`, and `build` pass.
- Manual smoke test of relevant input/platform behavior.
- No unapproved scope expansion; docs/backlog updated; OpenSpec change synced (if needed) and archived.

## Suggested first change
`feature-001 bootstrap-game`: initialize a minimal project, configure OpenSpec for OpenCode, add React shell and Phaser scene, make canvas resize, add CI-friendly scripts and one sample test. Do not implement enemies or combat in this change.

## Parking lot
Portrait layout, hero characters, online saves, achievements, leaderboards, multiplayer, monetization, procedural generation, Android native packaging.
