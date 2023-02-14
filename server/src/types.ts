export type Game = {
  id: string;
  name: string;
  players: {
    [key: string]: {
      isUndercover: boolean;
      inGame: boolean;
    };
  };
  round: number;
  numUndercover: number;
  words: {
    undercover: string;
    common: string;
  };
};
