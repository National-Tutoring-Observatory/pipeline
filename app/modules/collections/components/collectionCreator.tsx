import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import clsx from 'clsx';
import difference from 'lodash/difference';
import map from 'lodash/map';
import includes from 'lodash/includes';
import type { Run } from '~/modules/runs/runs.types';

export default function CollectionCreator({
  runs,
  selectedBaseRun,
  selectedBaseRunSessions,
  selectedRuns,
  isSetupCollectionButtonDisabled,
  onBaseRunClicked,
  onSelectRunToggled,
  onSetupCollectionButtonClicked
}: {
  runs: Run[],
  selectedBaseRun: number | null,
  selectedBaseRunSessions: number[],
  selectedRuns: number[],
  isSetupCollectionButtonDisabled: boolean,
  onBaseRunClicked: (run: Run) => void,
  onSelectRunToggled: ({ runId, isChecked }: { runId: number, isChecked: boolean }) => void,
  onSetupCollectionButtonClicked: () => void
}) {
  return (
    <div>

      <div className="border rounded-lg grid grid-cols-2">
        <div className="border-r">
          <div className="border-b p-2">
            Select a run to base this collection from
          </div>
          <div>

            {map(runs, (run) => {

              const className = clsx("w-full rounded-none justify-start", {
                "bg-purple-100 hover:bg-purple-100": selectedBaseRun === Number(run._id)
              });

              return (
                <Button key={run._id} variant="ghost" className={className}
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
              if (Number(run._id) === selectedBaseRun) return null;
              const runSessions = map(run.sessions, 'sessionId');

              const test = difference(runSessions, selectedBaseRunSessions);

              if (test.length > 0) return null;

              return (
                <Label key={run._id} htmlFor={`collection-creator-${run._id}`} className="w-full p-2 flex items-center gap-2">
                  <Checkbox
                    id={`collection-creator-${run._id}`}

                    checked={includes(selectedRuns, Number(run._id))}
                    onCheckedChange={(checked) => onSelectRunToggled({ runId: Number(run._id), isChecked: Boolean(checked) })}
                  >

                  </Checkbox>
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
          Start run
        </Button>
      </div>
    </div>
  );
}