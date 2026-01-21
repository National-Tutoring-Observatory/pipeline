import { beforeEach, describe, expect, it } from "vitest";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/queue.route";

describe("queue.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when there is no session cookie", async () => {
    const res = await loader({
      request: new Request("http://localhost/queue/prompts"),
      params: { type: "prompts" },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("requires super admin access", async () => {
    const user = await UserService.create({ username: "regular_user" });
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/queue/prompts", {
        headers: { cookie: cookieHeader },
      }),
      params: { type: "prompts" },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });
});
