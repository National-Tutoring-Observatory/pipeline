import { redirect } from "react-router";

export async function loader({ params }: { params: { type: string } }) {
    const queueType = params.type as string;
    return redirect(`/queues/${queueType}/active`);
}
