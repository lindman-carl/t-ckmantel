import { Game } from "./types.js";
import { getRandomKeys, log, validateWord } from "./utils.js";

export const games = new Map<string, Game>();

export const logGame = (gameId: string): void => {
  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return;
  }

  log("game", `game ${game.id} - ${game.name}`);
  log("game", `players: ${game.players}`);
};

export const createGame = (id: string): void => {
  // create a new game with id and default values
  // and add it to the games map

  const game: Game = {
    id,
    name: `game-${id}`,
    players: {},
    round: 0,
    numUndercover: 1,
    words: {
      undercover: "undercover",
      common: "common",
    },
    startPlayer: null,
  };

  games.set(id, game);
};

export const addPlayerToGame = (gameId: string, playerId: string): void => {
  // add player to game object by id

  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return;
  }

  // add player to game
  const newPlayers = {
    ...game.players,
    [playerId]: {
      isUndercover: false,
      inGame: false,
    },
  };
  const updatedGame = { ...game, players: newPlayers };

  // update game in games map
  games.set(game.id, updatedGame);

  log("game", `player ${playerId} added to game ${gameId}`);
};

export const removePlayerFromGame = (
  gameId: string,
  playerId: string
): void => {
  // remove player from game object by id

  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return;
  }

  // remove player from game
  const newPlayers = {
    ...game.players,
  };
  delete newPlayers[playerId];

  const updatedGame = {
    ...game,
    players: newPlayers,
  };

  // update game in games map
  games.set(game.id, updatedGame);

  log("game", `player ${playerId} removed from game ${gameId}`);
};

export const setWords = (
  gameId: string,
  commonWord: string,
  undercoverWord: string
): void => {
  // set the words for the game

  // validate words
  if (!validateWord(commonWord) || !validateWord(undercoverWord)) {
    log("game", `invalid words`);
    return;
  }

  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return;
  }

  // set words
  const updatedWords = {
    common: commonWord,
    undercover: undercoverWord,
  };
  const updatedGame = {
    ...game,
    words: updatedWords,
  };

  // update game in games map
  games.set(game.id, updatedGame);
};
