import { Password } from "../../middlewares/services/password";
import { User } from "../user";

it("test user password modified", async () => {
  const user = User.build({ email: "test@test.com", password: "test123" });
  await user.save();
  // change password
  user.password = "test123changed";
  await user.save();
  const res = await Password.compareHash("test123changed", user.password);
  expect(res).toBe(true);
});
it("test user password not modified", async () => {
  const user = User.build({ email: "test@test.com", password: "test123" });
  await user.save();
  // password not changed
  await user.save();
  const res = await Password.compareHash("test123", user.password);
  expect(res).toBe(true);
});
