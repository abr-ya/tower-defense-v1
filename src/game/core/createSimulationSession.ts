import { FIXED_STEP_SECONDS, MAX_CATCH_UP_TICKS } from './constants'
import { prototypeLevel } from '../content/prototypeLevel'
import { validateLevelDefinition } from './level'
import { createRouteTraversal, getRoutePosition } from './route'

import type {
  SimulationCommand,
  SimulationPhase,
  SimulationSession,
  SimulationSnapshot,
} from './types'
import type { LevelDefinition } from './level'

export function createSimulationSession(level: LevelDefinition = prototypeLevel): SimulationSession {
  validateLevelDefinition(level)

  let accumulatorSeconds = 0
  let phase: SimulationPhase = 'running'
  let tick = 0
  let travelledDistance = 0
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
          break
      }
    },

    getSnapshot(): SimulationSnapshot {
      const routePosition = getRoutePosition(level, traversal, travelledDistance)

      return Object.freeze({
        phase,
        tick,
        simulationTimeSeconds: tick * FIXED_STEP_SECONDS,
        route: routeSnapshot,
        enemy: Object.freeze({
          position: routePosition.position,
          speed: level.enemySpeed,
          completedRoute: routePosition.completed,
        }),
      })
    },
  }
}
