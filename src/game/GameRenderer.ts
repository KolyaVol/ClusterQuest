import * as PIXI from "pixi.js";
import { Grid } from "./Grid";
import { Cluster } from "./GameLogic";
import { AnimationManager } from "./animations/AnimationUtils";

interface CellDisplay {
  container: PIXI.Container;
  graphics: PIXI.Graphics;
  sprite?: PIXI.Sprite;
  stopPulse?: () => void;
}

export class GameRenderer {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private animationManager: AnimationManager;
  private cellSize: number = 60;
  private cellSpacing: number = 4;
  private colors: number[] = [
    0xffb3ba, 0xb4a7d6, 0xbae1c3, 0xd4a5f5, 0xffc0e0, 0xa7e7d6, 0xb3e0ff,
    0x9ce5f4,
  ];
  private strokeColors: number[] = [
    0xffd700, 0xffb900, 0xffa500, 0xffcc00, 0xffe135, 0xffc300, 0xffd93d,
    0xffaa00,
  ];
  private cellDisplays: Map<string, CellDisplay> = new Map();
  private spritesheet: PIXI.Spritesheet | null = null;
  private iconNames: string[] = ["gem", "potion", "sword", "scroll", "bow"];

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    this.animationManager = new AnimationManager(app);
  }

  async loadAssets(): Promise<void> {
    PIXI.Assets.add({ alias: "icons", src: "icons.json" });
    this.spritesheet = await PIXI.Assets.load("icons");
  }

  renderGrid(grid: Grid, clusters: Cluster[] = []): void {
    this.fadeOutCurrentGrid();

    this.container.removeChildren();
    this.stopAllAnimations();

    const clusterCells = new Set<string>();
    clusters.forEach((cluster) => {
      cluster.cells.forEach((cell) => {
        clusterCells.add(`${cell.x},${cell.y}`);
      });
    });

    const gridWidth = grid.width * (this.cellSize + this.cellSpacing);
    const gridHeight = grid.height * (this.cellSize + this.cellSpacing);

    const offsetX = (this.app.screen.width - gridWidth) / 2;
    const offsetY = (this.app.screen.height - gridHeight) / 2;

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.getCellAt(x, y)!;
        const cellContainer = new PIXI.Container();
        cellContainer.pivot.set(30, 30);
        const cellGraphics = new PIXI.Graphics();

        const isInCluster = clusterCells.has(`${x},${y}`);
        const color = this.colors[cell.iconType % this.colors.length];

        const posX = offsetX + x * (this.cellSize + this.cellSpacing);
        const posY = offsetY + y * (this.cellSize + this.cellSpacing);

        cellGraphics.roundRect(0, 0, this.cellSize, this.cellSize, 8);
        cellGraphics.fill(color);

        if (isInCluster) {
          const strokeColor =
            this.strokeColors[cell.iconType % this.strokeColors.length];
          cellGraphics.stroke({ width: 3, color: strokeColor });
        }

        cellContainer.position.set(posX, posY);
        cellContainer.addChild(cellGraphics);

        const cellDisplay: CellDisplay = {
          container: cellContainer,
          graphics: cellGraphics,
        };

        if (this.spritesheet) {
          const iconName =
            this.iconNames[cell.iconType % this.iconNames.length];
          const sprite = new PIXI.Sprite(this.spritesheet.textures[iconName]);

          const scale = Math.min(
            this.cellSize / sprite.width,
            this.cellSize / sprite.height,
          );
          sprite.scale.set(scale);

          sprite.anchor.set(0.5);
          sprite.position.set(this.cellSize / 2, this.cellSize / 2);

          cellContainer.addChild(sprite);
          cellDisplay.sprite = sprite;
        }

        const delay = (x + y) * 15;

        if (isInCluster) {
          const stopPulse = this.animationManager.animatePulse(
            cellContainer,
            0.98,
            1.02,
            1200,
          );
          cellDisplay.stopPulse = stopPulse;

          this.animationManager.animateScaleInDelayed(cellContainer, delay);
        } else {
          this.animationManager.hideNotClusters(cellContainer, 200, 0.5);

          this.animationManager.animateScaleInDelayed(cellContainer, delay, {
            animateAlpha: false,
          });
        }

        this.container.addChild(cellContainer);
        this.cellDisplays.set(`${x},${y}`, cellDisplay);
      }
    }
  }

  private fadeOutCurrentGrid(): void {
    this.cellDisplays.forEach((cellDisplay) => {
      this.animationManager.animateFadeOut(cellDisplay.container, 200);
    });
  }

  private stopAllAnimations(): void {
    this.cellDisplays.forEach((cellDisplay) => {
      if (cellDisplay.stopPulse) {
        cellDisplay.stopPulse();
      }
    });
    this.cellDisplays.clear();
  }

  clear(): void {
    this.stopAllAnimations();
    this.container.removeChildren();
  }
}
