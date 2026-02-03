import { Play } from "lucide-react";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Evaluation } from "~/modules/evaluations/evaluations.types";

export default (item: Evaluation) => {
  const runCount = item.runs?.length || 0;

  return {
    id: item._id,
    title: item.name,
    meta: [
      {
        icon: <Play />,
        text: `${runCount} run${runCount !== 1 ? "s" : ""}`,
      },
      {
        text: `Created ${getDateString(item.createdAt)}`,
      },
    ],
  };
};
