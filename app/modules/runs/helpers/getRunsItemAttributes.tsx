import get from "lodash/get";
import { CircleAlert, CircleCheck, Clock, LoaderPinwheel } from "lucide-react";
import { getAnnotationLabel } from "~/modules/annotations/helpers/annotationTypes";
import getDateString from "~/modules/app/helpers/getDateString";
import { getRunModelDisplayName } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";

interface Options {
  runSetId?: string;
}

function getStatusMeta(item: Run) {
  if (item.isRunning) {
    return {
      icon: <LoaderPinwheel className="animate-spin" />,
      text: "Running",
    };
  }
  if (item.hasErrored) {
    return {
      icon: <CircleAlert className="text-destructive" />,
      text: "Errored",
    };
  }
  if (item.isComplete) {
    return {
      icon: <CircleCheck className="text-green-600 dark:text-green-400" />,
      text: "Complete",
    };
  }
  return {
    icon: <Clock className="text-muted-foreground" />,
    text: "Incomplete",
  };
}

export default (item: Run, options?: Options) => {
  const promptName = get(item, "snapshot.prompt.name", "");

  const meta = [
    getStatusMeta(item),
    {
      text: `Annotation type - ${getAnnotationLabel(item.annotationType)}`,
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

  const to = options?.runSetId
    ? `/projects/${item.project}/run-sets/${options.runSetId}/runs/${item._id}`
    : `/projects/${item.project}/runs/${item._id}`;

  return {
    id: item._id,
    title: item.name,
    to,
    meta: meta,
  };
};
