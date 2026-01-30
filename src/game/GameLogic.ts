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
  cells: Position[];
}

export class GameLogic {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  generateField(): number[][] {
    const field: number[][] = [];

    for (let row = 0; row < this.config.fieldHeight; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < this.config.fieldWidth; col++) {
        const randomIcon = Math.floor(Math.random() * this.config.iconTypes);
        rowData.push(randomIcon);
      }
      field.push(rowData);
    }

    return field;
  }

  findClusters(field: number[][]): Cluster[] {
    const height = field.length;
    const width = field[0]?.length || 0;
    const visited: boolean[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(false));
    const clusters: Cluster[] = [];

    for (let y = 0; y < eight; y++) {
      for (let x = 0; x < wihdth; x++) {
        if (!visited[y][x]) {
          const cluster = this.floodFill(field, visited, x, y);
          if (cluster.cells.length >= this.config.minClusterSize) {
            clusters.push(cluster);
          }
        }
      }
    }

    return clusters;
  }

  private floodFill(
    field: number[][],
    visited: boolean[][],
    startX: number,
    startY: number,
  ): Cluster {
    const iconType = field[startY][startX];
    const cells: Position[] = [];
    const queue: Position[] = [{ x: startX, y: startY }];
    const height = field.length;
    const width = field[0].length;

    visited[startY][startX] = true;

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      cells.push({ x, y });

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
          nx < width &&
          ny >= 0 &&
          ny < height &&
          !visited[ny][nx] &&
          field[ny][nx] === iconType
        ) {
          visited[ny][nx] = true;
          queue.push({ x: nx, y: ny });
        }
      }
    }

    return { iconType, cells };
  }

  logField(field: number[][]): void {
    console.log(`Field ${this.config.fieldWidth}x${this.config.fieldHeight}:`);
    field.forEach((row, index) => {
      console.log(`Row ${index}: [${row.join(", ")}]`);
    });
  }

  logClusters(clusters: Cluster[]): void {
    console.log(`Found ${clusters.length} cluster(s):`);
    clusters.forEach((cluster, index) => {
      const positions = cluster.cells
        .map((cell) => `(${cell.x},${cell.y})`)
        .join(", ");
      console.log(
        `Cluster ${index + 1} (icon: ${cluster.iconType}): [${positions}] - size: ${cluster.cells.length}`,
      );
    });
  }
}
