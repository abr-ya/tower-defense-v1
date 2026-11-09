import { FIXED_STEP_SECONDS, MAX_CATCH_UP_TICKS } from './constants'
import { prototypeLevel } from '../content/prototypeLevel'
import { validateLevelDefinition } from './level'
import { createRouteTraversal, getRoutePosition } from './route'
import { validatePlacement } from './placement'
import { createWaveSchedule } from './waves'

import type {
  GameOutcome,
  SimulationCommand,
  SimulationPhase,
  SimulationSession,
  SimulationSnapshot,
} from './types'
import type { LevelDefinition } from './level'
import type { PlacedTower, PlacementRejectionReason } from './placement'

export function createSimulationSession(level: LevelDefinition = prototypeLevel): SimulationSession {
  validateLevelDefinition(level)

  let accumulatorSeconds = 0
  let phase: SimulationPhase = 'running'
  let tick = 0
  let enemies: readonly RuntimeEnemy[] = Object.freeze([])
  let towers: readonly PlacedTower[] = Object.freeze([])
  let lastPlacementRejection: PlacementRejectionReason | null = null
  let enemyId = 0
  let projectileId = 0
  let projectiles: readonly Readonly<{ id: number; position: { x: number; y: number }; targetId: number }>[] = Object.freeze([])
  let cooldowns: readonly number[] = Object.freeze([])
  let wave = 1
  let spawnedInWave = 0
  let secondsUntilNextSpawn = 0
  let baseHealth = level.outcomes.baseHealth
  let outcome: GameOutcome = 'playing'
  const traversal = createRouteTraversal(level)
  const waveSchedule = createWaveSchedule(level.outcomes.waves)
  const routeSnapshot = Object.freeze({
    bounds: Object.freeze({ ...level.bounds }),
    waypoints: Object.freeze(level.route.map((waypoint) => Object.freeze({ ...waypoint }))),
  })

  return {
    update(elapsedSeconds: number): void {
      if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
        throw new RangeError('elapsedSeconds must be a finite non-negative number.')
      }

      if (phase !== 'running') {
        return
      }

      accumulatorSeconds = Math.min(
        accumulatorSeconds + elapsedSeconds,
        FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS,
      )

      let processedTicks = 0

      while (accumulatorSeconds >= FIXED_STEP_SECONDS && processedTicks < MAX_CATCH_UP_TICKS) {
        if (phase !== 'running') break
        accumulatorSeconds -= FIXED_STEP_SECONDS
        tick += 1
        spawnDueEnemies()
        moveEnemies()
        if (phase !== 'running') {
          processedTicks += 1
          continue
        }
        resolveProjectiles()
        fireTowers()
        resolveWaveOutcome()
        processedTicks += 1
      }
    },

    dispatch(command: SimulationCommand): void {
      switch (command.type) {
        case 'pause':
          phase = 'paused'
          break
        case 'resume':
          phase = 'running'
          break
        case 'restart':
          accumulatorSeconds = 0
          phase = 'running'
          tick = 0
          enemies = Object.freeze([])
          towers = Object.freeze([])
          lastPlacementRejection = null
          enemyId = 0
          projectileId = 0
          projectiles = Object.freeze([])
          cooldowns = Object.freeze([])
          wave = 1
          spawnedInWave = 0
          secondsUntilNextSpawn = 0
          baseHealth = level.outcomes.baseHealth
          outcome = 'playing'
          break
        case 'placeTower': {
          if (phase !== 'running') break
          const result = validatePlacement(level, towers, command.position)
          if (result.accepted) {
            towers = Object.freeze([...towers, Object.freeze({ id: towers.length + 1, position: result.position })])
            cooldowns = Object.freeze([...cooldowns, 0])
            lastPlacementRejection = null
          } else {
            lastPlacementRejection = result.reason
          }
          break
        }
      }
    },

    getSnapshot(): SimulationSnapshot {
      return Object.freeze({
        phase,
        tick,
        simulationTimeSeconds: tick * FIXED_STEP_SECONDS,
        route: routeSnapshot,
        enemies: Object.freeze(enemies.map((enemy) => Object.freeze({
          id: enemy.id,
          position: getRoutePosition(level, traversal, enemy.travelledDistance).position,
          speed: level.enemySpeed,
          health: enemy.health,
          maxHealth: level.combat.enemyHealth,
        }))),
        towers,
        projectiles,
        lastPlacementRejection,
        wave,
        baseHealth,
        outcome,
      })
    },
  }

  function spawnDueEnemies(): void {
    const definition = waveSchedule[wave - 1]
    if (definition === undefined) return

    secondsUntilNextSpawn -= FIXED_STEP_SECONDS
    while (spawnedInWave < definition.enemyCount && secondsUntilNextSpawn <= 0) {
      enemies = Object.freeze([...enemies, Object.freeze({ id: ++enemyId, travelledDistance: 0, health: level.combat.enemyHealth })])
      spawnedInWave += 1
      secondsUntilNextSpawn += definition.spawnIntervalSeconds
      if (definition.spawnIntervalSeconds > 0) break
    }
  }

  function moveEnemies(): void {
    const nextEnemies: RuntimeEnemy[] = []
    for (const enemy of enemies) {
      const travelledDistance = Math.min(enemy.travelledDistance + level.enemySpeed * FIXED_STEP_SECONDS, traversal.totalLength)
      if (travelledDistance === traversal.totalLength) {
        baseHealth = Math.max(0, baseHealth - level.outcomes.escapeDamage)
      } else {
        nextEnemies.push(Object.freeze({ ...enemy, travelledDistance }))
      }
    }
    enemies = Object.freeze(nextEnemies)
    if (baseHealth === 0) finish('lost')
  }

  function resolveProjectiles(): void {
    const nextProjectiles: Array<(typeof projectiles)[number]> = []
    const nextHealth = new Map(enemies.map((enemy) => [enemy.id, enemy.health]))
    for (const projectile of projectiles) {
      const target = enemies.find((enemy) => enemy.id === projectile.targetId)
      if (target === undefined) continue
      const targetPosition = getRoutePosition(level, traversal, target.travelledDistance).position
      const distance = Math.hypot(targetPosition.x - projectile.position.x, targetPosition.y - projectile.position.y)
      const travel = level.combat.projectileSpeed * FIXED_STEP_SECONDS
      if (distance <= travel) nextHealth.set(target.id, Math.max(0, (nextHealth.get(target.id) ?? 0) - level.combat.projectileDamage))
      else nextProjectiles.push(Object.freeze({ ...projectile, position: Object.freeze({ x: projectile.position.x + (targetPosition.x - projectile.position.x) / distance * travel, y: projectile.position.y + (targetPosition.y - projectile.position.y) / distance * travel }) }))
    }
    enemies = Object.freeze(enemies.flatMap((enemy) => {
      const health = nextHealth.get(enemy.id) ?? enemy.health
      return health > 0 ? [Object.freeze({ ...enemy, health })] : []
    }))
    projectiles = Object.freeze(nextProjectiles)
  }

  function fireTowers(): void {
    cooldowns = Object.freeze(towers.map((tower, index) => {
      const cooldown = Math.max(0, (cooldowns[index] ?? 0) - FIXED_STEP_SECONDS)
      const target = enemies.find((enemy) => {
        const position = getRoutePosition(level, traversal, enemy.travelledDistance).position
        return Math.hypot(tower.position.x - position.x, tower.position.y - position.y) <= level.combat.towerRange
      })
      if (cooldown > 0 || target === undefined) return cooldown
      projectiles = Object.freeze([...projectiles, Object.freeze({ id: ++projectileId, position: tower.position, targetId: target.id })])
      return level.combat.towerCooldownSeconds
    }))
  }

  function resolveWaveOutcome(): void {
    if (phase !== 'running') return
    const definition = waveSchedule[wave - 1]
    if (definition !== undefined && spawnedInWave === definition.enemyCount && enemies.length === 0) {
      if (wave === waveSchedule.length) finish('won')
      else {
        wave += 1
        spawnedInWave = 0
        secondsUntilNextSpawn = 0
      }
    }
  }

  function finish(nextOutcome: Exclude<GameOutcome, 'playing'>): void {
    outcome = nextOutcome
    phase = nextOutcome
    projectiles = Object.freeze([])
  }
}

type RuntimeEnemy = Readonly<{ id: number; travelledDistance: number; health: number }>
