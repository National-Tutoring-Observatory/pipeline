import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import includes from "lodash/includes";
import map from "lodash/map";
import xor from "lodash/xor";
import type { Run } from "~/modules/runs/runs.types";

export default function CollectionCreator({
  runs,
  selectedBaseRun,
  selectedBaseRunSessions,
  selectedRuns,
  isSetupCollectionButtonDisabled,
  onBaseRunClicked,
  onSelectRunToggled,
  onSetupCollectionButtonClicked,
}: {
  runs: Run[];
  selectedBaseRun: string | null;
  selectedBaseRunSessions: string[];
  selectedRuns: string[];
  isSetupCollectionButtonDisabled: boolean;
  onBaseRunClicked: (run: Run) => void;
  onSelectRunToggled: ({
    runId,
    isChecked,
  }: {
    runId: string;
    isChecked: boolean;
  }) => void;
  onSetupCollectionButtonClicked: () => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 rounded-lg border">
        <div className="border-r">
          <div className="border-b p-2">
            Select a run to base this collection from
          </div>
          <div>
            {map(runs, (run) => {
              const className = clsx("w-full rounded-none justify-start", {
                "bg-purple-100 hover:bg-purple-100":
                  selectedBaseRun === run._id,
              });

              return (
                <Button
                  key={run._id}
                  variant="ghost"
                  className={className}
                  onClick={() => onBaseRunClicked(run)}
                >
                  {run.name}
                </Button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="border-b p-2">
            Select runs that match you base run
          </div>
          <div>
            {map(runs, (run) => {
              if (run._id === selectedBaseRun) return null;
              const runSessions = map(run.sessions, "sessionId");

              const test = xor(runSessions, selectedBaseRunSessions);

              if (test.length > 0) return null;

              return (
                <Label
                  key={run._id}
                  htmlFor={`collection-creator-${run._id}`}
                  className="flex w-full items-center gap-2 p-2"
                >
                  <Checkbox
                    id={`collection-creator-${run._id}`}
                    checked={includes(selectedRuns, run._id)}
                    onCheckedChange={(checked) =>
                      onSelectRunToggled({
                        runId: run._id,
                        isChecked: Boolean(checked),
                      })
                    }
                  ></Checkbox>
                  {run.name}
                </Label>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <Button
          size="lg"
          disabled={isSetupCollectionButtonDisabled}
          onClick={onSetupCollectionButtonClicked}
        >
          Build collection
        </Button>
      </div>
    </div>
  );
}
