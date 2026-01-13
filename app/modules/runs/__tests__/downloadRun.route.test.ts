import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/documents/documents";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/downloadRun.route";

describe("downloadRun.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("redirects to / when there is no session cookie", async () => {
    const fakeRunId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request("http://localhost/runs/" + fakeRunId + "/download"),
      params: { runId: fakeRunId }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns error when run not found", async () => {
    const user = await UserService.create({ username: 'test_user' });
    const cookieHeader = await loginUser(user._id);
    const fakeRunId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request("http://localhost/runs/" + fakeRunId + "/download", { headers: { cookie: cookieHeader } }),
      params: { runId: fakeRunId }
    } as any);

    expect(res).toBeInstanceOf(Response);
  });
})
