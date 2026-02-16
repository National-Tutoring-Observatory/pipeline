import getDateString from "~/modules/app/helpers/getDateString";
import {
  STATUS_META,
  getRunSessionStatusKey,
} from "~/modules/runs/helpers/statusMeta";
import type { RunSession } from "~/modules/runs/runs.types";

interface Options {
  projectId: string;
  runId: string;
  runSetId?: string;
}

export default function getRunSessionsItemAttributes(
  item: RunSession,
  options: Options,
) {
  const statusMeta = STATUS_META[getRunSessionStatusKey(item.status)];

  const meta: { text: string; icon?: React.ReactElement }[] = [statusMeta];

  if (item.status !== "NOT_STARTED" && item.startedAt) {
    meta.push({ text: `Started - ${getDateString(item.startedAt)}` });
  }
  if (item.status === "DONE" && item.finishedAt) {
    meta.push({ text: `Finished - ${getDateString(item.finishedAt)}` });
  }
  if (item.fileType) {
    meta.push({ text: `File type - ${item.fileType}` });
  }

  const to =
    item.status === "DONE"
      ? options.runSetId
        ? `/projects/${options.projectId}/run-sets/${options.runSetId}/runs/${options.runId}/sessions/${item.sessionId}`
        : `/projects/${options.projectId}/runs/${options.runId}/sessions/${item.sessionId}`
      : undefined;

  return {
    id: item.sessionId,
    title: item.name,
    description:
      item.status === "ERRORED" && item.error ? item.error : undefined,
    to,
    meta,
  };
}
