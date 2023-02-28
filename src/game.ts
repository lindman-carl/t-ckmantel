import { Game } from "./types.js";
import { getRandomWords, log, shuffleArray } from "./utils.js";

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

export const gameCreate = (
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
  };

  games.set(gameId, game);

  // add player to playersInGame map
  playersInGame.set(hostId, gameId);
  return game;
};

export const gameAddPlayer = (
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
      hasVoted: false,
    },
  };

  const updatedGame: Game = {
    ...game,
    players: newPlayers,
  };

  // update game in games map
  games.set(game.id, updatedGame);

  // add player to playersInGame map
  playersInGame.set(playerId, gameId);

  log("game", `player ${playerId} added to game ${gameId}`);
  logAllPlayers();

  return updatedGame;
};

export const gameRemovePlayer = (
  gameId: string,
  playerId: string
): Game | null => {
  // remove player from game object by id
  // also remove player from playersInGame map

  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return null;
  }

  // remove player from game
  const newPlayers = { ...game.players };
  delete newPlayers[playerId];
  const updatedGame = { ...game, players: newPlayers };

  // update game in games map
  games.set(game.id, updatedGame);

  // remove player from playersInGame map
  playersInGame.delete(playerId);

  log("game", `player ${playerId} removed from game ${gameId}`);

  return updatedGame;
};

export const gameStart = (
  gameId: string,
  words: [string, string] | null,
  numUndercover: number
): Game | null => {
  // get game
  const game = games.get(gameId);
  if (!game) {
    console.log("could not find game");
    return null;
  }

  // set who is undercover
  // get random order of players
  const playerIds = Object.keys(game.players);
  let playerIdsInRandomOrder = shuffleArray([...playerIds]);

  // get ids of first numUndercover players
  const undercoverPlayerIds = [];
  for (let i = 0; i < numUndercover; i++) {
    undercoverPlayerIds.push(playerIdsInRandomOrder[i]);
  }

  // reset all players to not undercover
  // then set undercover players to undercover
  const updatedPlayers = { ...game.players };
  for (const playerId of playerIds) {
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      isUndercover: false,
    };
  }
  for (const playerId of undercoverPlayerIds) {
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      isUndercover: true,
    };
  }

  // set all players to inGame and not voted
  for (const playerId of playerIds) {
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      inGame: true,
      hasVoted: false,
    };
  }

  // set words
  let wordsToUse;
  if (words !== null) {
    const shuffledWords = shuffleArray([...words]);
    wordsToUse = {
      undercover: shuffledWords[0],
      common: shuffledWords[1],
    };
  } else {
    wordsToUse = getRandomWords();
  }

  // set who is the first player
  // rerandomize player order
  playerIdsInRandomOrder = shuffleArray([...playerIds]);
  const startPlayer = playerIdsInRandomOrder[0];

  const message = `The game has started! ${game.players[startPlayer].name} goes first.`;

  // update game
  const updatedGame: Game = {
    ...game,
    players: updatedPlayers,
    startPlayer,
    words: wordsToUse,
    gameStarted: true,
    gameOver: false,
    round: 0,
    message,
    numUndercover,
  };

  // update games map
  games.set(gameId, updatedGame);

  // return success
  return updatedGame;
};
