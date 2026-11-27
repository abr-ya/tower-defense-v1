# Spec Delta

## MODIFIED Requirements

### Requirement: Deterministic waypoint traversal

The simulation SHALL expose one enemy position per spawned enemy that advances along the authored route at the speed configured for that enemy's family, traversing segments in route order.

#### Scenario: Enemy crosses a waypoint

- **WHEN** elapsed simulation time carries the enemy past a route waypoint
- **THEN** the enemy continues from that waypoint toward the next segment without changing its family speed

#### Scenario: Equivalent sessions traverse identically

- **WHEN** two sessions receive the same level definition and elapsed-time updates
- **THEN** their enemy position snapshots are equal after each update

### Requirement: Visible route traversal

The browser game surface SHALL render the authored route and its enemies from read-only simulation snapshots, allowing a player to observe movement without controlling gameplay.

#### Scenario: Browser prototype is opened

- **WHEN** a player opens the browser application
- **THEN** the route and its enemies are visible and the enemies move along the route
