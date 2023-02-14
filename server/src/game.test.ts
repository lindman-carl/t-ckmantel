import {
  games,
  createGame,
  addPlayerToGame,
  removePlayerFromGame,
} from "./game.js";

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

describe("removePlayerFromGame", () => {
  beforeAll(() => {
    // clear games
    games.clear();
  });

  it("should remove a player from a game", () => {
    // create game
    createGame("test");

    // add player to game
    addPlayerToGame("test", "player0");

    // get game
    let game = games.get("test");

    // expect one player to exist
    expect(game?.players).toHaveLength(1);

    // remove player from game
    removePlayerFromGame("test", "player0");

    // get game
    game = games.get("test");

    // expect no players to exist
    expect(game?.players).toHaveLength(0);
  });
});
