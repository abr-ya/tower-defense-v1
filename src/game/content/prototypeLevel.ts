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
  combat: Object.freeze({ towerRange: 180, towerCooldownSeconds: 0.5, projectileSpeed: 380, projectileDamage: 20, enemyHealth: 100 }),
  outcomes: Object.freeze({ baseHealth: 10, escapeDamage: 1, waves: Object.freeze([
    Object.freeze({ enemyCount: 2, spawnIntervalSeconds: 1 }), Object.freeze({ enemyCount: 3, spawnIntervalSeconds: 0.9 }), Object.freeze({ enemyCount: 3, spawnIntervalSeconds: 0.8 }), Object.freeze({ enemyCount: 4, spawnIntervalSeconds: 0.7 }), Object.freeze({ enemyCount: 5, spawnIntervalSeconds: 0.6 }),
  ]) }),
})
