import each from "lodash/each";
import extend from "lodash/extend";

const ACCEPTS = {
  CSV: {
    "txt/csv": [".csv"],
  },
  JSON: {
    "application/json": [".json"],
  },
  JSONL: {
    "application/jsonl": [".jsonl"],
  },
  VTT: {
    "text/vtt": [".vtt"],
  },
};
export default function getFileUploadAccepts(
  fileTypes: Array<keyof typeof ACCEPTS>,
) {
  const accepts = {};
  each(fileTypes, (fileType) => {
    extend(accepts, ACCEPTS[fileType]);
  });
  return accepts;
}
