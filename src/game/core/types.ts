import type { WorldBounds, WorldPoint } from './level'
import type { PlacedTower, PlacementRejectionReason } from './placement'

export type SimulationPhase = 'running' | 'paused' | 'won' | 'lost'
export type GameOutcome = 'playing' | 'won' | 'lost'

export type EnemySnapshot = Readonly<{
  id: number
  position: WorldPoint
  speed: number
  health: number
  maxHealth: number
}>

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
  enemies: readonly EnemySnapshot[]
  towers: readonly PlacedTower[]
  projectiles: readonly Readonly<{ id: number; position: WorldPoint; targetId: number }>[]
  lastPlacementRejection: PlacementRejectionReason | null
  wave: number
  baseHealth: number
  outcome: GameOutcome
}>

export type SimulationSession = Readonly<{
  update: (elapsedSeconds: number) => void
  dispatch: (command: SimulationCommand) => void
  getSnapshot: () => SimulationSnapshot
}>
