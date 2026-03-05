import getDateString from "~/modules/app/helpers/getDateString";
import type { User } from "../users.types";

export default function getUserManagementItemAttributes(item: User) {
  return {
    id: item._id,
    title: item.name || item.username || "Unknown User",
    description: [item.email, item.username].filter(Boolean).join(" - "),
    meta: [
      {
        text: item.role || "USER",
      },
      {
        text: `Created ${getDateString(item.createdAt)}`,
      },
    ],
  };
}
