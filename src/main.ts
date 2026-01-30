import { GameLogic } from "./game/GameLogic";

const config = {
  fieldWidth: 7,
  fieldHeight: 8,
  iconTypes: 5,
  minClusterSize: 3,
};

const gameLogic = new GameLogic(config);
const grid = gameLogic.createGrid();
const clusters = gameLogic.findClusters(grid);
console.log(grid.toArray());
console.log(clusters);
