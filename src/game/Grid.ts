import { Cell } from "./Cell";

export class Grid {
  public width: number;
  public height: number;
  public cells: Cell[][];
  private iconTypes: number;

  constructor(width: number, height: number, iconTypes: number) {
    this.width = width;
    this.height = height;
    this.iconTypes = iconTypes;
    this.cells = [];
    this.generate();
  }

  generate(): void {
    this.cells = [];
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        const randomIcon = Math.floor(Math.random() * this.iconTypes);
        row.push(new Cell(x, y, randomIcon));
      }
      this.cells.push(row);
    }
  }

  getCellAt(x: number, y: number): Cell | null {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.cells[y][x];
    }
    return null;
  }

  reset(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.cells[y][x].reset();
      }
    }
  }

  toArray(): number[][] {
    return this.cells.map((row) => row.map((cell) => cell.iconType));
  }
}
