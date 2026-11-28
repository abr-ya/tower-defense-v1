import type { WaveDefinition, WaveSpawnGroup } from './level'

export type WaveSchedule = Readonly<{
  wave: number
  groups: readonly WaveSpawnGroup[]
}>

export function createWaveSchedule(waves: readonly WaveDefinition[]): readonly WaveSchedule[] {
  if (waves.length === 0) {
    throw new RangeError('A level must define at least one wave.')
  }

  return Object.freeze(
    waves.map((wave, index) =>
      Object.freeze({
        wave: index + 1,
        groups: Object.freeze(wave.groups.map((group) => Object.freeze({ ...group }))),
      }),
    ),
  )
}
