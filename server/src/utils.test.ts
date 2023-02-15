import { validateWord, countPlayersInGame } from "./utils.js";
import { addPlayerToGame, createGame, games } from "./game.js";

describe("validateWord", () => {
  it("should return false if word is empty", () => {
    expect(validateWord("")).toBe(false);
  });

  it("should return true if word is not empty", () => {
    expect(validateWord("a")).toBe(true);
    expect(validateWord("test")).toBe(true);
  });
});

describe("countPlayersInGame", () => {
  beforeAll(() => {
    games.clear();
  });
  it("should return 0 if no players in game", () => {
    createGame("test");

    const game = games.get("test");
    if (!game) fail();

    expect(countPlayersInGame(game)).toBe(0);
  });

  it("players should not be in game by default", () => {
    createGame("test");

    const game = games.get("test");
    if (!game) fail();

    addPlayerToGame("test", "player0");
    addPlayerToGame("test", "player1");
    addPlayerToGame("test", "player2");

    expect(countPlayersInGame(game)).toBe(0);
  });
});
