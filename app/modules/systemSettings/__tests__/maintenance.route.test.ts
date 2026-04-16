import { beforeEach, describe, expect, it } from "vitest";
import { AuditService } from "~/modules/audits/audit";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import expectAuthRequired from "../../../../test/helpers/expectAuthRequired";
import loginUser from "../../../../test/helpers/loginUser";
import { action, loader } from "../containers/maintenance.route";
import { SystemSettingsService } from "../systemSettings";

describe("maintenance.route", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("loader", () => {
    it("redirects when not authenticated", async () => {
      await expectAuthRequired(() =>
        loader({
          request: new Request("http://localhost/admin/maintenance"),
          params: {},
          unstable_pattern: "",
          context: {},
        } as any),
      );
    });

    it("redirects when user is not a super admin", async () => {
      const user = await UserService.create({
        username: "regular_user",
        role: "USER",
      });
      const cookie = await loginUser(user._id);

      const res = (await loader({
        request: new Request("http://localhost/admin/maintenance", {
          headers: { cookie },
        }),
        params: {},
        unstable_pattern: "",
        context: {},
      } as any)) as any;

      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("/");
    });

    it("returns settings for super admin", async () => {
      const user = await UserService.create({
        username: "super_admin",
        role: "SUPER_ADMIN",
      });
      const cookie = await loginUser(user._id);

      const res = (await loader({
        request: new Request("http://localhost/admin/maintenance", {
          headers: { cookie },
        }),
        params: {},
        unstable_pattern: "",
        context: {},
      } as any)) as any;

      expect(res).not.toBeInstanceOf(Response);
      expect(res.settings).toBeDefined();
      expect(res.settings.maintenanceMode).toBe(false);
    });
  });

  describe("action - TOGGLE_MAINTENANCE", () => {
    it("redirects to / when not authenticated", async () => {
      await expectAuthRequired(() =>
        action({
          request: new Request("http://localhost/admin/maintenance", {
            method: "POST",
            body: JSON.stringify({
              intent: "TOGGLE_MAINTENANCE",
              payload: { maintenanceMode: true, maintenanceMessage: "" },
            }),
          }),
          params: {},
          unstable_pattern: "",
          context: {},
        } as any),
      );
    });

    it("returns 403 when user is not a super admin", async () => {
      const user = await UserService.create({
        username: "regular_user",
        role: "USER",
      });
      const cookie = await loginUser(user._id);

      const res = (await action({
        request: new Request("http://localhost/admin/maintenance", {
          method: "POST",
          headers: { cookie },
          body: JSON.stringify({
            intent: "TOGGLE_MAINTENANCE",
            payload: { maintenanceMode: true, maintenanceMessage: "" },
          }),
        }),
        params: {},
        unstable_pattern: "",
        context: {},
      } as any)) as any;

      expect(res.init?.status).toBe(403);
    });

    it("enables maintenance mode", async () => {
      const user = await UserService.create({
        username: "super_admin",
        role: "SUPER_ADMIN",
      });
      const cookie = await loginUser(user._id);

      const res = (await action({
        request: new Request("http://localhost/admin/maintenance", {
          method: "POST",
          headers: { cookie },
          body: JSON.stringify({
            intent: "TOGGLE_MAINTENANCE",
            payload: {
              maintenanceMode: true,
              maintenanceMessage: "Deploying billing",
            },
          }),
        }),
        params: {},
        unstable_pattern: "",
        context: {},
      } as any)) as any;

      expect(res.data?.success).toBe(true);
      expect(res.data?.settings?.maintenanceMode).toBe(true);
      expect(res.data?.settings?.maintenanceMessage).toBe("Deploying billing");

      const settings = await SystemSettingsService.getSettings();
      expect(settings.maintenanceMode).toBe(true);
    });

    it("disables maintenance mode", async () => {
      await SystemSettingsService.update({
        maintenanceMode: true,
        maintenanceMessage: "Deploying billing",
      });

      const user = await UserService.create({
        username: "super_admin",
        role: "SUPER_ADMIN",
      });
      const cookie = await loginUser(user._id);

      const res = (await action({
        request: new Request("http://localhost/admin/maintenance", {
          method: "POST",
          headers: { cookie },
          body: JSON.stringify({
            intent: "TOGGLE_MAINTENANCE",
            payload: { maintenanceMode: false, maintenanceMessage: "" },
          }),
        }),
        params: {},
        unstable_pattern: "",
        context: {},
      } as any)) as any;

      expect(res.data?.success).toBe(true);
      expect(res.data?.settings?.maintenanceMode).toBe(false);

      const settings = await SystemSettingsService.getSettings();
      expect(settings.maintenanceMode).toBe(false);
    });

    it("creates an audit record", async () => {
      const user = await UserService.create({
        username: "super_admin",
        role: "SUPER_ADMIN",
      });
      const cookie = await loginUser(user._id);

      await action({
        request: new Request("http://localhost/admin/maintenance", {
          method: "POST",
          headers: { cookie },
          body: JSON.stringify({
            intent: "TOGGLE_MAINTENANCE",
            payload: {
              maintenanceMode: true,
              maintenanceMessage: "Upgrading",
            },
          }),
        }),
        params: {},
        unstable_pattern: "",
        context: {},
      } as any);

      const audits = await AuditService.find({
        match: { action: "ENABLE_MAINTENANCE" },
      });
      expect(audits).toHaveLength(1);
      expect(audits[0].performedBy).toBe(user._id);
      expect(audits[0].context.maintenanceMessage).toBe("Upgrading");
    });
  });

  describe("action - invalid intent", () => {
    it("returns 400 for unknown intent", async () => {
      const user = await UserService.create({
        username: "super_admin",
        role: "SUPER_ADMIN",
      });
      const cookie = await loginUser(user._id);

      const res = (await action({
        request: new Request("http://localhost/admin/maintenance", {
          method: "POST",
          headers: { cookie },
          body: JSON.stringify({
            intent: "UNKNOWN",
            payload: {},
          }),
        }),
        params: {},
        unstable_pattern: "",
        context: {},
      } as any)) as any;

      expect(res.init?.status).toBe(400);
      expect(res.data?.errors?.general).toBe("Invalid intent");
    });
  });
});
