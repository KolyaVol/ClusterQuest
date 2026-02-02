import * as PIXI from "pixi.js";
import { GameRenderer } from "./game/GameRenderer";
import { GameController, GameState } from "./game/GameController";

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

  const renderer = new GameRenderer(app);
  const loader = document.getElementById("loader");
  const startButton = document.getElementById("start-button");

  if (loader) {
    loader.style.display = "flex";
  }

  try {
    await renderer.loadAssets();
  } finally {
    if (loader) {
      loader.style.display = "none";
    }
    if (startButton) {
      startButton.classList.remove("hidden");
    }
  }

  const controller = new GameController(config, renderer);

  if (startButton) {
    startButton.addEventListener("click", () => {
      if (controller.getState() === GameState.SHOWING_CLUSTERS) {
        controller.reset();
      }
      controller.start();
    });
  }
}

init();
