import clsx from "clsx";
import { Link, useLocation } from "react-router";

interface QueueTypeTabsProps {
  taskCount: number;
  cronCount: number;
}

export default function QueueTypeTabs({ taskCount, cronCount }: QueueTypeTabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isTasksActive = currentPath.includes('/tasks');
  const isCronActive = currentPath.includes('/cron');

  return (
    <div className="flex gap-2 mb-6">
      <Link
        to="/queues/tasks/active"
        className={clsx(
          "px-4 py-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
          "flex items-center justify-between min-w-[160px]",
          {
            "border-accent-foreground bg-accent/10": isTasksActive,
            "border-border hover:border-accent-foreground/50": !isTasksActive
          }
        )}
      >
        <span className="font-medium">Tasks</span>
        <span className={clsx(
          "px-2 py-1 rounded-full text-xs font-bold",
          {
            "bg-accent text-accent-foreground": isTasksActive,
            "bg-muted text-muted-foreground": !isTasksActive
          }
        )}>
          {taskCount}
        </span>
      </Link>

      <Link
        to="/queues/cron/active"
        className={clsx(
          "px-4 py-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
          "flex items-center justify-between min-w-[160px]",
          {
            "border-accent-foreground bg-accent/10": isCronActive,
            "border-border hover:border-accent-foreground/50": !isCronActive
          }
        )}
      >
        <span className="font-medium">Cron</span>
        <span className={clsx(
          "px-2 py-1 rounded-full text-xs font-bold",
          {
            "bg-accent text-accent-foreground": isCronActive,
            "bg-muted text-muted-foreground": !isCronActive
          }
        )}>
          {cronCount}
        </span>
      </Link>
    </div>
  );
}
