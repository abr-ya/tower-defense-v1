import Phaser from 'phaser'

import type { ViewportSize } from '../../../app/viewport'

class BootstrapScene extends Phaser.Scene {
  private title?: Phaser.GameObjects.Text

  public constructor() {
    super('bootstrap')
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#17233f')
    this.title = this.add
      .text(0, 0, 'Tower Defence', {
        color: '#c9dcff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 'clamp(24px, 5vw, 48px)',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.scale.on(Phaser.Scale.Events.RESIZE, this.centerTitle, this)
    this.centerTitle(this.scale.gameSize)
  }

  public shutdown(): void {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.centerTitle, this)
  }

  private centerTitle(size: Phaser.Structs.Size): void {
    this.title?.setPosition(size.width / 2, size.height / 2)
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
