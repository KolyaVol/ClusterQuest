jest.mock("pixi.js", () => {
  const Container = class {
    children: unknown[] = [];
    addChild(child: unknown) {
      this.children.push(child);
    }
    removeChildren() {
      this.children = [];
    }
    position = { set: () => {} };
    pivot = { set: () => {} };
    scale = { x: 1, y: 1, set: (v: number) => {} };
  };

  const Graphics = class extends Container {
    roundRect = () => this;
    fill = () => this;
    stroke = () => this;
  };

  const Application = class {
    stage = new Container();
    screen = { width: 400, height: 300 };
    ticker = {
      add: () => {},
      remove: () => {},
    };
  };

  const Sprite = class extends Container {
    anchor = { set: () => {} };
    position = { set: () => {} };
    scale = { set: () => {} };
    constructor() {
      super();
    }
  };

  return {
    __esModule: true,
    Container,
    Graphics,
    Application,
    Sprite,
    Assets: {
      add: () => {},
      load: async () => ({
        textures: {
          gem: {},
          potion: {},
          sword: {},
          scroll: {},
          bow: {},
        },
      }),
    },
  };
});

import { GameRenderer } from "../../src/game/GameRenderer";
import { Grid } from "../../src/game/Grid";
import { Cell } from "../../src/game/Cell";
import { Cluster } from "../../src/game/GameLogic";

function createSmallGrid(): Grid {
  const grid = new Grid(2, 2, 2);

  let icon = 0;
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      grid.cells[y][x] = new Cell(x, y, icon);
      icon = (icon + 1) % 2;
    }
  }

  return grid;
}

describe("GameRenderer", () => {
  it("renders a grid without throwing", () => {
    const app = new (require("pixi.js").Application as any)();
    const renderer = new GameRenderer(app);
    const grid = createSmallGrid();

    const clusters: Cluster[] = [
      {
        iconType: grid.cells[0][0].iconType,
        cells: [grid.cells[0][0], grid.cells[1][0]],
      },
    ];

    expect(() => renderer.renderGrid(grid, clusters)).not.toThrow();
  });
});
