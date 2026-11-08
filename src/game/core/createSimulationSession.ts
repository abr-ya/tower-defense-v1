import { FIXED_STEP_SECONDS, MAX_CATCH_UP_TICKS } from './constants'
import { prototypeLevel } from '../content/prototypeLevel'
import { validateLevelDefinition } from './level'
import { createRouteTraversal, getRoutePosition } from './route'
import { validatePlacement } from './placement'

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
  let travelledDistance = 0
  let towers: readonly PlacedTower[] = Object.freeze([])
  let lastPlacementRejection: PlacementRejectionReason | null = null
  let enemyHealth = level.combat.enemyHealth
  let projectileId = 0
  let projectiles: readonly Readonly<{ id: number; position: { x: number; y: number }; targetId: number }>[] = Object.freeze([])
  let cooldowns: readonly number[] = Object.freeze([])
  let wave = 1
  let baseHealth = level.outcomes.baseHealth
  let outcome: GameOutcome = 'playing'
  const traversal = createRouteTraversal(level)
  const routeSnapshot = Object.freeze({
    bounds: Object.freeze({ ...level.bounds }),
    waypoints: Object.freeze(level.route.map((waypoint) => Object.freeze({ ...waypoint }))),
  })

  return {
    update(elapsedSeconds: number): void {
      if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
        throw new RangeError('elapsedSeconds must be a finite non-negative number.')
      }

      if (phase === 'paused') {
        return
      }

      accumulatorSeconds = Math.min(
        accumulatorSeconds + elapsedSeconds,
        FIXED_STEP_SECONDS * MAX_CATCH_UP_TICKS,
      )

      let processedTicks = 0

      while (accumulatorSeconds >= FIXED_STEP_SECONDS && processedTicks < MAX_CATCH_UP_TICKS) {
        accumulatorSeconds -= FIXED_STEP_SECONDS
        tick += 1
        travelledDistance = Math.min(
          travelledDistance + level.enemySpeed * FIXED_STEP_SECONDS,
          traversal.totalLength,
        )
        if (enemyHealth > 0) {
          const enemyPosition = getRoutePosition(level, traversal, travelledDistance).position
          const nextProjectiles: Array<(typeof projectiles)[number]> = []
          for (const projectile of projectiles) {
            const distance = Math.hypot(enemyPosition.x - projectile.position.x, enemyPosition.y - projectile.position.y)
            const travel = level.combat.projectileSpeed * FIXED_STEP_SECONDS
            if (distance <= travel) enemyHealth = Math.max(0, enemyHealth - level.combat.projectileDamage)
            else nextProjectiles.push(Object.freeze({ ...projectile, position: Object.freeze({ x: projectile.position.x + (enemyPosition.x - projectile.position.x) / distance * travel, y: projectile.position.y + (enemyPosition.y - projectile.position.y) / distance * travel }) }))
          }
          projectiles = Object.freeze(nextProjectiles)
          cooldowns = Object.freeze(towers.map((tower, index) => {
            const cooldown = Math.max(0, (cooldowns[index] ?? 0) - FIXED_STEP_SECONDS)
            if (cooldown > 0 || Math.hypot(tower.position.x - enemyPosition.x, tower.position.y - enemyPosition.y) > level.combat.towerRange) return cooldown
            projectiles = Object.freeze([...projectiles, Object.freeze({ id: ++projectileId, position: tower.position, targetId: 1 })])
            return level.combat.towerCooldownSeconds
          }))
        }
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
          travelledDistance = 0
          towers = Object.freeze([])
          lastPlacementRejection = null
          enemyHealth = level.combat.enemyHealth
          projectileId = 0
          projectiles = Object.freeze([])
          cooldowns = Object.freeze([])
          wave = 1
          baseHealth = level.outcomes.baseHealth
          outcome = 'playing'
          break
        case 'placeTower': {
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
      const routePosition = getRoutePosition(level, traversal, travelledDistance)

      return Object.freeze({
        phase,
        tick,
        simulationTimeSeconds: tick * FIXED_STEP_SECONDS,
        route: routeSnapshot,
        enemy: enemyHealth > 0 ? Object.freeze({
          position: routePosition.position,
          speed: level.enemySpeed,
          completedRoute: routePosition.completed,
          health: enemyHealth,
          maxHealth: level.combat.enemyHealth,
        }) : null,
        towers,
        projectiles,
        lastPlacementRejection,
        wave,
        baseHealth,
        outcome,
      })
    },
  }
}
