import { readFileSync } from "fs";

import { dirname, join } from "path";
import { fileURLToPath } from "url";

type promptName =
  | "annotatePerSession"
  | "annotatePerUtterance"
  | "verifyPerSession"
  | "verifyPerUtterance"
  | "adjudicatePerSession"
  | "adjudicatePerUtterance";

export default function getPromptText(promptName: promptName) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const annotationPerSessionPrompts = readFileSync(
    join(__dirname, `../prompts/${promptName}.prompt.md`),
    "utf-8",
  );

  return annotationPerSessionPrompts;
}
