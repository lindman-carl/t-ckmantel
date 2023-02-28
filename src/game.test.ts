import { games, gameCreate, playersInGame } from "./game.js";

describe("gameCreate", () => {
  beforeEach(() => {
    // clear all games and players before each test
    games.clear();
    playersInGame.clear();
  });

  test("should create a game", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";

    const game = gameCreate(gameId, hostId, hostName);

    if (game === null) {
      fail("gameCreate returned null");
    }

    // expect the returned game object to match the default values
    expect(game).toEqual({
      id: gameId,
      host: hostId,
      players: {
        [hostId]: {
          isUndercover: false,
          inGame: false,
          isHost: true,
          name: hostName,
          wins: 0,
          hasVoted: false,
        },
      },
      round: 0,
      gameOver: false,
      gameStarted: false,
      numUndercover: 1,
      words: {
        undercover: "undercover",
        common: "common",
      },
      startPlayer: null,
      votes: [{}],
      allowVote: false,
      message: null,
    });

    // expect the game to be in the games map
    expect(games.get(gameId)).toEqual(game);

    // expect one game to be in the games map
    expect(games.size).toBe(1);

    // expect the host to be added to the players map
    const hostPlayerObject = game.players[hostId];
    expect(hostPlayerObject).toBeDefined();
    expect(hostPlayerObject.name).toBe(hostName);
    expect(hostPlayerObject.isHost).toBe(true);
    expect(hostPlayerObject.isUndercover).toBe(false);
    expect(hostPlayerObject.inGame).toBe(false);
    expect(hostPlayerObject.wins).toBe(0);
    expect(hostPlayerObject.hasVoted).toBe(false);

    // expect the host to added to the playersInGame map
    expect(playersInGame.get(hostId)).toBe(gameId);
  });

  test("should not create a game if the game id already exists", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";

    const game = gameCreate(gameId, hostId, hostName);
    const game2 = gameCreate(gameId, hostId, hostName);

    // expect the first game to be returned
    expect(game).toBeDefined();

    // expect the duplicate game to be null
    expect(game2).toBeNull();

    // expect one game to be in the games map
    expect(games.size).toBe(1);
  });

  test("should be able to create multiple games", () => {
    const numGames = 10;
    const gameIds = Array.from({ length: numGames }, (_, i) => `gameId${i}`);

    gameIds.forEach((gameId) => {
      const hostId = `${gameId}hostId`;
      const hostName = `${gameId}hostName`;

      const game = gameCreate(gameId, hostId, hostName);

      if (game === null) {
        fail("gameCreate returned null");
      }

      // expect the game to be in the games map
      expect(games.get(gameId)).toEqual(game);

      // expect the host to added to the playersInGame map
      expect(playersInGame.get(hostId)).toBe(gameId);
    });

    // expect the number of games to be in the games map
    expect(games.size).toBe(numGames);

    // expect the number of players to be in the playersInGame map
    expect(playersInGame.size).toBe(numGames);
  });
});
