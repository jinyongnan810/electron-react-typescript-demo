import request from "supertest";
import { app } from "../../app";
import { BadRequestError } from "../bad-request-error";
import { CustomError } from "../custom-error";

it("check not found error", async () => {
  const res = await request(app).get("/api/users/not-exist").send().expect(404);
  expect(res.body.errors.length).toEqual(1);
  expect(res.body.errors[0].message).toEqual("The path does not exist.");
});
it("BadRequestError no message", () => {
  const error = new BadRequestError();
  expect(error.message).toEqual("Bad request error occurred.");
});
