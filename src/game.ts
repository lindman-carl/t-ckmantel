import { Game } from "./types.js";
import { log } from "./utils.js";

export const games = new Map<string, Game>();
export const playersInGame = new Map<string, string>();

export const logGame = (gameId: string): void => {
  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return;
  }

  log("game", `${game.id}`);
  log("game", `players:`);
  Object.entries(game.players).forEach(([id, player]) => {
    log("game", `  ${id}: ${JSON.stringify(player)}`);
  });
};

export const logAllPlayers = (): void => {
  log("game", `players:`);
  playersInGame.forEach((gameId, playerId) => {
    log("game", `  ${playerId}: ${gameId}`);
  });
};

export const logAllGames = (): void => {
  games.forEach((game) => {
    logGame(game.id);
  });
};

export const createGame = (
  gameId: string,
  hostId: string,
  hostName: string
): Game => {
  // create a new game with id and default values
  // and add it to the games map

  const game: Game = {
    id: gameId,
    host: hostId,
    players: {
      [hostId]: {
        isUndercover: false,
        inGame: false,
        isHost: true,
        name: hostName,
        wins: 0,
      },
    },
    round: 0,
    gameOver: false,
    gameStarted: false,
    numUndercover: 2,
    words: {
      undercover: "undercover",
      common: "common",
    },
    startPlayer: null,
    votes: {},
    allowVote: false,
    expectedVotes: 0,
    currentVoteCount: 0,
    message: null,
  };

  games.set(gameId, game);

  // add player to playersInGame map
  playersInGame.set(hostId, gameId);
  return game;
};

export const addPlayerToGame = (
  gameId: string,
  playerId: string,
  playerName: string
): Game | null => {
  // add player to game object by id

  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return null;
  }

  // add player to game
  const newPlayers = {
    ...game.players,
    [playerId]: {
      isUndercover: false,
      inGame: false,
      name: playerName,
      wins: 0,
    },
  };
  const updatedGame = { ...game, players: newPlayers };

  // update game in games map
  games.set(game.id, updatedGame);

  // add player to playersInGame map
  playersInGame.set(playerId, gameId);

  log("game", `player ${playerId} added to game ${gameId}`);
  logAllPlayers();

  return updatedGame;
};
