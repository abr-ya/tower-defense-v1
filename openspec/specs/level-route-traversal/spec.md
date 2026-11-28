# Level Route Traversal Specification

## Purpose

Define one authored route and deterministic enemy movement that forms the first visible gameplay behavior.

## Requirements

### Requirement: Authored playable route

The system SHALL define one level with logical world bounds and an ordered route containing at least two finite waypoints inside those bounds.

#### Scenario: Valid level route loads

- **WHEN** the prototype level is loaded
- **THEN** it provides an ordered route that begins and ends within the logical world bounds

#### Scenario: Invalid route is rejected

- **WHEN** route data has fewer than two waypoints or a waypoint outside world bounds
- **THEN** validation rejects the level definition

### Requirement: Deterministic waypoint traversal

The simulation SHALL expose one enemy position per spawned enemy that advances along the authored route at the speed configured for that enemy's family, traversing segments in route order.

#### Scenario: Enemy crosses a waypoint

- **WHEN** elapsed simulation time carries the enemy past a route waypoint
- **THEN** the enemy continues from that waypoint toward the next segment without changing its family speed

#### Scenario: Equivalent sessions traverse identically

- **WHEN** two sessions receive the same level definition and elapsed-time updates
- **THEN** their enemy position snapshots are equal after each update

### Requirement: Route completion

The simulation SHALL mark the enemy as having completed the route when it reaches the final waypoint and SHALL not move it beyond that endpoint.

#### Scenario: Enemy reaches the route end

- **WHEN** accumulated simulation time reaches the end of the final route segment
- **THEN** the enemy snapshot is at the final waypoint and reports route completion

### Requirement: Visible route traversal

The browser game surface SHALL render the authored route and its enemies from read-only simulation snapshots, allowing a player to observe movement without controlling gameplay.

#### Scenario: Browser prototype is opened

- **WHEN** a player opens the browser application
- **THEN** the route and its enemies are visible and the enemies move along the route
