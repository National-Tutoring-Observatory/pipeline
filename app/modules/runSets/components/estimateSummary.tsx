import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, DollarSign } from "lucide-react";
import type { EstimationResult } from "~/modules/runSets/runSets.types";
import { formatCost, formatTime } from "../helpers/formatEstimates";

export default function EstimateSummary({
  estimation,
}: {
  estimation: EstimationResult;
}) {
  if (estimation.estimatedTimeSeconds === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-sandpiper-info flex cursor-help items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {formatTime(estimation.estimatedTimeSeconds)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Estimated time range based on recent runs.
            <br />
            Actual time can vary with load.
          </p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-sandpiper-info flex cursor-help items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">
              {formatCost(estimation.estimatedCost)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Estimate based on avg 500 tokens/session</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
