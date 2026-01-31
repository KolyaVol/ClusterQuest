import * as PIXI from "pixi.js";
import { Grid } from "./Grid";
import { Cluster } from "./GameLogic";

export class GameRenderer {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private cellSize: number = 60;
  private cellSpacing: number = 4;
  private colors: number[] = [
    0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da, 0xfcbad3,
    0xa8e6cf,
  ];
  private clusterTextStyle: PIXI.TextStyle;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

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
    this.container.removeChildren();

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
          cellGraphics.stroke({ width: 3, color: 0xffffff });
        }

        cellGraphics.position.set(posX, posY);
        this.container.addChild(cellGraphics);

        if (isInCluster) {
          const text = new PIXI.Text({
            text: "!",
            style: this.clusterTextStyle,
          });
          text.anchor.set(0.5);
          text.position.set(posX + this.cellSize / 2, posY + this.cellSize / 2);
          this.container.addChild(text);
        }
      }
    }
  }

  clear(): void {
    this.container.removeChildren();
  }
}
