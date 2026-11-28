import { validateEnemyDefinition } from '../core/enemies'
import type { EnemyDefinition, EnemyTypeId } from '../core/enemies'

export const prototypeEnemies: readonly EnemyDefinition[] = Object.freeze([
  {
    id: 'normal',
    name: 'Normal',
    speed: 70,
    health: 100,
    armor: 0,
  },
  {
    id: 'fast',
    name: 'Fast',
    speed: 115,
    health: 60,
    armor: 0,
  },
  {
    id: 'armored',
    name: 'Armored',
    speed: 55,
    health: 180,
    armor: 5,
  },
])

export function getEnemyDefinition(enemyType: EnemyTypeId): EnemyDefinition | undefined {
  return prototypeEnemies.find((definition) => definition.id === enemyType)
}

export function validatePrototypeEnemies(): void {
  for (const definition of prototypeEnemies) {
    validateEnemyDefinition(definition)
  }
}
