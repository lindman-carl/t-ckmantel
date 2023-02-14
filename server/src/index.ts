import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";

// local imports
import { log } from "./utils.js";
import {
  createGame,
  addPlayerToGame,
  removePlayerFromGame,
  logGame,
} from "./game.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// create game
createGame("0");

io.on("connection", (socket) => {
  log("server", `client connected: ${socket.id}`);

  // add client (player) to game
  addPlayerToGame("0", socket.id);
  logGame("0");

  socket.on("disconnect", () => {
    log("server", `client disconnected: ${socket.id}`);

    // remove client (player) from game
    removePlayerFromGame("0", socket.id);
    logGame("0");
  });
});

httpServer.listen(process.env.PORT, () => {
  log("server", `listening on port ${process.env.PORT}`);
});
