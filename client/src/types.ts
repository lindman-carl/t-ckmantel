export type Game = {
  id: string;
  host: string;
  players: {
    [id: string]: Player;
  };
  gameOver: boolean;
  gameStarted: boolean;
  round: number;
  numUndercover: number;
  startPlayer: string | null;
  words: {
    undercover: string;
    common: string;
  };
  votes: {
    [id: string]: string;
  };
  expectedVotes: number;
  currentVoteCount: number;
  allowVote: boolean;
  message: string | null;
};

export type Player = {
  isUndercover: boolean;
  inGame: boolean;
  isHost?: boolean;
  name: string;
  wins: number;
};

export interface ServerToClientEvents {
  "game-update": (game: Game) => void;
  "game-round-new": () => void;
}

export interface ClientToServerEvents {
  "game-create": (gameId: string, hostId: string, hostName: string) => void;
  "game-join": (gameId: string, playerId: string, playerName: string) => void;
  "game-leave": (gameId: string, playerId: string) => void;
  "game-start": (gameId: string) => void;
  "game-vote": (gameId: string, playerId: string, voteForId: string) => void;
}
