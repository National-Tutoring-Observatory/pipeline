import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { isProjectOwner } from "~/modules/projects/helpers/projectOwnership";
import type { User } from "~/modules/users/users.types";

export async function isRunOwner({
    user,
    runId,
}: {
    user: User;
    runId: string;
}): Promise<boolean> {
    const documents = getDocumentsAdapter();

    const run = await documents.getDocument({
        collection: 'runs',
        match: { _id: runId },
    }) as { data: { project: string } | null };

    if (!run.data) {
        return false;
    }

    return isProjectOwner({ user, projectId: run.data.project });
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
