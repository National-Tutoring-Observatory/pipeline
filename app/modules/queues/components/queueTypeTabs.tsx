import { ToggleGroup } from "@/components/ui/toggle-group";
import { useLocation, useNavigate } from "react-router";
import { QueueTab } from "./queueTab";

interface QueueTypeTabsProps {
  taskCount: number;
  cronCount: number;
}

export default function QueueTypeTabs({ taskCount, cronCount }: QueueTypeTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const types = [
    { key: "tasks", label: "Tasks", count: taskCount },
    { key: "cron", label: "Cron", count: cronCount }
  ];

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
        variant="outline"
        value={currentValue}
        onValueChange={handleValueChange}
        aria-label="Queue type selection"
      >
        {types.map((type, idx) => (
          <QueueTab
            key={type.key}
            value={type.key}
            label={type.label}
            count={type.count}
            ariaLabel={`${type.label} queue (${type.count} jobs)`}
          />
        ))}
      </ToggleGroup>
    </div>
  );
}
