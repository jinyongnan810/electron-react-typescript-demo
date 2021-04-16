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
    /////////////////Offer/////////////////
    // send offer from 1 to 2
    const offerData = {
      type: types.TRANSFER_OFFER,
      data: { to: id2, offer: "offer1" },
    };
    ws1.send(JSON.stringify(offerData));
    // send offer from 1 to 1
    const offerDataToSelf = {
      type: types.TRANSFER_OFFER,
      data: { to: id1, offer: "offer1" },
    };
    ws1.send(JSON.stringify(offerDataToSelf));
    // send offer from 1 to not exist user
    const offerDataToNotExists = {
      type: types.TRANSFER_OFFER,
      data: { to: "xxx", offer: "offer1" },
    };
    ws1.send(JSON.stringify(offerDataToNotExists));

    /////////////////Answer/////////////////
    // send answer from 1 to 2
    const answerData = {
      type: types.TRANSFER_ANSWER,
      data: { to: id2, answer: "answer1" },
    };
    ws1.send(JSON.stringify(answerData));
    // send answer from 1 to 1
    const answerDataToSelf = {
      type: types.TRANSFER_ANSWER,
      data: { to: id1, answer: "answer1" },
    };
    ws1.send(JSON.stringify(answerDataToSelf));
    // send answer from 1 to not exist user
    const answerDataToNotExists = {
      type: types.TRANSFER_ANSWER,
      data: { to: "xxx", answer: "answer1" },
    };
    ws1.send(JSON.stringify(answerDataToNotExists));

    /////////////////Candidate/////////////////
    // send candidate from 1 to 2
    const candidateData = {
      type: types.TRANSFER_CANDIDATE,
      data: { to: id2, candidate: "candidate1" },
    };
    ws1.send(JSON.stringify(candidateData));
    // send candidate from 1 to 1
    const candidateDataToSelf = {
      type: types.TRANSFER_CANDIDATE,
      data: { to: id1, candidate: "candidate1" },
    };
    ws1.send(JSON.stringify(candidateDataToSelf));
    // send candidate from 1 to not exist user
    const candidateDataToNotExists = {
      type: types.TRANSFER_CANDIDATE,
      data: { to: "xxx", candidate: "candidate1" },
    };
    ws1.send(JSON.stringify(candidateDataToNotExists));

    /////////////////Others/////////////////
    // send no recognized messages
    const notRecognizedData = {
      type: "not-exist",
      data: { to: id2 },
    };
    ws1.send(JSON.stringify(notRecognizedData));

    // confirm receive
    let offerReceived = false,
      answerReceived = false,
      candidateReceived = false;
    // user 1 should not receive any messages
    ws1.on("message", (msg) => {
      fail();
    });
    // user 2 should receive the messages
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
  it("connect server with authentication: enter and exit room", async (done) => {
    // preparations
    const email1 = "test1@test.com",
      email2 = "test2@test.com",
      email3 = "test3@test.com";
    const cookie1 = await global.signup(email1, "test111");
    const cookie2 = await global.signup(email2, "test222");
    const cookie3 = await global.signup(email3, "test333");
    const ws1 = await request(server).ws("", { headers: { cookie: cookie1 } });
    const ws2 = await request(server).ws("", { headers: { cookie: cookie2 } });
    const ws3 = await request(server).ws("", { headers: { cookie: cookie3 } });
    const id1 = (await User.findOne({ email: email1 }))!.id;
    const id2 = (await User.findOne({ email: email2 }))!.id;
    const id3 = (await User.findOne({ email: email3 }))!.id;

    /////////////////Confirm Messages/////////////////
    // confirm receive
    const receivedCurrentUserListMsgUser1: {
      id: string;
      email: string;
      status: "idle" | "host" | "guest";
      with: { id: string; email: string; status: "idle" | "host" | "guest" }[];
    }[] = [];
    const receivedCurrentUserListMsgUser2: {
      id: string;
      email: string;
      status: "idle" | "host" | "guest";
      with: { id: string; email: string; status: "idle" | "host" | "guest" }[];
    }[] = [];
    const receivedCurrentUserListMsgUser3: {
      id: string;
      email: string;
      status: "idle" | "host" | "guest";
      with: { id: string; email: string; status: "idle" | "host" | "guest" }[];
    }[] = [];
    const receivedJoinedRoomMsgUser1: { id: string }[] = [];
    const receivedJoinedRoomMsgUser2: { id: string }[] = [];
    const receivedJoinedRoomMsgUser3: { id: string }[] = [];
    const receivedExitedRoomMsgUser1: { id: string }[] = [];
    const receivedExitedRoomMsgUser2: { id: string }[] = [];
    const receivedExitedRoomMsgUser3: { id: string }[] = [];
    // user 1 received msgs
    ws1.on("message", (msg) => {
      const { type, data } = JSON.parse(msg.toString());
      switch (type) {
        case types.I_JOINED_ROOM:
          receivedJoinedRoomMsgUser1.push(data);
          break;
        case types.I_EXITED_ROOM:
          receivedExitedRoomMsgUser1.push(data);
          break;
        case types.CURRENT_USERS:
          receivedCurrentUserListMsgUser1.push(data);
          break;
        default:
          fail();
      }
    });
    // user 2 received msgs
    ws2.on("message", (msg) => {
      const { type, data } = JSON.parse(msg.toString());
      switch (type) {
        case types.I_JOINED_ROOM:
          receivedJoinedRoomMsgUser2.push(data);
          break;
        case types.I_EXITED_ROOM:
          receivedExitedRoomMsgUser2.push(data);
          break;
        case types.CURRENT_USERS:
          receivedCurrentUserListMsgUser2.push(data);
          break;
        default:
          fail();
      }
    });
    // user 3 received msgs
    ws3.on("message", (msg) => {
      const { type, data } = JSON.parse(msg.toString());
      switch (type) {
        case types.I_JOINED_ROOM:
          receivedJoinedRoomMsgUser3.push(data);
          break;
        case types.I_EXITED_ROOM:
          receivedExitedRoomMsgUser3.push(data);
          break;
        case types.CURRENT_USERS:
          receivedCurrentUserListMsgUser3.push(data);
          break;
        default:
          fail();
      }
    });

    /////////////////User 2&3 enter User 1,User 2 leave,User 3 leave/////////////////
    // User 2 enter User 1
    const joinRoomDataUser2 = {
      type: types.JOIN_ROOM,
      data: { to: id1 },
    };
    ws2.send(JSON.stringify(joinRoomDataUser2));
    // User 3 enter User 1
    const joinRoomDataUser3 = {
      type: types.JOIN_ROOM,
      data: { to: id1 },
    };
    ws3.send(JSON.stringify(joinRoomDataUser3));
    // wait
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });

    // User 2 leave
    const leaveRoomDataUser2 = {
      type: types.EXIT_ROOM,
    };

    ws2.send(JSON.stringify(leaveRoomDataUser2));
    // User 3 leave
    const leaveRoomDataUser3 = {
      type: types.EXIT_ROOM,
    };
    ws3.send(JSON.stringify(leaveRoomDataUser3));

    // wait
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    // confirm messages
    // join room msg
    expect(receivedJoinedRoomMsgUser1.length).toEqual(2);
    expect(receivedJoinedRoomMsgUser1[0].id).toEqual(id2);
    expect(receivedJoinedRoomMsgUser1[1].id).toEqual(id3);
    expect(receivedJoinedRoomMsgUser2.length).toEqual(1);
    expect(receivedJoinedRoomMsgUser2[0].id).toEqual(id3);
    expect(receivedJoinedRoomMsgUser3.length).toEqual(0);

    // exit room msg
    expect(receivedExitedRoomMsgUser1.length).toEqual(2);
    expect(receivedExitedRoomMsgUser1[0].id).toEqual(id2);
    expect(receivedExitedRoomMsgUser1[1].id).toEqual(id3);
    expect(receivedExitedRoomMsgUser2.length).toEqual(0);
    expect(receivedExitedRoomMsgUser3.length).toEqual(1);
    expect(receivedExitedRoomMsgUser3[0].id).toEqual(id2);

    // exit room msg
    const expectedCurrentUserListMsgs = [
      [
        {
          id: id1,
          email: email1,
          status: "host",
          with: [{ id: id2, email: email2, status: "guest" }],
        },
        {
          id: id2,
          email: email2,
          status: "guest",
          with: [{ id: id1, email: email1, status: "host" }],
        },
        { id: id3, email: email3, status: "idle", with: [] },
      ],
      [
        {
          id: id1,
          email: email1,
          status: "host",
          with: [
            { id: id2, email: email2, status: "guest" },
            { id: id3, email: email3, status: "guest" },
          ],
        },
        {
          id: id2,
          email: email2,
          status: "guest",
          with: [{ id: id1, email: email1, status: "host" }],
        },
        {
          id: id3,
          email: email3,
          status: "guest",
          with: [{ id: id1, email: email1, status: "host" }],
        },
      ],
      [
        {
          id: id1,
          email: email1,
          status: "host",
          with: [{ id: id3, email: email3, status: "guest" }],
        },
        { id: id2, email: email2, status: "idle", with: [] },
        {
          id: id3,
          email: email3,
          status: "guest",
          with: [{ id: id1, email: email1, status: "host" }],
        },
      ],
      [
        { id: id1, email: email1, status: "idle", with: [] },
        { id: id2, email: email2, status: "idle", with: [] },
        { id: id3, email: email3, status: "idle", with: [] },
      ],
    ];
    expect(receivedCurrentUserListMsgUser1.length).toEqual(4);
    expect(receivedCurrentUserListMsgUser1).toEqual(
      expectedCurrentUserListMsgs
    );
    expect(receivedCurrentUserListMsgUser2.length).toEqual(4);
    expect(receivedCurrentUserListMsgUser2).toEqual(
      expectedCurrentUserListMsgs
    );
    expect(receivedCurrentUserListMsgUser3.length).toEqual(4);
    expect(receivedCurrentUserListMsgUser3).toEqual(
      expectedCurrentUserListMsgs
    );

    // close all
    ws1.close();
    ws2.close();
    ws3.close();
    // wait
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
    done();
  });
});
