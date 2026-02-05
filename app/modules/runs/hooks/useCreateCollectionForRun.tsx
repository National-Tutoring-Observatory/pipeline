import { useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import addDialog from "~/modules/dialogs/addDialog";
import CreateCollectionForRunDialog from "~/modules/runs/components/createCollectionForRunDialog";

export function useCreateCollectionForRun({
  projectId,
}: {
  projectId: string;
}) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data || !("success" in fetcher.data)) return;

    if (fetcher.data.intent === "CREATE_COLLECTION") {
      toast.success("Collection created");
      navigate(fetcher.data.data.redirectTo);
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const submitCreateCollection = (name: string, runId: string) => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_COLLECTION",
        payload: { name },
      }),
      {
        method: "POST",
        encType: "application/json",
        action: `/projects/${projectId}/runs/${runId}/add-to-collection`,
      },
    );
  };

  const openCreateCollectionDialog = (runId: string) => {
    addDialog(
      <CreateCollectionForRunDialog
        onCreateCollectionClicked={(name: string) =>
          submitCreateCollection(name, runId)
        }
      />,
    );
  };

  return {
    openCreateCollectionDialog,
    isCreating: fetcher.state !== "idle",
  };
}
