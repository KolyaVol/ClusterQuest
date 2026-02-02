import { Grid } from "../../src/game/Grid";
import { Cell } from "../../src/game/Cell";

describe("Grid", () => {
  it("generates a grid with correct dimensions", () => {
    const width = 4;
    const height = 3;
    const iconTypes = 5;

    const grid = new Grid(width, height, iconTypes);

    expect(grid.width).toBe(width);
    expect(grid.height).toBe(height);
    expect(grid.cells.length).toBe(height);
    expect(grid.cells.every((row) => row.length === width)).toBe(true);
  });

  it("fills grid with Cell instances and valid icon types", () => {
    const width = 5;
    const height = 4;
    const iconTypes = 3;

    const grid = new Grid(width, height, iconTypes);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid.cells[y][x];
        expect(cell).toBeInstanceOf(Cell);
        expect(cell.iconType).toBeGreaterThanOrEqual(0);
        expect(cell.iconType).toBeLessThan(iconTypes);
      }
    }
  });

  it("getCellAt returns correct cell or null when out of bounds", () => {
    const grid = new Grid(2, 2, 2);

    const cell = grid.getCellAt(1, 1);
    expect(cell).not.toBeNull();
    expect(cell?.x).toBe(1);
    expect(cell?.y).toBe(1);

    expect(grid.getCellAt(-1, 0)).toBeNull();
    expect(grid.getCellAt(0, -1)).toBeNull();
    expect(grid.getCellAt(2, 0)).toBeNull();
    expect(grid.getCellAt(0, 2)).toBeNull();
  });

  it("reset clears isInCluster on all cells", () => {
    const grid = new Grid(2, 2, 2);

    grid.cells[0][0].markAsCluster();
    grid.cells[1][1].markAsCluster();

    grid.reset();

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        expect(grid.cells[y][x].isInCluster).toBe(false);
      }
    }
  });
});
