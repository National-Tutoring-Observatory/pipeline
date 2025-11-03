import clsx from "clsx";
import { Link, useLocation } from "react-router";

interface QueueState {
  key: string;
  label: string;
  count: number;
}

interface QueueStateTabsProps {
  queueType: string;
  states: QueueState[];
  currentState?: string;
}

export default function QueueStateTabs({ queueType, states, currentState }: QueueStateTabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex gap-2 mb-6">
      {states.map((state) => {
        const isActive = currentState === state.key || currentPath.includes(`/${state.key}`);
        return (
          <Link
            key={state.key}
            to={`/queues/${queueType}/${state.key}`}
            className={clsx(
              "px-4 py-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
              "flex items-center justify-between min-w-[120px]",
              {
                "border-accent-foreground bg-accent/10": isActive,
                "border-border hover:border-accent-foreground/50": !isActive
              }
            )}
          >
            <span className="font-medium">{state.label}</span>
            <span className={clsx(
              "px-2 py-1 rounded-full text-xs font-bold",
              {
                "bg-accent text-accent-foreground": isActive,
                "bg-muted text-muted-foreground": !isActive
              }
            )}>
              {state.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
