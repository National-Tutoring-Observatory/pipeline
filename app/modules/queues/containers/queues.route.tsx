import { useEffect } from "react";
import { redirect, useLoaderData } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import Queues from "../components/queues";
import type { Queue } from "../queues.types";

export async function loader({ request }: any) {
    const documents = getDocumentsAdapter();

    const user = await getSessionUser({ request }) as User;

    if (!user) {
        return redirect('/');
    }

    const queuesData = await documents.getDocuments({
        collection: 'queues',
        match: {},
        sort: { timestamp: -1 }
    }) as { data: Queue[] };

    return {
        queues: queuesData.data || []
    };
}

export default function QueuesRoute() {
    const { queues } = useLoaderData<typeof loader>();

    useEffect(() => {
        updateBreadcrumb([
            { text: 'Queues', link: '/queues' }
        ]);
    }, []);

    return <Queues queues={queues} />;
}
