import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/documents/documents";
import { UserService } from "~/modules/users/user";
import { TeamService } from "~/modules/teams/team";
import { ProjectService } from "~/modules/projects/project";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/runsList.route";

describe("runsList.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("throws error when project parameter is missing", async () => {
    const user = await UserService.create({ username: 'test_user' });
    const cookieHeader = await loginUser(user._id);

    try {
      await loader({
        request: new Request("http://localhost/runs", { headers: { cookie: cookieHeader } })
      } as any);
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain("Project parameter is required");
    }
  });

  it("returns runs list for authenticated user with valid project", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });
    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request(`http://localhost/runs?project=${project._id.toString()}`, { headers: { cookie: cookieHeader } })
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).runs).toBeDefined();
  });
})
