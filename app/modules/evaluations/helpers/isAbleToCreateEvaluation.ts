import type { Collection } from "~/modules/collections/collections.types";

export default function isAbleToCreateEvaluation(
  collection: Collection,
): boolean {
  return (collection.runs?.length ?? 0) > 1;
}
