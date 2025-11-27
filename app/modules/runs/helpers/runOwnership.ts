import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { isProjectOwner } from "~/modules/projects/helpers/projectOwnership";
import type { User } from "~/modules/users/users.types";
import type { Run } from "../runs.types";

export async function isRunOwner({
    user,
    runId,
}: {
    user: User;
    runId: string;
}): Promise<boolean> {
    const documents = getDocumentsAdapter();

    const run = await documents.getDocument<Run>({
        collection: 'runs',
        match: { _id: runId },
    });

    if (!run.data) {
        return false;
    }

    return isProjectOwner({ user, projectId: (run.data.project as string) });
}

export async function validateRunOwnership({
    user,
    runId,
}: {
    user: User;
    runId: string;
}) {
    if (!(await isRunOwner({ user, runId }))) {
        throw new Error("You do not have permission to access this run.");
    }
}
