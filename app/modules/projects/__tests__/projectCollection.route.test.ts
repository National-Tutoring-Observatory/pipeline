import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/projectCollection.route";
import { ProjectService } from "../project";

describe("projectCollection.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("redirects to / when project not found", async () => {
    const user = await UserService.create({ username: 'test_user' });
    const cookieHeader = await loginUser(user._id);
    const fakeProjectId = new Types.ObjectId().toString();
    const fakeCollectionId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request("http://localhost/projects/" + fakeProjectId + "/collections/" + fakeCollectionId, { headers: { cookie: cookieHeader } }),
      params: { projectId: fakeProjectId, collectionId: fakeCollectionId }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when user cannot view project", async () => {
    const owner = await UserService.create({ username: 'owner' });
    const otherUser = await UserService.create({ username: 'other_user' });
    const team = await TeamService.create({ name: 'Private Team' });

    const project = await ProjectService.create({
      name: 'Private Project',
      createdBy: owner._id,
      team: team._id
    });

    const cookieHeader = await loginUser(otherUser._id);
    const fakeCollectionId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id + "/collections/" + fakeCollectionId, { headers: { cookie: cookieHeader } }),
      params: { projectId: project._id, collectionId: fakeCollectionId }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });
})
