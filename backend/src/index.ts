import { createServer } from "http";
import WebSocket from "ws";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import cookieSesion from "cookie-session";
const mongod = new MongoMemoryServer();

import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";
import { extractUser } from "./middlewares/current-user";
const clients: Map<String, WebSocket> = new Map();
const start = async () => {
  console.log("Backend starting...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY not set.");
  }
  try {
    const uri = await mongod.getUri();
    await mongoose.connect(
      // `mongodb+srv://jinyongnan:${process.env.MONGO_PWD}@cluster0.xk5om.gcp.mongodb.net/electron-full-demo?retryWrites=true&w=majority`,
      uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    console.log("DB connected.");
  } catch (error) {
    console.log(error);
  }
  const server = createServer(app);
  const wss = new WebSocket.Server({ noServer: true });
  wss.on("connection", (ws, request: any) => {
    (ws as any).isAlive = true;
    clients.set(request.currentUser.id, ws);
    console.log(`${request.currentUser.id} connected`);

    ws.send("Hello from Server");
    ws.on("message", (msg) => {
      console.log(msg);
    });
    ws.on("pong", () => {
      (ws as any).isAlive = true;
    });
    ws.on("close", () => {
      console.log(`${request.currentUser.id} closed`);
      clients.delete(request.currentUser.id);
    });
  });
  server.on("upgrade", (request, socket, head) => {
    cookieSesion({
      signed: false, // no encryption
      secure: process.env.NODE_ENV === "production", // only https
    })(request, socket, () => {
      extractUser(request);
      if (!request.currentUser) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }
      wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit("connection", ws, request);
      });
    });
  });
  setInterval(() => {
    clients.forEach(
      (ws: WebSocket, key: String, map: Map<String, WebSocket>) => {
        if (!(ws as any).isAlive) {
          return ws.terminate();
        }
        (ws as any).isAlive = false;
        console.log("ping");
      }
    );
  }, 2000);
  server.listen(5000, async () => {
    console.log("Backend listening on port 5000.");
  });
};

start();
