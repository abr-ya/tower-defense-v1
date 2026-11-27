# Spec Delta

## Purpose

Define data-driven enemy families with distinct movement speed, health, and armor so the defense faces a varied and readable set of threats.

## ADDED Requirements

### Requirement: Data-defined enemy families

The system SHALL define Normal, Fast, and Armored enemy families with distinct movement speed, health, and armor values, and SHALL reject invalid family definitions.

#### Scenario: Valid family definitions load

- **WHEN** the enemy content is validated
- **THEN** three families are accepted with inspectable speed, health, and armor values

#### Scenario: Invalid family definition is rejected

- **WHEN** a family declares a non-positive speed, a non-positive health, or a negative armor value
- **THEN** the family definition is rejected

### Requirement: Enemy identity in snapshots

The system SHALL report every spawned enemy's family, armor, and effective movement speed in its read-only snapshot.

#### Scenario: Spawned enemy reports its family

- **WHEN** a wave spawns a Fast enemy
- **THEN** the enemy snapshot identifies the Fast family and reports its armor and health

#### Scenario: Slowed enemy keeps its family

- **WHEN** a Slow tower effect is applied to an enemy
- **THEN** the enemy snapshot reports the reduced speed and the unchanged family

### Requirement: Armor damage reduction

The system SHALL reduce each projectile's damage by the armor of the enemy it hits, and SHALL apply at least one damage per hit.

#### Scenario: Armored target takes reduced damage

- **WHEN** a projectile with damage 20 reaches an enemy with armor 5
- **THEN** the enemy health is reduced by 15

#### Scenario: Reduced damage never drops below one

- **WHEN** a projectile with damage 4 reaches an enemy with armor 5
- **THEN** the enemy health is reduced by 1

### Requirement: Family-specific movement speed

The system SHALL move each enemy along the route at the speed configured for its own family, and SHALL apply an active Slow effect as a multiplier of that family speed.

#### Scenario: Family speed is used

- **WHEN** a Fast enemy and a Normal enemy travel the same route for the same elapsed time
- **THEN** the Fast enemy covers more route distance than the Normal enemy

#### Scenario: Slow effect scales the family speed

- **WHEN** a Slow effect is active on an Armored enemy
- **THEN** the enemy moves at its family speed multiplied by the effect's speed multiplier

### Requirement: Readable family rendering

The browser game surface SHALL render each enemy family with its own color and size taken from read-only snapshots.

#### Scenario: Family differences are visible

- **WHEN** enemies of different families are travelling the route
- **THEN** each family is drawn with its own color and size
