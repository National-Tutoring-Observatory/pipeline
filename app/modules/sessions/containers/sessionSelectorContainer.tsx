import { useFetcher, useParams } from "react-router";
import SessionSelector from "../components/sessionSelector";
import { useEffect, useState } from "react";
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import pull from 'lodash/pull';
import sampleSize from 'lodash/sampleSize';

export default function SessionSelectorContainer({
  selectedSessions,
  onSelectedSessionsChanged
}: {
  selectedSessions: string[],
  onSelectedSessionsChanged: (selectedSessions: string[]) => void
}) {

  const sessionsFetcher = useFetcher({ key: 'sessionsList' });
  const [randomSampleSize, setRandomSampleSize] = useState(0);

  const params = useParams();

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      onSelectedSessionsChanged(map(sessionsFetcher.data?.sessions?.data, '_id'));
    } else {
      onSelectedSessionsChanged([]);
    }
  }

  const onSelectSessionToggled = ({ sessionId, isChecked }: { sessionId: string, isChecked: boolean }) => {
    let clonedSelectedSessions = cloneDeep(selectedSessions);
    if (isChecked) {
      clonedSelectedSessions.push(sessionId);
      onSelectedSessionsChanged(clonedSelectedSessions);
    } else {
      pull(clonedSelectedSessions, sessionId);
      onSelectedSessionsChanged(clonedSelectedSessions);
    }
  }

  const onSampleSizeChanged = (size: number) => {
    setRandomSampleSize(size);
  }

  const onRandomizeClicked = () => {
    if (!sessionsFetcher.data?.sessions?.data) return;
    const allSessionIds = map(sessionsFetcher.data.sessions.data, '_id');
    const randomSessions = sampleSize(allSessionIds, randomSampleSize);
    onSelectedSessionsChanged(randomSessions);
  }

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('project', params.projectId || "");
    sessionsFetcher.load(`/api/sessionsList?${queryParams.toString()}`);
  }, []);

  useEffect(() => {
    if (sessionsFetcher.data?.sessions?.count) {
      setRandomSampleSize(Math.floor(sessionsFetcher.data.sessions.count / 3) || 1);
    }
  }, [sessionsFetcher.data]);

  return (
    <SessionSelector
      sessions={sessionsFetcher.data?.sessions?.data}
      selectedSessions={selectedSessions}
      sampleSize={randomSampleSize}
      onSelectAllToggled={onSelectAllToggled}
      onSelectSessionToggled={onSelectSessionToggled}
      onSampleSizeChanged={onSampleSizeChanged}
      onRandomizeClicked={onRandomizeClicked}
    />
  );
}
