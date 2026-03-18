import isEqual from "lodash/isEqual";
import keyBy from "lodash/keyBy";
import omit from "lodash/omit";
import type { Annotation } from "../sessions.types";

const IGNORED_KEYS = [
  "_id",
  "identifiedBy",
  "markedAs",
  "votingReason",
  "isSystem",
];

function getComparableFields(annotation: Annotation) {
  return omit(annotation, IGNORED_KEYS);
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
): VerificationChanges {
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
    } else if (isEqual(getComparableFields(pre), getComparableFields(post))) {
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
