import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// local imports
import { getRandomWords, log, shuffleArray } from "./utils.js";
import {
  addPlayerToGame,
  createGame,
  logAllGames,
  games,
  playersInGame,
  logGame,
  removePlayerFromGame,
} from "./game.js";
import { ClientToServerEvents, Game, ServerToClientEvents } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.static("dist/client"));

io.on("connection", (socket) => {
  const clientId = socket.handshake.query.clientId;
  if (!clientId || typeof clientId !== "string") {
    console.log("no client id");
    return;
  }

  log("server", `client connected: ${clientId}`);

  if (playersInGame.has(clientId)) {
    const gameId = playersInGame.get(clientId);
    if (!gameId) {
      console.log("could not find game id");
      return;
    }
    socket.join(gameId);
    const game = games.get(gameId);
    if (!game) {
      console.log("could not find game");
      return;
    }
    socket.emit("game-reconnect-player", game);
  }

  socket.on("disconnect", () => {
    log("server", `client disconnected: ${clientId}`);
  });

  socket.on("game-create", (gameId, hostId, hostName, callback) => {
    const game = createGame(gameId, hostId, hostName);
    if (!game) {
      console.log("could not create game");
      callback(false);
      return;
    }

    callback(true);
    socket.join(gameId);
    io.to(gameId).emit("game-update", game);

    logAllGames();
  });

  socket.on("game-join", (gameId, playerId, playerName, callback) => {
    const game = addPlayerToGame(gameId, playerId, playerName);
    if (!game) {
      console.log("could not join game");
      callback(false);
      return;
    }

    callback(true);
    socket.join(gameId);
    io.to(gameId).emit("game-update", game);

    logAllGames();
  });

  socket.on("game-kick", (gameId, playerId, hostId) => {
    // get game
    const game = games.get(gameId);
    if (!game) {
      console.log("could not find game");
      return;
    }

    // check if host
    if (game.host !== hostId) {
      console.log("only host can kick");
      return;
    }

    // remove player from game
    const updatedGame = removePlayerFromGame(gameId, playerId);

    if (!updatedGame) {
      console.log("failed to kick player", playerId);
      return;
    }

    // kick player from game
    io.to(gameId).emit("game-kick", playerId);

    // update game
    games.set(gameId, updatedGame);
    io.to(gameId).emit("game-update", updatedGame);

    logAllGames();
  });

  socket.on("room-leave", (gameId) => {
    socket.leave(gameId);
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
    let playerIdsInRandomOrder = shuffleArray([...playerIds]);

    // get ids of first numUndercover players
    const undercoverPlayerIds = [];
    for (let i = 0; i < game.numUndercover; i++) {
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
    playerIdsInRandomOrder = shuffleArray([...playerIds]);
    const startPlayer = playerIdsInRandomOrder[0];

    // count expected votes
    const expectedVotes = Object.values(updatedPlayers).reduce(
      (acc, player) => acc + (player.inGame ? 1 : 0),
      0
    );

    const message = `The game has started! ${game.players[startPlayer].name} goes first.`;

    // update game
    const updatedGame: Game = {
      ...game,
      players: updatedPlayers,
      startPlayer,
      words: randomWords,
      gameStarted: true,
      gameOver: false,
      round: 0,
      expectedVotes,
      votes: {},
      message,
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
      const voteCounts = Object.values(updatedVotes).reduce(
        (acc, voteForId) => {
          if (acc[voteForId]) {
            acc[voteForId]++;
          } else {
            acc[voteForId] = 1;
          }
          return acc;
        },
        {} as Record<string, number>
      );
      console.log(voteCounts);

      // check if any player has more than anyone else
      // draws are possible and will result in no one being eliminated
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

      // if there is a player with the most votes, eliminate them
      if (currentMaxPlayerId !== null) {
        updatedPlayers[currentMaxPlayerId] = {
          ...updatedPlayers[currentMaxPlayerId],
          inGame: false,
        };
        const eliminatedPlayerName = updatedPlayers[currentMaxPlayerId].name;
        message = `player ${eliminatedPlayerName} was eliminated`;

        // check if game is over
        const numCommonersInGame = Object.values(updatedPlayers).reduce(
          (acc, player) =>
            acc + (!player.isUndercover && player.inGame ? 1 : 0),
          0
        );
        const numUndercoversInGame = Object.values(updatedPlayers).reduce(
          (acc, player) => acc + (player.isUndercover && player.inGame ? 1 : 0),
          0
        );
        if (numUndercoversInGame === 0) {
          // if there are no undercover players left, the commoners win
          // get ids of commoners players left
          const survivingCommonersPlayerNames = Object.values(updatedPlayers)
            .filter((player) => !player.isUndercover && player.inGame)
            .map((player) => player.name);

          message = `Player ${eliminatedPlayerName} was eliminated! The commoners won! Survivors: ${survivingCommonersPlayerNames.join(
            ", "
          )}`;
          gameOver = true;

          // give wins to commoners
          for (const playerId of Object.keys(updatedPlayers)) {
            if (!updatedPlayers[playerId].isUndercover) {
              updatedPlayers[playerId] = {
                ...updatedPlayers[playerId],
                wins: updatedPlayers[playerId].wins + 1,
              };
            }
          }
        } else if (numCommonersInGame <= numUndercoversInGame) {
          // if there are as many or fewer commoners than undercover players left, the undercover win
          const survivingUndercoverPlayerNames = Object.values(updatedPlayers)
            .filter((player) => player.isUndercover && player.inGame)
            .map((player) => player.name);

          message = `Player ${eliminatedPlayerName} was eliminated! The undercovers won! Survivors: ${survivingUndercoverPlayerNames.join(
            ", "
          )}`;
          gameOver = true;

          // give wins to undercovers
          for (const playerId of Object.keys(updatedPlayers)) {
            if (updatedPlayers[playerId].isUndercover) {
              updatedPlayers[playerId] = {
                ...updatedPlayers[playerId],
                wins: updatedPlayers[playerId].wins + 1,
              };
            }
          }
        }
      } else {
        // if there is a tie, no one is eliminated
        message = "there was a tie, no one was eliminated";
      }

      // count expected votes for next round
      const expectedVotes = Object.values(updatedPlayers).reduce(
        (acc, player) => acc + (player.inGame ? 1 : 0),
        0
      );

      // increment round
      const round = game.round + 1;

      // update game
      const updatedGame: Game = {
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
    const updatedGame: Game = {
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
