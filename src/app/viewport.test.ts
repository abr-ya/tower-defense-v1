import { describe, expect, it } from 'vitest'

import { normalizeViewportSize } from './viewport'

describe('normalizeViewportSize', () => {
  it('returns integer dimensions that keep a renderer usable', () => {
    expect(normalizeViewportSize(640.8, -12)).toEqual({ width: 640, height: 1 })
  })
})
