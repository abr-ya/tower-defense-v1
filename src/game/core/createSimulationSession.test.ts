import { describe, expect, it } from 'vitest'

import {
  FIXED_STEP_SECONDS,
  MAX_CATCH_UP_TICKS,
  createSimulationSession,
  prototypeLevel,
  validateLevelDefinition,
} from './index'
import type { LevelDefinition } from './index'

const testLevel: LevelDefinition = {
  id: 'test-route',
  bounds: { width: 100, height: 100 },
  route: [
    { x: 0, y: 0 },
    { x: 30, y: 0 },
    { x: 30, y: 40 },
  ],
  enemySpeed: 60,
}

describe('createSimulationSession', () => {
  it('keeps partial elapsed time until a fixed tick is reached', () => {
    const session = createSimulationSession()

    session.update(FIXED_STEP_SECONDS / 2)

    expect(session.getSnapshot()).toMatchObject({ tick: 0, simulationTimeSeconds: 0 })

    session.update(FIXED_STEP_SECONDS / 2)

    expect(session.getSnapshot()).toMatchObject({
      phase: 'running',
      tick: 1,
      simulationTimeSeconds: FIXED_STEP_SECONDS,
    })
  })

  it('advances one tick for every complete fixed timestep', () => {
    const session = createSimulationSession()

    session.update(FIXED_STEP_SECONDS * 3)

    expect(session.getSnapshot()).toMatchObject({
      tick: 3,
      simulationTimeSeconds: FIXED_STEP_SECONDS * 3,
    })
  })

  it('caps long updates and discards time beyond the catch-up window', () => {
    const session = createSimulationSession()

    session.update(10)

    expect(session.getSnapshot()).toMatchObject({ tick: MAX_CATCH_UP_TICKS })

    session.update(0)

    expect(session.getSnapshot()).toMatchObject({ tick: MAX_CATCH_UP_TICKS })
  })

  it('does not advance while paused and continues after resuming', () => {
    const session = createSimulationSession()

    session.dispatch({ type: 'pause' })
    session.update(FIXED_STEP_SECONDS * 2)

    expect(session.getSnapshot()).toMatchObject({ phase: 'paused', tick: 0, simulationTimeSeconds: 0 })

    session.dispatch({ type: 'resume' })
    session.update(FIXED_STEP_SECONDS)

    expect(session.getSnapshot()).toMatchObject({ phase: 'running', tick: 1 })
  })

  it('restarts to the initial running snapshot', () => {
    const session = createSimulationSession()

    session.update(FIXED_STEP_SECONDS * 3)
    session.dispatch({ type: 'pause' })
    session.dispatch({ type: 'restart' })

    expect(session.getSnapshot()).toEqual(createSimulationSession().getSnapshot())
  })

  it('returns frozen snapshots that do not change after later updates', () => {
    const session = createSimulationSession()
    const initialSnapshot = session.getSnapshot()

    session.update(FIXED_STEP_SECONDS)

    expect(Object.isFrozen(initialSnapshot)).toBe(true)
    expect(initialSnapshot).toMatchObject({ tick: 0, simulationTimeSeconds: 0 })
    expect(session.getSnapshot()).toMatchObject({ tick: 1 })
  })

  it('produces matching snapshots for matching ordered inputs', () => {
    const first = createSimulationSession()
    const second = createSimulationSession()
    const inputs = [
      { kind: 'update' as const, elapsedSeconds: FIXED_STEP_SECONDS / 2 },
      { kind: 'command' as const, command: { type: 'pause' as const } },
      { kind: 'update' as const, elapsedSeconds: FIXED_STEP_SECONDS * 3 },
      { kind: 'command' as const, command: { type: 'resume' as const } },
      { kind: 'update' as const, elapsedSeconds: FIXED_STEP_SECONDS * 2 },
    ]

    for (const input of inputs) {
      if (input.kind === 'update') {
        first.update(input.elapsedSeconds)
        second.update(input.elapsedSeconds)
      } else {
        first.dispatch(input.command)
        second.dispatch(input.command)
      }

      expect(first.getSnapshot()).toEqual(second.getSnapshot())
    }
  })

  it('accepts the prototype route and rejects invalid route definitions', () => {
    expect(() => validateLevelDefinition(prototypeLevel)).not.toThrow()
    expect(() => validateLevelDefinition({ ...testLevel, route: [{ x: 0, y: 0 }] })).toThrow(
      'at least two waypoints',
    )
    expect(() => validateLevelDefinition({ ...testLevel, route: [{ x: 0, y: 0 }, { x: 101, y: 0 }] })).toThrow(
      'inside the world bounds',
    )
    expect(() => validateLevelDefinition({ ...testLevel, route: [{ x: 0, y: 0 }, { x: 0, y: 0 }] })).toThrow(
      'non-zero length',
    )
  })

  it('traverses route segments at a stable speed and crosses waypoints', () => {
    const session = createSimulationSession(testLevel)

    for (let index = 0; index < 6; index += 1) {
      session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)
    }
    expect(session.getSnapshot().enemy).toMatchObject({
      position: { x: 30, y: 0 },
      speed: 60,
      completedRoute: false,
    })

    for (let index = 0; index < 2; index += 1) {
      session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)
    }
    expect(session.getSnapshot().enemy.position).toEqual({ x: 30, y: 10 })
  })

  it('clamps the enemy at the final waypoint and restarts its route', () => {
    const session = createSimulationSession(testLevel)

    for (let index = 0; index < 20; index += 1) {
      session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)
    }

    expect(session.getSnapshot().enemy).toEqual({
      position: { x: 30, y: 40 },
      speed: 60,
      completedRoute: true,
    })

    session.dispatch({ type: 'restart' })
    expect(session.getSnapshot().enemy).toEqual({
      position: { x: 0, y: 0 },
      speed: 60,
      completedRoute: false,
    })
  })
})
