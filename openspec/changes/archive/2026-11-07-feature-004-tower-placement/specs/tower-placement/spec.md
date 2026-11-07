# Spec Delta

## Purpose

Define deterministic grid-based tower placement so players can preview and commit valid positions on the prototype map from any supported pointer input.

## ADDED Requirements

### Requirement: Grid-snapped placement candidates

The system SHALL convert a logical world position to a stable placement cell and expose that cell's logical centre for preview and placement.

#### Scenario: Pointer is between grid centres

- **WHEN** a player points to a world position between placement grid centres
- **THEN** the preview uses the nearest configured placement cell centre

#### Scenario: Equivalent positions are processed

- **WHEN** equivalent sessions receive the same placement world position
- **THEN** they resolve the same candidate cell

### Requirement: Deterministic placement validation

The system SHALL accept a candidate only when its tower footprint is fully within level bounds, outside the route exclusion area, and not occupied by another tower. It SHALL return a typed rejection reason for every invalid candidate.

#### Scenario: Candidate overlaps the route

- **WHEN** a snapped candidate footprint intersects the route exclusion area
- **THEN** validation rejects it with the route rejection reason

#### Scenario: Candidate overlaps a placed tower

- **WHEN** a snapped candidate footprint intersects an existing tower footprint
- **THEN** validation rejects it with the occupied rejection reason

#### Scenario: Candidate exceeds level bounds

- **WHEN** a snapped candidate footprint would extend outside the level bounds
- **THEN** validation rejects it with the bounds rejection reason

### Requirement: Validated placement command

The simulation SHALL expose a typed placement command. A valid command SHALL add one placed-tower snapshot at the candidate cell; an invalid command SHALL leave the simulation state unchanged.

#### Scenario: Valid candidate is committed

- **WHEN** the simulation receives a placement command for a valid candidate
- **THEN** its next snapshot contains one tower at that snapped cell

#### Scenario: Invalid candidate is committed

- **WHEN** the simulation receives a placement command for an invalid candidate
- **THEN** its tower snapshots remain unchanged and the rejection reason is inspectable

### Requirement: Pointer placement preview

The browser game surface SHALL show a preview snapped to the shared world-grid conversion and SHALL visually distinguish valid from invalid candidates. Mouse and touch input SHALL use the same preview and placement behavior.

#### Scenario: Mouse preview and click

- **WHEN** a mouse pointer moves over the game surface and clicks a valid candidate
- **THEN** the snapped valid preview is shown before the click and the tower is placed at that cell

#### Scenario: Touch preview and tap

- **WHEN** a touch pointer targets a candidate and taps a valid cell
- **THEN** the same snapped valid preview is shown and the tower is placed at that cell
