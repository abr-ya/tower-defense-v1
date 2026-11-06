import { describe, expect, it } from 'vitest'

import {
  FIXED_STEP_SECONDS,
  MAX_CATCH_UP_TICKS,
  createSimulationSession,
} from './index'

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
})
