import { Game } from "./types.js";

export const log = (from: string, message: string) => {
  const fromPad = `[${from}]`.padEnd(12, " ");

  console.log(`${fromPad}${message}`);
};

export const validateWord = (word: string): boolean => {
  // check if word is valid
  if (word.length < 1) {
    return false;
  }

  return true;
};

export const getRandomKeys = (keys: string[], num: number): string[] => {
  // get random keys from array
  const randomKeys = [];

  for (let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * keys.length);
    const randomKey = keys[randomIndex];

    randomKeys.push(randomKey);
  }

  return randomKeys;
};

export const countPlayersInGame = (game: Game): number => {
  // count number of players in game
  const players = Object.values(game.players);
  const numPlayersInGame = players.reduce(
    (acc, player) => acc + (player.inGame ? 1 : 0),
    0
  );

  return numPlayersInGame;
};

export const wordPairs = [
  ["aardvark", "ant"],
  ["communist", "capitalist"],
];
