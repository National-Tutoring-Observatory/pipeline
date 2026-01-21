import dayjs from "dayjs";
import loginUser from "test/helpers/loginUser";
import { expect, test } from "vitest";
import { UserService } from "~/modules/users/user";
import { loader } from "../containers/authentication.route.js";

async function readLoaderJson(resp: any) {
  if (!resp) return null;
  if (typeof resp.json === "function") return await resp.json(); // Response
  return resp; // plain object already
}

test("logs in authenticated users", async () => {
  const user = await UserService.create({ username: "test_user" });

  const cookieHeader = await loginUser(user._id);

  // build a Request with the cookie header
  const req = new Request("http://localhost/auth", {
    headers: { cookie: cookieHeader },
  });

  const resp = await loader({ request: req } as any);
  const body = await readLoaderJson(resp);

  const auth = body.authentication.data;

  expect(auth._id).toEqual(user._id);
});

test("logs in before 72h", async () => {
  const user = await UserService.create({ username: "test_user" });

  const cookieHeader = await loginUser(user._id, {
    lastActivity: dayjs().subtract(71, "hour").valueOf(),
  });

  // build a Request with the cookie header
  const req = new Request("http://localhost/auth", {
    headers: { cookie: cookieHeader },
  });

  const resp = await loader({ request: req } as any);
  const body = await readLoaderJson(resp);

  const auth = body.authentication.data;

  expect(auth._id).toEqual(user._id);
});

test("logs out after 72h inactivity", async () => {
  const user = await UserService.create({ username: "test_user" });

  const cookieHeader = await loginUser(user._id, {
    lastActivity: dayjs().subtract(73, "hour").valueOf(),
  });

  const req = new Request("http://localhost/auth", {
    headers: { cookie: cookieHeader },
  });

  const resp = await loader({ request: req } as any);
  const body = await readLoaderJson(resp);
  const auth = body.authentication;

  expect(auth).toEqual({});
});
