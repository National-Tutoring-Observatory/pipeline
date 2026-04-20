import { beforeEach, describe, expect, it } from "vitest";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { loader } from "../containers/join.route";
import { TeamService } from "../team";
import { TeamInviteService } from "../teamInvites";

async function captureThrow(promise: Promise<unknown>): Promise<Response> {
  try {
    await promise;
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  throw new Error("Expected loader to throw a Response, but it resolved");
}

describe("join.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to signup with EXPIRED_INVITE when the invite is expired", async () => {
    const admin = await UserService.create({ username: "admin", teams: [] });
    const team = await TeamService.create({ name: "T" });
    const invite = await TeamInviteService.create({
      team: team._id,
      name: "Old",
      maxUses: 5,
      createdBy: admin._id,
    });
    // Manually expire
    const mongoose = await import("mongoose");
    await mongoose.default
      .model("TeamInvite")
      .updateOne(
        { _id: invite._id },
        { createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      );

    const response = await captureThrow(
      loader({
        request: new Request(`http://localhost/join/${invite.slug}`),
        params: { slug: invite.slug },
      } as any),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "/signup?error=EXPIRED_INVITE",
    );
  });

  it("redirects to signup with EXPIRED_INVITE when the invite does not exist", async () => {
    const response = await captureThrow(
      loader({
        request: new Request("http://localhost/join/does-not-exist-12345678"),
        params: { slug: "does-not-exist-12345678" },
      } as any),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "/signup?error=EXPIRED_INVITE",
    );
  });

  it("returns an ok loader payload for an active invite", async () => {
    const admin = await UserService.create({ username: "admin", teams: [] });
    const team = await TeamService.create({ name: "T" });
    const invite = await TeamInviteService.create({
      team: team._id,
      name: "Active",
      maxUses: 5,
      createdBy: admin._id,
    });

    const result = (await loader({
      request: new Request(`http://localhost/join/${invite.slug}`),
      params: { slug: invite.slug },
    } as any)) as { ok: boolean; slug: string };

    expect(result.ok).toBe(true);
    expect(result.slug).toBe(invite.slug);
  });
});
