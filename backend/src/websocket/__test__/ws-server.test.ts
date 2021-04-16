import request from "superwstest";
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
  it("connect server with authentication", async (done) => {
    const cookie = await global.signup();
    const ws = await request(server).ws("", { headers: { cookie: cookie } });
    // send pong
    ws.pong();
    ws.close();
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    done();
  });
});
