import { beforeEach, describe, expect, it } from "vitest";
import { UserService } from "~/modules/users/user";
import sessionStorage from "../../../../sessionStorage";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import requireAuth from "../helpers/requireAuth";

beforeEach(async () => {
  await clearDocumentDB();
});

describe("requireAuth", () => {
  describe("unauthenticated", () => {
    it("throws a redirect to /signup", async () => {
      const req = new Request("http://localhost/projects/123");
      await expect(requireAuth({ request: req })).rejects.toBeInstanceOf(
        Response,
      );
    });

    it("redirects to /signup with no query string", async () => {
      const req = new Request("http://localhost/projects/123");
      let thrown: Response | undefined;
      try {
        await requireAuth({ request: req });
      } catch (e) {
        thrown = e as Response;
      }
      expect(thrown?.status).toBe(302);
      expect(thrown?.headers.get("Location")).toBe("/signup");
    });

    it("stores the pathname in the session as returnTo", async () => {
      const req = new Request("http://localhost/projects/123");
      let thrown: Response | undefined;
      try {
        await requireAuth({ request: req });
      } catch (e) {
        thrown = e as Response;
      }
      const cookie = thrown?.headers.get("Set-Cookie") ?? "";
      const session = await sessionStorage.getSession(cookie);
      expect(session.get("returnTo")).toBe("/projects/123");
    });

    it("stores pathname and query string in the session", async () => {
      const req = new Request(
        "http://localhost/projects/123?searchValue=hello",
      );
      let thrown: Response | undefined;
      try {
        await requireAuth({ request: req });
      } catch (e) {
        thrown = e as Response;
      }
      const cookie = thrown?.headers.get("Set-Cookie") ?? "";
      const session = await sessionStorage.getSession(cookie);
      expect(session.get("returnTo")).toBe("/projects/123?searchValue=hello");
    });

    it("does not store the host in returnTo", async () => {
      const req = new Request("http://evil.com/projects/123");
      let thrown: Response | undefined;
      try {
        await requireAuth({ request: req });
      } catch (e) {
        thrown = e as Response;
      }
      const cookie = thrown?.headers.get("Set-Cookie") ?? "";
      const session = await sessionStorage.getSession(cookie);
      const returnTo = session.get("returnTo") as string;
      expect(returnTo.startsWith("/")).toBe(true);
      expect(returnTo).not.toContain("evil.com");
    });
  });

  describe("authenticated", () => {
    it("returns the user", async () => {
      const user = await UserService.create({ username: "test_user" });
      const cookieHeader = await loginUser(user._id);
      const req = new Request("http://localhost/projects/123", {
        headers: { cookie: cookieHeader },
      });
      const result = await requireAuth({ request: req });
      expect(result._id).toEqual(user._id);
    });
  });
});
