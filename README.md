# Tower Defence

## Project

Tower Defence is a lightweight, cartoon-style 2D tower-defense game for desktop and mobile browsers. The project starts with a focused, playable vertical slice and grows through small, independently verifiable features.

## Technology stack

- TypeScript with strict type checking
- Vite for development and browser builds
- Phaser 3 for gameplay rendering, input, assets, and sound
- React for menus and HUD
- Vitest for simulation unit tests
- LocalStorage for settings and level-progress persistence

Gameplay simulation remains independent from rendering, browser APIs, and persistence.

## MVP scope

- One authored map with a fixed enemy route
- Ten waves, preceded by a five-wave prototype
- Three tower types: basic, rapid-fire, and slowing
- Three enemy types: normal, fast, and armored
- Grid-snapped tower placement, upgrades, economy, base health, victory/defeat, pause, and restart
- Responsive desktop and landscape-mobile browser play with mouse and touch support
- Local settings and completed-level progress; no account or backend

## Future direction

- Additional maps, campaign progression, tower and enemy variants, bosses, and effects
- Mobile usability polish and optional offline PWA support
- Content validation, balancing tools, and a level editor
- Desktop packaging for Windows and Linux after browser gameplay is stable

See [`docs/PROJECT.md`](docs/PROJECT.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and [`docs/BACKLOG.md`](docs/BACKLOG.md) for the current product, technical, and delivery details.
