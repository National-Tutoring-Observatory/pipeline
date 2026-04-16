import type { ActionFunctionArgs } from "react-router";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import getStorageAdapter from "../helpers/getStorageAdapter";

function extractProjectIdFromUrl(rawUrl: string): string {
  const decoded = decodeURIComponent(decodeURIComponent(rawUrl));
  const parts = decoded.split("/");

  if (parts[0] !== "storage" || !parts[1]) {
    throw new Error("Invalid request path");
  }

  if (parts.some((part) => part === ".." || part === ".")) {
    throw new Error("Invalid request path");
  }

  return parts[1];
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth({ request });

  const { intent, payload } = await request.json();

  if (intent === "REQUEST_STORAGE") {
    const { url } = payload;

    if (!url) {
      throw new Error("Storage URL is required");
    }

    const projectId = extractProjectIdFromUrl(url);
    const project = await ProjectService.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!ProjectAuthorization.canView(user, project)) {
      throw new Error(
        "You do not have permission to access files from this project",
      );
    }

    const storage = getStorageAdapter();
    const requestUrl = await storage.request({ url });
    return { requestUrl };
  }

  return {};
}
