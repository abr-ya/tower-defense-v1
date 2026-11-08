import type { WorldBounds, WorldPoint } from './level'
import type { PlacedTower, PlacementRejectionReason } from './placement'

export type SimulationPhase = 'running' | 'paused'

export type SimulationCommand =
  | Readonly<{ type: 'pause' }>
  | Readonly<{ type: 'resume' }>
  | Readonly<{ type: 'restart' }>
  | Readonly<{ type: 'placeTower'; position: WorldPoint }>

export type SimulationSnapshot = Readonly<{
  phase: SimulationPhase
  tick: number
  simulationTimeSeconds: number
  route: Readonly<{
    bounds: WorldBounds
    waypoints: readonly WorldPoint[]
  }>
  enemy: Readonly<{
    position: WorldPoint
    speed: number
    completedRoute: boolean
  }>
  towers: readonly PlacedTower[]
  lastPlacementRejection: PlacementRejectionReason | null
}>

export type SimulationSession = Readonly<{
  update: (elapsedSeconds: number) => void
  dispatch: (command: SimulationCommand) => void
  getSnapshot: () => SimulationSnapshot
}>
