export type SimulationPhase = 'running' | 'paused'

export type SimulationCommand =
  | Readonly<{ type: 'pause' }>
  | Readonly<{ type: 'resume' }>
  | Readonly<{ type: 'restart' }>

export type SimulationSnapshot = Readonly<{
  phase: SimulationPhase
  tick: number
  simulationTimeSeconds: number
}>

export type SimulationSession = Readonly<{
  update: (elapsedSeconds: number) => void
  dispatch: (command: SimulationCommand) => void
  getSnapshot: () => SimulationSnapshot
}>
