import { GameHost } from '../game/adapters/phaser/GameHost'

export function App() {
  return (
    <main className="app-shell" aria-label="Tower Defence game">
      <section className="game-frame" aria-label="Game surface">
        <GameHost />
      </section>
    </main>
  )
}
