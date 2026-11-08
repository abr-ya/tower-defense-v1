# Design

## Context

The session has one route enemy, placement, and combat but no respawn or outcomes. See proposal and wave requirements.

## Goals / Non-Goals

**Goals:** data-defined five-wave spawning, escape damage, terminal states, and restart in the pure fixed-step session.

**Non-Goals:** currency, rewards, manual wave controls, new enemy types, or HUD framework.

## Decisions

Use a compact authored array of wave spawn intervals and one runtime spawn queue. A terminal phase prevents movement, firing, and spawning after win/loss. Phaser renders only snapshot status text.

## Risks / Trade-offs

- [Balance is not yet tuned] → use deliberately readable prototype timings and health values.
- [Existing single-enemy assumptions] → replace them with ordered enemy snapshots and stable IDs.

## Migration Plan

1. Add wave data and pure state tests.
2. Integrate spawning, escapes, outcomes, and restart.
3. Render status and run browser smoke checks.
