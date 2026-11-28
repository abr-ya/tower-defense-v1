import { describe, expect, it } from 'vitest'

import {
  ENEMY_TYPE_IDS,
  findEnemyDefinition,
  isEnemyTypeId,
  prototypeEnemies,
  resolveDamageAgainstArmor,
  validateEnemyDefinition,
  validatePrototypeEnemies,
} from './index'
import type { EnemyDefinition } from './index'

const validDefinition: EnemyDefinition = {
  id: 'normal',
  name: 'Normal',
  speed: 70,
  health: 100,
  armor: 0,
}

describe('enemy definitions', () => {
  it('accepts the three prototype families with distinct statistics', () => {
    expect(() => validatePrototypeEnemies()).not.toThrow()
    expect(ENEMY_TYPE_IDS).toEqual(['normal', 'fast', 'armored'])

    const speeds = prototypeEnemies.map((definition) => definition.speed)
    const healths = prototypeEnemies.map((definition) => definition.health)

    expect(new Set(speeds).size).toBe(3)
    expect(new Set(healths).size).toBe(3)
    expect(prototypeEnemies.find((definition) => definition.id === 'armored')?.armor).toBe(5)
    expect(prototypeEnemies.find((definition) => definition.id === 'normal')?.armor).toBe(0)
  })

  it('rejects an unknown enemy type', () => {
    expect(() => validateEnemyDefinition({ ...validDefinition, id: 'boss' as 'normal' })).toThrow(
      'not a defined enemy type',
    )
  })

  it('rejects a non-positive speed, a non-positive health, and a negative armor value', () => {
    expect(() => validateEnemyDefinition({ ...validDefinition, speed: 0 })).toThrow('speed must be a positive')
    expect(() => validateEnemyDefinition({ ...validDefinition, health: -1 })).toThrow('health must be a positive')
    expect(() => validateEnemyDefinition({ ...validDefinition, armor: -1 })).toThrow('armor must be a non-negative')
  })

  it('rejects an empty family name', () => {
    expect(() => validateEnemyDefinition({ ...validDefinition, name: '  ' })).toThrow('name must not be empty')
  })

  it('finds a family by its identifier', () => {
    expect(findEnemyDefinition(prototypeEnemies, 'fast')?.name).toBe('Fast')
    expect(findEnemyDefinition(prototypeEnemies, 'normal')).toBeDefined()
    expect(isEnemyTypeId('armored')).toBe(true)
    expect(isEnemyTypeId('boss')).toBe(false)
  })

  it('reduces damage by armor but never below one', () => {
    expect(resolveDamageAgainstArmor(20, 5)).toBe(15)
    expect(resolveDamageAgainstArmor(4, 5)).toBe(1)
    expect(resolveDamageAgainstArmor(20, 0)).toBe(20)
    expect(resolveDamageAgainstArmor(1, 9)).toBe(1)
  })
})
