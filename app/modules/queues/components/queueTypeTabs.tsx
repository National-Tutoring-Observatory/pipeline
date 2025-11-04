import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLocation, useNavigate } from "react-router";

interface QueueTypeTabsProps {
  taskCount: number;
  cronCount: number;
}

export default function QueueTypeTabs({ taskCount, cronCount }: QueueTypeTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const currentValue = currentPath.includes('/tasks') ? 'tasks' : 'cron';

  const handleValueChange = (value: string) => {
    if (value) {
      navigate(`/queues/${value}/active`);
    }
  };

  return (
    <div className="mb-6">
      <ToggleGroup
        type="single"
        value={currentValue}
        onValueChange={handleValueChange}
        className="justify-start"
        aria-label="Queue type selection"
      >
        <ToggleGroupItem
          value="tasks"
          className="flex items-center justify-between min-w-[160px] px-4 py-3 h-auto border border-border rounded-l-lg border-r-0 transition-all cursor-pointer hover:shadow-sm hover:border-accent-foreground/50 hover:border-r data-[state=on]:bg-accent/10 data-[state=on]:border-accent-foreground data-[state=on]:border-r"
          aria-label={`Tasks queue (${taskCount} jobs)`}
        >
          <span className="font-medium">Tasks</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground" aria-hidden="true">
            {taskCount}
          </span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="cron"
          className="flex items-center justify-between min-w-[160px] px-4 py-3 h-auto border border-border rounded-r-lg transition-all cursor-pointer hover:shadow-sm hover:border-accent-foreground/50 data-[state=on]:bg-accent/10 data-[state=on]:border-accent-foreground"
          aria-label={`Cron queue (${cronCount} jobs)`}
        >
          <span className="font-medium">Cron</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground" aria-hidden="true">
            {cronCount}
          </span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
