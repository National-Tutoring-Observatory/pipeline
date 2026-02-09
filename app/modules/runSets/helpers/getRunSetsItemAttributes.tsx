import { Zap } from "lucide-react";
import getDateString from "~/modules/app/helpers/getDateString";
import type { RunSet } from "../runSets.types";

export default (item: RunSet) => {
  const runCount = item.runs?.length || 0;

  return {
    id: item._id,
    title: item.name,
    to: `/projects/${item.project}/run-sets/${item._id}`,
    meta: [
      {
        icon: <Zap />,
        text: `${runCount} run${runCount !== 1 ? "s" : ""}`,
      },
      {
        text: `Created at - ${getDateString(item.createdAt)}`,
      },
    ],
  };
};
