import { useEffect, useRef } from 'react'

import { normalizeViewportSize } from '../../../app/viewport'
import { createGame, resizeGame } from './createGame'

export function GameHost() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current

    if (host === null) {
      return undefined
    }

    const initialSize = normalizeViewportSize(host.clientWidth, host.clientHeight)
    const game = createGame(host, initialSize)
    const resizeObserver = new ResizeObserver(([entry]) => {
      const size = normalizeViewportSize(entry.contentRect.width, entry.contentRect.height)
      resizeGame(game, size)
    })

    resizeObserver.observe(host)

    return () => {
      resizeObserver.disconnect()
      game.destroy(true)
    }
  }, [])

  return (
    <div className="game-canvas-host" aria-label="Tower Defence game canvas">
      <div ref={hostRef} className="phaser-canvas-host" />
      <div className="game-title" aria-hidden="true">
        Tower Defence
      </div>
    </div>
  )
}
