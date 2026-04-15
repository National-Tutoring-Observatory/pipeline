import { Types } from "mongoose";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import { RunSetService } from "~/modules/runSets/runSet";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action } from "../containers/humanAnnotations.route";

const mockUpload = vi.fn().mockResolvedValue(undefined);

vi.mock("~/modules/storage/helpers/getStorageAdapter", () => ({
  default: () => ({
    upload: mockUpload,
    download: vi.fn(),
    remove: vi.fn(),
    request: vi.fn(),
  }),
}));

vi.mock("~/modules/humanAnnotations/services/analyzeHumanCsv.server", () => ({
  default: vi
    .fn()
    .mockResolvedValue({ missingSessionNames: [], matchedSessions: [] }),
}));

vi.mock("~/modules/humanAnnotations/services/createHumanRun.server", () => ({
  default: vi.fn().mockResolvedValue({ _id: new Types.ObjectId().toString() }),
}));

vi.mock(
  "~/modules/humanAnnotations/services/uploadHumanAnnotations.server",
  () => ({
    default: vi.fn().mockResolvedValue(undefined),
  }),
);

describe("humanAnnotations.route action - UPLOAD_HUMAN_CSV", () => {
  beforeEach(async () => {
    await clearDocumentDB();
    mockUpload.mockClear();
  });

  async function setupAndUpload(filename: string) {
    const team = await TeamService.create({ name: "Team" });
    const user = await UserService.create({
      username: "admin",
      role: "USER",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Project",
      createdBy: user._id,
      team: team._id,
    });
    const runSet = await RunSetService.create({
      name: "RunSet",
      project: project._id,
      annotationType: "PER_UTTERANCE",
    });

    const cookieHeader = await loginUser(user._id);

    const formData = new FormData();
    formData.append(
      "body",
      JSON.stringify({
        intent: "UPLOAD_HUMAN_CSV",
        payload: {
          headers: ["session_name", "annotation"],
          sessionIds: [],
          annotators: ["Annotator A"],
        },
      }),
    );
    formData.append(
      "file",
      new File(["col1,col2\nval1,val2"], filename, { type: "text/csv" }),
    );

    await action({
      request: new Request(
        "http://localhost/api/humanAnnotations/" + runSet._id,
        {
          method: "POST",
          headers: { cookie: cookieHeader },
          body: formData,
        },
      ),
      params: { runSetId: runSet._id },
    } as any);

    return { runSet };
  }

  it("sanitizes path traversal sequences in the uploaded filename", async () => {
    await setupAndUpload("../../.env");

    expect(mockUpload).toHaveBeenCalledOnce();
    const { uploadPath } = mockUpload.mock.calls[0][0];

    expect(path.basename(uploadPath)).toBe(".env");
    expect(uploadPath).not.toContain("..");
    expect(uploadPath).not.toContain("../../");
  });

  it("uses path.basename of the original filename for safe filenames", async () => {
    await setupAndUpload("annotations.csv");

    expect(mockUpload).toHaveBeenCalledOnce();
    const { uploadPath } = mockUpload.mock.calls[0][0];

    expect(path.basename(uploadPath)).toBe("annotations.csv");
    expect(uploadPath).not.toContain("..");
  });
});
