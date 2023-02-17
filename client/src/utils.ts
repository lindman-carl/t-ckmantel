const animals: string[] = [
  "hippo",
  "horse",
  "dog",
  "porcupine",
  "flamingo",
  "seal",
  "deer",
  "cat",
  "lynx",
  "bear",
  "tiger",
  "panther",
];

const colors: string[] = [
  "green",
  "red",
  "blue",
  "pink",
  "yellow",
  "purple",
  "indigo",
  "orange",
  "brown",
  "gray",
  "turqoise",
  "magenta",
];

export const getRandomGameId = () => {
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomInt = Math.floor(Math.random() * 1000);

  return `${randomColor}${randomAnimal}${randomInt}`;
};
