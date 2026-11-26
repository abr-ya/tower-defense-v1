import type { TowerTypeId, WorldPoint } from '../../core'

export type GameControl = 'restart' | 'upgrade' | TowerTypeId

export type PointerAction =
  | Readonly<{ kind: 'control'; control: GameControl }>
  | Readonly<{ kind: 'selectTower'; towerId: number }>
  | Readonly<{ kind: 'placeTower'; position: WorldPoint }>

export function resolvePointerAction(input: Readonly<{
  control: GameControl | undefined
  towerId: number | undefined
  position: WorldPoint
}>): PointerAction {
  if (input.control !== undefined) {
    return Object.freeze({ kind: 'control', control: input.control })
  }

  if (input.towerId !== undefined) {
    return Object.freeze({ kind: 'selectTower', towerId: input.towerId })
  }

  return Object.freeze({ kind: 'placeTower', position: input.position })
}
