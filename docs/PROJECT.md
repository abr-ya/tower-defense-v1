# Tower Defence — Project Vision

Status: planning | Updated: 2026-11-04

## Product vision
A lightweight, extensible, cartoon-style 2D tower-defense game, playable in desktop and mobile browsers, with future desktop packaging (Windows/Linux) and potential native mobile packaging. Build a fun vertical slice before expanding content.

## Core gameplay
- Top-down map with a predefined, winding enemy route.
- Player places towers freely on valid terrain, not on the road or occupied space. Placement snaps to a logical grid.
- Enemies follow authored waypoints; no dynamic pathfinding in MVP.
- Towers automatically acquire targets and attack; defeated enemies award currency.
- Player survives waves while defending a base with limited health.
- Mouse and touch are first-class inputs.

## MVP scope
- One map, one route, 10 waves; a five-wave prototype precedes the full MVP.
- Three towers: basic single-target, rapid-fire, slowing.
- Three enemies: normal, fast, armored.
- Tower placement, two upgrade tiers (base + one upgrade), economy, base health, victory/defeat, pause and restart.
- Cartoon-inspired readable visuals, simple effects and audio; placeholder shapes acceptable for prototype.
- Save settings and unlocked/completed level progress locally. In-progress run save is not required.
- Responsive browser play on desktop and landscape mobile; no account or backend.

## Explicit non-goals for MVP
Multiplayer, user accounts, cloud saves, in-app purchases, leaderboards, procedural maps, level editor, heroes, skill trees, advanced status combinations, and native app packaging.

## Future roadmap
- Content: maps, enemy families, bosses, tower variants, campaign progression.
- Mechanics: area damage, poison, buffs, branching waves, targeting modes, abilities.
- Tools: data validation, level editor, balancing simulation.
- Platforms: PWA/offline support, Windows/Linux through Tauri (after compatibility testing), potential Android packaging.
- Online: optional sync, rankings and profiles only if justified.

## Product principles
1. Playable after every milestone; small vertical slices.
2. Gameplay rules are independent of rendering and platform.
3. New content is mostly data-driven; new behaviors use small composable modules.
4. Deterministic fixed-step simulation and testable core logic.
5. Avoid premature abstractions, backend services and large frameworks.
6. No unreviewed feature implementation: backlog item -> OpenSpec change -> review -> implement -> verify -> archive.

## MVP acceptance criteria
- A player can open the URL in a desktop browser and landscape mobile browser, place and upgrade towers, complete or lose a full 10-wave level, and restart.
- Invalid placement is visibly rejected and never spends currency.
- Wave progression, rewards, health, and victory/defeat behave consistently.
- No core gameplay requires network access after assets are loaded.
- Game logic has automated unit tests and critical interactions are manually tested on mouse and touch.
- Configuration files define map route, tower/enemy statistics and wave composition.

## Decisions to revisit
- Final art direction and asset licensing.
- Balance values after playtesting.
- Portrait support (not required initially).
- Tauri vs Electron after desktop performance tests.
