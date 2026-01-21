import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface QueueControlsProps {
  queueType?: string;
  onPauseResume?: () => void;
  isPaused?: boolean;
}

export default function QueueControls({
  queueType,
  onPauseResume,
  isPaused = false,
}: QueueControlsProps) {
  return (
    <Button
      variant="outline"
      onClick={onPauseResume}
      className="min-w-[120px] flex items-center gap-2"
    >
      {isPaused ? (
        <>
          <Play className="h-4 w-4" />
          Resume Queue
        </>
      ) : (
        <>
          <Pause className="h-4 w-4" />
          Pause Queue
        </>
      )}
    </Button>
  );
}
