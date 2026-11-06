import Phaser from 'phaser'

import type { ViewportSize } from '../../../app/viewport'

class BootstrapScene extends Phaser.Scene {
  public constructor() {
    super('bootstrap')
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#17233f')
  }
}

export function createGame(container: HTMLElement, size: ViewportSize): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: size.width,
    height: size.height,
    backgroundColor: '#17233f',
    scene: BootstrapScene,
  })
}

export function resizeGame(game: Phaser.Game, size: ViewportSize): void {
  game.scale.resize(size.width, size.height)
}
