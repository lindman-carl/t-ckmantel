import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
// local imports
import { getRandomWords, log } from "./utils.js";
import { addPlayerToGame, createGame, logAllGames, games, logGame, } from "./game.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});
app.use(express.static("dist/client"));
io.on("connection", (socket) => {
    // log("server", `client connected: ${socket.id}`);
    socket.on("disconnect", () => {
        log("server", `client disconnected: ${socket.id}`);
    });
    socket.on("game-create", (gameId, hostId, hostName) => {
        const game = createGame(gameId, hostId, hostName);
        if (!game) {
            console.log("could not create game");
            return;
        }
        socket.join(gameId);
        io.to(gameId).emit("game-update", game);
        logAllGames();
    });
    socket.on("game-join", (gameId, playerId, playerName) => {
        const game = addPlayerToGame(gameId, playerId, playerName);
        if (!game) {
            console.log("could not join game");
            return;
        }
        socket.join(gameId);
        io.to(gameId).emit("game-update", game);
        logAllGames();
    });
    socket.on("game-start", (gameId) => {
        // get game
        const game = games.get(gameId);
        if (!game) {
            console.log("could not find game");
            return;
        }
        // set who is undercover
        // get random order of players
        const playerIds = Object.keys(game.players);
        let playerIdsInRandomOrder = [...playerIds].sort(() => Math.random() - 0.5);
        // get ids of first numUndercover players
        const undercoverPlayerIds = [];
        for (let i = 0; i < game.numUndercover; i++) {
            undercoverPlayerIds.push(playerIdsInRandomOrder[i]);
        }
        const updatedPlayers = { ...game.players };
        for (const playerId of undercoverPlayerIds) {
            updatedPlayers[playerId] = {
                ...updatedPlayers[playerId],
                isUndercover: true,
            };
        }
        // set all players to inGame
        for (const playerId of playerIds) {
            updatedPlayers[playerId] = {
                ...updatedPlayers[playerId],
                inGame: true,
            };
        }
        // get random words
        const randomWords = getRandomWords();
        // set who is the first player
        // rerandomize player order
        playerIdsInRandomOrder = [...playerIds].sort(() => Math.random() - 0.5);
        const startPlayer = playerIdsInRandomOrder[0];
        // count expected votes
        const expectedVotes = Object.values(updatedPlayers).reduce((acc, player) => acc + (player.inGame ? 1 : 0), 0);
        // update game
        const updatedGame = {
            ...game,
            players: updatedPlayers,
            startPlayer,
            words: randomWords,
            gameStarted: true,
            expectedVotes,
            votes: {},
        };
        // update games map
        games.set(gameId, updatedGame);
        // emit game update
        io.to(gameId).emit("game-update", updatedGame);
        log("game", `game ${gameId} started`);
        logGame(gameId);
    });
    socket.on("game-vote", (gameId, playerId, voteForId) => {
        // get game
        const game = games.get(gameId);
        if (!game) {
            console.log("could not find game");
            return;
        }
        // update votes
        const updatedVotes = { ...game.votes };
        updatedVotes[playerId] = voteForId;
        // count votes
        const voteCount = Object.keys(updatedVotes).length;
        const updatedPlayers = { ...game.players };
        let message = null;
        let gameOver = false;
        // end round if all votes are in
        if (voteCount === game.expectedVotes) {
            // count votes for each player
            const voteCounts = Object.values(updatedVotes).reduce((acc, voteForId) => {
                if (acc[voteForId]) {
                    acc[voteForId]++;
                }
                else {
                    acc[voteForId] = 1;
                }
                return acc;
            }, {});
            console.log(voteCounts);
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
                }
                else if (numCommonersInGame <= numUndercoversInGame) {
                    // if there are as many or fewer commoners than undercover players left, the undercover win
                    const survivingUndercoverPlayerNames = Object.values(updatedPlayers)
                        .filter((player) => player.isUndercover && player.inGame)
                        .map((player) => player.name);
                    message = `Player ${eliminatedPlayerName} was eliminated! The undercovers won! Survivors: ${survivingUndercoverPlayerNames.join(", ")}`;
                    gameOver = true;
                }
            }
            else {
                // if there is a tie, no one is eliminated
                message = "there was a tie, no one was eliminated";
            }
            // count expected votes for next round
            const expectedVotes = Object.values(updatedPlayers).reduce((acc, player) => acc + (player.inGame ? 1 : 0), 0);
            // increment round
            const round = game.round + 1;
            // update game
            const updatedGame = {
                ...game,
                votes: {},
                expectedVotes,
                round,
                players: updatedPlayers,
                message,
                currentVoteCount: 0,
                gameOver,
            };
            // update games map
            games.set(gameId, updatedGame);
            // emit game update
            io.to(gameId).emit("game-update", updatedGame);
            io.to(gameId).emit("game-round-new");
            return;
        }
        // update game
        const updatedGame = {
            ...game,
            votes: updatedVotes,
            currentVoteCount: voteCount,
        };
        // update games map
        games.set(gameId, updatedGame);
        // emit game update
        io.to(gameId).emit("game-update", updatedGame);
    });
});
app.get("/", (_, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
});
httpServer.listen(process.env.PORT, () => {
    log("server", `listening on port ${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map