# Tower Defence — Technical Architecture

Status: proposed | Updated: 2026-11-04

## Stack
- TypeScript (strict), Vite, Phaser 3, React for menus/HUD, Vitest for core unit tests.
- Browser-first deployment. LocalStorage for settings and progression.
- No backend in MVP. Desktop packaging later with Tauri 2, subject to Windows WebView/Phaser testing.
- Prefer a single app/repository for MVP, with clear module boundaries rather than a premature monorepo.

## Architectural boundaries
```
React UI (menus, HUD, controls)
    <-> typed commands and read-only state/events
Game application / session controller
    <-> deterministic simulation (pure TypeScript)
    <-> Phaser adapter (render, input, assets, sound)
    <-> platform adapters (storage, fullscreen)
Data definitions (maps, towers, enemies, waves)
```
The simulation MUST NOT import Phaser, React, browser DOM or storage APIs. Rendering consumes snapshots/events; input dispatches typed commands. UI never mutates simulation entities directly.

## Proposed structure
```
src/
  app/                 # React bootstrap and screens
  game/
    core/              # GameState, GameSession, clock, commands, events
    systems/           # movement, targeting, combat, effects, waves, economy
    entities/          # runtime entity types and factories
    behaviors/         # modular attack/status/targeting strategies
    adapters/phaser/   # Phaser scene, rendering, input mapping, asset loading
    maps/              # map loading, terrain and placement validation
  content/
    towers/ enemies/ waves/ levels/  # definitions, validation
  platform/            # StoragePort, browser implementation, future desktop
  ui/                  # React HUD, tower shop, dialogs
  assets/
tests/
```
Adapt folder names to implementation needs; preserve boundaries rather than exact file count.

## Simulation
- Fixed timestep (e.g. 1/60 s) with accumulator and capped catch-up; rendering may interpolate.
- Simulation state includes game phase, currency, base health, current wave, towers, enemies, projectiles, status effects, and a stable entity ID generator.
- Determinism target: given the same initial config, seed (if randomness introduced), and command sequence, simulation results match. Avoid wall-clock time and Math.random in simulation.
- Systems run in documented order: apply commands -> spawn/move -> acquire targets -> fire/projectiles -> damage/status -> deaths/rewards -> escapes/base damage -> wave/end checks. Adjust order through a reviewed spec if needed.
- Pause halts simulation updates; speed multiplier is a future extension point.

## Data-driven definitions
- `LevelDefinition`: map bounds, route waypoints, buildable mask/tiles, starting currency/health, wave references.
- `TowerDefinition`: cost, range, cooldown, damage, target strategy, attack behavior, upgrades.
- `EnemyDefinition`: speed, HP, armor/resistance, bounty, visual key.
- `WaveDefinition`: ordered spawn groups with enemy type, count, interval and start offset.
- Validate references and numerical ranges on startup/build; keep IDs stable.

## Placement
- Logical grid (initial candidate: 32 world units); world coordinates are independent of viewport pixels.
- Tower footprint must fit entirely in bounds and on buildable cells; must not intersect route exclusion mask, other towers, or reserved areas.
- Preview uses exactly the same validation logic as committed placement.
- Failed command returns a typed rejection reason; currency deducted only after successful placement.

## Inputs and viewport
- Desktop: mouse move/click, optional keyboard shortcuts.
- Mobile: tap-to-select then tap-to-place (drag optional later), large touch targets, cancel/confirm affordances.
- Coordinate transform from screen to world shared across input methods.
- Landscape-first layout with letterboxing/camera scaling; avoid changing simulation dimensions when viewport resizes.

## Events and state
- Commands: `StartWave`, `PlaceTower`, `UpgradeTower`, `SelectTower`, `Pause`, `Resume`, `Restart` (selection may remain UI-only).
- Events: `TowerPlaced`, `TowerUpgraded`, `EnemyKilled`, `EnemyEscaped`, `WaveStarted`, `WaveCompleted`, `GameWon`, `GameLost`.
- UI subscribes to snapshots/selectors or typed events; no event-bus sprawl or global mutable singleton.

## Persistence
- Versioned schema for preferences and level completion, stored behind `StoragePort`.
- Handle corrupt/unavailable local storage gracefully; support future migrations.
- Do not persist transient run state in MVP.

## Testing and quality
- Vitest for path traversal, placement validation, targeting, damage, reward, wave and end-state rules.
- Tests for identical outcomes with fixed inputs and seed.
- Manual smoke tests in Chromium/Firefox desktop and at least one touch-enabled mobile browser.
- ESLint, TypeScript typecheck and tests must pass before completing a backlog item.
- Avoid heavy asset bundles; performance budget to be established by profiling on a mid-range phone.

## Delivery and packaging
- `npm run dev` for local web; `npm run build` for static hosting.
- PWA only after core gameplay is stable; test offline caching and update behavior.
- Desktop wrapper is a separate future work item; core game and UI remain shared.
- GitHub Actions can build Windows artifacts on Windows runners when packaging is introduced.

## Architectural decision records (initial)
- ADR-001: Browser-first Phaser + React + Vite.
- ADR-002: Framework-independent simulation.
- ADR-003: Authored fixed enemy paths; grid-validated free tower placement.
- ADR-004: No backend for MVP.
- ADR-005: OpenSpec change lifecycle plus separate prioritized backlog.
