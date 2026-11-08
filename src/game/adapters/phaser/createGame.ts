import Phaser from 'phaser'

import type { ViewportSize } from '../../../app/viewport'
import { createSimulationSession, prototypeLevel, validatePlacement } from '../../core'
import type { SimulationSnapshot, WorldPoint } from '../../core'

class BootstrapScene extends Phaser.Scene {
  private readonly session = createSimulationSession()
  private previewPosition?: WorldPoint
  private routeGraphics?: Phaser.GameObjects.Graphics
  private placementGraphics?: Phaser.GameObjects.Graphics
  private enemyGraphics?: Phaser.GameObjects.Arc

  public constructor() {
    super('bootstrap')
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#17233f')
    this.routeGraphics = this.add.graphics()
    this.placementGraphics = this.add.graphics()
    this.enemyGraphics = this.add.circle(0, 0, 12, 0xf4b942)

    this.scale.on(Phaser.Scale.Events.RESIZE, this.renderSnapshot, this)
    this.input.on('pointermove', this.updatePreview, this)
    this.input.on('pointerdown', this.placeTower, this)
    this.renderSnapshot()
  }

  public update(_time: number, deltaMilliseconds: number): void {
    this.session.update(deltaMilliseconds / 1_000)
    this.renderSnapshot()
  }

  private renderSnapshot(): void {
    if (this.routeGraphics === undefined || this.placementGraphics === undefined || this.enemyGraphics === undefined) {
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

    this.placementGraphics.clear()
    const footprint = prototypeLevel.placement.towerFootprint * transform.scale
    for (const tower of snapshot.towers) {
      const [towerX, towerY] = this.toScreenPoint(tower.position, transform)
      this.placementGraphics.fillStyle(0x78d9c7, 1)
      this.placementGraphics.fillRect(towerX - footprint / 2, towerY - footprint / 2, footprint, footprint)
    }

    if (this.previewPosition !== undefined) {
      const preview = validatePlacement(prototypeLevel, snapshot.towers, this.previewPosition)
      const [previewX, previewY] = this.toScreenPoint(preview.position, transform)
      this.placementGraphics.fillStyle(preview.accepted ? 0x8fe388 : 0xef6a6a, 0.55)
      this.placementGraphics.fillRect(previewX - footprint / 2, previewY - footprint / 2, footprint, footprint)
      this.placementGraphics.lineStyle(2, preview.accepted ? 0xd5ffc4 : 0xffc1c1, 1)
      this.placementGraphics.strokeRect(previewX - footprint / 2, previewY - footprint / 2, footprint, footprint)
    }

    if (snapshot.enemy === null) {
      this.enemyGraphics.setVisible(false)
    } else {
      const [enemyX, enemyY] = this.toScreenPoint(snapshot.enemy.position, transform)
      this.enemyGraphics.setVisible(true).setPosition(enemyX, enemyY)
      this.enemyGraphics.setFillStyle(snapshot.enemy.completedRoute ? 0x8fe388 : 0xf4b942)
    }
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

  private updatePreview(pointer: Phaser.Input.Pointer): void {
    this.previewPosition = this.toWorldPoint(pointer.x, pointer.y)
    this.renderSnapshot()
  }

  private placeTower(pointer: Phaser.Input.Pointer): void {
    this.previewPosition = this.toWorldPoint(pointer.x, pointer.y)
    this.session.dispatch({ type: 'placeTower', position: this.previewPosition })
    this.renderSnapshot()
  }

  private toWorldPoint(screenX: number, screenY: number): WorldPoint {
    const transform = this.getWorldTransform(this.session.getSnapshot())
    return {
      x: (screenX - transform.offsetX) / transform.scale,
      y: (screenY - transform.offsetY) / transform.scale,
    }
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
