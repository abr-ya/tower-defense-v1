import type { LevelDefinition, WorldPoint } from './level'

export type RouteTraversal = Readonly<{
  segmentLengths: readonly number[]
  totalLength: number
}>

export type RoutePosition = Readonly<{
  position: WorldPoint
  completed: boolean
}>

export function createRouteTraversal(level: LevelDefinition): RouteTraversal {
  const segmentLengths = level.route.slice(1).map((waypoint, index) => {
    const previousWaypoint = level.route[index]
    return Math.hypot(waypoint.x - previousWaypoint.x, waypoint.y - previousWaypoint.y)
  })

  return Object.freeze({
    segmentLengths: Object.freeze(segmentLengths),
    totalLength: segmentLengths.reduce((total, segmentLength) => total + segmentLength, 0),
  })
}

export function getRoutePosition(
  level: LevelDefinition,
  traversal: RouteTraversal,
  travelledDistance: number,
): RoutePosition {
  const finalWaypoint = level.route[level.route.length - 1]
  const clampedDistance = Math.max(0, Math.min(travelledDistance, traversal.totalLength))

  if (clampedDistance === traversal.totalLength) {
    return Object.freeze({ position: finalWaypoint, completed: true })
  }

  let remainingDistance = clampedDistance

  for (let index = 0; index < traversal.segmentLengths.length; index += 1) {
    const segmentLength = traversal.segmentLengths[index]
    if (remainingDistance < segmentLength) {
      const from = level.route[index]
      const to = level.route[index + 1]
      const progress = remainingDistance / segmentLength

      return Object.freeze({
        position: Object.freeze({
          x: from.x + (to.x - from.x) * progress,
          y: from.y + (to.y - from.y) * progress,
        }),
        completed: false,
      })
    }

    remainingDistance -= segmentLength
  }

  return Object.freeze({ position: finalWaypoint, completed: true })
}
