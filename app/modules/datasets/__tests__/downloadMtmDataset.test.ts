import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import expectAuthRequired from "../../../../test/helpers/expectAuthRequired";
import loginUser from "../../../../test/helpers/loginUser";
import { action } from "../containers/downloadMtmDataset.route";

vi.mock("~/modules/storage/helpers/getStorageAdapter", () => ({
  default: () => ({
    download: vi.fn().mockResolvedValue("/tmp/fake-latest.json"),
    request: vi.fn().mockResolvedValue("https://example.com/presigned-url"),
  }),
}));

vi.mock("fs-extra", () => ({
  default: {
    readJSON: vi.fn().mockResolvedValue({ version: 1 }),
  },
}));

describe("downloadMtmDataset.route action", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when not authenticated", async () => {
    const request = new Request("http://localhost/api/downloadMtmDataset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "REQUEST_MTM_DOWNLOAD" }),
    });

    await expectAuthRequired(() => action({ request }));
  });

  it("throws when agreed is not true", async () => {
    const user = await UserService.create({ username: "test_user" });
    const cookieHeader = await loginUser(user._id);

    const request = new Request("http://localhost/api/downloadMtmDataset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({ intent: "REQUEST_MTM_DOWNLOAD", agreed: false }),
    });

    await expect(action({ request })).rejects.toThrow(
      "Data-use agreement must be accepted",
    );
  });

  it("returns downloadUrl for REQUEST_MTM_DOWNLOAD intent when agreed", async () => {
    const user = await UserService.create({ username: "test_user" });
    const cookieHeader = await loginUser(user._id);

    const request = new Request("http://localhost/api/downloadMtmDataset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({ intent: "REQUEST_MTM_DOWNLOAD", agreed: true }),
    });

    const res = await action({ request });

    expect(res).toHaveProperty("downloadUrl");
    expect((res as any).downloadUrl).toBe("https://example.com/presigned-url");
  });

  it("returns empty object for unknown intent", async () => {
    const user = await UserService.create({ username: "test_user" });
    const cookieHeader = await loginUser(user._id);

    const request = new Request("http://localhost/api/downloadMtmDataset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({ intent: "UNKNOWN" }),
    });

    const res = await action({ request });

    expect(res).toEqual({});
  });
});
