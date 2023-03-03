export const countPlayersInGame = (players) => {
    // count the number of players with inGame === true
    const playersInGame = Object.values(players).reduce((acc, player) => acc + (player.inGame ? 1 : 0), 0);
    return playersInGame;
};
export const countUndercoversInGame = (players) => {
    // count the number of players with isUndercover === true and inGame === true
    return Object.values(players).reduce((acc, player) => acc + (player.isUndercover && player.inGame ? 1 : 0), 0);
};
export const countCommonersInGame = (players) => {
    // count the number of players with isUndercover === false and inGame === true
    return Object.values(players).reduce((acc, player) => acc + (!player.isUndercover && player.inGame ? 1 : 0), 0);
};
export const countVotes = (votes) => {
    // count the number of votes for each player
    // return an object with the player id as the key and the number of votes as the value
    // e.g. { player1Id: 2, player2Id: 1, etc... }
    return Object.values(votes).reduce((acc, voteForId) => {
        if (acc[voteForId]) {
            acc[voteForId]++;
        }
        else {
            acc[voteForId] = 1;
        }
        return acc;
    }, {});
};
export const getPlayerWithMostVotes = (voteCounts) => {
    let currentMax = 0;
    let currentMaxPlayerId = null;
    for (const [playerId, voteCount] of Object.entries(voteCounts)) {
        if (voteCount > currentMax) {
            currentMax = voteCount;
            currentMaxPlayerId = playerId;
        }
        else if (voteCount === currentMax) {
            // if there is a tie, no one is eliminated
            currentMaxPlayerId = null;
        }
    }
    return currentMaxPlayerId;
};
//# sourceMappingURL=gameUtils.js.map