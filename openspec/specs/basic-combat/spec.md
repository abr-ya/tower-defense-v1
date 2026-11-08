# Basic Combat Specification

## Purpose

Define a deterministic prototype combat loop in which placed towers defend the route by targeting, damaging, and defeating the moving enemy.

## Requirements

### Requirement: Range-based target acquisition

The simulation SHALL allow each placed prototype tower to acquire the nearest living route enemy within its configured logical range.

#### Scenario: Enemy enters tower range
- **WHEN** the route enemy is within a placed tower's range
- **THEN** the tower selects that enemy as its target

#### Scenario: Enemy is outside tower range
- **WHEN** the route enemy is outside a placed tower's range
- **THEN** the tower does not fire

### Requirement: Deterministic projectile damage

The simulation SHALL fire projectiles at a configured fixed-step cooldown and speed. A projectile that reaches its target SHALL reduce that enemy's health by configured damage.

#### Scenario: Tower fires at an acquired target
- **WHEN** an in-range target is acquired and the tower cooldown is ready
- **THEN** a projectile snapshot is created toward that target

#### Scenario: Projectile reaches its target
- **WHEN** a projectile reaches its living target
- **THEN** the target health is reduced and the projectile is removed

### Requirement: Enemy defeat

The simulation SHALL remove an enemy when damage reduces its health to zero or below, and later simulation ticks SHALL not target or move that enemy.

#### Scenario: Final damage is applied
- **WHEN** a projectile reduces the enemy health to zero or below
- **THEN** the enemy is removed from the simulation snapshot

### Requirement: Visible prototype combat

The browser game surface SHALL render placed towers, their target range, projectiles, and the route enemy's remaining health from read-only snapshots.

#### Scenario: Player places an in-range tower
- **WHEN** a player places a tower near the route enemy
- **THEN** the player can observe projectiles travelling to the enemy and its health decreasing
