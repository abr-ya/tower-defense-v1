import { describe, expect, it } from 'vitest'

import {
  FIXED_STEP_SECONDS,
  MAX_CATCH_UP_TICKS,
  createSimulationSession,
  prototypeLevel,
  snapToPlacementGrid,
  validatePlacement,
  validateLevelDefinition,
  createWaveSchedule,
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
  placement: { gridSize: 10, towerFootprint: 8, routeExclusionRadius: 2 },
  combat: { towerRange: 100, towerCooldownSeconds: 0.1, projectileSpeed: 600, projectileDamage: 50, enemyHealth: 100 },
  outcomes: { baseHealth: 3, escapeDamage: 1, waves: [{ enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }] },
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
    expect(session.getSnapshot().enemies[0]).toMatchObject({
      position: { x: 30, y: 0 },
      speed: 60,
    })

    for (let index = 0; index < 2; index += 1) {
      session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)
    }
    expect(session.getSnapshot().enemies[0]?.position).toEqual({ x: 30, y: 10 })
  })

  it('fires at an in-range enemy and removes it after lethal projectile damage', () => {
    const session = createSimulationSession(testLevel)
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 } })
    for (let index = 0; index < 20; index += 1) session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)
    expect(session.getSnapshot().enemies.some((enemy) => enemy.id === 1)).toBe(false)
  })

  it('removes escaped enemies and reduces base health', () => {
    const session = createSimulationSession(testLevel)
    for (let index = 0; index < 20; index += 1) session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)

    expect(session.getSnapshot()).toMatchObject({ baseHealth: 2 })
    expect(session.getSnapshot().enemies.some((enemy) => enemy.id === 1)).toBe(false)
  })

  it('snaps placement candidates to stable grid centres', () => {
    expect(snapToPlacementGrid(testLevel, { x: 24, y: 26 })).toEqual({ x: 25, y: 25 })
    expect(snapToPlacementGrid(testLevel, { x: 26, y: 24 })).toEqual({ x: 25, y: 25 })
  })

  it('validates bounds, route, and occupied placement candidates', () => {
    expect(validatePlacement(testLevel, [], { x: -100, y: 95 })).toMatchObject({ accepted: false, reason: 'bounds' })
    expect(validatePlacement(testLevel, [], { x: 15, y: 5 })).toMatchObject({ accepted: false, reason: 'route' })
    expect(validatePlacement(testLevel, [{ id: 1, position: { x: 75, y: 75 } }], { x: 75, y: 75 })).toMatchObject({ accepted: false, reason: 'occupied' })
    expect(validatePlacement(testLevel, [], { x: 75, y: 75 })).toMatchObject({ accepted: true, position: { x: 75, y: 75 } })
  })

  it('commits valid towers, reports rejected placements, and resets placement state', () => {
    const session = createSimulationSession(testLevel)
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 } })
    expect(session.getSnapshot().towers).toEqual([{ id: 1, position: { x: 75, y: 75 } }])

    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 } })
    expect(session.getSnapshot()).toMatchObject({ lastPlacementRejection: 'occupied' })
    expect(session.getSnapshot().towers).toHaveLength(1)

    session.dispatch({ type: 'restart' })
    expect(session.getSnapshot()).toMatchObject({ towers: [], lastPlacementRejection: null })
  })

  it('creates an ordered five-wave schedule from authored content', () => {
    expect(createWaveSchedule(testLevel.outcomes.waves)).toEqual([
      { wave: 1, enemyCount: 1, spawnIntervalSeconds: 0 },
      { wave: 2, enemyCount: 1, spawnIntervalSeconds: 0 },
      { wave: 3, enemyCount: 1, spawnIntervalSeconds: 0 },
      { wave: 4, enemyCount: 1, spawnIntervalSeconds: 0 },
      { wave: 5, enemyCount: 1, spawnIntervalSeconds: 0 },
    ])
  })

  it('spawns each wave in authored order and timing', () => {
    const session = createSimulationSession({
      ...testLevel,
      enemySpeed: 1,
      outcomes: { ...testLevel.outcomes, waves: [{ enemyCount: 2, spawnIntervalSeconds: 0.1 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }] },
    })

    session.update(FIXED_STEP_SECONDS)
    expect(session.getSnapshot().enemies.map((enemy) => enemy.id)).toEqual([1])
    for (let index = 0; index < 10; index += 1) session.update(FIXED_STEP_SECONDS)
    expect(session.getSnapshot().enemies.map((enemy) => enemy.id)).toEqual([1, 2])
  })

  it('reports victory after all five waves are defeated', () => {
    const session = createSimulationSession({
      ...testLevel,
      combat: { ...testLevel.combat, enemyHealth: 1 },
      outcomes: { ...testLevel.outcomes, waves: [{ enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }, { enemyCount: 1, spawnIntervalSeconds: 0 }] },
    })
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 } })
    for (let index = 0; index < 30; index += 1) session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)

    expect(session.getSnapshot()).toMatchObject({ phase: 'won', outcome: 'won', wave: 5, enemies: [] })
  })

  it('reports loss and restart restores an equivalent fresh session', () => {
    const losingLevel = { ...testLevel, outcomes: { ...testLevel.outcomes, baseHealth: 1 } }
    const session = createSimulationSession(losingLevel)
    for (let index = 0; index < 20; index += 1) session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)

    expect(session.getSnapshot()).toMatchObject({ phase: 'lost', outcome: 'lost', baseHealth: 0 })
    session.dispatch({ type: 'restart' })
    expect(session.getSnapshot()).toEqual(createSimulationSession(losingLevel).getSnapshot())
  })
})
