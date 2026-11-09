# Spec Delta

## Purpose

Define data-driven tower variety and one deterministic upgrade tier so the prototype offers meaningful defensive choices before economy is introduced.

## ADDED Requirements

### Requirement: Data-defined tower types

The system SHALL define Basic, Rapid, and Slow tower types with distinct, inspectable attack statistics. Basic SHALL be balanced, Rapid SHALL fire more often with lower per-hit damage, and Slow SHALL apply a temporary movement reduction.

#### Scenario: Tower type is placed

- **WHEN** a player places a selected valid tower type
- **THEN** the resulting tower snapshot identifies that type and uses its configured statistics

### Requirement: One-tier tower upgrade

The system SHALL allow an unupgraded placed tower to receive one free upgrade that improves its configured combat statistics. A tower SHALL not upgrade more than once in this feature.

#### Scenario: Unupgraded tower is upgraded

- **WHEN** an unupgraded tower receives an upgrade command
- **THEN** its snapshot reports the upgraded tier and subsequent attacks use the upgraded statistics

#### Scenario: Upgraded tower is upgraded again

- **WHEN** an already upgraded tower receives an upgrade command
- **THEN** the tower state remains unchanged

### Requirement: Deterministic slowing effect

The system SHALL reduce an enemy's movement speed by the configured Slow tower effect for its configured duration, and SHALL restore normal movement after the effect expires.

#### Scenario: Slow projectile hits an enemy

- **WHEN** a Slow tower projectile reaches a living enemy
- **THEN** the enemy moves at the configured reduced speed for the configured duration

#### Scenario: Slow duration expires

- **WHEN** the configured slow duration elapses
- **THEN** the enemy resumes its normal configured movement speed

### Requirement: Tower selection and upgrade controls

The browser game surface SHALL let players select one of the three tower types before placement and select a placed tower to expose its available one-tier upgrade action. These controls SHALL not require or display currency.

#### Scenario: Player chooses a tower type

- **WHEN** a player activates a tower-type control
- **THEN** subsequent valid placement uses that type and the control identifies the active selection

#### Scenario: Player upgrades a selected tower

- **WHEN** a player activates the upgrade control for an eligible selected tower
- **THEN** the tower visibly reflects its upgraded state and the control no longer offers another upgrade
