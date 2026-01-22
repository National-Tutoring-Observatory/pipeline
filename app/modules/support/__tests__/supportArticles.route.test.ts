import { beforeEach, describe, expect, it } from "vitest";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/supportArticles.route";

describe("supportArticles.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("returns support articles", async () => {
    const user = await UserService.create({ username: "test_user" });
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/support", {
        headers: { cookie: cookieHeader },
      }),
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect(typeof (res as any).count).toBe("number");
    expect(Array.isArray((res as any).data)).toBe(true);
  });
});
