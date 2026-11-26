export const TOWER_TYPE_IDS = Object.freeze(['basic', 'rapid', 'slow'] as const)

export type TowerTypeId = (typeof TOWER_TYPE_IDS)[number]
export type TowerTier = 0 | 1

export type TowerEffect =
  | Readonly<{ kind: 'none' }>
  | Readonly<{ kind: 'slow'; durationSeconds: number; speedMultiplier: number }>

export type TowerAttackStats = Readonly<{
  range: number
  cooldownSeconds: number
  projectileSpeed: number
  projectileDamage: number
  effect: TowerEffect
}>

export type TowerTierDefinition = Readonly<{
  tier: TowerTier
  stats: TowerAttackStats
}>

export type TowerDefinition = Readonly<{
  id: TowerTypeId
  name: string
  tiers: readonly TowerTierDefinition[]
}>

export function isTowerTypeId(value: string): value is TowerTypeId {
  return (TOWER_TYPE_IDS as readonly string[]).includes(value)
}

export function validateTowerDefinition(definition: TowerDefinition): void {
  if (!isTowerTypeId(definition.id)) {
    throw new RangeError(`Tower type "${definition.id}" is not a defined tower type.`)
  }

  if (definition.name.trim().length === 0) {
    throw new RangeError('Tower definition name must not be empty.')
  }

  if (definition.tiers.length !== 2) {
    throw new RangeError('Tower definitions must define exactly two tiers.')
  }

  const baseTier = definition.tiers.find((tier) => tier.tier === 0)
  const upgradeTier = definition.tiers.find((tier) => tier.tier === 1)

  if (baseTier === undefined || upgradeTier === undefined) {
    throw new RangeError('Tower definitions must define tier 0 and tier 1.')
  }

  validateTowerStats(baseTier.stats)
  validateTowerStats(upgradeTier.stats)
  validateUpgradeImprovement(baseTier.stats, upgradeTier.stats)
}

export function resolveTowerStats(definition: TowerDefinition, tier: TowerTier): TowerAttackStats {
  const tierDefinition = definition.tiers.find((candidate) => candidate.tier === tier)

  if (tierDefinition === undefined) {
    throw new RangeError(`Tower "${definition.id}" does not define tier ${tier}.`)
  }

  return tierDefinition.stats
}

function validateTowerStats(stats: TowerAttackStats): void {
  const numericStats: ReadonlyArray<readonly [string, number]> = [
    ['range', stats.range],
    ['cooldownSeconds', stats.cooldownSeconds],
    ['projectileSpeed', stats.projectileSpeed],
    ['projectileDamage', stats.projectileDamage],
  ]

  for (const [name, value] of numericStats) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`Tower statistic "${name}" must be a positive finite number.`)
    }
  }

  if (stats.effect.kind === 'slow') {
    if (!Number.isFinite(stats.effect.durationSeconds) || stats.effect.durationSeconds <= 0) {
      throw new RangeError('Slow effect duration must be a positive finite number.')
    }

    if (
      !Number.isFinite(stats.effect.speedMultiplier) ||
      stats.effect.speedMultiplier <= 0 ||
      stats.effect.speedMultiplier >= 1
    ) {
      throw new RangeError('Slow effect speed multiplier must be greater than zero and less than one.')
    }
  }
}

function validateUpgradeImprovement(base: TowerAttackStats, upgrade: TowerAttackStats): void {
  if (upgrade.range < base.range) {
    throw new RangeError('An upgraded tier must not reduce tower range.')
  }

  if (upgrade.projectileDamage < base.projectileDamage) {
    throw new RangeError('An upgraded tier must not reduce tower damage.')
  }

  if (upgrade.cooldownSeconds > base.cooldownSeconds) {
    throw new RangeError('An upgraded tier must not increase tower cooldown.')
  }

  const improved =
    upgrade.range > base.range ||
    upgrade.projectileDamage > base.projectileDamage ||
    upgrade.cooldownSeconds < base.cooldownSeconds ||
    upgrade.projectileSpeed > base.projectileSpeed

  if (!improved) {
    throw new RangeError('An upgraded tier must improve at least one tower statistic.')
  }
}
