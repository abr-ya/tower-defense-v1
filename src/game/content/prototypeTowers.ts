import { validateTowerDefinition } from '../core/towers'
import type { TowerDefinition, TowerTypeId } from '../core/towers'

export const prototypeTowers: readonly TowerDefinition[] = Object.freeze([
  {
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
  },
  {
    id: 'rapid',
    name: 'Rapid',
    tiers: [
      {
        tier: 0,
        stats: { range: 150, cooldownSeconds: 0.2, projectileSpeed: 520, projectileDamage: 8, effect: { kind: 'none' } },
      },
      {
        tier: 1,
        stats: { range: 165, cooldownSeconds: 0.15, projectileSpeed: 600, projectileDamage: 12, effect: { kind: 'none' } },
      },
    ],
  },
  {
    id: 'slow',
    name: 'Slow',
    tiers: [
      {
        tier: 0,
        stats: {
          range: 170,
          cooldownSeconds: 0.8,
          projectileSpeed: 300,
          projectileDamage: 10,
          effect: { kind: 'slow', durationSeconds: 1.5, speedMultiplier: 0.5 },
        },
      },
      {
        tier: 1,
        stats: {
          range: 185,
          cooldownSeconds: 0.7,
          projectileSpeed: 340,
          projectileDamage: 14,
          effect: { kind: 'slow', durationSeconds: 2.5, speedMultiplier: 0.4 },
        },
      },
    ],
  },
])

export function getTowerDefinition(towerType: TowerTypeId): TowerDefinition | undefined {
  return prototypeTowers.find((definition) => definition.id === towerType)
}

export function isDefinedTowerType(value: string): value is TowerTypeId {
  return prototypeTowers.some((definition) => definition.id === value)
}

export function validatePrototypeTowers(): void {
  for (const definition of prototypeTowers) {
    validateTowerDefinition(definition)
  }
}
