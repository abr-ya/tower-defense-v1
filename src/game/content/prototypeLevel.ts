import type { EnemyTypeId } from '../core/enemies'
import type { LevelDefinition, WaveDefinition, WaveSpawnGroup } from '../core/level'

function spawnGroup(
  enemyType: EnemyTypeId,
  count: number,
  spawnIntervalSeconds: number,
  startOffsetSeconds: number,
): WaveSpawnGroup {
  return Object.freeze({ enemyType, count, spawnIntervalSeconds, startOffsetSeconds })
}

function wave(groups: readonly WaveSpawnGroup[]): WaveDefinition {
  return Object.freeze({ groups: Object.freeze([...groups]) })
}

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
  placement: Object.freeze({ gridSize: 48, towerFootprint: 32, routeExclusionRadius: 28 }),
  outcomes: Object.freeze({
    baseHealth: 10,
    escapeDamage: 1,
    waves: Object.freeze([
      wave([spawnGroup('normal', 4, 1, 0)]),
      wave([spawnGroup('normal', 6, 0.9, 0)]),
      wave([spawnGroup('normal', 5, 0.9, 0), spawnGroup('fast', 3, 0.6, 1)]),
      wave([spawnGroup('normal', 6, 0.8, 0), spawnGroup('fast', 5, 0.5, 1)]),
      wave([
        spawnGroup('normal', 6, 0.8, 0),
        spawnGroup('fast', 5, 0.5, 1),
        spawnGroup('armored', 2, 1.2, 3),
      ]),
      wave([
        spawnGroup('normal', 6, 0.7, 0),
        spawnGroup('fast', 7, 0.45, 1),
        spawnGroup('armored', 3, 1, 3),
      ]),
      wave([
        spawnGroup('normal', 7, 0.7, 0),
        spawnGroup('fast', 8, 0.4, 1),
        spawnGroup('armored', 4, 1, 3),
      ]),
      wave([
        spawnGroup('normal', 8, 0.65, 0),
        spawnGroup('fast', 9, 0.35, 1),
        spawnGroup('armored', 5, 0.9, 3),
      ]),
      wave([
        spawnGroup('normal', 9, 0.6, 0),
        spawnGroup('fast', 11, 0.3, 1),
        spawnGroup('armored', 6, 0.9, 3),
      ]),
      wave([
        spawnGroup('normal', 10, 0.55, 0),
        spawnGroup('fast', 13, 0.3, 1),
        spawnGroup('armored', 8, 0.8, 3),
      ]),
    ]),
  }),
})
