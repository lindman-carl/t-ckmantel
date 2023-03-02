import { z } from "zod";
import { generateChordData, getRandomWords, log, shuffleArray, } from "./utils.js";
export const games = new Map();
export const playersInGame = new Map();
export const logGame = (gameId) => {
    // get game from games map
    const game = games.get(gameId);
    if (!game) {
        log("game", `game ${gameId} not found`);
        return;
    }
    log("game", `${game.id}`);
    log("game", `players:`);
    Object.entries(game.players).forEach(([id, player]) => {
        log("game", `  ${id}: ${JSON.stringify(player)}`);
    });
};
export const logAllPlayers = () => {
    log("game", `players:`);
    playersInGame.forEach((gameId, playerId) => {
        log("game", `  ${playerId}: ${gameId}`);
    });
};
export const logAllGames = () => {
    games.forEach((game) => {
        logGame(game.id);
    });
};
export const gameCreate = (gameId, hostId, hostName) => {
    // create a new game with id and default values
    // and add it to the games map
    const trimmedGameId = gameId.trim();
    const trimmedHostName = hostName.trim();
    // validate input with zod
    const gameIdSchema = z
        .string()
        .min(4, { message: "Game id: min 4 characters long" })
        .max(20, { message: "Game id: max 20 charactes long" });
    const playerNameSchema = z
        .string()
        .min(1, { message: "Player name: min 1 character" })
        .max(12, { message: "Player name: max 12 characters" });
    try {
        gameIdSchema.parse(trimmedGameId);
        playerNameSchema.parse(trimmedHostName);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            log("game", err.issues[0].message);
            return null;
        }
    }
    // check if game already exists
    if (games.has(trimmedGameId)) {
        log("game", `game ${trimmedGameId} already exists`);
        return null;
    }
    const game = {
        id: trimmedGameId,
        host: hostId,
        players: {
            [hostId]: {
                isUndercover: false,
                inGame: false,
                isHost: true,
                name: trimmedHostName,
                wins: 0,
                hasVoted: false,
            },
        },
        round: 0,
        gameOver: false,
        gameStarted: false,
        numUndercover: 1,
        words: {
            undercover: "undercover",
            common: "common",
        },
        startPlayer: null,
        votes: [{}],
        allowVote: false,
        message: null,
    };
    games.set(trimmedGameId, game);
    // add player to playersInGame map
    playersInGame.set(hostId, trimmedGameId);
    return game;
};
export const gameAddPlayer = (gameId, playerId, playerName) => {
    // add player to game object by id
    // validate input with zod
    const trimmedPlayerName = playerName.trim();
    const playerNameSchema = z
        .string()
        .min(1, { message: "Player name: min 1 character" })
        .max(12, { message: "Player name: max 12 characters" });
    try {
        playerNameSchema.parse(trimmedPlayerName);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            log("game", err.issues[0].message);
            return null;
        }
    }
    // check if player is already in game
    if (playersInGame.has(playerId)) {
        log("game", `player ${playerId} already in game`);
        return null;
    }
    // check if game exists
    // get game from games map
    const game = games.get(gameId);
    if (!game) {
        log("game", `game ${gameId} not found`);
        return null;
    }
    // check if the game has already started
    if (game.gameStarted) {
        log("game", `game ${gameId} has already started`);
        return null;
    }
    // add player to game
    const newPlayers = {
        ...game.players,
        [playerId]: {
            isUndercover: false,
            inGame: false,
            name: trimmedPlayerName,
            wins: 0,
            hasVoted: false,
        },
    };
    const updatedGame = {
        ...game,
        players: newPlayers,
    };
    // update game in games map
    games.set(game.id, updatedGame);
    // add player to playersInGame map
    playersInGame.set(playerId, gameId);
    log("game", `player ${playerId} added to game ${gameId}`);
    logAllPlayers();
    return updatedGame;
};
export const gameRemovePlayer = (gameId, playerId) => {
    // remove player from game object by id
    // also remove player from playersInGame map
    // get game from games map
    const game = games.get(gameId);
    if (!game) {
        log("game", `game ${gameId} not found`);
        return null;
    }
    // remove player from game
    const newPlayers = { ...game.players };
    delete newPlayers[playerId];
    const updatedGame = { ...game, players: newPlayers };
    // update game in games map
    games.set(game.id, updatedGame);
    // remove player from playersInGame map
    playersInGame.delete(playerId);
    log("game", `player ${playerId} removed from game ${gameId}`);
    return updatedGame;
};
export const gameEliminatePlayer = (gameId, playerId) => {
    // eliminate player from game object by id
    // FOR TESTING ONLY
    // get game from games map
    const game = games.get(gameId);
    if (!game) {
        log("game", `game ${gameId} not found`);
        return null;
    }
    // remove player from game
    const newPlayers = { ...game.players };
    newPlayers[playerId] = {
        ...newPlayers[playerId],
        inGame: false,
    };
    const updatedGame = { ...game, players: newPlayers };
    // update game in games map
    games.set(game.id, updatedGame);
    log("game", `player ${playerId} eliminated from game ${gameId}`);
    return updatedGame;
};
export const gameStart = (startedBy, gameId, words, numUndercover) => {
    // get game
    const game = games.get(gameId);
    if (!game) {
        console.log("could not find game");
        return null;
    }
    // check if the game is started by the host
    if (game.host !== startedBy) {
        console.log("game can only be started by the host");
        return null;
    }
    // check if game is already started
    if (game.gameStarted) {
        console.log("game already started");
        return null;
    }
    // check if there are enough players
    if (Object.keys(game.players).length < 3) {
        console.log("not enough players, need at least 3");
        return null;
    }
    // check for valid words
    if (words) {
        if (words[0] === words[1]) {
            console.log("words cannot be the same");
            return null;
        }
        // validate input with zod
        const wordSchema = z
            .string()
            .min(1, { message: "Word: min 1 character" })
            .max(12, { message: "Word: max 30 characters" });
        try {
            wordSchema.parse(words[0]);
            wordSchema.parse(words[1]);
        }
        catch (err) {
            if (err instanceof z.ZodError) {
                console.log(err.issues[0].message);
                return null;
            }
        }
    }
    // check for valid numUndercover
    // at least 1 is required
    // less than half of players is required
    // validate input with zod
    // ie:
    //    3-4 players: 1 undercover
    //    5-6 players: 1-2 undercover
    //    7-8 players: 1-3 undercover
    // calculate max number of undercovers
    const numPlayers = Object.keys(game.players).length;
    let maxUndercover = 1;
    if (numPlayers % 2 === 0) {
        maxUndercover = numPlayers / 2 - 1;
    }
    else {
        maxUndercover = (numPlayers - 1) / 2;
    }
    const numUndercoverSchema = z
        .number()
        .int({ message: "Number of undercover: must be an integer" })
        .min(1, { message: "Number of undercover: min 1" })
        .max(maxUndercover, {
        message: `Number of undercover: max ${maxUndercover}`,
    });
    try {
        numUndercoverSchema.parse(numUndercover);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            console.log(err.issues[0].message);
            return null;
        }
    }
    // set who is undercover
    // get random order of players
    const playerIds = Object.keys(game.players);
    let playerIdsInRandomOrder = shuffleArray([...playerIds]);
    // get ids of first numUndercover players
    const undercoverPlayerIds = [];
    for (let i = 0; i < numUndercover; i++) {
        undercoverPlayerIds.push(playerIdsInRandomOrder[i]);
    }
    // reset all players to not undercover
    // then set undercover players to undercover
    const updatedPlayers = { ...game.players };
    for (const playerId of playerIds) {
        updatedPlayers[playerId] = {
            ...updatedPlayers[playerId],
            isUndercover: false,
        };
    }
    for (const playerId of undercoverPlayerIds) {
        updatedPlayers[playerId] = {
            ...updatedPlayers[playerId],
            isUndercover: true,
        };
    }
    // set all players to inGame and not voted
    for (const playerId of playerIds) {
        updatedPlayers[playerId] = {
            ...updatedPlayers[playerId],
            inGame: true,
            hasVoted: false,
        };
    }
    // set words
    let wordsToUse;
    if (words !== null) {
        const shuffledWords = shuffleArray([...words]);
        wordsToUse = {
            undercover: shuffledWords[0],
            common: shuffledWords[1],
        };
    }
    else {
        wordsToUse = getRandomWords();
    }
    // set who is the first player
    // rerandomize player order
    playerIdsInRandomOrder = shuffleArray([...playerIds]);
    const startPlayer = playerIdsInRandomOrder[0];
    const message = `The game has started! ${game.players[startPlayer].name} goes first.`;
    // update game
    const updatedGame = {
        ...game,
        players: updatedPlayers,
        startPlayer,
        words: wordsToUse,
        gameStarted: true,
        gameOver: false,
        round: 0,
        message,
        numUndercover,
    };
    // update games map
    games.set(gameId, updatedGame);
    // return success
    return updatedGame;
};
export const gameVote = (gameId, playerId, voteForId) => {
    // handles user voting for a player
    // returns updated game and whether a new round should start
    // the round is over when all players have voted
    // if the round is over, the votes are counted and a player is eliminated if they have more votes than all other players
    // check for voting for self
    if (playerId === voteForId) {
        console.log("cannot vote for self");
        return null;
    }
    // get game
    const game = games.get(gameId);
    if (!game) {
        console.log("could not find game");
        return null;
    }
    // check that the vote target is in the same game
    if (!Object.hasOwn(game.players, voteForId)) {
        console.log("vote target not in game");
        return null;
    }
    // check that the target is not eliminated
    if (!game.players[voteForId].inGame) {
        console.log("vote target is already eliminated");
        return null;
    }
    // update votes
    const currentVotesObject = game.votes[0];
    const updatedVotesObject = { ...currentVotesObject };
    updatedVotesObject[playerId] = voteForId;
    const updatedVotes = [updatedVotesObject, ...game.votes.slice(1)];
    // count votes
    const voteCount = Object.keys(updatedVotesObject).length;
    const expectedVoteCount = Object.values(game.players).reduce((acc, player) => acc + (player.inGame ? 1 : 0), 0);
    const updatedPlayers = {
        ...game.players,
        [playerId]: { ...game.players[playerId], hasVoted: true },
    };
    let message = null;
    let gameOver = false;
    // end round if all votes are in
    if (voteCount === expectedVoteCount) {
        // count votes for each player
        const voteCounts = Object.values(updatedVotesObject).reduce((acc, voteForId) => {
            if (acc[voteForId]) {
                acc[voteForId]++;
            }
            else {
                acc[voteForId] = 1;
            }
            return acc;
        }, {});
        // check if any player has more than anyone else
        // draws are possible and will result in no one being eliminated
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
        // if there is a player with the most votes, eliminate them
        if (currentMaxPlayerId !== null) {
            updatedPlayers[currentMaxPlayerId] = {
                ...updatedPlayers[currentMaxPlayerId],
                inGame: false,
            };
            const eliminatedPlayerName = updatedPlayers[currentMaxPlayerId].name;
            message = `player ${eliminatedPlayerName} was eliminated`;
            // check if game is over
            const numCommonersInGame = Object.values(updatedPlayers).reduce((acc, player) => acc + (!player.isUndercover && player.inGame ? 1 : 0), 0);
            const numUndercoversInGame = Object.values(updatedPlayers).reduce((acc, player) => acc + (player.isUndercover && player.inGame ? 1 : 0), 0);
            if (numUndercoversInGame === 0) {
                // if there are no undercover players left, the commoners win
                // get ids of commoners players left
                const survivingCommonersPlayerNames = Object.values(updatedPlayers)
                    .filter((player) => !player.isUndercover && player.inGame)
                    .map((player) => player.name);
                message = `Player ${eliminatedPlayerName} was eliminated! The commoners won! Survivors: ${survivingCommonersPlayerNames.join(", ")}`;
                gameOver = true;
                // give wins to surviving commoners
                for (const playerId of Object.keys(updatedPlayers)) {
                    if (!updatedPlayers[playerId].isUndercover &&
                        updatedPlayers[playerId].inGame) {
                        updatedPlayers[playerId] = {
                            ...updatedPlayers[playerId],
                            wins: updatedPlayers[playerId].wins + 1,
                        };
                    }
                }
            }
            else if (numCommonersInGame <= numUndercoversInGame) {
                // if there are as many or fewer commoners than undercover players left, the undercover win
                const survivingUndercoverPlayerNames = Object.values(updatedPlayers)
                    .filter((player) => player.isUndercover && player.inGame)
                    .map((player) => player.name);
                message = `Player ${eliminatedPlayerName} was eliminated! The undercovers won! Survivors: ${survivingUndercoverPlayerNames.join(", ")}`;
                gameOver = true;
                // give wins to surviving undercovers
                for (const playerId of Object.keys(updatedPlayers)) {
                    if (updatedPlayers[playerId].isUndercover &&
                        updatedPlayers[playerId].inGame) {
                        updatedPlayers[playerId] = {
                            ...updatedPlayers[playerId],
                            wins: updatedPlayers[playerId].wins + 1,
                        };
                    }
                }
            }
        }
        else {
            // if there is a tie, no one is eliminated
            message = "there was a tie, no one was eliminated";
        }
        // increment round
        const round = game.round + 1;
        // set all players to not have voted
        for (const playerId of Object.keys(updatedPlayers)) {
            updatedPlayers[playerId] = {
                ...updatedPlayers[playerId],
                hasVoted: false,
            };
        }
        // generate a new chord matrix
        const chordData = generateChordData(updatedVotes);
        // new round, make new votes object in the beginning of the votes array
        updatedVotes.unshift({});
        // update game
        const updatedGame = {
            ...game,
            votes: updatedVotes,
            round,
            players: updatedPlayers,
            message,
            gameOver,
            chordData,
        };
        // update games map
        games.set(gameId, updatedGame);
        return { updatedGame, newRound: true };
    }
    // update game
    const updatedGame = {
        ...game,
        votes: updatedVotes,
        players: updatedPlayers,
    };
    // update games map
    games.set(gameId, updatedGame);
    return { updatedGame, newRound: false };
};
//# sourceMappingURL=game.js.map