import get from "lodash/get";
import { Users } from "lucide-react";
import { getAnnotationLabel } from "~/modules/annotations/helpers/annotationTypes";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Prompt } from "../prompts.types";

export default (item: Prompt) => {
  const teamName = get(item, "team.name", "");

  return {
    id: item._id,
    title: item.name,
    to: `/prompts/${item._id}/${item.productionVersion}`,
    meta: [
      {
        icon: <Users />,
        text: teamName,
      },
      {
        text: `Annotation type - ${getAnnotationLabel(item.annotationType)}`,
      },
      {
        text: `Created at - ${getDateString(item.createdAt)}`,
      },
    ],
  };
};
