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

export const wordPairs = [
  ["aardvark", "ant"],
  ["communist", "capitalist"],
];
