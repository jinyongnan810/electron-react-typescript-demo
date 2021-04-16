import request from "superwstest";
import WebSocket from "ws";
import { server, checkAliveTimer } from "../..";

describe("Websocket Server test", () => {
  beforeAll((done) => {
    server.close();
    clearInterval(checkAliveTimer);
    done();
  });
  beforeEach((done) => {
    server.listen(0, "localhost", done);
  });
  afterEach((done) => {
    server.close(done);
  });
  it("connect server without authentication", async () => {
    await request(server).ws("").expectConnectionError(401);
  });
});
