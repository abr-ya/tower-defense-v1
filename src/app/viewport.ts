export type ViewportSize = Readonly<{
  width: number
  height: number
}>

export function normalizeViewportSize(width: number, height: number): ViewportSize {
  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height)),
  }
}
