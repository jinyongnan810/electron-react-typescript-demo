import request from "supertest";
import { app } from "../../app";

beforeEach(async () => {
  // signup
  await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "test",
  });
});

it("normal signout", async () => {
  // sign in
  const signinRes = await request(app).post("/api/users/signin").send({
    email: "test@test.com",
    password: "test",
  });
  // sign out
  const res = await request(app).post("/api/users/signout").send().expect(200);
  expect(res.get("Set-Cookie")).toEqual([
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly",
  ]); // check cookie is set
});

it("signout without signin", async () => {
  // sign out
  const res = await request(app).post("/api/users/signout").send().expect(200);
  expect(res.get("Set-Cookie")).toEqual([
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly",
  ]); // check cookie is set
});
