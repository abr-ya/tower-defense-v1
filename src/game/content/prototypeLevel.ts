import type { LevelDefinition } from '../core/level'

export const prototypeLevel: LevelDefinition = Object.freeze({
  id: 'prototype-route',
  bounds: Object.freeze({ width: 960, height: 540 }),
  route: Object.freeze([
    Object.freeze({ x: 80, y: 120 }),
    Object.freeze({ x: 280, y: 120 }),
    Object.freeze({ x: 400, y: 270 }),
    Object.freeze({ x: 700, y: 270 }),
    Object.freeze({ x: 840, y: 420 }),
  ]),
  enemySpeed: 70,
  placement: Object.freeze({ gridSize: 48, towerFootprint: 32, routeExclusionRadius: 28 }),
})
