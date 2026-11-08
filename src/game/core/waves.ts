import type { WaveDefinition } from './level'

export type WaveSchedule = Readonly<{
  wave: number
  enemyCount: number
  spawnIntervalSeconds: number
}>

export function createWaveSchedule(waves: readonly WaveDefinition[]): readonly WaveSchedule[] {
  if (waves.length !== 5) {
    throw new RangeError('Prototype gameplay requires exactly five waves.')
  }

  return Object.freeze(
    waves.map((wave, index) =>
      Object.freeze({
        wave: index + 1,
        enemyCount: wave.enemyCount,
        spawnIntervalSeconds: wave.spawnIntervalSeconds,
      }),
    ),
  )
}
