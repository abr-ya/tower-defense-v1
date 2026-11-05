# Tasks

## 1. Project toolchain

- [x] 1.1 Create the Vite, strict TypeScript, ESLint, and Vitest configuration plus `package.json` scripts (`dev`, `lint`, `typecheck`, `test`, `build`); verify dependencies install with `npm install`.
- [x] 1.2 Add the React application entry point, global responsive layout styles, and a README development section; verify `npm run dev` starts the application.
- [x] 1.3 Add a focused Vitest test for a pure bootstrap helper and verify it passes with `npm run test`.

## 2. Phaser browser shell

- [ ] 2.1 Implement a React-owned game host and a Phaser adapter that creates one neutral placeholder scene and destroys the `Game` instance during component cleanup; verify the application loads without console errors through `npm run dev`.
- [ ] 2.2 Implement host-based Phaser canvas resizing without coupling viewport pixels to future logical world coordinates; verify desktop resizing keeps the canvas within its host without reloading.
- [ ] 2.3 Add a landscape mobile-safe layout that prevents horizontal page overflow; verify with browser device emulation or a touch-enabled landscape browser.

## 3. Integration verification

- [ ] 3.1 Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`; verify every command exits successfully.
- [ ] 3.2 Perform the manual smoke check: open the app in Chromium or Firefox on desktop, resize the viewport, then open it in a landscape touch-enabled mobile viewport; verify a visible placeholder canvas, responsive resizing, and no horizontal overflow. Record the user-provided result before marking this task complete.
- [ ] 3.3 Update `docs/BACKLOG.md` status only after the automated checks and user-provided manual smoke result pass; verify the status remains `IN PROGRESS` until archive conditions are met.

## Workflow follow-up

- Review the change artifacts before implementation.
- After implementation and smoke-test review, sync the capability spec and archive the change; then mark `feature-001` as `DONE`.
