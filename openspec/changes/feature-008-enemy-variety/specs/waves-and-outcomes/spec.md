# Spec Delta

## MODIFIED Requirements

### Requirement: Authored wave sequence

The system SHALL define an ordered wave sequence in which each wave contains ordered spawn groups, and each group SHALL declare an enemy family, a count, a spawn interval, and a start offset relative to the start of its wave.

#### Scenario: Wave starts

- **WHEN** the session begins or the prior wave completes
- **THEN** the next authored wave spawns its groups in their declared order, each group starting after its own start offset

#### Scenario: Group spawn timing

- **WHEN** a group declares a start offset and a spawn interval
- **THEN** its first enemy appears after the start offset and its remaining enemies appear one interval apart

### Requirement: Terminal outcomes

The system SHALL report loss when base health reaches zero and victory when all authored waves complete with no living or pending enemies.

#### Scenario: Final wave is defeated

- **WHEN** the final wave has no pending or living enemies and base health is positive
- **THEN** the session reports victory

#### Scenario: Base is depleted

- **WHEN** escaped enemies reduce base health to zero
- **THEN** the session reports loss and stops spawning or advancing gameplay

### Requirement: Visible wave state

The browser game surface SHALL display the current wave against the authored wave count, base health, and terminal victory or loss state from read-only snapshots.

#### Scenario: Browser game advances

- **WHEN** waves spawn or base health changes
- **THEN** the displayed wave and health reflect the current snapshot

#### Scenario: Authored wave count is displayed

- **WHEN** the game surface shows the wave indicator
- **THEN** it shows the current wave number together with the authored wave count from the snapshot

## ADDED Requirements

### Requirement: Authored MVP difficulty curve

The system SHALL ship one level that defines ten waves, and each wave SHALL contain more enemies than the wave before it.

#### Scenario: The level defines ten waves

- **WHEN** the shipped level content is loaded
- **THEN** it defines ten authored waves

#### Scenario: Difficulty grows across waves

- **WHEN** two consecutive authored waves are compared
- **THEN** the later wave contains more enemies than the earlier one
