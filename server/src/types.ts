export type Game = {
  id: string;
  name: string;
  players: string[];
  round: number;
  numUndercover: number;
  words: {
    undercover: string;
    common: string;
  };
};
