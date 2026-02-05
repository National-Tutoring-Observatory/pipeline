import type { Project } from "~/modules/projects/projects.types";

export default (project: Project) => {
  const actions = [];

  if (project.hasErrored && !project.isConvertingFiles) {
    actions.push({
      action: "RE_RUN",
      text: "Re-run errored",
    });
  }

  return actions;
};
