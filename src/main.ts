import { GameLogic } from "./game/GameLogic";

const config = {
  fieldWidth: 7,
  fieldHeight: 8,
  iconTypes: 5,
  minClusterSize: 3,
};

const gameLogic = new GameLogic(config);

const field = gameLogic.generateField();
gameLogic.logField(field);

const clusters = gameLogic.findClusters(field);

gameLogic.logClusters(clusters);
