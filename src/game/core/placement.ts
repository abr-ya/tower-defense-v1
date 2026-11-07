import type { LevelDefinition, WorldPoint } from './level'

export type PlacedTower = Readonly<{ id: number; position: WorldPoint }>
export type PlacementRejectionReason = 'bounds' | 'route' | 'occupied'
export type PlacementResult =
  | Readonly<{ accepted: true; position: WorldPoint }>
  | Readonly<{ accepted: false; position: WorldPoint; reason: PlacementRejectionReason }>

export function snapToPlacementGrid(level: LevelDefinition, position: WorldPoint): WorldPoint {
  const { gridSize } = level.placement
  return Object.freeze({
    x: Math.round((position.x - gridSize / 2) / gridSize) * gridSize + gridSize / 2,
    y: Math.round((position.y - gridSize / 2) / gridSize) * gridSize + gridSize / 2,
  })
}

export function validatePlacement(
  level: LevelDefinition,
  towers: readonly PlacedTower[],
  worldPosition: WorldPoint,
): PlacementResult {
  const position = snapToPlacementGrid(level, worldPosition)
  const halfFootprint = level.placement.towerFootprint / 2

  if (
    position.x - halfFootprint < 0 || position.x + halfFootprint > level.bounds.width ||
    position.y - halfFootprint < 0 || position.y + halfFootprint > level.bounds.height
  ) {
    return Object.freeze({ accepted: false, position, reason: 'bounds' })
  }

  const exclusionRadius = level.placement.routeExclusionRadius + halfFootprint
  if (level.route.slice(1).some((point, index) => distanceToSegment(position, level.route[index], point) <= exclusionRadius)) {
    return Object.freeze({ accepted: false, position, reason: 'route' })
  }

  if (towers.some((tower) => Math.abs(tower.position.x - position.x) < level.placement.towerFootprint && Math.abs(tower.position.y - position.y) < level.placement.towerFootprint)) {
    return Object.freeze({ accepted: false, position, reason: 'occupied' })
  }

  return Object.freeze({ accepted: true, position })
}

function distanceToSegment(point: WorldPoint, start: WorldPoint, end: WorldPoint): number {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const lengthSquared = deltaX * deltaX + deltaY * deltaY
  const progress = Math.max(0, Math.min(1, ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared))
  return Math.hypot(point.x - (start.x + deltaX * progress), point.y - (start.y + deltaY * progress))
}
