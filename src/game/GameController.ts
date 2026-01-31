import { GameLogic, GameConfig, Cluster } from "./GameLogic";
import { Grid } from "./Grid";
import { GameRenderer } from "./GameRenderer";

export enum GameState {
  IDLE = "IDLE",
  SHOWING_CLUSTERS = "SHOWING_CLUSTERS",
}

export class GameController {
  private gameLogic: GameLogic;
  private renderer: GameRenderer;
  private state: GameState = GameState.IDLE;
  private grid: Grid | null = null;
  private clusters: Cluster[] = [];

  constructor(config: GameConfig, renderer: GameRenderer) {
    this.gameLogic = new GameLogic(config);
    this.renderer = renderer;
  }

  start(): void {
    this.grid = this.gameLogic.createGrid();
    this.clusters = this.gameLogic.findClusters(this.grid);
    this.renderer.renderGrid(this.grid, this.clusters);
    this.state = GameState.SHOWING_CLUSTERS;
  }

  reset(): void {
    this.state = GameState.IDLE;
    this.grid = null;
    this.clusters = [];
    this.renderer.clear();
  }

  getState(): GameState {
    return this.state;
  }

  getClusters(): Cluster[] {
    return this.clusters;
  }
}
