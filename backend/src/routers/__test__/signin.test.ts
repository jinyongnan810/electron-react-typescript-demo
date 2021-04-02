import request from "supertest";
import { app } from "../../app";

beforeEach(async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "test",
    })
    .expect(201);
});

it("normal signin", async () => {
  const res = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "test",
    })
    .expect(200);
  expect(res.get("Set-Cookie")).toBeDefined(); // check cookie is set
  expect(res.body.email).toEqual("test@test.com");
  expect(res.body.id).toBeTruthy();
});

it("signin with not existing email", async () => {
  const res = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test2@test.com",
      password: "test",
    })
    .expect(400);
  expect(res.get("Set-Cookie")).toBeUndefined();
});

it("signin with wrong password", async () => {
  const res = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "test1",
    })
    .expect(400);
  expect(res.get("Set-Cookie")).toBeUndefined();
});
it("empty request", async () => {
  const res1 = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
    })
    .expect(400);
  expect(res1.body).toHaveProperty("errors");
  expect(res1.body.errors).toHaveLength(1);
  expect(res1.body.errors[0]["field"]).toEqual("password");
  const res2 = await request(app)
    .post("/api/users/signin")
    .send({
      password: "test",
    })
    .expect(400);
  expect(res2.body).toHaveProperty("errors");
  expect(res2.body.errors).toHaveLength(1);
  expect(res2.body.errors[0]["field"]).toEqual("email");
});
