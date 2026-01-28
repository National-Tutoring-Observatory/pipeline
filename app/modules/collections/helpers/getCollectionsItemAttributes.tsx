import { Zap } from "lucide-react";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Collection } from "../collections.types";

export default (item: Collection) => {
  const runCount = item.runs?.length || 0;

  return {
    id: item._id,
    title: item.name,
    to: `/projects/${item.project}/collections/${item._id}`,
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
