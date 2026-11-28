# Basic Combat Specification

## Purpose

Define a deterministic prototype combat loop in which placed towers defend the route by targeting, damaging, and defeating the moving enemy.

## Requirements

### Requirement: Range-based target acquisition

The simulation SHALL allow each placed tower to acquire the living route enemy nearest to it within the logical range configured for that tower's type and upgrade tier, and SHALL break ties between equally distant enemies by the lower enemy identifier.

#### Scenario: Enemy enters tower range

- **WHEN** a living enemy of any family is within a placed tower's range
- **THEN** the tower selects the nearest such enemy as its target

#### Scenario: Enemy is outside tower range

- **WHEN** every living enemy is outside a placed tower's range
- **THEN** the tower does not fire

#### Scenario: Equally distant enemies are resolved deterministically

- **WHEN** two living enemies are at the same distance from a placed tower
- **THEN** the tower selects the one with the lower identifier

### Requirement: Deterministic projectile damage

The simulation SHALL fire projectiles using the fixed-step cooldown, speed, damage, and optional effect configured for the firing tower's type and upgrade tier. A projectile that reaches its target SHALL reduce that enemy's health by its configured damage reduced by the target's armor, and SHALL never reduce it by less than one.

#### Scenario: Tower fires at an acquired target

- **WHEN** an in-range target is acquired and the tower cooldown is ready
- **THEN** a projectile snapshot is created toward that target using the tower's configured attack statistics

#### Scenario: Projectile reaches its target

- **WHEN** a projectile reaches its living target
- **THEN** the target health is reduced by the damage after armor and the projectile is removed

### Requirement: Enemy defeat

The simulation SHALL remove an enemy when damage reduces its health to zero or below, and later simulation ticks SHALL not target or move that enemy.

#### Scenario: Final damage is applied
- **WHEN** a projectile reduces the enemy health to zero or below
- **THEN** the enemy is removed from the simulation snapshot

### Requirement: Visible prototype combat

The browser game surface SHALL render placed towers, their target range, projectiles, and the remaining health of every living enemy from read-only snapshots.

#### Scenario: Player places an in-range tower

- **WHEN** a player places a tower near a living enemy
- **THEN** the player can observe projectiles travelling to the enemy and its health decreasing
