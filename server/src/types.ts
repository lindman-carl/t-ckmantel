export type Game = {
  id: string;
  name: string;
  players: {
    [id: string]: Player;
  };
  round: number;
  numUndercover: number;
  startPlayer: string | null;
  words: {
    undercover: string;
    common: string;
  };
};

export type Player = {
  isUndercover: boolean;
  inGame: boolean;
};
