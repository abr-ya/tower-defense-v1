# Spec Delta

## MODIFIED Requirements

### Requirement: Range-based target acquisition

The simulation SHALL allow each placed tower to acquire the nearest living route enemy within the logical range configured for that tower's type and upgrade tier.

#### Scenario: Enemy enters tower range

- **WHEN** the route enemy is within a placed tower's range
- **THEN** the tower selects that enemy as its target

#### Scenario: Enemy is outside tower range

- **WHEN** the route enemy is outside a placed tower's range
- **THEN** the tower does not fire

### Requirement: Deterministic projectile damage

The simulation SHALL fire projectiles using the fixed-step cooldown, speed, damage, and optional effect configured for the firing tower's type and upgrade tier. A projectile that reaches its target SHALL reduce that enemy's health by its configured damage.

#### Scenario: Tower fires at an acquired target

- **WHEN** an in-range target is acquired and the tower cooldown is ready
- **THEN** a projectile snapshot is created toward that target using the tower's configured attack statistics

#### Scenario: Projectile reaches its target

- **WHEN** a projectile reaches its living target
- **THEN** the target health is reduced and the projectile is removed
