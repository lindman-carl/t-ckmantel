import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// local imports
import { log } from "./utils.js";
import {
  gameAddPlayer,
  gameCreate,
  logAllGames,
  games,
  playersInGame,
  logGame,
  gameRemovePlayer,
  gameStart,
  gameVote,
} from "./game.js";
import { ClientToServerEvents, ServerToClientEvents } from "./types.js";

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

  // check if the player is reconnecting to a game
  // by checking if the player is in the playersInGame map
  if (playersInGame.has(clientId)) {
    const gameId = playersInGame.get(clientId);
    if (!gameId) {
      console.log("could not find game id");
      return;
    }
    const game = games.get(gameId);
    if (!game) {
      console.log("could not find game");
      return;
    }
    socket.join(gameId);
    socket.emit("game-reconnect-player", game);
  }

  socket.on("disconnect", () => {
    log("server", `client disconnected: ${clientId}`);
  });

  socket.on("game-create", (gameId, hostId, hostName, callback) => {
    const game = gameCreate(gameId, hostId, hostName);
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
    const game = gameAddPlayer(gameId, playerId, playerName);
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
    const updatedGame = gameRemovePlayer(gameId, playerId);

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

  socket.on("game-start", (startedBy, gameId, words, numUndercover) => {
    const updatedGame = gameStart(startedBy, gameId, words, numUndercover);
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
    const res = gameVote(gameId, playerId, voteForId);
    if (res === null) {
      console.log("could not vote");
      return;
    }

    // emit game update
    if (res.newRound) {
      io.to(gameId).emit("game-round-new");
    }
    io.to(gameId).emit("game-update", res.updatedGame);
  });
});

app.get("/", (_, res) => {
  res.sendFile(path.resolve(__dirname, "client", "index.html"));
});

httpServer.listen(process.env.PORT, () => {
  log("server", `listening on port ${process.env.PORT}`);
});
