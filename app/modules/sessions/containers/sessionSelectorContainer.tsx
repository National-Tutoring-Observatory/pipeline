import { useFetcher, useNavigation, useParams } from "react-router";
import SessionSelector from "../components/sessionSelector";
import { useEffect, useState } from "react";
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import pull from 'lodash/pull';

export default function SessionSelectorContainer({
  selectedSessions,
  onSelectedSessionsChanged
}: {
  selectedSessions: string[],
  onSelectedSessionsChanged: (selectedSessions: string[]) => void
}) {

  const sessionsFetcher = useFetcher({ key: 'sessionsList' });

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

  const onRandomizeClicked = () => {
    if (!sessionsFetcher.data?.sessions?.data) return;
    const allSessionIds = map(sessionsFetcher.data.sessions.data, '_id');
    const randomCount = Math.floor(Math.random() * allSessionIds.length) + 1;
    const shuffled = [...allSessionIds].sort(() => Math.random() - 0.5);
    onSelectedSessionsChanged(shuffled.slice(0, randomCount));
  }

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('project', params.projectId || "");
    sessionsFetcher.load(`/api/sessionsList?${queryParams.toString()}`);
  }, []);


  return (
    <SessionSelector
      sessions={sessionsFetcher.data?.sessions?.data}
      selectedSessions={selectedSessions}
      onSelectAllToggled={onSelectAllToggled}
      onSelectSessionToggled={onSelectSessionToggled}
      onRandomizeClicked={onRandomizeClicked}
    />
  );
}