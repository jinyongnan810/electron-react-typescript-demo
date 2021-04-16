import request from "superwstest";
import { server, checkAliveTimer } from "../..";
import { User } from "../../models/user";
import * as types from "../types";
import mongoose from "mongoose";

describe("Websocket Server test", () => {
  beforeAll((done) => {
    server.close();
    clearInterval(checkAliveTimer);
    done();
  });
  beforeEach(async (done) => {
    server.listen(0, "localhost");
    await User.deleteMany({});
    done();
  });
  afterEach(async (done) => {
    server.close(done);
    await User.deleteMany({});
  });
  it("connect server without authentication", async () => {
    await request(server).ws("").expectConnectionError(401);
  });
  it("connect server with authentication: connect successfully", async (done) => {
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
  it("connect server with authentication: transfer offer/answer/candidate", async (done) => {
    // preparations
    const cookie1 = await global.signup("test1@test.com", "test111");
    const cookie2 = await global.signup("test2@test.com", "test222");
    const ws1 = await request(server).ws("", { headers: { cookie: cookie1 } });
    const ws2 = await request(server).ws("", { headers: { cookie: cookie2 } });
    const id1 = (await User.findOne({ email: "test1@test.com" }))!.id;
    const id2 = (await User.findOne({ email: "test2@test.com" }))!.id;
    // send offer from 1 to 2
    const offerData = {
      type: types.TRANSFER_OFFER,
      data: { to: id2, offer: "offer1" },
    };
    ws1.send(JSON.stringify(offerData));
    // send answer from 1 to 2
    const answerData = {
      type: types.TRANSFER_ANSWER,
      data: { to: id2, answer: "answer1" },
    };
    ws1.send(JSON.stringify(answerData));
    // send candidate from 1 to 2
    const candidateData = {
      type: types.TRANSFER_CANDIDATE,
      data: { to: id2, candidate: "candidate1" },
    };
    ws1.send(JSON.stringify(candidateData));

    // confirm receive
    let offerReceived = false,
      answerReceived = false,
      candidateReceived = false;

    ws2.on("message", (msg) => {
      const { type, data } = JSON.parse(msg.toString());
      switch (type) {
        case types.TRANSFER_OFFER:
          expect(data.offer).toEqual("offer1");
          expect(data.id).toEqual(id1);
          offerReceived = true;
          break;
        case types.TRANSFER_ANSWER:
          expect(data.answer).toEqual("answer1");
          expect(data.id).toEqual(id1);
          answerReceived = true;
          break;
        case types.TRANSFER_CANDIDATE:
          expect(data.candidate).toEqual("candidate1");
          expect(data.id).toEqual(id1);
          candidateReceived = true;
          break;
        default:
          fail();
      }
    });

    // wait
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });

    expect(offerReceived).toEqual(true);
    expect(answerReceived).toEqual(true);
    expect(candidateReceived).toEqual(true);
    ws1.close();
    ws2.close();
    // wait
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
    done();
  });
});
