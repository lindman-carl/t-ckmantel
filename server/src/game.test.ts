import { games, createGame, addPlayerToGame } from "./game.js";

describe("createGame", () => {
  beforeAll(() => {
    // clear games
    games.clear();
  });

  it("should create a game", () => {
    expect(games.size).toBe(0);

    // create game
    createGame("test");
    const game = games.get("test");

    // expect one game to exist
    expect(games.size).toBe(1);

    // expect default values for the game
    expect(game).toBeDefined();
    expect(game?.id).toBe("test");
    expect(game?.players).toHaveLength(0);
  });
});

describe("addPlayerToGame", () => {
  beforeAll(() => {
    // clear games
    games.clear();
  });

  it("should add a player to a game", () => {
    // create game
    createGame("test");

    // add player to game
    addPlayerToGame("test", "player0");

    // get game
    const game = games.get("test");

    // expect one player to exist
    expect(game?.players).toHaveLength(1);

    // expect player to be added
    expect(game?.players[0]).toBe("player0");
  });
});
