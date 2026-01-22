import { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import addDialog from "~/modules/dialogs/addDialog";
import DeleteProjectDialog from "~/modules/projects/components/deleteProjectDialog";
import EditProjectDialog from "~/modules/projects/components/editProjectDialog";
import type { Project } from "~/modules/projects/projects.types";

interface UseProjectActionsOptions {
  onEditSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useProjectActions({
  onEditSuccess,
  onDeleteSuccess,
}: UseProjectActionsOptions = {}) {
  const editFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  const actionUrl = "/api/projects";

  useEffect(() => {
    if (editFetcher.state === "idle" && editFetcher.data) {
      if (
        editFetcher.data.success &&
        editFetcher.data.intent === "UPDATE_PROJECT"
      ) {
        toast.success("Project updated");
        addDialog(null);
        onEditSuccess?.();
      } else if (editFetcher.data.errors) {
        toast.error(editFetcher.data.errors.general || "An error occurred");
      }
    }
  }, [editFetcher.state, editFetcher.data]);

  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data) {
      if (
        deleteFetcher.data.success &&
        deleteFetcher.data.intent === "DELETE_PROJECT"
      ) {
        toast.success("Project deleted");
        addDialog(null);
        onDeleteSuccess?.();
      } else if (deleteFetcher.data.errors) {
        toast.error(deleteFetcher.data.errors.general || "An error occurred");
      }
    }
  }, [deleteFetcher.state, deleteFetcher.data]);

  const submitEditProject = (project: Project) => {
    editFetcher.submit(
      JSON.stringify({
        intent: "UPDATE_PROJECT",
        entityId: project._id,
        payload: { name: project.name },
      }),
      { method: "PUT", encType: "application/json", action: actionUrl },
    );
  };

  const submitDeleteProject = (projectId: string) => {
    deleteFetcher.submit(
      JSON.stringify({ intent: "DELETE_PROJECT", entityId: projectId }),
      { method: "DELETE", encType: "application/json", action: actionUrl },
    );
  };

  const openEditProjectDialog = (project: Project) => {
    addDialog(
      <EditProjectDialog
        project={project}
        onEditProjectClicked={submitEditProject}
        isSubmitting={editFetcher.state === "submitting"}
      />,
    );
  };

  const openDeleteProjectDialog = (project: Project) => {
    addDialog(
      <DeleteProjectDialog
        project={project}
        onDeleteProjectClicked={submitDeleteProject}
      />,
    );
  };

  return {
    openEditProjectDialog,
    openDeleteProjectDialog,
    isEditing: editFetcher.state !== "idle",
    isDeleting: deleteFetcher.state !== "idle",
  };
}
