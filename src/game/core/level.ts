import { isEnemyTypeId } from './enemies'
import type { EnemyTypeId } from './enemies'

export type WorldPoint = Readonly<{
  x: number
  y: number
}>

export type WorldBounds = Readonly<{
  width: number
  height: number
}>

export type PlacementConfig = Readonly<{
  gridSize: number
  towerFootprint: number
  routeExclusionRadius: number
}>

export type WaveSpawnGroup = Readonly<{
  enemyType: EnemyTypeId
  count: number
  spawnIntervalSeconds: number
  startOffsetSeconds: number
}>

export type WaveDefinition = Readonly<{
  groups: readonly WaveSpawnGroup[]
}>

export type OutcomeConfig = Readonly<{ baseHealth: number; escapeDamage: number; waves: readonly WaveDefinition[] }>

export type LevelDefinition = Readonly<{
  id: string
  bounds: WorldBounds
  route: readonly WorldPoint[]
  placement: PlacementConfig
  outcomes: OutcomeConfig
}>

export function validateLevelDefinition(level: LevelDefinition): void {
  if (!Number.isFinite(level.bounds.width) || !Number.isFinite(level.bounds.height)) {
    throw new RangeError('Level bounds must be finite numbers.')
  }

  if (level.bounds.width <= 0 || level.bounds.height <= 0) {
    throw new RangeError('Level bounds must be positive.')
  }

  if (level.route.length < 2) {
    throw new RangeError('A level route must contain at least two waypoints.')
  }

  for (const value of [level.placement.gridSize, level.placement.towerFootprint, level.placement.routeExclusionRadius]) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError('Placement configuration values must be positive finite numbers.')
    }
  }

  if (!Number.isFinite(level.outcomes.baseHealth) || level.outcomes.baseHealth <= 0) {
    throw new RangeError('Outcome configuration must define positive base health.')
  }

  if (!Number.isFinite(level.outcomes.escapeDamage) || level.outcomes.escapeDamage <= 0) {
    throw new RangeError('Outcome configuration must define positive escape damage.')
  }

  if (level.outcomes.waves.length === 0) {
    throw new RangeError('A level must define at least one wave.')
  }

  for (const [waveIndex, wave] of level.outcomes.waves.entries()) {
    if (wave.groups.length === 0) {
      throw new RangeError(`Wave ${waveIndex + 1} must define at least one spawn group.`)
    }

    for (const [groupIndex, group] of wave.groups.entries()) {
      validateSpawnGroup(waveIndex + 1, groupIndex + 1, group)
    }
  }

  for (const [index, waypoint] of level.route.entries()) {
    if (!Number.isFinite(waypoint.x) || !Number.isFinite(waypoint.y)) {
      throw new RangeError(`Waypoint ${index} must have finite coordinates.`)
    }

    if (
      waypoint.x < 0 ||
      waypoint.x > level.bounds.width ||
      waypoint.y < 0 ||
      waypoint.y > level.bounds.height
    ) {
      throw new RangeError(`Waypoint ${index} must be inside the world bounds.`)
    }

    if (index > 0) {
      const previousWaypoint = level.route[index - 1]
      if (waypoint.x === previousWaypoint.x && waypoint.y === previousWaypoint.y) {
        throw new RangeError('Route segments must have non-zero length.')
      }
    }
  }
}

function validateSpawnGroup(waveNumber: number, groupNumber: number, group: WaveSpawnGroup): void {
  if (!isEnemyTypeId(group.enemyType)) {
    throw new RangeError(`Wave ${waveNumber} spawn group ${groupNumber} must reference a defined enemy type.`)
  }

  if (!Number.isInteger(group.count) || group.count <= 0) {
    throw new RangeError(`Wave ${waveNumber} spawn group ${groupNumber} must spawn a positive number of enemies.`)
  }

  if (!Number.isFinite(group.spawnIntervalSeconds) || group.spawnIntervalSeconds < 0) {
    throw new RangeError(`Wave ${waveNumber} spawn group ${groupNumber} must use a non-negative spawn interval.`)
  }

  if (!Number.isFinite(group.startOffsetSeconds) || group.startOffsetSeconds < 0) {
    throw new RangeError(`Wave ${waveNumber} spawn group ${groupNumber} must use a non-negative start offset.`)
  }
}
