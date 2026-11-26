import { FIXED_STEP_SECONDS, MAX_CATCH_UP_TICKS } from './constants'
import { prototypeLevel } from '../content/prototypeLevel'
import { prototypeTowers } from '../content/prototypeTowers'
import { validateLevelDefinition } from './level'
import { createRouteTraversal, getRoutePosition } from './route'
import { validatePlacement } from './placement'
import { findTowerDefinition, resolveTowerStats } from './towers'
import { createWaveSchedule } from './waves'

import type {
  GameOutcome,
  ProjectileSnapshot,
  SimulationCommand,
  SimulationPhase,
  SimulationSession,
  SimulationSnapshot,
} from './types'
import type { LevelDefinition, WorldPoint } from './level'
import type { PlacementRejectionReason } from './placement'
import type { TowerAttackStats, TowerDefinition, TowerTier, TowerTypeId } from './towers'

export function createSimulationSession(
  level: LevelDefinition = prototypeLevel,
  towerDefinitions: readonly TowerDefinition[] = prototypeTowers,
): SimulationSession {
  validateLevelDefinition(level)

  let accumulatorSeconds = 0
  let phase: SimulationPhase = 'running'
  let tick = 0
  let enemies: readonly RuntimeEnemy[] = Object.freeze([])
  let towers: readonly RuntimeTower[] = Object.freeze([])
  let lastPlacementRejection: PlacementRejectionReason | null = null
  let enemyId = 0
  let projectileId = 0
  let projectiles: readonly ProjectileSnapshot[] = Object.freeze([])
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
          wave = 1
          spawnedInWave = 0
          secondsUntilNextSpawn = 0
          baseHealth = level.outcomes.baseHealth
          outcome = 'playing'
          break
        case 'placeTower': {
          if (phase !== 'running') break
          const definition = findTowerDefinition(towerDefinitions, command.towerType)
          if (definition === undefined) {
            lastPlacementRejection = 'unknownTowerType'
            break
          }
          const result = validatePlacement(level, towers, command.position)
          if (result.accepted) {
            towers = Object.freeze([
              ...towers,
              createRuntimeTower(towers.length + 1, result.position, command.towerType, 0, definition),
            ])
            lastPlacementRejection = null
          } else {
            lastPlacementRejection = result.reason
          }
          break
        }
        case 'upgradeTower': {
          if (phase !== 'running') break
          const target = towers.find((tower) => tower.id === command.towerId)
          if (target === undefined || target.tier >= 1) break
          const definition = findTowerDefinition(towerDefinitions, target.towerType)
          if (definition === undefined) break
          towers = Object.freeze(
            towers.map((tower) =>
              tower.id === command.towerId
                ? createRuntimeTower(tower.id, tower.position, tower.towerType, 1, definition, tower.cooldownRemainingSeconds)
                : tower,
            ),
          )
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
          speed: level.enemySpeed * enemySpeedMultiplier(enemy),
          health: enemy.health,
          maxHealth: level.combat.enemyHealth,
          slowRemainingSeconds: enemy.slowRemainingSeconds,
        }))),
        towers: Object.freeze(towers.map((tower) => Object.freeze({
          id: tower.id,
          position: tower.position,
          towerType: tower.towerType,
          tier: tower.tier,
        }))),
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
      enemies = Object.freeze([
        ...enemies,
        Object.freeze({
          id: ++enemyId,
          travelledDistance: 0,
          health: level.combat.enemyHealth,
          slowRemainingSeconds: 0,
          slowMultiplier: 1,
        }),
      ])
      spawnedInWave += 1
      secondsUntilNextSpawn += definition.spawnIntervalSeconds
      if (definition.spawnIntervalSeconds > 0) break
    }
  }

  function moveEnemies(): void {
    const nextEnemies: RuntimeEnemy[] = []
    for (const enemy of enemies) {
      const travelledDistance = Math.min(
        enemy.travelledDistance + level.enemySpeed * enemySpeedMultiplier(enemy) * FIXED_STEP_SECONDS,
        traversal.totalLength,
      )
      if (travelledDistance === traversal.totalLength) {
        baseHealth = Math.max(0, baseHealth - level.outcomes.escapeDamage)
      } else {
        nextEnemies.push(Object.freeze({
          ...enemy,
          travelledDistance,
          slowRemainingSeconds: Math.max(0, enemy.slowRemainingSeconds - FIXED_STEP_SECONDS),
        }))
      }
    }
    enemies = Object.freeze(nextEnemies)
    if (baseHealth === 0) finish('lost')
  }

  function resolveProjectiles(): void {
    const nextProjectiles: ProjectileSnapshot[] = []
    const nextHealth = new Map(enemies.map((enemy) => [enemy.id, enemy.health]))
    const nextSlow = new Map<number, RuntimeSlow>()
    for (const projectile of projectiles) {
      const target = enemies.find((enemy) => enemy.id === projectile.targetId)
      if (target === undefined) continue
      const targetPosition = getRoutePosition(level, traversal, target.travelledDistance).position
      const distance = Math.hypot(targetPosition.x - projectile.position.x, targetPosition.y - projectile.position.y)
      const travel = projectile.speed * FIXED_STEP_SECONDS
      if (distance <= travel) {
        nextHealth.set(target.id, Math.max(0, (nextHealth.get(target.id) ?? 0) - projectile.damage))
        if (projectile.effect.kind === 'slow') {
          nextSlow.set(target.id, {
            slowRemainingSeconds: projectile.effect.durationSeconds,
            slowMultiplier: projectile.effect.speedMultiplier,
          })
        }
      } else {
        nextProjectiles.push(Object.freeze({
          ...projectile,
          position: Object.freeze({
            x: projectile.position.x + (targetPosition.x - projectile.position.x) / distance * travel,
            y: projectile.position.y + (targetPosition.y - projectile.position.y) / distance * travel,
          }),
        }))
      }
    }
    enemies = Object.freeze(enemies.flatMap((enemy) => {
      const health = nextHealth.get(enemy.id) ?? enemy.health
      if (health <= 0) return []
      const slow = nextSlow.get(enemy.id)
      return [Object.freeze({ ...enemy, health, ...slow })]
    }))
    projectiles = Object.freeze(nextProjectiles)
  }

  function fireTowers(): void {
    towers = Object.freeze(towers.map((tower) => {
      const cooldownRemainingSeconds = Math.max(0, tower.cooldownRemainingSeconds - FIXED_STEP_SECONDS)
      if (cooldownRemainingSeconds > 0) return Object.freeze({ ...tower, cooldownRemainingSeconds })

      const target = findTarget(tower)
      if (target === undefined) return Object.freeze({ ...tower, cooldownRemainingSeconds })

      projectiles = Object.freeze([
        ...projectiles,
        Object.freeze({
          id: ++projectileId,
          position: tower.position,
          targetId: target.id,
          damage: tower.stats.projectileDamage,
          speed: tower.stats.projectileSpeed,
          effect: tower.stats.effect,
        }),
      ])
      return Object.freeze({ ...tower, cooldownRemainingSeconds: tower.stats.cooldownSeconds })
    }))
  }

  function findTarget(tower: RuntimeTower): RuntimeEnemy | undefined {
    let closest: RuntimeEnemy | undefined
    let closestDistance = Number.POSITIVE_INFINITY
    for (const enemy of enemies) {
      const position = getRoutePosition(level, traversal, enemy.travelledDistance).position
      const distance = Math.hypot(tower.position.x - position.x, tower.position.y - position.y)
      if (distance > tower.stats.range) continue
      if (distance < closestDistance) {
        closest = enemy
        closestDistance = distance
      }
    }
    return closest
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

function createRuntimeTower(
  id: number,
  position: WorldPoint,
  towerType: TowerTypeId,
  tier: TowerTier,
  definition: TowerDefinition,
  cooldownRemainingSeconds = 0,
): RuntimeTower {
  return Object.freeze({
    id,
    position,
    towerType,
    tier,
    stats: resolveTowerStats(definition, tier),
    cooldownRemainingSeconds,
  })
}

function enemySpeedMultiplier(enemy: RuntimeEnemy): number {
  return enemy.slowRemainingSeconds > 0 ? enemy.slowMultiplier : 1
}

type RuntimeEnemy = Readonly<{
  id: number
  travelledDistance: number
  health: number
  slowRemainingSeconds: number
  slowMultiplier: number
}>

type RuntimeSlow = Readonly<{
  slowRemainingSeconds: number
  slowMultiplier: number
}>

type RuntimeTower = Readonly<{
  id: number
  position: WorldPoint
  towerType: TowerTypeId
  tier: TowerTier
  stats: TowerAttackStats
  cooldownRemainingSeconds: number
}>
