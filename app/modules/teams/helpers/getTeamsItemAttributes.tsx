import getDateString from "~/modules/app/helpers/getDateString";
import type { Team } from "../teams.types";

export default function getTeamsItemAttributes(
  item: Team,
  balance: number | undefined,
) {
  return {
    id: item._id,
    title: item.name,
    to: `/teams/${item._id}/users`,
    meta: [
      { text: `Created at - ${getDateString(item.createdAt)}` },
      ...(balance !== undefined
        ? [{ text: `Balance: $${balance.toFixed(2)}` }]
        : []),
    ],
  };
}
