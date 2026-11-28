# Tower Defence — Verification Backlog

Status: active | Updated: 2026-11-27

## Purpose
Deferred and advanced verification checks. A check lands here when it is not required to close its source OpenSpec change but still has to be confirmed before the browser MVP release. Every item keeps its source change, platform, and an executable scenario, so the check can be run later without re-reading the change artifacts.

This file is not a feature backlog. Feature work and its priorities stay in [`docs/BACKLOG.md`](BACKLOG.md); OpenSpec remains the source of truth for requirements and design.

## Working agreement
- ID format `verify-NNN`; IDs are unique and never reused.
- Status: `TODO`, `IN PROGRESS`, `DONE`, `WONTFIX`.
- Every item names the source change, the platform, and a concrete scenario.
- `MVP blocking` marks checks that gate the browser MVP release; those also stay linked from the matching feature in [`docs/BACKLOG.md`](BACKLOG.md).
- A check moves here only by an explicit user decision. The source change keeps a pointer to the item id so the trail stays visible.
- A check is closed as `DONE` only after its scenario passes on the named platform.

## Checks
| ID | Source change | Platform | MVP blocking | Status | Check |
|---|---|---|---|---|---|
| verify-001 | feature-007 tower variety | Mobile browser, landscape orientation | yes | TODO | Tower type buttons, tower selection and the free Upgrade control work with touch input: tap a type control, tap a valid cell, tap a placed tower, tap Upgrade. A control tap must never place a tower underneath it, the Upgrade action must hide after the upgrade, and no currency may be displayed or spent. |
| verify-002 | feature-008 enemy variety | Desktop browser | no | TODO | Play the shipped level through all ten waves to a win or a loss and confirm the restart returns to wave 1 with the base health restored: the status panel counts the waves from 1 to 10, Normal enemies appear from wave 1, Fast from wave 3 and Armored from wave 5, and the outcome text appears when the run ends. |

## How to run a check
1. Start the dev server with network access: `npm run dev -- --host`.
2. Open the printed network URL on the target platform and follow the scenario of the check.
3. Record the outcome in this table and set the status to `DONE`; keep the item linked from the feature it belongs to.

## Deferred history
| Item | Moved from | Date | Reason |
|---|---|---|---|
| Landscape touch smoke of the tower variety controls | `feature-007-tower-variety` task 4.2 | 2026-11-26 | The desktop mouse smoke check passed; the touch path shares the same pointer handling but still needs a real touch device. |
| Full ten-wave playthrough of the authored difficulty curve | `feature-008-enemy-variety` task 4.2 | 2026-11-27 | The browser smoke check passed: the three families appear on their waves and the restart resets the run; a full playthrough needs a long manual session, and the difficulty curve is tuned in `feature-012`. |
