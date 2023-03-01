import { nanoid } from "nanoid";

import {
  games,
  playersInGame,
  gameCreate,
  gameAddPlayer,
  gameRemovePlayer,
  gameVote,
  gameEliminatePlayer,
  gameStart,
} from "./game.js";

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

  test("should not add a player to a game if the game has already started", () => {
    const gameId = "gameId";

    // create a game
    gameCreate(gameId, "hostId", "hostName");

    // add two players to the game
    gameAddPlayer(gameId, "playerId1", "playerName1");
    gameAddPlayer(gameId, "playerId2", "playerName2");

    // start the game
    gameStart("hostId", gameId, null, 1);

    // add a player to the game after it has started
    const updatedGame = gameAddPlayer(gameId, "playerId3", "playerName3");

    // expect the game to be null
    expect(updatedGame).toBeNull();

    // expect the player to not be added to the playerInGame map
    expect(playersInGame.size).toBe(3);
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
    const playerNames = Array.from({ length: numPlayers }, (_, i) => `p${i}`);

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

  test("should not add a player with an invalid name", () => {
    const gameId = "gameId";
    const hostName = "hostName";
    const invalidPlayerNames = ["", " ", "  ", "longerThan12C"];

    // create a game
    gameCreate(gameId, nanoid(), hostName);

    // add players to the game
    invalidPlayerNames.forEach((playerName) => {
      const updatedGame = gameAddPlayer(gameId, nanoid(), playerName);

      // expect the game to be null
      expect(updatedGame).toBeNull();
    });

    // expect the number of players to be in the playersInGame map
    expect(playersInGame.size).toBe(1);

    // expect the game to not have any players other than the host
    const game = games.get(gameId);
    if (game === undefined) {
      fail(gameId + "not found in games map");
    }
    expect(Object.keys(game.players).length).toBe(1);
  });
});

describe("gameRemovePlayer", () => {
  beforeEach(() => {
    // clear the games and playersInGame maps
    games.clear();
    playersInGame.clear();
  });

  test("should be able to remove a player from a game", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const numPlayers = 5;
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
    });

    // remove a player from the game
    const playerIdToRemove = playerIds[0];
    const updatedGame = gameRemovePlayer(gameId, playerIdToRemove);

    if (updatedGame === null) {
      fail("gameRemovePlayer returned null");
    }

    // expect the player to be removed from the game
    const game = games.get(gameId);
    if (game === undefined) {
      fail(gameId + "not found in games map");
    }
    expect(game.players[playerIdToRemove]).toBeUndefined();

    // expect the player to be removed from the playersInGame map
    expect(playersInGame.get(playerIdToRemove)).toBeUndefined();

    // expect the number of players to be in the playersInGame map
    expect(playersInGame.size).toBe(numPlayers);
  });
});

describe("gameStart", () => {
  beforeEach(() => {
    // clear the games and playersInGame maps
    games.clear();
    playersInGame.clear();
  });

  test("should be able to start a game by host", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const numPlayers = 5;
    const playerIds = Array.from(
      { length: numPlayers },
      (_, i) => `playerId${i}`
    );
    const playerNames = Array.from(
      { length: numPlayers },
      (_, i) => `playerName${i}`
    );
    const words: [string, string] = ["word1", "word2"];

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add players to the game
    playerIds.forEach((playerId, i) => {
      const playerName = playerNames[i];

      gameAddPlayer(gameId, playerId, playerName);
    });

    // start the game
    const startedGame = gameStart(hostId, gameId, words, 1);

    if (startedGame === null) {
      fail("gameStart returned null");
    }

    // expect the game to have started
    expect(startedGame).toBeDefined();
    expect(startedGame.gameStarted).toBe(true);
  });

  test("should not be able to start a game by non-host", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const numPlayers = 5;
    const playerIds = Array.from(
      { length: numPlayers },
      (_, i) => `playerId${i}`
    );
    const playerNames = Array.from(
      { length: numPlayers },
      (_, i) => `playerName${i}`
    );
    const words: [string, string] = ["word1", "word2"];

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add players to the game
    playerIds.forEach((playerId, i) => {
      const playerName = playerNames[i];

      gameAddPlayer(gameId, playerId, playerName);
    });

    // start the game
    const startedGame = gameStart(playerIds[0], gameId, words, 1);

    // expect the game to not have started
    expect(startedGame).toBeNull();
  });

  test("should not be able to start a game with less than 3 players", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const words: [string, string] = ["word1", "word2"];

    // create a game
    gameCreate(gameId, hostId, "hostName");

    // add a player to the game
    gameAddPlayer(gameId, "playerId", "playerName");

    // try to start the game
    const startedGame = gameStart(hostId, gameId, words, 1);

    // expect the game to not have started
    expect(startedGame).toBeNull();
  });

  test("should not be able to start a game twice", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const numPlayers = 5;
    const playerIds = Array.from(
      { length: numPlayers },
      (_, i) => `playerId${i}`
    );
    const playerNames = Array.from(
      { length: numPlayers },
      (_, i) => `playerName${i}`
    );
    const words: [string, string] = ["word1", "word2"];

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add players to the game
    playerIds.forEach((playerId, i) => {
      const playerName = playerNames[i];

      gameAddPlayer(gameId, playerId, playerName);
    });

    // start the game
    const startedGame = gameStart(hostId, gameId, words, 1);

    if (startedGame === null) {
      fail("gameStart returned null");
    }

    // start the game again
    const startedGameAgain = gameStart(hostId, gameId, words, 1);

    // expect the game to not have started
    expect(startedGameAgain).toBeNull();
  });

  test("should not be able to start a game with invalid words", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const numPlayers = 5;
    const playerIds = Array.from(
      { length: numPlayers },
      (_, i) => `playerId${i}`
    );
    const playerNames = Array.from(
      { length: numPlayers },
      (_, i) => `playerName${i}`
    );
    const invalidWords: [string, string][] = [
      ["", "word2"],
      ["word1", ""],
      ["word1", "word1"],
      [" ", " "],
      ["", ""],
    ];

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add players to the game
    playerIds.forEach((playerId, i) => {
      const playerName = playerNames[i];

      gameAddPlayer(gameId, playerId, playerName);
    });

    // start the game
    invalidWords.forEach((words) => {
      const startedGame = gameStart(hostId, gameId, words, 1);

      // expect the game to not have started
      expect(startedGame).toBeNull();
    });
  });

  test("should start game with random words if no words are provided", () => {
    const gameId = "gameId";

    // create a game
    gameCreate(gameId, "hostId", "hostName");

    // add players to the game
    gameAddPlayer(gameId, "playerId1", "playerName1");
    gameAddPlayer(gameId, "playerId2", "playerName2");
    gameAddPlayer(gameId, "playerId3", "playerName3");

    // start the game
    const startedGame = gameStart("hostId", gameId, null, 1);

    if (startedGame === null) {
      fail("gameStart returned null");
    }

    // expect the game to have started
    expect(startedGame).toBeDefined();
    expect(startedGame.gameStarted).toBe(true);

    // expect the game to have random words
    expect(startedGame.words).not.toEqual(["", ""]);
  });

  test("should not be able to start a game with less than 1 undercover", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const numPlayers = 5;
    const playerIds = Array.from(
      { length: numPlayers },
      (_, i) => `playerId${i}`
    );
    const playerNames = Array.from(
      { length: numPlayers },
      (_, i) => `playerName${i}`
    );
    const words: [string, string] = ["word1", "word2"];

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add players to the game
    playerIds.forEach((playerId, i) => {
      const playerName = playerNames[i];

      gameAddPlayer(gameId, playerId, playerName);
    });

    // start the game
    const startedGame = gameStart(hostId, gameId, words, 0);

    // expect the game to not have started
    expect(startedGame).toBeNull();
  });

  test("should not be able to start a game with floor(numPlayers / 2) undercovers or more", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";

    for (let numPlayers = 3; numPlayers <= 10; numPlayers++) {
      const numUndercovers = Math.floor((numPlayers + 1) / 2) + 1;
      const playerIds = Array.from(
        { length: numPlayers },
        (_, i) => `playerId${i}`
      );
      const playerNames = Array.from(
        { length: numPlayers },
        (_, i) => `playerName${i}`
      );
      const words: [string, string] = ["word1", "word2"];

      // create a game
      gameCreate(gameId, hostId, hostName);

      // add players to the game
      playerIds.forEach((playerId, i) => {
        const playerName = playerNames[i];

        gameAddPlayer(gameId, playerId, playerName);
      });

      // start the game
      console.log(numPlayers, numUndercovers);
      const startedGame = gameStart(hostId, gameId, words, numUndercovers);

      // expect the game to not have started
      expect(startedGame).toBeNull();
    }
  });
});

describe("gameVote", () => {
  beforeEach(() => {
    // clear the games and playersInGame maps
    games.clear();
    playersInGame.clear();
  });

  test("should be able to vote for another player", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const playerId = "playerId";
    const playerId2 = "playerId2";

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add two players to the game
    gameAddPlayer(gameId, playerId, "playerName");
    gameAddPlayer(gameId, playerId2, "playerName2");

    // start the game
    gameStart(hostId, gameId, ["word1", "word2"], 1);

    // vote for the player
    const res = gameVote(gameId, playerId, hostId);

    if (res === null) {
      fail("gameVote returned null");
    }

    // destruct response
    const { updatedGame } = res;

    // expect the player to have voted
    const player = updatedGame.players[playerId];
    expect(player.hasVoted).toBe(true);

    // expect the number of votes to be 1
    const voteKeys = Object.keys(updatedGame.votes);
    expect(voteKeys).toHaveLength(1);
  });

  test("should not be able to vote for a player if the game id is non-existent", () => {
    // create a game
    gameCreate("gameId", "hostId", "hostName");

    // add two players to the game
    gameAddPlayer("gameId", "playerId", "playerName");
    gameAddPlayer("gameId", "playerId2", "playerName2");

    // start the game
    gameStart("hostId", "gameId", ["word1", "word2"], 1);

    // vote for a player but with a non-existent game id
    const res = gameVote("invalidGameId", "playerId", "hostId");

    // expect the vote to not be successful
    // expect the game to be null
    expect(res).toBeNull();
  });

  test("should not be able to vote if the game has not started", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const playerId = "playerId";
    const playerName = "playerName";

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add a player to the game
    gameAddPlayer(gameId, playerId, playerName);

    // vote for the player before the game has started
    const res = gameVote(gameId, playerId, hostId);

    // expect the vote to not be successful
    // expect the game to be null
    expect(res).toBeNull();
  });

  test("should not be able to vote for themselves", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const playerId = "playerId";

    // create a game
    gameCreate(gameId, hostId, "hostName");

    // add a player to the game
    gameAddPlayer(gameId, playerId, "playerName");

    // start the game
    gameStart(hostId, gameId, ["word1", "word2"], 1);

    // vote for the player
    const res = gameVote(gameId, playerId, playerId);

    // expect the vote to not be successful
    // expect the game to be null
    expect(res).toBeNull();
  });

  test("should not be able to vote for a player that is not in the game", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const playerId = "playerId";

    // create a game
    gameCreate(gameId, "hostId", "hostName");

    // add a player to the game
    gameAddPlayer(gameId, playerId, "playerName");

    // start the game
    gameStart(hostId, gameId, ["word1", "word2"], 1);

    // vote for a player that is not in the game
    const res = gameVote(gameId, playerId, "idThatDoesNotExist");

    // expect the vote to not be successful
    // expect the game to be null
    expect(res).toBeNull();
  });

  test("should not be able to vote for a player that is eliminated", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const playerId = "playerId";

    // create a game
    gameCreate(gameId, hostId, "hostName");

    // add a player to the game
    gameAddPlayer(gameId, playerId, "playerName");

    // start the game
    gameStart(hostId, gameId, ["word1", "word2"], 1);

    // eliminate the player
    gameEliminatePlayer(gameId, playerId);

    // vote for the player
    const res = gameVote(gameId, hostId, playerId);

    // expect the vote to not be successful
    // expect the game to be null
    expect(res).toBeNull();
  });

  test("should not eliminate a player if there is a tie", () => {
    const gameId = "gameId";

    // create a game
    gameCreate(gameId, "hostId", "hostName");

    // add three players to the game
    gameAddPlayer(gameId, "playerId", "playerName");
    gameAddPlayer(gameId, "playerId2", "playerName2");
    gameAddPlayer(gameId, "playerId3", "playerName3");

    // start the game
    gameStart("hostId", gameId, ["word1", "word2"], 1);

    // vote for the first player
    gameVote(gameId, "hostId", "playerId");
    gameVote(gameId, "playerId2", "playerId");

    // vote for the second player
    gameVote(gameId, "playerId", "playerId2");
    gameVote(gameId, "playerId3", "playerId2");

    // expect the round to be over
    const game = games.get(gameId);
    if (game === undefined) {
      fail("game is undefined");
    }

    expect(game?.message).toBe("there was a tie, no one was eliminated");

    // expect 4 players to still be in the game
    // count players .inGame
    const numPlayersLeftInGame = Object.values(game.players).reduce(
      (acc, curr) => acc + (curr.inGame ? 1 : 0),
      0
    );
    expect(numPlayersLeftInGame).toBe(4);
    expect(game.round).toBe(1);
  });

  test("should eliminate a player if they got more votes than everyone else", () => {
    const gameId = "gameId";

    // create a game
    gameCreate(gameId, "hostId", "hostName");

    // add four players to the game
    gameAddPlayer(gameId, "playerId", "playerName");
    gameAddPlayer(gameId, "playerId2", "playerName2");
    gameAddPlayer(gameId, "playerId3", "playerName3");
    gameAddPlayer(gameId, "playerId4", "playerName4");

    // start the game
    gameStart("hostId", gameId, ["word1", "word2"], 1);

    // vote for the first player
    gameVote(gameId, "hostId", "playerId");
    gameVote(gameId, "playerId2", "playerId");

    // vote for the other players
    gameVote(gameId, "playerId", "playerId2");
    gameVote(gameId, "playerId3", "playerId4");
    gameVote(gameId, "playerId4", "playerId3");

    // expect the round to be over
    const game = games.get(gameId);
    if (game === undefined) {
      fail("game is undefined");
    }

    expect(game?.message).toBe("player playerName was eliminated");

    // expect 4 players to still be in the game
    // count players .inGame
    const numPlayersLeftInGame = Object.values(game.players).reduce(
      (acc, curr) => acc + (curr.inGame ? 1 : 0),
      0
    );
    expect(numPlayersLeftInGame).toBe(4);
    expect(game.round).toBe(1);
  });

  test("should end game when the last undercover is voted out", () => {
    const gameId = "gameId";
    const hostId = "hostId";
    const hostName = "hostName";
    const playerId = "playerId";
    const playerId2 = "playerId2";

    // create a game
    gameCreate(gameId, hostId, hostName);

    // add two players to the game
    gameAddPlayer(gameId, playerId, "playerName");
    gameAddPlayer(gameId, playerId2, "playerName2");

    // start the game
    gameStart(hostId, gameId, ["word1", "word2"], 1);

    // get who is undercover
    let game = games.get(gameId);
    if (game === undefined) {
      fail("game is undefined");
    }

    const undercoverPlayer = Object.entries(game.players).find(
      ([_, player]) => {
        return player.isUndercover;
      }
    );

    if (undercoverPlayer === undefined) {
      fail("no undercover was found");
    }

    const [undercoverId] = undercoverPlayer;

    // get players who are not undercover
    const nonUndercoverPlayers = Object.keys(game.players).filter(
      (playerId) => {
        return playerId !== undercoverId;
      }
    );

    // vote for the undercover
    nonUndercoverPlayers.forEach((playerId) => {
      gameVote(gameId, playerId, undercoverId);
    });

    // let the undercover vote for someone else
    gameVote(gameId, undercoverId, nonUndercoverPlayers[0]);

    // get the game again
    game = games.get(gameId);
    if (game === undefined) {
      fail("game is undefined");
    }

    // expect the game to be over
    expect(game.gameOver).toBe(true);
  });

  test("should end game when there is no longer a majority of non-undercover players", () => {
    const gameId = "gameId";

    // create a game
    gameCreate(gameId, "hostId", "hostName");

    // add three players to the game
    gameAddPlayer(gameId, "playerId", "playerName");
    gameAddPlayer(gameId, "playerId2", "playerName2");
    gameAddPlayer(gameId, "playerId3", "playerName3");

    // start the game
    gameStart("hostId", gameId, ["word1", "word2"], 1);

    // get who is undercover
    let game = games.get(gameId);
    if (game === undefined) {
      fail("game is undefined");
    }

    const undercoverPlayer = Object.entries(game.players).find(
      ([_, player]) => {
        return player.isUndercover;
      }
    );

    if (undercoverPlayer === undefined) {
      fail("no undercover was found");
    }

    const [undercoverId] = undercoverPlayer;

    // get players who are not undercover
    let nonUndercoverPlayers = Object.keys(game.players).filter((playerId) => {
      return playerId !== undercoverId;
    });

    // vote for someone who is not undercover
    let targetId = nonUndercoverPlayers[0];
    gameVote(gameId, undercoverId, targetId);

    nonUndercoverPlayers.forEach((playerId) => {
      if (playerId !== targetId) {
        gameVote(gameId, playerId, targetId);
      } else {
        gameVote(gameId, playerId, undercoverId);
      }
    });

    // expect one player to be eliminated
    game = games.get(gameId);
    if (game === undefined) {
      fail("game is undefined");
    }

    // count players .inGame
    let numPlayersLeftInGame = Object.values(game.players).reduce(
      (acc, curr) => acc + (curr.inGame ? 1 : 0),
      0
    );
    expect(numPlayersLeftInGame).toBe(3);
    expect(game.round).toBe(1);

    // next round
    targetId = nonUndercoverPlayers[1];
    gameVote(gameId, undercoverId, targetId);

    nonUndercoverPlayers.forEach((playerId) => {
      // skip voting if the player is already eliminated
      if (game?.players[playerId].inGame === false) {
        return;
      }

      if (playerId !== targetId) {
        gameVote(gameId, playerId, targetId);
      } else {
        gameVote(gameId, playerId, undercoverId);
      }
    });

    // expect two players to be eliminated
    game = games.get(gameId);
    if (game === undefined) {
      fail("game is undefined");
    }

    // count players .inGame
    numPlayersLeftInGame = Object.values(game.players).reduce(
      (acc, curr) => acc + (curr.inGame ? 1 : 0),
      0
    );
    expect(numPlayersLeftInGame).toBe(2);
    expect(game.round).toBe(2);

    // expect the game to be over
    // the undercover player won because there is no longer a majority of non-undercover players
    expect(game.gameOver).toBe(true);
  });
});
