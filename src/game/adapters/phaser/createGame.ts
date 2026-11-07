import Phaser from 'phaser'

import type { ViewportSize } from '../../../app/viewport'
import { createSimulationSession } from '../../core'
import type { SimulationSnapshot, WorldPoint } from '../../core'

class BootstrapScene extends Phaser.Scene {
  private readonly session = createSimulationSession()
  private routeGraphics?: Phaser.GameObjects.Graphics
  private enemyGraphics?: Phaser.GameObjects.Arc

  public constructor() {
    super('bootstrap')
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#17233f')
    this.routeGraphics = this.add.graphics()
    this.enemyGraphics = this.add.circle(0, 0, 12, 0xf4b942)

    this.scale.on(Phaser.Scale.Events.RESIZE, this.renderSnapshot, this)
    this.renderSnapshot()
  }

  public update(_time: number, deltaMilliseconds: number): void {
    this.session.update(deltaMilliseconds / 1_000)
    this.renderSnapshot()
  }

  private renderSnapshot(): void {
    if (this.routeGraphics === undefined || this.enemyGraphics === undefined) {
      return
    }

    const snapshot = this.session.getSnapshot()
    const transform = this.getWorldTransform(snapshot)
    const waypoints = snapshot.route.waypoints

    this.routeGraphics.clear()
    this.routeGraphics.lineStyle(8, 0x4f6cae, 1)
    this.routeGraphics.beginPath()
    this.routeGraphics.moveTo(...this.toScreenPoint(waypoints[0], transform))
    for (const waypoint of waypoints.slice(1)) {
      this.routeGraphics.lineTo(...this.toScreenPoint(waypoint, transform))
    }
    this.routeGraphics.strokePath()

    this.routeGraphics.fillStyle(0x9bc4ff, 1)
    for (const waypoint of waypoints) {
      this.routeGraphics.fillCircle(...this.toScreenPoint(waypoint, transform), 6)
    }

    const [enemyX, enemyY] = this.toScreenPoint(snapshot.enemy.position, transform)
    this.enemyGraphics.setPosition(enemyX, enemyY)
    this.enemyGraphics.setFillStyle(snapshot.enemy.completedRoute ? 0x8fe388 : 0xf4b942)
  }

  private getWorldTransform(snapshot: SimulationSnapshot): Readonly<{
    scale: number
    offsetX: number
    offsetY: number
  }> {
    const padding = 32
    const availableWidth = Math.max(1, this.scale.width - padding * 2)
    const availableHeight = Math.max(1, this.scale.height - padding * 2)
    const scale = Math.min(
      availableWidth / snapshot.route.bounds.width,
      availableHeight / snapshot.route.bounds.height,
    )

    return {
      scale,
      offsetX: (this.scale.width - snapshot.route.bounds.width * scale) / 2,
      offsetY: (this.scale.height - snapshot.route.bounds.height * scale) / 2,
    }
  }

  private toScreenPoint(
    point: WorldPoint,
    transform: Readonly<{ scale: number; offsetX: number; offsetY: number }>,
  ): [number, number] {
    return [point.x * transform.scale + transform.offsetX, point.y * transform.scale + transform.offsetY]
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
