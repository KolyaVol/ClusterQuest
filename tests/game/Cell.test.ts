import { Cell } from "../../src/game/Cell";

describe("Cell", () => {
  it("initializes with provided coordinates and icon type", () => {
    const cell = new Cell(1, 2, 3);

    expect(cell.x).toBe(1);
    expect(cell.y).toBe(2);
    expect(cell.iconType).toBe(3);
    expect(cell.isInCluster).toBe(false);
  });

  it("updates icon type with setIcon", () => {
    const cell = new Cell(0, 0, 1);
    cell.setIcon(4);
    expect(cell.iconType).toBe(4);
  });

  it("marks and resets cluster state", () => {
    const cell = new Cell(0, 0, 1);
    cell.markAsCluster();
    expect(cell.isInCluster).toBe(true);

    cell.reset();
    expect(cell.isInCluster).toBe(false);
  });
});
