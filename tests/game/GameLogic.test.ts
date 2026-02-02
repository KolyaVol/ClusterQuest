import { GameLogic, GameConfig, Cluster } from "../../src/game/GameLogic";
import { Grid } from "../../src/game/Grid";
import { Cell } from "../../src/game/Cell";

function createTestGrid(cells: number[][]): Grid {
  const height = cells.length;
  const width = cells[0].length;
  const grid = new Grid(width, height, 10);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid.cells[y][x] = new Cell(x, y, cells[y][x]);
    }
  }

  return grid;
}

describe("GameLogic", () => {
  const config: GameConfig = {
    fieldWidth: 3,
    fieldHeight: 3,
    iconTypes: 3,
    minClusterSize: 3,
  };

  it("createGrid respects GameConfig dimensions and icon count", () => {
    const logic = new GameLogic(config);
    const grid = logic.createGrid();

    expect(grid.width).toBe(config.fieldWidth);
    expect(grid.height).toBe(config.fieldHeight);

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        expect(cell.iconType).toBeGreaterThanOrEqual(0);
        expect(cell.iconType).toBeLessThan(config.iconTypes);
      }
    }
  });

  it("findClusters finds simple horizontal and vertical clusters", () => {
    const logic = new GameLogic(config);

    const cells = [
      [1, 1, 1],
      [2, 3, 3],
      [2, 3, 4],
    ];
    const grid = createTestGrid(cells);

    const clusters = logic.findClusters(grid);

    const horizontal = clusters.find((c) => c.iconType === 1);
    expect(horizontal).toBeDefined();
    expect(horizontal?.cells.length).toBe(3);

    const vertical = clusters.find((c) => c.iconType === 3);
    expect(vertical).toBeDefined();
    expect(vertical?.cells.length).toBe(3);
  });

  it("findClusters ignores groups smaller than minClusterSize", () => {
    const logic = new GameLogic(config);
    const cells = [
      [1, 2, 3],
      [4, 1, 2],
      [3, 4, 1],
    ];
    const grid = createTestGrid(cells);

    const clusters = logic.findClusters(grid);
    expect(clusters).toHaveLength(0);
  });

  it("marks cells in clusters as isInCluster", () => {
    const logic = new GameLogic(config);
    const cells = [
      [1, 1, 1],
      [0, 0, 0],
      [2, 2, 2],
    ];
    const grid = createTestGrid(cells);

    const clusters: Cluster[] = logic.findClusters(grid);
    expect(clusters.length).toBeGreaterThan(0);

    for (const cluster of clusters) {
      for (const cell of cluster.cells) {
        expect(cell.isInCluster).toBe(true);
      }
    }
  });
});
