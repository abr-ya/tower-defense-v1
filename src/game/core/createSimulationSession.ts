import { FIXED_STEP_SECONDS, MAX_CATCH_UP_TICKS } from './constants'

import type {
  SimulationCommand,
  SimulationPhase,
  SimulationSession,
  SimulationSnapshot,
} from './types'

export function createSimulationSession(): SimulationSession {
  let accumulatorSeconds = 0
  let phase: SimulationPhase = 'running'
  let tick = 0

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
          break
      }
    },

    getSnapshot(): SimulationSnapshot {
      return Object.freeze({
        phase,
        tick,
        simulationTimeSeconds: tick * FIXED_STEP_SECONDS,
      })
    },
  }
}
