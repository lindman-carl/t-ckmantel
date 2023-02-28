import { games, gameCreate, playersInGame, gameAddPlayer } from "./game.js";

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
      const hostName = `${gameId}hName`;

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

  test("should not create a game with invalid game id", () => {
    const invalidGameIds = ["", " ", "1", "123"];

    invalidGameIds.forEach((gameId) => {
      const hostId = "hostId";
      const hostName = "hostName";

      const game = gameCreate(gameId, hostId, hostName);

      // expect the game to be null
      expect(game).toBeNull();

      // expect the games map to be empty
      expect(games.size).toBe(0);

      // expect the playersInGame map to be empty
      expect(playersInGame.size).toBe(0);
    });
  });

  test("should not create a game with invalid host name", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const invalidHostNames = ["", " ", "reallyLongName"];

    invalidHostNames.forEach((hostName) => {
      const game = gameCreate(gameId, hostId, hostName);

      // expect the game to be null
      expect(game).toBeNull();

      // expect the games map to be empty
      expect(games.size).toBe(0);

      // expect the playersInGame map to be empty
      expect(playersInGame.size).toBe(0);
    });
  });
});

describe("gameAddPlayer", () => {
  beforeEach(() => {
    // clear all games and players before each test
    games.clear();
    playersInGame.clear();
  });

  test("should add a player to a game", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const playerId = "playerId";
    const playerName = "playerName";

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add a player to the game
    const updatedGame = gameAddPlayer(gameId, playerId, playerName);

    if (updatedGame === null) {
      fail("gameAddPlayer returned null");
    }

    // get the game from the games map
    const game = games.get(gameId);

    if (game === undefined) {
      fail(gameId + "not found in games map");
    }

    // expect the player to be in the game
    const playerFromGame = game.players[playerId];
    expect(playerFromGame).toBeDefined();
    expect(playerFromGame.name).toBe(playerName);
    expect(playerFromGame.isHost).toBe(undefined);
    expect(playerFromGame.isUndercover).toBe(false);
    expect(playerFromGame.inGame).toBe(false);
    expect(playerFromGame.wins).toBe(0);
    expect(playerFromGame.hasVoted).toBe(false);

    // expect the player to be in the correct game
    const playerInGameId = playersInGame.get(playerId);
    expect(playerInGameId).toBe(gameId);
  });

  test("should not add a player to a game if the game does not exist", () => {
    const gameIdThatDoesntExist = "gameIdThatDoesntExist";
    const playerId = "playerId";
    const playerName = "playerName";

    // add a player to the non-existing game
    const updatedGame = gameAddPlayer(
      gameIdThatDoesntExist,
      playerId,
      playerName
    );

    // expect the game to be null
    expect(updatedGame).toBeNull();

    // expect the player to not be added to the playerInGame map
    expect(playersInGame.size).toBe(0);
  });

  test("should not add a player to a game if the player is already in a game", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const playerId = "playerId";
    const playerName = "playerName";

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add a player to the game
    gameAddPlayer(gameId, playerId, playerName);

    // add the same player to the game again
    const updatedGame = gameAddPlayer(gameId, playerId, playerName);

    // expect the game to be null
    expect(updatedGame).toBeNull();

    // expect the player to not be added to the playerInGame map
    expect(playersInGame.size).toBe(2);
  });

  test("should be able to add multiple players to a game", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const numPlayers = 10;
    const playerIds = Array.from(
      { length: numPlayers },
      (_, i) => `playerId${i}`
    );
    const playerNames = Array.from(
      { length: numPlayers },
      (_, i) => `playerName${i}`
    );

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add players to the game
    playerIds.forEach((playerId, i) => {
      const playerName = playerNames[i];

      const updatedGame = gameAddPlayer(gameId, playerId, playerName);

      if (updatedGame === null) {
        fail("gameAddPlayer returned null");
      }

      // get the game from the games map
      const game = games.get(gameId);

      if (game === undefined) {
        fail(gameId + "not found in games map");
      }

      // expect the player to be in the game
      const playerFromGame = game.players[playerId];
      expect(playerFromGame).toBeDefined();
      expect(playerFromGame.name).toBe(playerName);
      expect(playerFromGame.isHost).toBe(undefined);
      expect(playerFromGame.isUndercover).toBe(false);
      expect(playerFromGame.inGame).toBe(false);
      expect(playerFromGame.wins).toBe(0);
      expect(playerFromGame.hasVoted).toBe(false);

      // expect the player to be in the correct game
      const playerInGameId = playersInGame.get(playerId);
      expect(playerInGameId).toBe(gameId);
    });

    // expect the number of players to be in the playersInGame map
    expect(playersInGame.size).toBe(numPlayers + 1);
  });

  test("should be able to add multiple players to multiple games", () => {
    const numGames = 5;
    const gameIds = Array.from({ length: numGames }, (_, i) => `gameId${i}`);
    const hostIds = Array.from({ length: numGames }, (_, i) => `hostId${i}`);
    const hostNames = Array.from(
      { length: numGames },
      (_, i) => `hostName${i}`
    );
    const numPlayers = 5;
    const playerIds = Array.from(
      { length: numPlayers },
      (_, i) => `playerId${i}`
    );
    const playerNames = Array.from(
      { length: numPlayers },
      (_, i) => `playerName${i}`
    );

    // create games
    gameIds.forEach((gameId, i) => {
      const hostId = hostIds[i];
      const hostName = hostNames[i];

      gameCreate(gameId, hostId, hostName);
    });

    // add players to the games
    gameIds.forEach((gameId) => {
      playerIds.forEach((playerId, i) => {
        const playerName = gameId + playerNames[i];
        const playerIdWithGameId = gameId + playerId;

        const updatedGame = gameAddPlayer(
          gameId,
          playerIdWithGameId,
          playerName
        );

        if (updatedGame === null) {
          fail("gameAddPlayer returned null");
        }

        // get the game from the games map
        const game = games.get(gameId);

        if (game === undefined) {
          fail(gameId + "not found in games map");
        }

        // expect the player to be in the game
        const playerFromGame = game.players[playerIdWithGameId];
        expect(playerFromGame).toBeDefined();
        expect(playerFromGame.name).toBe(playerName);
        expect(playerFromGame.isHost).toBe(undefined);
        expect(playerFromGame.isUndercover).toBe(false);
        expect(playerFromGame.inGame).toBe(false);
        expect(playerFromGame.wins).toBe(0);
        expect(playerFromGame.hasVoted).toBe(false);

        // expect the player to be in the correct game
        const playerInGameId = playersInGame.get(playerIdWithGameId);
        expect(playerInGameId).toBe(gameId);
      });
    });

    // expect the number of players to be in the playersInGame map
    expect(playersInGame.size).toBe(numGames * numPlayers + numGames);
  });
});
