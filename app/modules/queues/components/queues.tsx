import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import dayjs from 'dayjs';
import map from 'lodash/map';
import type { Queue } from "../queues.types";

interface QueuesProps {
    queues: Queue[];
}

const getStateBadgeVariant = (state: Queue['state']) => {
    switch (state) {
        case 'wait': return 'secondary';
        case 'active': return 'default';
        case 'completed': return 'outline';
        case 'failed': return 'destructive';
        default: return 'secondary';
    }
}

export default function Queues({
    queues
}: QueuesProps) {
    return (
        <div className="max-w-6xl p-8">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
                Queues
            </h1>
            {(queues.length === 0) && (
                <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
                    No queue jobs found
                </div>
            )}
            {(queues.length > 0) && (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Name</TableHead>
                                <TableHead className="w-[120px]">Queue</TableHead>
                                <TableHead className="w-[100px]">State</TableHead>
                                <TableHead className="w-[100px]">Attempts</TableHead>
                                <TableHead className="w-[180px]">Processed On</TableHead>
                                <TableHead className="w-[180px]">Finished On</TableHead>
                                <TableHead>Failed Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {map(queues, (queue) => {
                                return (
                                    <TableRow key={queue._id}>
                                        <TableCell className="font-medium">
                                            {queue.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{queue.queue}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStateBadgeVariant(queue.state)}>
                                                {queue.state}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {queue.attemptsMade}/3
                                        </TableCell>
                                        <TableCell>
                                            {queue.processedOn ? dayjs(queue.processedOn).format('MMM D, YYYY - h:mm A') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {queue.finishedOn ? dayjs(queue.finishedOn).format('MMM D, YYYY - h:mm A') : '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {queue.failedReason || '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
