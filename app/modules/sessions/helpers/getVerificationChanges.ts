import isEqual from "lodash/isEqual";
import keyBy from "lodash/keyBy";
import pick from "lodash/pick";
import type { AnnotationSchemaItem } from "~/modules/prompts/prompts.types";
import type { Annotation } from "../sessions.types";

function getComparableFields(annotation: Annotation, fieldKeys: string[]) {
  return pick(annotation, fieldKeys);
}

export interface VerificationChanges {
  added: Annotation[];
  removed: Annotation[];
  changed: { before: Annotation; after: Annotation }[];
  unchanged: Annotation[];
}

export default function getVerificationChanges(
  preAnnotations: Annotation[],
  postAnnotations: Annotation[],
  annotationSchema: AnnotationSchemaItem[],
): VerificationChanges {
  const comparableFieldKeys = annotationSchema
    .filter((field) => !field.isSystem)
    .map((field) => field.fieldKey);

  const preById = keyBy(preAnnotations, "_id");
  const postById = keyBy(postAnnotations, "_id");

  const added: Annotation[] = [];
  const removed: Annotation[] = [];
  const changed: { before: Annotation; after: Annotation }[] = [];
  const unchanged: Annotation[] = [];

  for (const post of postAnnotations) {
    const pre = preById[post._id];
    if (!pre) {
      added.push(post);
    } else if (
      isEqual(
        getComparableFields(pre, comparableFieldKeys),
        getComparableFields(post, comparableFieldKeys),
      )
    ) {
      unchanged.push(post);
    } else {
      changed.push({ before: pre, after: post });
    }
  }

  for (const pre of preAnnotations) {
    if (!postById[pre._id]) {
      removed.push(pre);
    }
  }

  return { added, removed, changed, unchanged };
}
