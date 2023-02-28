import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// local imports
import { generateChordData, log } from "./utils.js";
import {
  addPlayerToGame,
  createGame,
  logAllGames,
  games,
  playersInGame,
  logGame,
  removePlayerFromGame,
  gameStart,
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

  socket.on("game-start", (gameId, words, numUndercover) => {
    const updatedGame = gameStart(gameId, words, numUndercover);
    if (!updatedGame) {
      console.log("could not start game");
      return;
    }

    // emit game update
    io.to(gameId).emit("game-update", updatedGame);

    // log game
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
    const currentVotesObject = game.votes[0];
    const updatedVotesObject = { ...currentVotesObject };
    updatedVotesObject[playerId] = voteForId;
    const updatedVotes = [updatedVotesObject, ...game.votes.slice(1)];

    // count votes
    const voteCount = Object.keys(updatedVotesObject).length;

    const expectedVoteCount = Object.values(game.players).reduce(
      (acc, player) => acc + (player.inGame ? 1 : 0),
      0
    );

    console.log("expected vote count", expectedVoteCount);
    console.log("vote count", voteCount);

    const updatedPlayers = {
      ...game.players,
      [playerId]: { ...game.players[playerId], hasVoted: true },
    };
    let message = null;
    let gameOver = false;

    // end round if all votes are in
    if (voteCount === expectedVoteCount) {
      // count votes for each player
      const voteCounts = Object.values(updatedVotesObject).reduce(
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

          // give wins to surviving commoners
          for (const playerId of Object.keys(updatedPlayers)) {
            if (
              !updatedPlayers[playerId].isUndercover &&
              updatedPlayers[playerId].inGame
            ) {
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

          // give wins to surviving undercovers
          for (const playerId of Object.keys(updatedPlayers)) {
            if (
              updatedPlayers[playerId].isUndercover &&
              updatedPlayers[playerId].inGame
            ) {
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
      const updatedGame: Game = {
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

      console.log(updatedVotes);

      // emit game update
      io.to(gameId).emit("game-update", updatedGame);
      io.to(gameId).emit("game-round-new");
      return;
    }

    // update game
    const updatedGame: Game = {
      ...game,
      votes: updatedVotes,
      players: updatedPlayers,
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
