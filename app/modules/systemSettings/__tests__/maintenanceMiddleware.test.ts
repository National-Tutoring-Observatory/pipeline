import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import maintenanceMiddleware from "../maintenanceMiddleware";
import { SystemSettingsService } from "../systemSettings";

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.set = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

describe("maintenanceMiddleware", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("calls next() when maintenance mode is off", async () => {
    const next = vi.fn();
    const req = { path: "/projects", headers: {} } as any;

    await maintenanceMiddleware(req, createMockRes(), next);

    expect(next).toHaveBeenCalled();
  });

  it("returns 503 for unauthenticated requests when maintenance is on", async () => {
    await SystemSettingsService.update({
      maintenanceMode: true,
      maintenanceMessage: "Down for upgrades",
    });

    const next = vi.fn();
    const res = createMockRes();
    const req = { path: "/projects", headers: {} } as any;

    await maintenanceMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.set).toHaveBeenCalledWith("Retry-After", "300");
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining("Down for upgrades"),
    );
  });

  it("returns 503 for regular users when maintenance is on", async () => {
    await SystemSettingsService.update({ maintenanceMode: true });

    const user = await UserService.create({
      username: "regular_user",
      role: "USER",
    });
    const cookie = await loginUser(user._id);

    const next = vi.fn();
    const res = createMockRes();
    const req = { path: "/projects", headers: { cookie } } as any;

    await maintenanceMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it("allows super admins through when maintenance is on", async () => {
    await SystemSettingsService.update({ maintenanceMode: true });

    const user = await UserService.create({
      username: "super_admin",
      role: "SUPER_ADMIN",
    });
    const cookie = await loginUser(user._id);

    const next = vi.fn();
    const req = { path: "/projects", headers: { cookie } } as any;

    await maintenanceMiddleware(req, createMockRes(), next);

    expect(next).toHaveBeenCalled();
  });

  describe("exempt paths", () => {
    it.each([
      "/assets/logo.svg",
      "/socket.io/connect",
      "/api/sockets",
      "/api/webhooks/stripe",
    ])("allows %s through during maintenance", async (path) => {
      await SystemSettingsService.update({ maintenanceMode: true });

      const next = vi.fn();
      const req = { path, headers: {} } as any;

      await maintenanceMiddleware(req, createMockRes(), next);

      expect(next).toHaveBeenCalled();
    });
  });

  it("fails open when SystemSettingsService throws", async () => {
    vi.spyOn(SystemSettingsService, "getSettings").mockRejectedValueOnce(
      new Error("DB down"),
    );

    const next = vi.fn();
    const req = { path: "/projects", headers: {} } as any;

    await maintenanceMiddleware(req, createMockRes(), next);

    expect(next).toHaveBeenCalled();
  });
});
