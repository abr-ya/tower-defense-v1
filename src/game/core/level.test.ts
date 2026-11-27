import { describe, expect, it } from 'vitest'

import { createWaveSchedule, prototypeLevel, validateLevelDefinition } from './index'
import type { EnemyTypeId, LevelDefinition, WaveDefinition, WaveSpawnGroup } from './index'

function totalEnemies(wave: WaveDefinition): number {
  return wave.groups.reduce((total, group) => total + group.count, 0)
}

function familiesOf(wave: WaveDefinition): EnemyTypeId[] {
  return wave.groups.map((group) => group.enemyType)
}

describe('level wave content', () => {
  it('authors ten waves', () => {
    expect(prototypeLevel.outcomes.waves).toHaveLength(10)
    expect(() => validateLevelDefinition(prototypeLevel)).not.toThrow()
  })

  it('grows the enemy count on every wave', () => {
    const counts = prototypeLevel.outcomes.waves.map(totalEnemies)

    for (const [index, count] of counts.entries()) {
      if (index === 0) continue
      expect(count).toBeGreaterThan(counts[index - 1])
    }
  })

  it('introduces Fast enemies on wave three and Armored enemies on wave five', () => {
    const waves = prototypeLevel.outcomes.waves

    expect(familiesOf(waves[0])).toEqual(['normal'])
    expect(familiesOf(waves[1])).toEqual(['normal'])
    expect(familiesOf(waves[2])).toContain('fast')
    expect(familiesOf(waves[3])).not.toContain('armored')
    expect(familiesOf(waves[4])).toContain('armored')
    expect(familiesOf(waves[9]).sort()).toEqual(['armored', 'fast', 'normal'])
  })

  it('creates an ordered wave schedule that keeps the authored groups', () => {
    const schedule = createWaveSchedule(prototypeLevel.outcomes.waves)

    expect(schedule).toHaveLength(10)
    expect(schedule[0]).toEqual({ wave: 1, groups: prototypeLevel.outcomes.waves[0].groups })
    expect(schedule[9].wave).toBe(10)
  })
})

describe('level validation', () => {
  const waves = prototypeLevel.outcomes.waves

  it('rejects a level without waves', () => {
    expect(() =>
      validateLevelDefinition({ ...prototypeLevel, outcomes: { ...prototypeLevel.outcomes, waves: [] } }),
    ).toThrow('at least one wave')
  })

  it('rejects a wave without spawn groups', () => {
    expect(() =>
      validateLevelDefinition({
        ...prototypeLevel,
        outcomes: { ...prototypeLevel.outcomes, waves: [{ groups: [] }, ...waves.slice(1)] },
      }),
    ).toThrow('at least one spawn group')
  })

  it('rejects a spawn group that references an unknown enemy type', () => {
    expect(() =>
      validateLevelDefinition({
        ...prototypeLevel,
        outcomes: {
          ...prototypeLevel.outcomes,
          waves: [
            { groups: [{ enemyType: 'boss' as 'normal', count: 1, spawnIntervalSeconds: 0, startOffsetSeconds: 0 }] },
            ...waves.slice(1),
          ],
        },
      }),
    ).toThrow('defined enemy type')
  })

  it('rejects malformed spawn group values', () => {
    const withGroup = (group: Partial<WaveSpawnGroup>): LevelDefinition => ({
      ...prototypeLevel,
      outcomes: {
        ...prototypeLevel.outcomes,
        waves: [
          {
            groups: [
              {
                enemyType: 'normal',
                count: 1,
                spawnIntervalSeconds: 0,
                startOffsetSeconds: 0,
                ...group,
              },
            ],
          },
          ...waves.slice(1),
        ],
      },
    })

    expect(() => validateLevelDefinition(withGroup({ count: 0 }))).toThrow('positive number of enemies')
    expect(() => validateLevelDefinition(withGroup({ count: 1.5 }))).toThrow('positive number of enemies')
    expect(() => validateLevelDefinition(withGroup({ spawnIntervalSeconds: -1 }))).toThrow('non-negative spawn interval')
    expect(() => validateLevelDefinition(withGroup({ startOffsetSeconds: -1 }))).toThrow('non-negative start offset')
  })
})
