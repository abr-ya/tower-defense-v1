import { describe, expect, it } from 'vitest'

import { resolvePointerAction } from './pointerActions'

describe('resolvePointerAction', () => {
  it('activates a control instead of placing a tower underneath it', () => {
    expect(resolvePointerAction({ control: 'basic', towerId: undefined, position: { x: 10, y: 20 } })).toEqual({
      kind: 'control',
      control: 'basic',
    })
    expect(resolvePointerAction({ control: 'upgrade', towerId: 7, position: { x: 10, y: 20 } })).toEqual({
      kind: 'control',
      control: 'upgrade',
    })
  })

  it('selects an existing tower instead of placing another one on its cell', () => {
    expect(resolvePointerAction({ control: undefined, towerId: 7, position: { x: 10, y: 20 } })).toEqual({
      kind: 'selectTower',
      towerId: 7,
    })
  })

  it('places a tower when no control and no tower is hit', () => {
    expect(resolvePointerAction({ control: undefined, towerId: undefined, position: { x: 10, y: 20 } })).toEqual({
      kind: 'placeTower',
      position: { x: 10, y: 20 },
    })
  })
})
