import get from "lodash/get";
import { getAnnotationLabel } from "~/modules/annotations/helpers/annotationTypes";
import getDateString from "~/modules/app/helpers/getDateString";
import { getRunModelDisplayName } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";

interface Options {
  collectionId?: string;
}

export default (item: Run, options?: Options) => {
  const promptName = get(item, "snapshot.prompt.name", "");

  const meta = [
    {
      text: `Annotation type - ${getAnnotationLabel(item.annotationType)}`,
    },
    {
      text: `Status - ${item.isComplete ? "Complete" : "Incomplete"}`,
    },
  ];

  if (item.isComplete) {
    const modelName = getRunModelDisplayName(item);
    meta.push({
      text: `Prompt - ${promptName}`,
    });
    meta.push({
      text: `Model - ${modelName}`,
    });
  }

  meta.push({
    text: `Created at - ${getDateString(item.createdAt)}`,
  });

  const to = options?.collectionId
    ? `/projects/${item.project}/collections/${options.collectionId}/runs/${item._id}`
    : `/projects/${item.project}/runs/${item._id}`;

  return {
    id: item._id,
    title: item.name,
    to,
    meta: meta,
  };
};
