import getDateString from "~/modules/app/helpers/getDateString";
import type { User } from "../users.types";

export default (item: User) => {
  return {
    id: item._id,
    title: item.username || "Unknown User",
    description: "",
    meta: [
      {
        text: item.role || "USER",
      },
      {
        text: `Created ${getDateString(item.createdAt)}`,
      },
    ],
  };
};
