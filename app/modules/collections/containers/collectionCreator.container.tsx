import cloneDeep from "lodash/cloneDeep";
import map from "lodash/map";
import pull from "lodash/pull";
import { useEffect, useState } from "react";
import { useFetcher, useParams } from "react-router";
import type { Run } from "~/modules/runs/runs.types";
import type { CreateCollection } from "../collections.types";
import CollectionCreator from "../components/collectionCreator";

export default function CollectionCreatorContainer({
  onSetupCollection,
}: {
  onSetupCollection: ({
    selectedSessions,
    selectedRuns,
  }: CreateCollection) => void;
}) {
  const [selectedBaseRun, setSelectedBaseRun] = useState(null as string | null);
  const [selectedBaseRunSessions, setSelectedBaseRunSessions] = useState(
    [] as string[],
  );
  const [selectedRuns, setSelectedRuns] = useState([] as string[]);

  const runsFetcher = useFetcher({ key: "runsList" });

  const params = useParams();

  const onBaseRunClicked = (run: Run) => {
    setSelectedBaseRun(run._id);
    setSelectedBaseRunSessions(map(run.sessions, "sessionId"));
    setSelectedRuns([run._id]);
  };

  const onSelectRunToggled = ({
    runId,
    isChecked,
  }: {
    runId: string;
    isChecked: boolean;
  }) => {
    let clonedSelectedSessions = cloneDeep(selectedRuns);
    if (isChecked) {
      clonedSelectedSessions.push(runId);
      setSelectedRuns(clonedSelectedSessions);
    } else {
      pull(clonedSelectedSessions, runId);
      setSelectedRuns(clonedSelectedSessions);
    }
  };

  const onSetupCollectionButtonClicked = () => {
    onSetupCollection({
      selectedSessions: selectedBaseRunSessions,
      selectedRuns: selectedRuns,
    });
  };

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set("project", params.projectId || "");
    runsFetcher.load(`/api/runsList?${queryParams.toString()}`);
  }, []);

  const isSetupCollectionButtonDisabled = !selectedBaseRun;

  return (
    <CollectionCreator
      runs={runsFetcher.data?.runs?.data}
      selectedBaseRun={selectedBaseRun}
      selectedBaseRunSessions={selectedBaseRunSessions}
      selectedRuns={selectedRuns}
      isSetupCollectionButtonDisabled={isSetupCollectionButtonDisabled}
      onBaseRunClicked={onBaseRunClicked}
      onSelectRunToggled={onSelectRunToggled}
      onSetupCollectionButtonClicked={onSetupCollectionButtonClicked}
    />
  );
}
