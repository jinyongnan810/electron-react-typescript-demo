import { createServer } from "http";
import WebSocket from "ws";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import cookieSesion from "cookie-session";
import * as types from "./websocket/types";
const mongod = new MongoMemoryServer();

import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";
import { extractUser } from "./middlewares/current-user";
interface UserInfo {
  ws: WebSocket;
  email: String;
}
interface MsgType {
  type: String;
  data: Object;
}
const clients: Map<String, UserInfo> = new Map();
const sendToClient = (ws: WebSocket, msg: MsgType) => {
  ws.send(JSON.stringify(msg));
};
const broadcaseClientsStatus = () => {
  // send user lists
  const userList: { id: String; email: String }[] = [];
  clients.forEach((c, key) => {
    userList.push({ id: key, email: c.email });
  });
  clients.forEach((c) => {
    sendToClient(c.ws, { type: types.CURRENT_USERS, data: userList });
  });
};
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
    // accept the client
    (ws as any).isAlive = true;
    clients.set(request.currentUser.id, {
      ws,
      email: request.currentUser.email,
    });
    console.log(`${request.currentUser.id} connected`);
    ws.send("Hello from Server");
    // broadcast current users status
    broadcaseClientsStatus();

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
      (user: UserInfo, key: String, map: Map<String, UserInfo>) => {
        if (!(user.ws as any).isAlive) {
          return user.ws.terminate();
        }
        (user.ws as any).isAlive = false;
        user.ws.ping("");
      }
    );
  }, 2000);
  server.listen(5000, async () => {
    console.log("Backend listening on port 5000.");
  });
};

start();
