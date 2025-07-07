import { useFetcher, useNavigation, useParams } from "react-router";
import SessionSelector from "../components/sessionSelector";
import { useEffect, useState } from "react";
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import pull from 'lodash/pull';

export default function SessionSelectorContainer() {

  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const sessionsFetcher = useFetcher();

  const params = useParams();

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedSessions(map(sessionsFetcher.data?.sessions?.data, '_id'));
    } else {
      setSelectedSessions([]);
    }
  }

  const onSelectSessionToggled = ({ sessionId, isChecked }: { sessionId: string, isChecked: boolean }) => {
    let clonedSelectedSessions = cloneDeep(selectedSessions);
    if (isChecked) {
      clonedSelectedSessions.push(sessionId);
      setSelectedSessions(clonedSelectedSessions);
    } else {
      pull(clonedSelectedSessions, sessionId);
      setSelectedSessions(clonedSelectedSessions);
    }
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
    />
  );
}