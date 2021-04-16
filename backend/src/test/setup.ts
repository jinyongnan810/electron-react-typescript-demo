import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
  namespace NodeJS {
    interface Global {
      signup(): Promise<string[]>;
    }
  }
}

global.signup = async () => {
  const signInRes = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "test",
    })
    .expect(201);
  const cookie = signInRes.get("Set-Cookie");
  return cookie;
};
