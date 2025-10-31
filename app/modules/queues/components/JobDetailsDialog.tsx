import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import dayjs from 'dayjs';

interface Job {
    id: string;
    name: string;
    createdAt?: string;
    status?: string;
}

interface JobDetailsDialogProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (job: Job) => void;
}

export default function JobDetailsDialog({ job, isOpen, onClose, onDelete }: JobDetailsDialogProps) {
    if (!job) return null;

    const handleDelete = () => {
        onDelete(job);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Job Details</DialogTitle>
                    <DialogDescription>
                        View and manage queue job information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Job Name</label>
                        <p className="text-sm text-muted-foreground">{job.name}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Job ID</label>
                        <p className="text-sm text-muted-foreground font-mono">{job.id}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <div>
                            <Badge variant="outline" className="capitalize">
                                {job.status || 'Unknown'}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Created</label>
                        <p className="text-sm text-muted-foreground">
                            {job.createdAt
                                ? dayjs(job.createdAt).format('ddd, MMM D, YYYY - h:mm A')
                                : 'Unknown'
                            }
                        </p>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-destructive">Danger Zone</p>
                                <p className="text-xs text-muted-foreground">Remove this job from the queue</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={handleDelete}>
                                Remove Job
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
