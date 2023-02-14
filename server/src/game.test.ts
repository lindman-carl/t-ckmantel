import { games, createGame } from "./game.js";

describe("createGame", () => {
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
