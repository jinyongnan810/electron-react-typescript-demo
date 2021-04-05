import request from "supertest";
import { mocked } from "ts-jest/utils";
import { app } from "../../app";
import jwt from "jsonwebtoken";
it("test un-expected error", async () => {
  console.log("hello");

  const jwtMocked = jest.spyOn(jwt, "sign");
  jwtMocked.mockImplementation(() => {
    throw new Error("Something failed!");
  });

  const res = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "test123",
    })
    .expect(500);
  expect(mocked(jwt).sign.mock.calls.length).toEqual(1);
  expect(res.body.errors.length).toEqual(1);
  expect(res.body.errors[0].message).toEqual(
    "Unknown error!" + "Something failed!"
  );
});
