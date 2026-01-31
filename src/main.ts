import * as PIXI from "pixi.js";
import { GameLogic } from "./game/GameLogic";
import { GameRenderer } from "./game/GameRenderer";

const config = {
  fieldWidth: 7,
  fieldHeight: 8,
  iconTypes: 5,
  minClusterSize: 3,
};

async function init() {
  const app = new PIXI.Application();

  await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1a1a2e,
    antialias: true,
  });

  const container = document.getElementById("pixi-container");
  if (container) {
    container.appendChild(app.canvas);
  }

  const gameLogic = new GameLogic(config);
  const renderer = new GameRenderer(app);

  const grid = gameLogic.createGrid();
  gameLogic.findClusters(grid);
  renderer.renderGrid(grid);
}

init();
