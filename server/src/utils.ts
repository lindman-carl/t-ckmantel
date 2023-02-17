export const log = (from: string, message: string) => {
  const fromPad = `[${from}]`.padEnd(12, " ");

  console.log(`${fromPad}${message}`);
};

export const wordPairsEng = [
  ["aardvark", "ant"],
  ["communist", "capitalist"],
];

export const wordPairs = [
  ["myrslok", "myra"],
  ["katt", "hund"],
  ["kommunist", "kapitalist"],
  ["fidel castro", "donald trump"],
  ["kalle anka", "musse pigg"],
  ["carpe diem", "yolo"],
  ["kaffe", "cola-zero"],
];

export const getRandomWords = (): { common: string; undercover: string } => {
  // get random word pair
  const randomIndex = Math.floor(Math.random() * wordPairs.length);
  const randomWordPair = wordPairs[randomIndex];

  // randomize word order
  const randomWordOrder = Math.random() < 0.5 ? 0 : 1;
  const common = randomWordPair[randomWordOrder];
  const undercover = randomWordPair[1 - randomWordOrder];

  return {
    common,
    undercover,
  };
};
