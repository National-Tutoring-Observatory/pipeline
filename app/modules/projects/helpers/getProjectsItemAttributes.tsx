import dayjs from "dayjs";
import get from "lodash/get";
import { Users } from "lucide-react";
import type { Project } from "../projects.types";

export default (item: Project) => {
  const teamName = get(item, "team.name", "");

  return {
    id: item._id,
    title: item.name,
    to: `/projects/${item._id}`,
    meta: [
      {
        icon: <Users />,
        text: teamName,
      },
      {
        text: `Created at - ${dayjs(item.createdAt).format("ddd, MMM D, YYYY - h:mm A")}`,
      },
    ],
  };
};
