import { Grid } from "./Grid";
import { Cell } from "./Cell";

export interface GameConfig {
  fieldWidth: number;
  fieldHeight: number;
  iconTypes: number;
  minClusterSize: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Cluster {
  iconType: number;
  cells: Cell[];
}

export class GameLogic {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  createGrid(): Grid {
    return new Grid(
      this.config.fieldWidth,
      this.config.fieldHeight,
      this.config.iconTypes,
    );
  }

  findClusters(grid: Grid): Cluster[] {
    const visited: boolean[][] = Array(grid.height)
      .fill(null)
      .map(() => Array(grid.width).fill(false));
    const clusters: Cluster[] = [];

    grid.reset();

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if (!visited[y][x]) {
          const cluster = this.floodFill(grid, visited, x, y);
          if (cluster.cells.length >= this.config.minClusterSize) {
            cluster.cells.forEach((cell) => cell.markAsCluster());
            clusters.push(cluster);
          }
        }
      }
    }

    return clusters;
  }

  private floodFill(
    grid: Grid,
    visited: boolean[][],
    startX: number,
    startY: number,
  ): Cluster {
    const startCell = grid.getCellAt(startX, startY)!;
    const iconType = startCell.iconType;
    const cells: Cell[] = [];
    const queue: Position[] = [{ x: startX, y: startY }];

    visited[startY][startX] = true;

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const cell = grid.getCellAt(x, y)!;
      cells.push(cell);

      const neighbors = [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
      ];

      for (const neighbor of neighbors) {
        const { x: nx, y: ny } = neighbor;

        if (
          nx >= 0 &&
          nx < grid.width &&
          ny >= 0 &&
          ny < grid.height &&
          !visited[ny][nx]
        ) {
          const neighborCell = grid.getCellAt(nx, ny)!;
          if (neighborCell.iconType === iconType) {
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }

    return { iconType, cells };
  }
}
