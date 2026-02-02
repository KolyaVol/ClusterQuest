import { GameController, GameState } from "../../src/game/GameController";
import { GameConfig, Cluster } from "../../src/game/GameLogic";
import { Grid } from "../../src/game/Grid";

class GameRendererMock {
  renderGridCalls: { grid: Grid; clusters: Cluster[] }[] = [];
  clearCalls = 0;

  renderGrid(grid: Grid, clusters: Cluster[]): void {
    this.renderGridCalls.push({ grid, clusters });
  }

  clear(): void {
    this.clearCalls += 1;
  }
}

describe("GameController", () => {
  const config: GameConfig = {
    fieldWidth: 3,
    fieldHeight: 3,
    iconTypes: 3,
    minClusterSize: 3,
  };

  it("start creates grid, finds clusters, renders, and updates state", () => {
    const renderer = new GameRendererMock() as any;
    const controller = new GameController(config, renderer);

    controller.start();

    expect(controller.getState()).toBe(GameState.SHOWING_CLUSTERS);
    expect(renderer.renderGridCalls.length).toBe(1);

    const { grid, clusters } = renderer.renderGridCalls[0];
    expect(grid.width).toBe(config.fieldWidth);
    expect(grid.height).toBe(config.fieldHeight);
    expect(Array.isArray(clusters)).toBe(true);
  });

  it("reset clears grid and clusters, resets state, and calls renderer.clear", () => {
    const renderer = new GameRendererMock() as any;
    const controller = new GameController(config, renderer);

    controller.start();
    controller.reset();

    expect(controller.getState()).toBe(GameState.IDLE);
    expect(renderer.clearCalls).toBe(1);
  });
});
