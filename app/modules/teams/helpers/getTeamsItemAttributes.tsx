import getDateString from "~/modules/app/helpers/getDateString";
import type { Team } from "../teams.types";

export default (item: Team) => {
  return {
    id: item._id,
    title: item.name,
    to: `/teams/${item._id}/users`,
    meta: [
      {
        text: `Created at - ${getDateString(item.createdAt)}`,
      },
    ],
  };
};
