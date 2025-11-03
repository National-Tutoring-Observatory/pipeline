import { redirect } from "react-router";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/queues.route";

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getSessionUser({ request }) as User;
    if (!isSuperAdmin(user)) {
        return redirect('/');
    }
    return redirect("/queues/tasks/active");
}

export default function QueuesRoute() {
    // This component won't actually render since we redirect
    return null;
}
