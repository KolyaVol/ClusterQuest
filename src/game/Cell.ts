export class Cell {
  public x: number;
  public y: number;
  public iconType: number;
  public isInCluster: boolean;

  constructor(x: number, y: number, iconType: number = 0) {
    this.x = x;
    this.y = y;
    this.iconType = iconType;
    this.isInCluster = false;
  }

  setIcon(iconType: number): void {
    this.iconType = iconType;
  }

  markAsCluster(): void {
    this.isInCluster = true;
  }

  reset(): void {
    this.isInCluster = false;
  }
}
