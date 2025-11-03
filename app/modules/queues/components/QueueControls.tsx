import { Button } from "@/components/ui/button";

interface QueueControlsProps {
  queueType?: string;
  onPauseResume?: () => void;
  isPaused?: boolean;
}

export default function QueueControls({ queueType, onPauseResume, isPaused = false }: QueueControlsProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        {queueType && (
          <span className="capitalize">{queueType} Queue Controls</span>
        )}
      </div>
      <Button
        variant="outline"
        onClick={onPauseResume}
        className="min-w-[120px]"
      >
        {isPaused ? 'Resume Queue' : 'Pause Queue'}
      </Button>
    </div>
  );
}
