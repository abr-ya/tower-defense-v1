import Phaser from 'phaser'

import type { ViewportSize } from '../../../app/viewport'
import {
  createSimulationSession,
  getPrototypeTowerStats,
  getTowerDefinition,
  prototypeLevel,
  snapToPlacementGrid,
  TOWER_TYPE_IDS,
  validatePlacement,
} from '../../core'
import type { SimulationSnapshot, TowerTypeId, WorldPoint } from '../../core'
import type { EnemyTypeId } from '../../core'
import { resolvePointerAction } from './pointerActions'
import type { GameControl } from './pointerActions'

const TOWER_COLORS: Readonly<Record<TowerTypeId, number>> = {
  basic: 0x78d9c7,
  rapid: 0xffb347,
  slow: 0x9b8cff,
}

const ENEMY_STYLES: Readonly<Record<EnemyTypeId, Readonly<{ color: number; radius: number }>>> = {
  normal: { color: 0xf4b942, radius: 12 },
  fast: { color: 0x8fe388, radius: 9 },
  armored: { color: 0x9b8cff, radius: 15 },
}

const CONTROL_BACKGROUND = '#2c3b63'
const ACTIVE_CONTROL_BACKGROUND = '#78d9c7'
const STATUS_PANEL_WIDTH = 190
const STATUS_PANEL_HEIGHT = 62

type TowerSnapshot = SimulationSnapshot['towers'][number]

class BootstrapScene extends Phaser.Scene {
  private readonly session = createSimulationSession()
  private previewPosition?: WorldPoint
  private routeGraphics?: Phaser.GameObjects.Graphics
  private combatGraphics?: Phaser.GameObjects.Graphics
  private placementGraphics?: Phaser.GameObjects.Graphics
  private enemyGraphics: Phaser.GameObjects.Arc[] = []
  private statusText?: Phaser.GameObjects.Text
  private restartButton?: Phaser.GameObjects.Text
  private upgradeButton?: Phaser.GameObjects.Text
  private typeButtons: Phaser.GameObjects.Text[] = []
  private selectedTowerType: TowerTypeId = 'basic'
  private selectedTowerId?: number

  public constructor() {
    super('bootstrap')
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#17233f')
    this.routeGraphics = this.add.graphics()
    this.combatGraphics = this.add.graphics()
    this.placementGraphics = this.add.graphics()
    const layout = this.getHudLayout()
    this.statusText = this.add.text(layout.panelX + 8, layout.panelY + 6, '', { color: '#ffffff', fontSize: '16px' }).setDepth(1)
    this.restartButton = this.createButton(layout.panelX, layout.panelY + 74, 'Restart')
    this.upgradeButton = this.createButton(12, 54, 'Upgrade')
    this.typeButtons = this.createTypeButtons()
    this.updateTypeButtonStyles()
    this.updateUpgradeButton()

    this.scale.on(Phaser.Scale.Events.RESIZE, this.renderSnapshot, this)
    this.input.on('pointermove', this.updatePreview, this)
    this.input.on('pointerdown', this.handlePointerDown, this)
    this.renderSnapshot()
  }

  public update(_time: number, deltaMilliseconds: number): void {
    this.session.update(deltaMilliseconds / 1_000)
    this.renderSnapshot()
  }

  private createButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, label, {
        backgroundColor: CONTROL_BACKGROUND,
        color: '#ffffff',
        fontSize: '16px',
        padding: { x: 12, y: 8 },
      })
      .setDepth(1)
      .setInteractive({ useHandCursor: true })
  }

  private createTypeButtons(): Phaser.GameObjects.Text[] {
    const buttons = TOWER_TYPE_IDS.map((towerType) =>
      this.createButton(12, 12, getTowerDefinition(towerType)?.name ?? towerType),
    )

    let cursorX = 12
    for (const button of buttons) {
      button.setPosition(cursorX, 12)
      cursorX += button.getBounds().width + 12
    }

    return buttons
  }

  private updateTypeButtonStyles(): void {
    for (const [index, towerType] of TOWER_TYPE_IDS.entries()) {
      const button = this.typeButtons[index]
      if (button === undefined) continue
      const active = towerType === this.selectedTowerType
      button.setBackgroundColor(active ? ACTIVE_CONTROL_BACKGROUND : CONTROL_BACKGROUND)
      button.setColor(active ? '#0d1526' : '#ffffff')
    }
  }

  private updateUpgradeButton(): void {
    if (this.upgradeButton === undefined) return
    const selectedTower = this.findSelectedTower()
    this.upgradeButton.setVisible(selectedTower !== undefined && selectedTower.tier === 0)
  }

  private findSelectedTower(): TowerSnapshot | undefined {
    if (this.selectedTowerId === undefined) return undefined
    return this.session.getSnapshot().towers.find((tower) => tower.id === this.selectedTowerId)
  }

  private findControlAt(screenX: number, screenY: number): GameControl | undefined {
    if (
      this.upgradeButton !== undefined &&
      this.upgradeButton.visible &&
      this.upgradeButton.getBounds().contains(screenX, screenY)
    ) {
      return 'upgrade'
    }
    if (
      this.restartButton !== undefined &&
      this.restartButton.visible &&
      this.restartButton.getBounds().contains(screenX, screenY)
    ) {
      return 'restart'
    }

    for (const [index, towerType] of TOWER_TYPE_IDS.entries()) {
      const button = this.typeButtons[index]
      if (button !== undefined && button.getBounds().contains(screenX, screenY)) return towerType
    }

    return undefined
  }

  private activateControl(control: GameControl): void {
    if (control === 'upgrade') {
      if (this.selectedTowerId !== undefined) {
        this.session.dispatch({ type: 'upgradeTower', towerId: this.selectedTowerId })
      }
    } else if (control === 'restart') {
      this.selectedTowerId = undefined
      this.previewPosition = undefined
      this.session.dispatch({ type: 'restart' })
    } else {
      this.selectedTowerType = control
      this.updateTypeButtonStyles()
    }

    this.updateUpgradeButton()
    this.renderSnapshot()
  }

  private findTowerAt(worldPosition: WorldPoint): TowerSnapshot | undefined {
    const candidate = snapToPlacementGrid(prototypeLevel, worldPosition)
    return this.session
      .getSnapshot()
      .towers.find((tower) => tower.position.x === candidate.x && tower.position.y === candidate.y)
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const worldPosition = this.toWorldPoint(pointer.x, pointer.y)
    const action = resolvePointerAction({
      control: this.findControlAt(pointer.x, pointer.y),
      towerId: this.findTowerAt(worldPosition)?.id,
      position: worldPosition,
    })

    if (action.kind === 'control') {
      this.activateControl(action.control)
      return
    }

    if (action.kind === 'selectTower') {
      this.selectedTowerId = action.towerId
      this.previewPosition = undefined
      this.updateUpgradeButton()
      this.renderSnapshot()
      return
    }

    this.session.dispatch({ type: 'placeTower', position: action.position, towerType: this.selectedTowerType })
    if (this.session.getSnapshot().lastPlacementRejection === null) {
      this.selectedTowerId = undefined
      this.previewPosition = undefined
    }
    this.updateUpgradeButton()
    this.renderSnapshot()
  }

  private renderSnapshot(): void {
    if (this.routeGraphics === undefined || this.combatGraphics === undefined || this.placementGraphics === undefined || this.statusText === undefined || this.restartButton === undefined) {
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
    this.combatGraphics.clear()
    const footprint = prototypeLevel.placement.towerFootprint * transform.scale
    for (const tower of snapshot.towers) {
      const [towerX, towerY] = this.toScreenPoint(tower.position, transform)
      const towerRange = getPrototypeTowerStats(tower.towerType, tower.tier).range
      this.combatGraphics.lineStyle(1, 0x78d9c7, 0.35)
      this.combatGraphics.strokeCircle(towerX, towerY, towerRange * transform.scale)
      this.placementGraphics.fillStyle(TOWER_COLORS[tower.towerType], tower.tier === 0 ? 0.7 : 1)
      this.placementGraphics.fillRect(towerX - footprint / 2, towerY - footprint / 2, footprint, footprint)
      if (tower.tier === 1) {
        this.placementGraphics.lineStyle(2, 0xffffff, 0.9)
        this.placementGraphics.strokeRect(towerX - footprint / 2 - 3, towerY - footprint / 2 - 3, footprint + 6, footprint + 6)
      }
      if (tower.id === this.selectedTowerId) {
        this.placementGraphics.lineStyle(2, 0xffe082, 1)
        this.placementGraphics.strokeRect(towerX - footprint / 2 - 6, towerY - footprint / 2 - 6, footprint + 12, footprint + 12)
      }
    }

    this.combatGraphics.fillStyle(0xffe082, 1)
    for (const projectile of snapshot.projectiles) {
      this.combatGraphics.fillCircle(...this.toScreenPoint(projectile.position, transform), 4)
    }

    if (this.previewPosition !== undefined) {
      const preview = validatePlacement(prototypeLevel, snapshot.towers, this.previewPosition)
      const [previewX, previewY] = this.toScreenPoint(preview.position, transform)
      this.placementGraphics.fillStyle(preview.accepted ? 0x8fe388 : 0xef6a6a, 0.55)
      this.placementGraphics.fillRect(previewX - footprint / 2, previewY - footprint / 2, footprint, footprint)
      this.placementGraphics.lineStyle(2, preview.accepted ? 0xd5ffc4 : 0xffc1c1, 1)
      this.placementGraphics.strokeRect(previewX - footprint / 2, previewY - footprint / 2, footprint, footprint)
    }

    while (this.enemyGraphics.length < snapshot.enemies.length) this.enemyGraphics.push(this.add.circle(0, 0, 12, 0xf4b942))
    for (const [index, enemy] of snapshot.enemies.entries()) {
      const enemyGraphics = this.enemyGraphics[index]
      const [enemyX, enemyY] = this.toScreenPoint(enemy.position, transform)
      const enemyStyle = ENEMY_STYLES[enemy.enemyType]
      enemyGraphics
        .setVisible(true)
        .setPosition(enemyX, enemyY)
        .setRadius(enemyStyle.radius)
        .setFillStyle(enemyStyle.color)
      const healthWidth = 28
      const healthRatio = enemy.health / enemy.maxHealth
      this.combatGraphics.fillStyle(0x311c2b, 1)
      this.combatGraphics.fillRect(enemyX - healthWidth / 2, enemyY - 22, healthWidth, 4)
      this.combatGraphics.fillStyle(0x7ee787, 1)
      this.combatGraphics.fillRect(enemyX - healthWidth / 2, enemyY - 22, healthWidth * healthRatio, 4)
    }
    for (const enemyGraphics of this.enemyGraphics.slice(snapshot.enemies.length)) enemyGraphics.setVisible(false)

    const outcomeText = snapshot.outcome === 'playing' ? '' : snapshot.outcome === 'won' ? 'VICTORY' : 'DEFEAT'
    const layout = this.getHudLayout()
    this.statusText.setPosition(layout.panelX + 8, layout.panelY + 6)
    this.restartButton.setPosition(layout.panelX, layout.panelY + 74)
    this.combatGraphics.fillStyle(0xffffff, 1)
    this.combatGraphics.fillRect(layout.panelX, layout.panelY, STATUS_PANEL_WIDTH, STATUS_PANEL_HEIGHT)
    this.combatGraphics.fillStyle(0x17233f, 1)
    this.combatGraphics.fillRect(layout.panelX + 2, layout.panelY + 2, STATUS_PANEL_WIDTH - 4, STATUS_PANEL_HEIGHT - 4)
    this.statusText.setText(`Wave ${snapshot.wave}/${snapshot.waveCount}\nBase ${snapshot.baseHealth}${outcomeText ? `\n${outcomeText}` : ''}`)
    this.statusText.setColor(outcomeText === 'DEFEAT' ? '#ef6a6a' : outcomeText === 'VICTORY' ? '#8fe388' : '#ffffff')
    this.restartButton.setVisible(snapshot.outcome !== 'playing')
  }

  private getHudLayout(): Readonly<{ panelX: number; panelY: number }> {
    return {
      panelX: Math.max(12, this.scale.width - STATUS_PANEL_WIDTH - 12),
      panelY: 12,
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
