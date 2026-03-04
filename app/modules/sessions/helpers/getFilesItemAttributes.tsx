import getDateString from "~/modules/app/helpers/getDateString";
import type { File } from "~/modules/files/files.types";

export default function getFilesItemAttributes(item: File) {
  return {
    id: item._id,
    title: item.name,
    meta: [
      {
        text: `File type - ${item.fileType}`,
      },
      {
        text: `Created at - ${getDateString(item.createdAt)}`,
      },
    ],
  };
}
