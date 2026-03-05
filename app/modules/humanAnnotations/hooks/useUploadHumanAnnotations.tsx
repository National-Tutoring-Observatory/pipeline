import { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import addDialog from "~/modules/dialogs/addDialog";
import UploadHumanAnnotationsDialog from "../components/uploadHumanAnnotationsDialog";
import type { AnnotationCsvMeta } from "../helpers/extractAnnotationCsvMeta";

interface UseUploadHumanAnnotationsOptions {
  runSetId: string;
}

export function useUploadHumanAnnotations({
  runSetId,
}: UseUploadHumanAnnotationsOptions) {
  const uploadFetcher = useFetcher();

  useEffect(() => {
    if (uploadFetcher.state !== "idle") return;
    if (!uploadFetcher.data) return;

    if (uploadFetcher.data.success) {
      toast.success("Human annotations uploaded. Processing has started.");
      addDialog(null);
    } else if (uploadFetcher.data.errors) {
      toast.error(
        uploadFetcher.data.errors.general || "Failed to upload annotations",
      );
    }
  }, [uploadFetcher.state, uploadFetcher.data]);

  const submitUpload = (file: File, meta: AnnotationCsvMeta) => {
    const formData = new FormData();
    formData.append(
      "body",
      JSON.stringify({
        intent: "UPLOAD_HUMAN_CSV",
        payload: {
          headers: meta.headers,
          annotators: meta.annotators,
          sessionIds: meta.sessionIds,
          annotationFields: meta.annotationFields,
        },
      }),
    );
    formData.append("file", file);
    uploadFetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
      action: `/api/humanAnnotations/${runSetId}`,
    });
  };

  const openUploadHumanAnnotationsDialog = () => {
    addDialog(
      <UploadHumanAnnotationsDialog
        runSetId={runSetId}
        onUploadClicked={submitUpload}
      />,
    );
  };

  return {
    openUploadHumanAnnotationsDialog,
    isUploading: uploadFetcher.state !== "idle",
  };
}
