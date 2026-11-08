# Waves and Outcomes Specification

## Purpose

Define a deterministic five-wave prototype loop with escaped-enemy damage and clear win or loss outcomes.

## Requirements

### Requirement: Authored wave sequence

The system SHALL define five ordered prototype waves, each with deterministic enemy spawn timing.

#### Scenario: Wave starts

- **WHEN** the session begins or the prior wave completes
- **THEN** the next authored wave spawns enemies in its defined order and timing

### Requirement: Base health and escapes

The system SHALL expose base health and reduce it when a living enemy reaches the route end, then remove that enemy.

#### Scenario: Enemy escapes

- **WHEN** a living enemy reaches the final waypoint
- **THEN** base health decreases by the configured escape damage and the enemy is removed

### Requirement: Terminal outcomes

The system SHALL report loss when base health reaches zero and victory when all five waves complete with no living or pending enemies.

#### Scenario: Final wave is defeated

- **WHEN** the final wave has no pending or living enemies and base health is positive
- **THEN** the session reports victory

#### Scenario: Base is depleted

- **WHEN** escaped enemies reduce base health to zero
- **THEN** the session reports loss and stops spawning or advancing gameplay

### Requirement: Outcome restart

The restart command SHALL restore base health, wave progress, pending spawns, enemies, towers, and outcome to the initial running state.

#### Scenario: Terminal session restarts

- **WHEN** a won or lost session receives restart
- **THEN** its snapshot matches a newly created session with the same configuration

### Requirement: Visible wave state

The browser game surface SHALL display current wave, base health, and terminal victory or loss state from read-only snapshots.

#### Scenario: Browser game advances

- **WHEN** waves spawn or base health changes
- **THEN** the displayed wave and health reflect the current snapshot

### Requirement: Terminal restart control

The browser game surface SHALL display a `Restart` button only when the snapshot reports victory or loss, and dispatch the restart command when activated.

#### Scenario: Terminal outcome is restarted from the browser

- **WHEN** the player activates `Restart` after victory or loss
- **THEN** the game surface returns to the initial running wave and base-health state and hides the button
