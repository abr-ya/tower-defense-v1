# Waves and Outcomes Specification

## Purpose

Define a deterministic ten-wave prototype loop with escaped-enemy damage and clear win or loss outcomes.

## Requirements

### Requirement: Authored wave sequence

The system SHALL define an ordered wave sequence in which each wave contains ordered spawn groups, and each group SHALL declare an enemy family, a count, a spawn interval, and a start offset relative to the start of its wave.

#### Scenario: Wave starts

- **WHEN** the session begins or the prior wave completes
- **THEN** the next authored wave spawns its groups in their declared order, each group starting after its own start offset

#### Scenario: Group spawn timing

- **WHEN** a group declares a start offset and a spawn interval
- **THEN** its first enemy appears after the start offset and its remaining enemies appear one interval apart

### Requirement: Base health and escapes

The system SHALL expose base health and reduce it when a living enemy reaches the route end, then remove that enemy.

#### Scenario: Enemy escapes

- **WHEN** a living enemy reaches the final waypoint
- **THEN** base health decreases by the configured escape damage and the enemy is removed

### Requirement: Terminal outcomes

The system SHALL report loss when base health reaches zero and victory when all authored waves complete with no living or pending enemies.

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

The browser game surface SHALL display the current wave against the authored wave count, base health, and terminal victory or loss state from read-only snapshots.

#### Scenario: Browser game advances

- **WHEN** waves spawn or base health changes
- **THEN** the displayed wave and health reflect the current snapshot

#### Scenario: Authored wave count is displayed

- **WHEN** the game surface shows the wave indicator
- **THEN** it shows the current wave number together with the authored wave count from the snapshot

### Requirement: Terminal restart control

The browser game surface SHALL display a `Restart` button only when the snapshot reports victory or loss, and dispatch the restart command when activated.

#### Scenario: Terminal outcome is restarted from the browser

- **WHEN** the player activates `Restart` after victory or loss
- **THEN** the game surface returns to the initial running wave and base-health state and hides the button

### Requirement: Authored MVP difficulty curve

The system SHALL ship one level that defines ten waves, and each wave SHALL contain more enemies than the wave before it.

#### Scenario: The level defines ten waves

- **WHEN** the shipped level content is loaded
- **THEN** it defines ten authored waves

#### Scenario: Difficulty grows across waves

- **WHEN** two consecutive authored waves are compared
- **THEN** the later wave contains more enemies than the earlier one
