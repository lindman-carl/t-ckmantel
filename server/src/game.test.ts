import { games, createGame, addPlayerToGame } from "./game.js";

describe("createGame", () => {
  beforeAll(() => {
    // clear games
    games.clear();
  });

  it("should create a game", () => {
    expect(games.size).toBe(0);

    // create game
    createGame("test", "test-host", "test-player0");
    const game = games.get("test");
    if (!game) fail("game not found");

    // expect one game to exist
    expect(games.size).toBe(1);

    // expect default values for the game
    expect(game).toBeDefined();
    expect(game?.id).toBe("test");

    // players
    const playerIds = Object.keys(game.players);
    expect(playerIds).toHaveLength(0);

    expect(game?.round).toBe(0);
    expect(game?.numUndercover).toBe(1);
    expect(game?.words.undercover).toBe("undercover");
    expect(game?.words.common).toBe("common");
  });
});

describe("addPlayerToGame", () => {
  beforeAll(() => {
    // clear games
    games.clear();
  });

  it("should add a player to a game", () => {
    // create game
    createGame("test", "test-host", "test-player0");

    // add player to game
    addPlayerToGame("test", "player-id1", "test-player1");

    // get game
    const game = games.get("test");
    if (!game) fail("game not found");

    // expect one player to exist
    const playerIds = Object.keys(game.players);
    expect(playerIds).toHaveLength(1);
    expect(playerIds[0]).toBe("player0");
  });
});
