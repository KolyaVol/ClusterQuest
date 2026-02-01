import * as PIXI from "pixi.js";
import { Grid } from "./Grid";
import { Cluster } from "./GameLogic";
import { AnimationManager } from "./animations/AnimationUtils";

interface CellDisplay {
  graphics: PIXI.Graphics;
  text?: PIXI.Text;
  stopPulse?: () => void;
}

export class GameRenderer {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private animationManager: AnimationManager;
  private cellSize: number = 60;
  private cellSpacing: number = 4;
  private colors: number[] = [
    0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da, 0xfcbad3,
    0xa8e6cf,
  ];
  private strokeColors: number[] = [
    0xc41e3a, 0x006b6b, 0xff8c00, 0x008b8b, 0xdc143c, 0x6a0dad, 0xff1493,
    0x2e8b57,
  ];
  private clusterTextStyle: PIXI.TextStyle;
  private cellDisplays: Map<string, CellDisplay> = new Map();

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    this.animationManager = new AnimationManager(app);

    this.clusterTextStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 32,
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: 0x000000,
      align: "center",
    });
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

        cellGraphics.position.set(posX, posY);
        this.container.addChild(cellGraphics);

        const cellDisplay: CellDisplay = { graphics: cellGraphics };

        if (isInCluster) {
          const text = new PIXI.Text({
            text: "!",
            style: this.clusterTextStyle,
          });
          text.anchor.set(0.5);
          text.position.set(posX + this.cellSize / 2, posY + this.cellSize / 2);
          this.container.addChild(text);
          cellDisplay.text = text;

          const stopPulse = this.animationManager.animatePulse(
            cellGraphics,
            0.98,
            1.02,
            1200,
          );
          cellDisplay.stopPulse = stopPulse;
        }

        this.cellDisplays.set(`${x},${y}`, cellDisplay);

        const delay = (x + y) * 15;
        this.animationManager.animateScaleInDelayed(
          cellGraphics,
          delay,
          300,
          0,
          1,
        );
        if (cellDisplay.text) {
          this.animationManager.animateScaleInDelayed(
            cellDisplay.text,
            delay,
            300,
            0,
            1,
          );
        }
      }
    }
  }

  private fadeOutCurrentGrid(): void {
    this.cellDisplays.forEach((cellDisplay) => {
      this.animationManager.animateFadeOut(cellDisplay.graphics, 200);
      if (cellDisplay.text) {
        this.animationManager.animateFadeOut(cellDisplay.text, 200);
      }
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
