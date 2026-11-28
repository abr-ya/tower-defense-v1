export const ENEMY_TYPE_IDS = Object.freeze(['normal', 'fast', 'armored'] as const)

export type EnemyTypeId = (typeof ENEMY_TYPE_IDS)[number]

export type EnemyDefinition = Readonly<{
  id: EnemyTypeId
  name: string
  speed: number
  health: number
  armor: number
}>

export function isEnemyTypeId(value: string): value is EnemyTypeId {
  return (ENEMY_TYPE_IDS as readonly string[]).includes(value)
}

export function validateEnemyDefinition(definition: EnemyDefinition): void {
  if (!isEnemyTypeId(definition.id)) {
    throw new RangeError(`Enemy type "${definition.id}" is not a defined enemy type.`)
  }

  if (definition.name.trim().length === 0) {
    throw new RangeError('Enemy definition name must not be empty.')
  }

  if (!Number.isFinite(definition.speed) || definition.speed <= 0) {
    throw new RangeError('Enemy speed must be a positive finite number.')
  }

  if (!Number.isFinite(definition.health) || definition.health <= 0) {
    throw new RangeError('Enemy health must be a positive finite number.')
  }

  if (!Number.isFinite(definition.armor) || definition.armor < 0) {
    throw new RangeError('Enemy armor must be a non-negative finite number.')
  }
}

export function findEnemyDefinition(
  definitions: readonly EnemyDefinition[],
  enemyType: EnemyTypeId,
): EnemyDefinition | undefined {
  return definitions.find((definition) => definition.id === enemyType)
}

export function resolveDamageAgainstArmor(damage: number, armor: number): number {
  return Math.max(1, damage - armor)
}
