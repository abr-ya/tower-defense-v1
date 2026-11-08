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
export type CombatConfig = Readonly<{ towerRange: number; towerCooldownSeconds: number; projectileSpeed: number; projectileDamage: number; enemyHealth: number }>

export type LevelDefinition = Readonly<{
  id: string
  bounds: WorldBounds
  route: readonly WorldPoint[]
  enemySpeed: number
  placement: PlacementConfig
  combat: CombatConfig
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

  if (!Number.isFinite(level.enemySpeed) || level.enemySpeed <= 0) {
    throw new RangeError('Enemy speed must be a positive finite number.')
  }

  for (const value of [level.placement.gridSize, level.placement.towerFootprint, level.placement.routeExclusionRadius]) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError('Placement configuration values must be positive finite numbers.')
    }
  }
  for (const value of Object.values(level.combat)) if (!Number.isFinite(value) || value <= 0) throw new RangeError('Combat configuration values must be positive finite numbers.')

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
