# Spec Delta

## MODIFIED Requirements

### Requirement: Validated placement command

The simulation SHALL expose a typed placement command that identifies a defined tower type. A valid command SHALL add one placed-tower snapshot with that type at the candidate cell; an invalid command SHALL leave the simulation state unchanged.

#### Scenario: Valid candidate is committed

- **WHEN** the simulation receives a placement command for a valid candidate and defined tower type
- **THEN** its next snapshot contains one tower of that type at the snapped cell

#### Scenario: Invalid candidate is committed

- **WHEN** the simulation receives a placement command for an invalid candidate
- **THEN** its tower snapshots remain unchanged and the rejection reason is inspectable

### Requirement: Pointer placement preview

The browser game surface SHALL show a preview for the selected tower type snapped to the shared world-grid conversion and SHALL visually distinguish valid from invalid candidates. Mouse and touch input SHALL use the same preview and placement behavior.

#### Scenario: Mouse preview and click

- **WHEN** a mouse pointer moves over the game surface and clicks a valid candidate
- **THEN** the selected tower type's snapped valid preview is shown before the click and that tower is placed at the cell

#### Scenario: Touch preview and tap

- **WHEN** a touch pointer targets a candidate and taps a valid cell
- **THEN** the selected tower type's snapped valid preview is shown and that tower is placed at the cell
