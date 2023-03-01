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
  votes: { [id: string]: string }[];
  allowVote: boolean;
  message: string | null;
  chordData?: { source: string; target: string; value: number }[];
};

export type Player = {
  isUndercover: boolean;
  inGame: boolean;
  isHost?: boolean;
  name: string;
  wins: number;
  hasVoted: boolean;
};

export interface ServerToClientEvents {
  "game-update": (game: Game) => void;
  "game-round-new": () => void;
  "game-reconnect-player": (game: Game) => void;
  "game-kick": (playerId: string) => void;
}

export interface ClientToServerEvents {
  "game-create": (
    gameId: string,
    hostId: string,
    hostName: string,
    callback: (success: boolean) => void
  ) => void;
  "game-join": (
    gameId: string,
    playerId: string,
    playerName: string,
    callback: (success: boolean) => void
  ) => void;
  "game-kick": (gameId: string, playerId: string, hostId: string) => void;
  "game-start": (
    startedBy: string,
    gameId: string,
    words: [string, string] | null,
    numUndercover: number
  ) => void;
  "game-vote": (gameId: string, playerId: string, voteForId: string) => void;
  "room-leave": (gameId: string) => void;
}
