import get from "lodash/get";
import { Users } from "lucide-react";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Codebook } from "../codebooks.types";

export default function getCodebooksItemAttributes(item: Codebook) {
  const teamName = get(item, "team.name", "");

  return {
    id: item._id,
    title: item.name,
    description: item.description || "",
    to: `/codebooks/${item._id}/${item.productionVersion}`,
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
}
