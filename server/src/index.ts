import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";

// local imports
import { log } from "./utils.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  log("server", `client connected: ${socket.id}`);
});

httpServer.listen(process.env.PORT, () => {
  log("server", `listening on port ${process.env.PORT}`);
});
