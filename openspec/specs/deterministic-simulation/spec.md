# deterministic-simulation Specification

## Purpose

Provide a deterministic, platform-independent simulation foundation for all later gameplay rules and adapters.

## Requirements

### Requirement: Framework-independent simulation session
The system SHALL expose a TypeScript simulation session that can be created, advanced, commanded, and inspected without loading Phaser, React, browser APIs, or persistence APIs.

#### Scenario: Session runs in a unit-test environment
- **WHEN** a unit test creates and advances a simulation session in a non-browser runtime
- **THEN** the session produces an inspectable state without requiring rendering or platform services

### Requirement: Fixed-step simulation advancement
The simulation session SHALL convert elapsed time into fixed simulation ticks using an accumulator and a documented bounded catch-up limit per update call.

#### Scenario: Elapsed time reaches one tick
- **WHEN** accumulated elapsed time reaches one fixed timestep while the session is running
- **THEN** the session advances exactly one simulation tick and records the resulting simulation time

#### Scenario: Long frame is bounded
- **WHEN** an update supplies elapsed time that would require more than the configured catch-up limit
- **THEN** the session processes no more than that limit during the update call

### Requirement: Simulation lifecycle commands
The simulation session SHALL support typed pause, resume, and restart commands. Pause SHALL prevent simulation ticks from advancing, resume SHALL permit future ticks, and restart SHALL restore the initial session state.

#### Scenario: Paused session receives elapsed time
- **WHEN** elapsed time is supplied after a pause command
- **THEN** the session's tick count and simulation time remain unchanged

#### Scenario: Restart resets a running session
- **WHEN** a session has advanced and receives a restart command
- **THEN** its state matches a newly created running session with the same configuration

### Requirement: Reproducible simulation outcomes
Given the same initial configuration and ordered sequence of commands and elapsed-time updates, the simulation session SHALL produce identical snapshots.

#### Scenario: Equivalent sessions receive identical inputs
- **WHEN** two sessions receive the same configuration and ordered inputs
- **THEN** their snapshots are equal after every corresponding input
