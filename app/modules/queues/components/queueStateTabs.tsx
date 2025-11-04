import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLocation, useNavigate } from "react-router";

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
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Determine current value from either prop or URL
  const currentValue = currentState || states.find(state =>
    currentPath.includes(`/${state.key}`)
  )?.key || states[0]?.key;

  const handleValueChange = (value: string) => {
    if (value) {
      navigate(`/queues/${queueType}/${value}`);
    }
  };

  return (
    <div>
      <ToggleGroup
        type="single"
        value={currentValue}
        onValueChange={handleValueChange}
        className="justify-start"
        aria-label="Queue state filter"
      >
        {states.map((state, index) => {
          const isFirst = index === 0;
          const isLast = index === states.length - 1;
          const borderRadius = isFirst ? 'rounded-l-lg' : isLast ? 'rounded-r-lg' : '';
          const borderRight = isLast ? 'border-r' : 'border-r-0';
          const hoverBorderRight = !isLast ? 'hover:border-r' : '';
          const selectedBorderRight = !isLast ? 'data-[state=on]:border-r' : '';

          return (
            <ToggleGroupItem
              key={state.key}
              value={state.key}
              className={`flex items-center justify-between min-w-[120px] px-4 py-3 h-auto border border-border ${borderRadius} ${borderRight} ${hoverBorderRight} ${selectedBorderRight} transition-all cursor-pointer hover:shadow-sm hover:border-accent-foreground/50 data-[state=on]:bg-accent/10 data-[state=on]:border-accent-foreground`}
              aria-label={`${state.label} jobs (${state.count} items)`}
            >
              <span className="font-medium">{state.label}</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground" aria-hidden="true">
                {state.count}
              </span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
