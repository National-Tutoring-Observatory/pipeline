import get from "lodash/get";
import { BadgeCheck } from "lucide-react";
import { getAnnotationLabel } from "~/modules/annotations/helpers/annotationTypes";
import getDateString from "~/modules/app/helpers/getDateString";
import { getRunModelDisplayName } from "~/modules/runs/helpers/runModel";
import {
  STATUS_META,
  getRunStatusKey,
} from "~/modules/runs/helpers/statusMeta";
import type { Run } from "~/modules/runs/runs.types";

interface Options {
  runSetId?: string;
  hasRunVerification?: boolean;
}

export default function getRunsItemAttributes(item: Run, options?: Options) {
  const promptName = get(item, "snapshot.prompt.name", "");

  const meta = [
    STATUS_META[getRunStatusKey(item)],
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

  if (options?.hasRunVerification && item.shouldRunVerification) {
    meta.push({
      icon: <BadgeCheck className="text-green-600 dark:text-green-400" />,
      text: "Verified",
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
}
