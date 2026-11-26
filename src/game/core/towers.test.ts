import { describe, expect, it } from 'vitest'

import {
  TOWER_TYPE_IDS,
  getTowerDefinition,
  isDefinedTowerType,
  prototypeTowers,
  resolveTowerStats,
  validatePrototypeTowers,
  validateTowerDefinition,
} from './index'
import type { TowerDefinition } from './index'

const validDefinition: TowerDefinition = {
  id: 'basic',
  name: 'Basic',
  tiers: [
    {
      tier: 0,
      stats: { range: 180, cooldownSeconds: 0.5, projectileSpeed: 380, projectileDamage: 20, effect: { kind: 'none' } },
    },
    {
      tier: 1,
      stats: { range: 200, cooldownSeconds: 0.45, projectileSpeed: 420, projectileDamage: 28, effect: { kind: 'none' } },
    },
  ],
}

function withTiers(tiers: TowerDefinition['tiers']): TowerDefinition {
  return { ...validDefinition, tiers }
}

describe('tower definitions', () => {
  it('defines exactly the three prototype tower types', () => {
    expect([...TOWER_TYPE_IDS]).toEqual(['basic', 'rapid', 'slow'])
    expect(prototypeTowers.map((definition) => definition.id)).toEqual(['basic', 'rapid', 'slow'])
    expect(() => validatePrototypeTowers()).not.toThrow()
  })

  it('reports which tower types are defined', () => {
    expect(isDefinedTowerType('slow')).toBe(true)
    expect(isDefinedTowerType('cannon')).toBe(false)
    expect(getTowerDefinition('rapid')?.name).toBe('Rapid')
    expect(getTowerDefinition('cannon' as 'basic')).toBeUndefined()
  })

  it('exposes distinct statistics per tower type', () => {
    const basic = resolveTowerStats(getTowerDefinition('basic')!, 0)
    const rapid = resolveTowerStats(getTowerDefinition('rapid')!, 0)
    const slow = resolveTowerStats(getTowerDefinition('slow')!, 0)

    expect(rapid.cooldownSeconds).toBeLessThan(basic.cooldownSeconds)
    expect(rapid.projectileDamage).toBeLessThan(basic.projectileDamage)
    expect(slow.effect).toEqual({ kind: 'slow', durationSeconds: 1.5, speedMultiplier: 0.5 })
    expect(basic.effect).toEqual({ kind: 'none' })
    expect(rapid.effect).toEqual({ kind: 'none' })
  })

  it('resolves upgraded tier statistics that improve on the base tier', () => {
    for (const definition of prototypeTowers) {
      const base = resolveTowerStats(definition, 0)
      const upgraded = resolveTowerStats(definition, 1)

      expect(upgraded.range).toBeGreaterThanOrEqual(base.range)
      expect(upgraded.projectileDamage).toBeGreaterThan(base.projectileDamage)
      expect(upgraded.cooldownSeconds).toBeLessThanOrEqual(base.cooldownSeconds)
    }
  })

  it('rejects definitions with an unknown type', () => {
    expect(() => validateTowerDefinition({ ...validDefinition, id: 'cannon' as 'basic' })).toThrow(
      'is not a defined tower type',
    )
  })

  it('rejects definitions without both tiers', () => {
    expect(() => validateTowerDefinition(withTiers([]))).toThrow('exactly two tiers')
    expect(() => validateTowerDefinition(withTiers([validDefinition.tiers[0]]))).toThrow('exactly two tiers')
    expect(() =>
      validateTowerDefinition(
        withTiers([
          { tier: 0, stats: validDefinition.tiers[0].stats },
          { tier: 1, stats: validDefinition.tiers[0].stats },
        ]),
      ),
    ).toThrow('improve at least one tower statistic')
  })

  it('rejects definitions with non-positive statistics', () => {
    expect(() =>
      validateTowerDefinition(
        withTiers([
          { tier: 0, stats: { ...validDefinition.tiers[0].stats, range: 0 } },
          validDefinition.tiers[1],
        ]),
      ),
    ).toThrow('"range" must be a positive finite number')

    expect(() =>
      validateTowerDefinition(
        withTiers([
          { tier: 0, stats: { ...validDefinition.tiers[0].stats, cooldownSeconds: Number.NaN } },
          validDefinition.tiers[1],
        ]),
      ),
    ).toThrow('"cooldownSeconds" must be a positive finite number')
  })

  it('rejects invalid slow effects', () => {
    expect(() =>
      validateTowerDefinition(
        withTiers([
          {
            tier: 0,
            stats: {
              ...validDefinition.tiers[0].stats,
              effect: { kind: 'slow', durationSeconds: 0, speedMultiplier: 0.5 },
            },
          },
          validDefinition.tiers[1],
        ]),
      ),
    ).toThrow('Slow effect duration must be a positive finite number')

    expect(() =>
      validateTowerDefinition(
        withTiers([
          {
            tier: 0,
            stats: {
              ...validDefinition.tiers[0].stats,
              effect: { kind: 'slow', durationSeconds: 1.5, speedMultiplier: 1 },
            },
          },
          validDefinition.tiers[1],
        ]),
      ),
    ).toThrow('Slow effect speed multiplier must be greater than zero and less than one')
  })

  it('rejects upgraded tiers that weaken a tower', () => {
    expect(() =>
      validateTowerDefinition(
        withTiers([
          validDefinition.tiers[0],
          { tier: 1, stats: { ...validDefinition.tiers[1].stats, projectileDamage: 1 } },
        ]),
      ),
    ).toThrow('must not reduce tower damage')

    expect(() =>
      validateTowerDefinition(
        withTiers([
          validDefinition.tiers[0],
          { tier: 1, stats: { ...validDefinition.tiers[1].stats, cooldownSeconds: 2 } },
        ]),
      ),
    ).toThrow('must not increase tower cooldown')
  })
})
