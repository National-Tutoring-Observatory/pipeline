import get from "lodash/get";
import { Users } from "lucide-react";
import getDateString from "~/modules/app/helpers/getDateString";
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
        text: `Created at - ${getDateString(item.createdAt)}`,
      },
    ],
  };
};
