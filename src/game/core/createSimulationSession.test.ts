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
import type {
  EnemyDefinition,
  EnemyTypeId,
  LevelDefinition,
  SimulationSession,
  SimulationSnapshot,
  TowerAttackStats,
  TowerDefinition,
  TowerTypeId,
  WaveDefinition,
  WaveSpawnGroup,
} from './index'

function groupOf(
  enemyType: EnemyTypeId,
  count = 1,
  spawnIntervalSeconds = 0,
  startOffsetSeconds = 0,
): WaveSpawnGroup {
  return { enemyType, count, spawnIntervalSeconds, startOffsetSeconds }
}

function waveOf(...groups: readonly WaveSpawnGroup[]): WaveDefinition {
  return { groups }
}

const testLevel: LevelDefinition = {
  id: 'test-route',
  bounds: { width: 100, height: 100 },
  route: [
    { x: 0, y: 0 },
    { x: 30, y: 0 },
    { x: 30, y: 40 },
  ],
  placement: { gridSize: 10, towerFootprint: 8, routeExclusionRadius: 2 },
  outcomes: {
    baseHealth: 3,
    escapeDamage: 1,
    waves: [
      waveOf(groupOf('normal')),
      waveOf(groupOf('normal')),
      waveOf(groupOf('normal')),
      waveOf(groupOf('normal')),
      waveOf(groupOf('normal')),
    ],
  },
}

const testEnemies: readonly EnemyDefinition[] = [
  { id: 'normal', name: 'Normal', speed: 60, health: 100, armor: 0 },
  { id: 'fast', name: 'Fast', speed: 120, health: 100, armor: 0 },
  { id: 'armored', name: 'Armored', speed: 60, health: 100, armor: 0 },
]

const combatLevel: LevelDefinition = {
  id: 'combat-route',
  bounds: { width: 300, height: 200 },
  route: [
    { x: 0, y: 100 },
    { x: 300, y: 100 },
  ],
  placement: { gridSize: 10, towerFootprint: 8, routeExclusionRadius: 2 },
  outcomes: {
    baseHealth: 5,
    escapeDamage: 1,
    waves: [
      waveOf(groupOf('normal')),
      waveOf(groupOf('normal')),
      waveOf(groupOf('normal')),
      waveOf(groupOf('normal')),
      waveOf(groupOf('normal')),
    ],
  },
}

const combatEnemies: readonly EnemyDefinition[] = [
  { id: 'normal', name: 'Normal', speed: 10, health: 1000, armor: 0 },
  { id: 'fast', name: 'Fast', speed: 20, health: 1000, armor: 0 },
  { id: 'armored', name: 'Armored', speed: 10, health: 1000, armor: 0 },
]

const armorEnemies: readonly EnemyDefinition[] = [
  { id: 'normal', name: 'Normal', speed: 10, health: 100, armor: 0 },
  { id: 'fast', name: 'Fast', speed: 10, health: 100, armor: 0 },
  { id: 'armored', name: 'Armored', speed: 10, health: 100, armor: 5 },
]

const testTowers: readonly TowerDefinition[] = [
  {
    id: 'basic',
    name: 'Basic',
    tiers: [
      {
        tier: 0,
        stats: { range: 100, cooldownSeconds: 0.1, projectileSpeed: 600, projectileDamage: 50, effect: { kind: 'none' } },
      },
      {
        tier: 1,
        stats: { range: 110, cooldownSeconds: 0.08, projectileSpeed: 660, projectileDamage: 70, effect: { kind: 'none' } },
      },
    ],
  },
  {
    id: 'rapid',
    name: 'Rapid',
    tiers: [
      {
        tier: 0,
        stats: { range: 100, cooldownSeconds: 0.02, projectileSpeed: 900, projectileDamage: 10, effect: { kind: 'none' } },
      },
      {
        tier: 1,
        stats: { range: 110, cooldownSeconds: 0.015, projectileSpeed: 960, projectileDamage: 15, effect: { kind: 'none' } },
      },
    ],
  },
  {
    id: 'slow',
    name: 'Slow',
    tiers: [
      {
        tier: 0,
        stats: { range: 100, cooldownSeconds: 0.1, projectileSpeed: 600, projectileDamage: 10, effect: { kind: 'slow', durationSeconds: 1, speedMultiplier: 0.5 } },
      },
      {
        tier: 1,
        stats: { range: 110, cooldownSeconds: 0.09, projectileSpeed: 660, projectileDamage: 15, effect: { kind: 'slow', durationSeconds: 1, speedMultiplier: 0.5 } },
      },
    ],
  },
]

const combatTowers: readonly TowerDefinition[] = [
  {
    id: 'basic',
    name: 'Basic',
    tiers: [
      {
        tier: 0,
        stats: { range: 120, cooldownSeconds: 0.5, projectileSpeed: 240, projectileDamage: 25, effect: { kind: 'none' } },
      },
      {
        tier: 1,
        stats: { range: 150, cooldownSeconds: 0.4, projectileSpeed: 300, projectileDamage: 40, effect: { kind: 'none' } },
      },
    ],
  },
  {
    id: 'rapid',
    name: 'Rapid',
    tiers: [
      {
        tier: 0,
        stats: { range: 120, cooldownSeconds: 0.1, projectileSpeed: 480, projectileDamage: 4, effect: { kind: 'none' } },
      },
      {
        tier: 1,
        stats: { range: 150, cooldownSeconds: 0.08, projectileSpeed: 600, projectileDamage: 6, effect: { kind: 'none' } },
      },
    ],
  },
  {
    id: 'slow',
    name: 'Slow',
    tiers: [
      {
        tier: 0,
        stats: { range: 120, cooldownSeconds: 0.5, projectileSpeed: 240, projectileDamage: 10, effect: { kind: 'slow', durationSeconds: 1.5, speedMultiplier: 0.5 } },
      },
      {
        tier: 1,
        stats: { range: 150, cooldownSeconds: 0.4, projectileSpeed: 300, projectileDamage: 15, effect: { kind: 'slow', durationSeconds: 2.5, speedMultiplier: 0.4 } },
      },
    ],
  },
]

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
    const session = createSimulationSession(testLevel, testTowers, testEnemies)

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
    const session = createSimulationSession(testLevel, testTowers, testEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'basic' })
    for (let index = 0; index < 20; index += 1) session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)
    expect(session.getSnapshot().enemies.some((enemy) => enemy.id === 1)).toBe(false)
  })

  it('removes escaped enemies and reduces base health', () => {
    const session = createSimulationSession(testLevel, testTowers, testEnemies)
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
    expect(validatePlacement(testLevel, [{ id: 1, position: { x: 75, y: 75 }, towerType: 'basic', tier: 0 }], { x: 75, y: 75 })).toMatchObject({ accepted: false, reason: 'occupied' })
    expect(validatePlacement(testLevel, [], { x: 75, y: 75 })).toMatchObject({ accepted: true, position: { x: 75, y: 75 } })
  })

  it('commits valid towers, reports rejected placements, and resets placement state', () => {
    const session = createSimulationSession(testLevel, testTowers, testEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'basic' })
    expect(session.getSnapshot().towers).toEqual([{ id: 1, position: { x: 75, y: 75 }, towerType: 'basic', tier: 0 }])

    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'basic' })
    expect(session.getSnapshot()).toMatchObject({ lastPlacementRejection: 'occupied' })
    expect(session.getSnapshot().towers).toHaveLength(1)

    session.dispatch({ type: 'restart' })
    expect(session.getSnapshot()).toMatchObject({ towers: [], lastPlacementRejection: null })
  })

  it('creates an ordered wave schedule from authored content', () => {
    expect(createWaveSchedule(testLevel.outcomes.waves)).toEqual([
      { wave: 1, groups: testLevel.outcomes.waves[0].groups },
      { wave: 2, groups: testLevel.outcomes.waves[1].groups },
      { wave: 3, groups: testLevel.outcomes.waves[2].groups },
      { wave: 4, groups: testLevel.outcomes.waves[3].groups },
      { wave: 5, groups: testLevel.outcomes.waves[4].groups },
    ])
  })

  it('spawns each wave in authored order and timing', () => {
    const session = createSimulationSession({
      ...testLevel,
      outcomes: {
        ...testLevel.outcomes,
        waves: [waveOf(groupOf('normal', 2, 0.1)), ...testLevel.outcomes.waves.slice(1)],
      },
    }, testTowers, testEnemies)

    session.update(FIXED_STEP_SECONDS)
    expect(session.getSnapshot().enemies.map((enemy) => enemy.id)).toEqual([1])
    for (let index = 0; index < 10; index += 1) session.update(FIXED_STEP_SECONDS)
    expect(session.getSnapshot().enemies.map((enemy) => enemy.id)).toEqual([1, 2])
  })

  it('reports victory after all authored waves are defeated', () => {
    const session = createSimulationSession({
      ...testLevel,
      outcomes: { ...testLevel.outcomes, waves: testLevel.outcomes.waves },
    }, testTowers, [
      { id: 'normal', name: 'Normal', speed: 60, health: 1, armor: 0 },
      { id: 'fast', name: 'Fast', speed: 60, health: 1, armor: 0 },
      { id: 'armored', name: 'Armored', speed: 60, health: 1, armor: 0 },
    ])
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'basic' })
    for (let index = 0; index < 30; index += 1) session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)

    expect(session.getSnapshot()).toMatchObject({ phase: 'won', outcome: 'won', wave: 5, waveCount: 5, enemies: [] })
  })

  it('reports loss and restart restores an equivalent fresh session', () => {
    const losingLevel = { ...testLevel, outcomes: { ...testLevel.outcomes, baseHealth: 1 } }
    const session = createSimulationSession(losingLevel, testTowers, testEnemies)
    for (let index = 0; index < 20; index += 1) session.update(FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS)

    expect(session.getSnapshot()).toMatchObject({ phase: 'lost', outcome: 'lost', baseHealth: 0 })
    session.dispatch({ type: 'restart' })
    expect(session.getSnapshot()).toEqual(createSimulationSession(losingLevel, testTowers, testEnemies).getSnapshot())
  })

  it('places typed towers and reports their type and tier', () => {
    const session = createSimulationSession(testLevel, testTowers, testEnemies)

    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'slow' })
    session.dispatch({ type: 'placeTower', position: { x: 85, y: 85 }, towerType: 'rapid' })

    expect(session.getSnapshot().towers).toEqual([
      { id: 1, position: { x: 75, y: 75 }, towerType: 'slow', tier: 0 },
      { id: 2, position: { x: 85, y: 85 }, towerType: 'rapid', tier: 0 },
    ])
  })

  it('rejects an undefined tower type without changing tower state', () => {
    const session = createSimulationSession(testLevel, testTowers, testEnemies)

    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'cannon' as 'basic' })

    expect(session.getSnapshot().towers).toEqual([])
    expect(session.getSnapshot().lastPlacementRejection).toBe('unknownTowerType')
  })

  it('upgrades a tower exactly once and ignores further upgrades', () => {
    const session = createSimulationSession(testLevel, testTowers, testEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'basic' })

    session.dispatch({ type: 'upgradeTower', towerId: 1 })
    expect(session.getSnapshot().towers[0]).toMatchObject({ id: 1, tier: 1 })

    session.dispatch({ type: 'upgradeTower', towerId: 1 })
    expect(session.getSnapshot().towers[0]).toMatchObject({ id: 1, tier: 1 })
  })

  it('ignores an upgrade for an unknown tower id', () => {
    const session = createSimulationSession(testLevel, testTowers, testEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'basic' })

    session.dispatch({ type: 'upgradeTower', towerId: 42 })

    expect(session.getSnapshot().towers[0]).toMatchObject({ id: 1, tier: 0 })
  })

  it('resets tower types and tiers on restart', () => {
    const session = createSimulationSession(testLevel, testTowers, testEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'rapid' })
    session.dispatch({ type: 'upgradeTower', towerId: 1 })

    session.dispatch({ type: 'restart' })

    expect(session.getSnapshot()).toMatchObject({ towers: [], lastPlacementRejection: null })
  })

  it('produces matching snapshots for typed placement and upgrade sequences', () => {
    const first = createSimulationSession(testLevel, testTowers, testEnemies)
    const second = createSimulationSession(testLevel, testTowers, testEnemies)
    const commands = [
      { type: 'placeTower' as const, position: { x: 75, y: 75 }, towerType: 'slow' as const },
      { type: 'upgradeTower' as const, towerId: 1 },
      { type: 'placeTower' as const, position: { x: 85, y: 85 }, towerType: 'rapid' as const },
      { type: 'upgradeTower' as const, towerId: 1 },
    ]

    for (const command of commands) {
      first.dispatch(command)
      second.dispatch(command)
      expect(first.getSnapshot()).toEqual(second.getSnapshot())
    }

    first.update(FIXED_STEP_SECONDS * 5)
    second.update(FIXED_STEP_SECONDS * 5)
    expect(first.getSnapshot()).toEqual(second.getSnapshot())
  })

  it('fires a projectile with the attack statistics of the placed tower type', () => {
    const basic = createSimulationSession(combatLevel, combatTowers, combatEnemies)
    basic.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'basic' })
    basic.update(FIXED_STEP_SECONDS)

    const rapid = createSimulationSession(combatLevel, combatTowers, combatEnemies)
    rapid.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'rapid' })
    rapid.update(FIXED_STEP_SECONDS)

    const slow = createSimulationSession(combatLevel, combatTowers, combatEnemies)
    slow.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'slow' })
    slow.update(FIXED_STEP_SECONDS)

    expect(basic.getSnapshot().projectiles[0]).toMatchObject({
      damage: 25,
      speed: 240,
      effect: { kind: 'none' },
    })
    expect(rapid.getSnapshot().projectiles[0]).toMatchObject({
      damage: 4,
      speed: 480,
      effect: { kind: 'none' },
    })
    expect(slow.getSnapshot().projectiles[0]).toMatchObject({
      damage: 10,
      speed: 240,
      effect: { kind: 'slow', durationSeconds: 1.5, speedMultiplier: 0.5 },
    })
  })

  it('fires with the upgraded tier statistics after an upgrade', () => {
    const session = createSimulationSession(combatLevel, combatTowers, combatEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'slow' })

    session.dispatch({ type: 'upgradeTower', towerId: 1 })
    session.update(FIXED_STEP_SECONDS)

    expect(session.getSnapshot().projectiles[0]).toMatchObject({
      damage: 15,
      speed: 300,
      effect: { kind: 'slow', durationSeconds: 2.5, speedMultiplier: 0.4 },
    })
  })

  it('acquires a target only inside the range of the current tier', () => {
    const session = createSimulationSession(
      combatLevel,
      towerDefinition('basic', { range: 30, cooldownSeconds: 0.5, projectileSpeed: 240, projectileDamage: 25, effect: { kind: 'none' } }),
      combatEnemies,
    )
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'basic' })

    advanceTicks(session, 60)

    expect(session.getSnapshot().projectiles).toHaveLength(0)

    session.dispatch({ type: 'upgradeTower', towerId: 1 })
    session.update(FIXED_STEP_SECONDS)

    expect(session.getSnapshot().projectiles).toHaveLength(1)
    expect(session.getSnapshot().projectiles[0]).toMatchObject({ damage: 30, speed: 300 })
  })

  it('fires on the cooldown configured for each tower type', () => {
    const slowFlightTowers: readonly TowerDefinition[] = [
      {
        id: 'basic',
        name: 'Basic',
        tiers: [
          { tier: 0, stats: { range: 300, cooldownSeconds: 0.5, projectileSpeed: 30, projectileDamage: 25, effect: { kind: 'none' } } },
          { tier: 1, stats: { range: 320, cooldownSeconds: 0.4, projectileSpeed: 40, projectileDamage: 40, effect: { kind: 'none' } } },
        ],
      },
      {
        id: 'rapid',
        name: 'Rapid',
        tiers: [
          { tier: 0, stats: { range: 300, cooldownSeconds: 0.1, projectileSpeed: 30, projectileDamage: 4, effect: { kind: 'none' } } },
          { tier: 1, stats: { range: 320, cooldownSeconds: 0.08, projectileSpeed: 40, projectileDamage: 6, effect: { kind: 'none' } } },
        ],
      },
    ]

    const basic = createSimulationSession(combatLevel, slowFlightTowers, combatEnemies)
    basic.dispatch({ type: 'placeTower', position: { x: 135, y: 125 }, towerType: 'basic' })

    const rapid = createSimulationSession(combatLevel, slowFlightTowers, combatEnemies)
    rapid.dispatch({ type: 'placeTower', position: { x: 135, y: 125 }, towerType: 'rapid' })

    advanceTicks(basic, 120)
    advanceTicks(rapid, 120)

    // The projectiles are still in flight, so every shot stays visible.
    const basicShots = basic.getSnapshot().projectiles.length
    const rapidShots = rapid.getSnapshot().projectiles.length

    expect(basicShots).toBeGreaterThanOrEqual(3)
    expect(rapidShots).toBeGreaterThanOrEqual(15)
    expect(rapidShots).toBeGreaterThan(basicShots * 3)
  })

  it('applies the slow effect to an enemy that is hit', () => {
    const session = createSimulationSession(combatLevel, combatTowers, combatEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'slow' })

    const applied = advanceUntil(session, (snapshot) => (snapshot.enemies[0]?.slowRemainingSeconds ?? 0) > 0)
    const enemy = session.getSnapshot().enemies[0]

    expect(applied).toBeGreaterThan(0)
    expect(enemy?.slowRemainingSeconds).toBe(1.5)
    expect(enemy?.speed).toBe(5)
  })

  it('refreshes the slow duration instead of stacking it', () => {
    const session = createSimulationSession(combatLevel, combatTowers, combatEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'slow' })

    advanceUntil(session, (snapshot) => (snapshot.enemies[0]?.slowRemainingSeconds ?? 0) > 0)

    let previous = session.getSnapshot().enemies[0]?.slowRemainingSeconds ?? 0
    let refreshed = false
    for (let tick = 0; tick < 120 && !refreshed; tick += 1) {
      session.update(FIXED_STEP_SECONDS)
      const current = session.getSnapshot().enemies[0]?.slowRemainingSeconds ?? 0
      refreshed = current > previous
      previous = current
    }
    const enemy = session.getSnapshot().enemies[0]

    expect(refreshed).toBe(true)
    expect(enemy?.slowRemainingSeconds).toBe(1.5)
    expect(enemy?.speed).toBe(5)
  })

  it('restores normal speed when the slow duration expires', () => {
    const session = createSimulationSession(
      combatLevel,
      towerDefinition('slow', {
        range: 200,
        cooldownSeconds: 1.5,
        projectileSpeed: 240,
        projectileDamage: 10,
        effect: { kind: 'slow', durationSeconds: 0.5, speedMultiplier: 0.5 },
      }),
      combatEnemies,
    )
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'slow' })

    advanceUntil(session, (snapshot) => (snapshot.enemies[0]?.slowRemainingSeconds ?? 0) > 0)
    expect(session.getSnapshot().enemies[0]?.slowRemainingSeconds).toBe(0.5)

    const expired = advanceUntil(session, (snapshot) => (snapshot.enemies[0]?.slowRemainingSeconds ?? 1) === 0)
    const enemy = session.getSnapshot().enemies[0]

    expect(expired).toBeGreaterThan(0)
    expect(enemy?.slowRemainingSeconds).toBe(0)
    expect(enemy?.speed).toBe(10)
  })

  it('moves an enemy slower while the slow effect is active', () => {
    const session = createSimulationSession(combatLevel, combatTowers, combatEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'slow' })

    advanceUntil(session, (snapshot) => (snapshot.enemies[0]?.slowRemainingSeconds ?? 0) > 0)
    const slowedStart = session.getSnapshot().enemies[0]?.position.x ?? 0
    advanceTicks(session, 60)
    const slowedDistance = (session.getSnapshot().enemies[0]?.position.x ?? 0) - slowedStart

    const normalSession = createSimulationSession(combatLevel, combatTowers, combatEnemies)
    normalSession.update(FIXED_STEP_SECONDS)
    const normalStart = normalSession.getSnapshot().enemies[0]?.position.x ?? 0
    advanceTicks(normalSession, 60)
    const normalDistance = (normalSession.getSnapshot().enemies[0]?.position.x ?? 0) - normalStart

    expect(slowedDistance).toBeCloseTo(5, 3)
    expect(normalDistance).toBeCloseTo(10, 3)
    expect(slowedDistance).toBeLessThan(normalDistance)
  })
})

describe('enemy families in the simulation', () => {
  it('reports the family, armor, and health of every living enemy', () => {
    const session = createSimulationSession({
      ...testLevel,
      outcomes: { ...testLevel.outcomes, waves: [waveOf(groupOf('armored')), ...testLevel.outcomes.waves.slice(1)] },
    }, testTowers, armorEnemies)

    session.update(FIXED_STEP_SECONDS)

    expect(session.getSnapshot().enemies[0]).toMatchObject({
      enemyType: 'armored',
      armor: 5,
      health: 100,
      maxHealth: 100,
    })
  })

  it('moves a Fast enemy further than a Normal enemy in the same time', () => {
    const fastSession = createSimulationSession({
      ...combatLevel,
      outcomes: { ...combatLevel.outcomes, waves: [waveOf(groupOf('fast')), ...combatLevel.outcomes.waves.slice(1)] },
    }, testTowers, testEnemies)
    const normalSession = createSimulationSession(combatLevel, testTowers, testEnemies)

    advanceTicks(fastSession, 30)
    advanceTicks(normalSession, 30)

    expect(fastSession.getSnapshot().enemies[0]?.position.x).toBeGreaterThan(
      normalSession.getSnapshot().enemies[0]?.position.x ?? 0,
    )
    expect(fastSession.getSnapshot().enemies[0]?.speed).toBe(120)
    expect(normalSession.getSnapshot().enemies[0]?.speed).toBe(60)
  })

  it('keeps the enemy family while the slow effect scales its speed', () => {
    const session = createSimulationSession({
      ...testLevel,
      outcomes: { ...testLevel.outcomes, waves: [waveOf(groupOf('fast')), ...testLevel.outcomes.waves.slice(1)] },
    }, testTowers, testEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'slow' })

    advanceUntil(session, (snapshot) => (snapshot.enemies[0]?.slowRemainingSeconds ?? 0) > 0)

    expect(session.getSnapshot().enemies[0]).toMatchObject({
      enemyType: 'fast',
      speed: 60,
    })
  })

  it('reduces projectile damage by the armor of the target', () => {
    const session = createSimulationSession({
      ...combatLevel,
      outcomes: { ...combatLevel.outcomes, waves: [waveOf(groupOf('armored')), ...combatLevel.outcomes.waves.slice(1)] },
    }, towerDefinition('basic', { range: 120, cooldownSeconds: 0.5, projectileSpeed: 240, projectileDamage: 20, effect: { kind: 'none' } }), armorEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'basic' })

    advanceUntil(session, (snapshot) => (snapshot.enemies[0]?.health ?? 100) < 100)

    expect(session.getSnapshot().enemies[0]?.health).toBe(85)
  })

  it('applies at least one damage against heavy armor', () => {
    const session = createSimulationSession({
      ...combatLevel,
      outcomes: { ...combatLevel.outcomes, waves: [waveOf(groupOf('armored')), ...combatLevel.outcomes.waves.slice(1)] },
    }, towerDefinition('basic', { range: 120, cooldownSeconds: 0.5, projectileSpeed: 240, projectileDamage: 4, effect: { kind: 'none' } }), armorEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'basic' })

    advanceUntil(session, (snapshot) => (snapshot.enemies[0]?.health ?? 100) < 100)

    expect(session.getSnapshot().enemies[0]?.health).toBe(99)
  })

  it('removes an armored enemy once its health reaches zero', () => {
    const session = createSimulationSession({
      ...combatLevel,
      outcomes: { ...combatLevel.outcomes, waves: [waveOf(groupOf('armored')), ...combatLevel.outcomes.waves.slice(1)] },
    }, towerDefinition('basic', { range: 120, cooldownSeconds: 0.5, projectileSpeed: 240, projectileDamage: 20, effect: { kind: 'none' } }), [
      { id: 'normal', name: 'Normal', speed: 10, health: 10, armor: 0 },
      { id: 'fast', name: 'Fast', speed: 10, health: 10, armor: 0 },
      { id: 'armored', name: 'Armored', speed: 10, health: 10, armor: 5 },
    ])
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'basic' })

    advanceUntil(session, (snapshot) => snapshot.enemies.length === 0, 300)

    expect(session.getSnapshot().enemies).toEqual([])
  })
})

describe('spawn groups in the simulation', () => {
  it('spawns a group only after its start offset', () => {
    const session = createSimulationSession({
      ...testLevel,
      outcomes: {
        ...testLevel.outcomes,
        waves: [waveOf(groupOf('normal', 1, 0, 1)), ...testLevel.outcomes.waves.slice(1)],
      },
    }, testTowers, testEnemies)

    advanceTicks(session, 59)
    expect(session.getSnapshot().enemies).toHaveLength(0)

    advanceTicks(session, 1)
    expect(session.getSnapshot().enemies).toHaveLength(1)
  })

  it('spawns the enemies of a group one interval apart', () => {
    const session = createSimulationSession({
      ...testLevel,
      outcomes: {
        ...testLevel.outcomes,
        waves: [waveOf(groupOf('normal', 2, 0.5)), ...testLevel.outcomes.waves.slice(1)],
      },
    }, testTowers, testEnemies)

    advanceTicks(session, 1)
    expect(session.getSnapshot().enemies).toHaveLength(1)

    advanceTicks(session, 29)
    expect(session.getSnapshot().enemies).toHaveLength(2)
  })

  it('spawns the families of one wave from their own groups', () => {
    const session = createSimulationSession({
      ...testLevel,
      outcomes: {
        ...testLevel.outcomes,
        waves: [waveOf(groupOf('normal'), groupOf('fast')), ...testLevel.outcomes.waves.slice(1)],
      },
    }, testTowers, testEnemies)

    advanceTicks(session, 1)

    expect(session.getSnapshot().enemies.map((enemy) => enemy.enemyType)).toEqual(['normal', 'fast'])
  })

  it('exposes the authored wave count in the snapshot', () => {
    expect(createSimulationSession().getSnapshot()).toMatchObject({ wave: 1, waveCount: 10 })
    expect(createSimulationSession(testLevel, testTowers, testEnemies).getSnapshot()).toMatchObject({ wave: 1, waveCount: 5 })
  })

  it('advances to the next wave after the last enemy of a wave is defeated', () => {
    const session = createSimulationSession(testLevel, testTowers, [
      { id: 'normal', name: 'Normal', speed: 60, health: 1, armor: 0 },
      { id: 'fast', name: 'Fast', speed: 60, health: 1, armor: 0 },
      { id: 'armored', name: 'Armored', speed: 60, health: 1, armor: 0 },
    ])
    session.dispatch({ type: 'placeTower', position: { x: 75, y: 75 }, towerType: 'basic' })

    advanceUntil(session, (snapshot) => snapshot.wave === 2, 300)

    expect(session.getSnapshot()).toMatchObject({ wave: 2, waveCount: 5 })
  })
})

describe('target selection', () => {
  it('resolves equally distant enemies by the lower identifier', () => {
    const session = createSimulationSession({
      ...combatLevel,
      outcomes: { ...combatLevel.outcomes, waves: [waveOf(groupOf('normal', 2)), ...combatLevel.outcomes.waves.slice(1)] },
    }, combatTowers, combatEnemies)
    session.dispatch({ type: 'placeTower', position: { x: 55, y: 125 }, towerType: 'basic' })

    session.update(FIXED_STEP_SECONDS)

    expect(session.getSnapshot().projectiles[0]).toMatchObject({ targetId: 1 })
  })
})

function towerDefinition(id: TowerTypeId, stats: TowerAttackStats): readonly TowerDefinition[] {
  return [
    {
      id,
      name: id,
      tiers: [
        {
          tier: 0,
          stats,
        },
        {
          tier: 1,
          stats: {
            ...stats,
            range: stats.range + 60,
            cooldownSeconds: stats.cooldownSeconds * 0.8,
            projectileSpeed: stats.projectileSpeed + 60,
            projectileDamage: stats.projectileDamage + 5,
          },
        },
      ],
    },
  ]
}

function advanceTicks(session: SimulationSession, ticks: number): void {
  for (let index = 0; index < ticks; index += 1) {
    session.update(FIXED_STEP_SECONDS)
  }
}

function advanceUntil(
  session: SimulationSession,
  predicate: (snapshot: SimulationSnapshot) => boolean,
  maxTicks = 600,
): number {
  let ticks = 0
  while (ticks < maxTicks && !predicate(session.getSnapshot())) {
    session.update(FIXED_STEP_SECONDS)
    ticks += 1
  }
  return ticks
}
