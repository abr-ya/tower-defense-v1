# Design

## Context

The repository has planning documentation and OpenSpec configuration but no application source or package manifest. The architecture calls for strict TypeScript, Vite, React for menus/HUD, Phaser for rendering and input, and Vitest for simulation tests. See `proposal.md` for motivation and `specs/browser-game-shell/spec.md` for the observable contract.

## Goals / Non-Goals

**Goals:**

- Establish a minimal, browser-first Vite application with clear `app`, `game/adapters/phaser`, and test entry points.
- Mount one Phaser scene inside a React-owned application shell and dispose it when the host unmounts.
- Size the Phaser renderer from the host element so viewport changes update the canvas without changing future logical world dimensions.
- Make repository checks deterministic and runnable by CI through package scripts.

**Non-Goals:**

- No simulation state, game loop, entities, route, placement, combat, HUD controls, persistence, assets, or audio.
- No custom scaling/camera policy beyond a neutral responsive renderer scaffold.
- No CI service configuration, deployment, PWA support, or mobile portrait layout.

## Decisions

### Use Vite with strict TypeScript and package scripts

The bootstrap will use Vite's browser development/build pipeline and a strict TypeScript configuration. `package.json` will expose `dev`, `build`, `lint`, `typecheck`, and `test` scripts; the README will name the commands.

Vite is selected because it is the documented project stack and keeps the initial browser build small. A custom bundler setup is rejected because it adds configuration work without advancing the vertical slice.

### Keep React and Phaser at an adapter boundary

`src/app` will own React startup and the layout host. A dedicated `src/game/adapters/phaser` module will create and destroy the Phaser `Game` instance and contain the placeholder scene. The scene will not import React, and React will not manipulate scene objects.

This reflects the intended architecture from the first commit and keeps the future pure simulation on the other side of the adapter. Rendering directly from React or adding simulation state to the Phaser scene is rejected because both would blur the required boundary.

### Resize from the rendered host, not from simulation coordinates

The React wrapper will observe or otherwise react to host-size changes and forward the current dimensions to Phaser's scale manager. The canvas will fill the wrapper, while the initial scene remains a non-gameplay placeholder.

This supports desktop resizing and landscape mobile viewports now, while allowing a later change to define a fixed logical world and camera/letterbox behavior. Tying world size directly to `window.innerWidth` is rejected because the architecture requires logical world coordinates independent of viewport pixels.

### Verify configuration with a small application-level test

Vitest will be configured with at least one focused test of a pure bootstrap helper or equivalent non-browser module. Browser lifecycle and responsive behavior will be covered by the manual smoke scenarios for this change.

This proves the test command and test discovery work without prematurely introducing a heavy browser testing stack. Adding DOM or end-to-end test tooling is deferred until a later feature needs it.

## Risks / Trade-offs

- [Phaser lifecycle leaks during hot reload or React remounts] → Destroy the Phaser `Game` instance in the host component cleanup and keep instance creation in one adapter.
- [Canvas sizing differs across browser chrome or device orientation changes] → Use the actual host dimensions and include desktop resize and landscape-touch smoke checks.
- [Tool versions become incompatible] → Pin compatible dependency ranges through the package manifest and validate lint, typecheck, test, and build after installation.
- [Bootstrap code grows into game logic] → Keep the scene visual-only and defer all simulation and gameplay commands to `feature-002` and later backlog items.

## Migration Plan

1. Add the package manifest, TypeScript/Vite/Vitest/ESLint configuration, source scaffold, and documentation.
2. Install dependencies and run lint, typecheck, test, and build.
3. Manually open the development server in a desktop browser, resize the viewport, and repeat in a landscape touch-enabled viewport.
4. Roll back by removing the bootstrap files and dependency manifest if the stack cannot meet the stated checks; no persisted data or external API contract is introduced.
