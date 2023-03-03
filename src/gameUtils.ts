import { Player } from "./types.js";

export const countPlayersInGame = (players: {
  [id: string]: Player;
}): number => {
  // count the number of players with inGame === true

  const playersInGame = Object.values(players).reduce(
    (acc, player) => acc + (player.inGame ? 1 : 0),
    0
  );

  return playersInGame;
};

export const countUndercoversInGame = (players: {
  [id: string]: Player;
}): number => {
  // count the number of players with isUndercover === true and inGame === true

  return Object.values(players).reduce(
    (acc, player) => acc + (player.isUndercover && player.inGame ? 1 : 0),
    0
  );
};

export const countCommonersInGame = (players: {
  [id: string]: Player;
}): number => {
  // count the number of players with isUndercover === false and inGame === true

  return Object.values(players).reduce(
    (acc, player) => acc + (!player.isUndercover && player.inGame ? 1 : 0),
    0
  );
};

export const countVotes = (votes: {
  [id: string]: string;
}): Record<string, number> => {
  // count the number of votes for each player
  // return an object with the player id as the key and the number of votes as the value
  // e.g. { player1Id: 2, player2Id: 1, etc... }

  return Object.values(votes).reduce((acc, voteForId) => {
    if (acc[voteForId]) {
      acc[voteForId]++;
    } else {
      acc[voteForId] = 1;
    }
    return acc;
  }, {} as Record<string, number>);
};

export const getPlayerWithMostVotes = (
  voteCounts: Record<string, number>
): string | null => {
  let currentMax = 0;
  let currentMaxPlayerId: string | null = null;
  for (const [playerId, voteCount] of Object.entries(voteCounts)) {
    if (voteCount > currentMax) {
      currentMax = voteCount;
      currentMaxPlayerId = playerId;
    } else if (voteCount === currentMax) {
      // if there is a tie, no one is eliminated
      currentMaxPlayerId = null;
    }
  }

  return currentMaxPlayerId;
};
