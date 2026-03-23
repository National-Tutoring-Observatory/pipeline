import cloneDeep from "lodash/cloneDeep";
import map from "lodash/map";
import orderBy from "lodash/orderBy";
import pull from "lodash/pull";
import sampleSize from "lodash/sampleSize";
import { useEffect, useMemo, useState } from "react";
import { useFetcher, useParams } from "react-router";
import type {
  SessionSortField,
  SortDirection,
} from "../components/sessionSelector";
import SessionSelector from "../components/sessionSelector";

export default function SessionSelectorContainer({
  selectedSessions,
  onSelectedSessionsChanged,
}: {
  selectedSessions: string[];
  onSelectedSessionsChanged: (selectedSessions: string[]) => void;
}) {
  const sessionsFetcher = useFetcher({ key: "sessionsList" });
  const [userSampleSize, setUserSampleSize] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SessionSortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const defaultSampleSize = sessionsFetcher.data?.sessions?.count
    ? Math.floor(sessionsFetcher.data.sessions.count / 3) || 1
    : 0;
  const randomSampleSize = userSampleSize ?? defaultSampleSize;

  const params = useParams();

  const sortedSessions = useMemo(() => {
    const sessions = sessionsFetcher.data?.sessions?.data;
    if (!sessions) return [];
    return orderBy(sessions, [sortField], [sortDirection]);
  }, [sessionsFetcher.data?.sessions?.data, sortField, sortDirection]);

  const onSortChanged = (field: SessionSortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      onSelectedSessionsChanged(
        map(sessionsFetcher.data?.sessions?.data, "_id"),
      );
    } else {
      onSelectedSessionsChanged([]);
    }
  };

  const onSelectSessionToggled = ({
    sessionId,
    isChecked,
  }: {
    sessionId: string;
    isChecked: boolean;
  }) => {
    const clonedSelectedSessions = cloneDeep(selectedSessions);
    if (isChecked) {
      clonedSelectedSessions.push(sessionId);
      onSelectedSessionsChanged(clonedSelectedSessions);
    } else {
      pull(clonedSelectedSessions, sessionId);
      onSelectedSessionsChanged(clonedSelectedSessions);
    }
  };

  const onSampleSizeChanged = (size: number) => {
    setUserSampleSize(size);
  };

  const onRandomizeClicked = () => {
    if (!sessionsFetcher.data?.sessions?.data) return;
    const allSessionIds = map(sessionsFetcher.data.sessions.data, "_id");
    const randomSessions = sampleSize(allSessionIds, randomSampleSize);
    onSelectedSessionsChanged(randomSessions);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set("project", params.projectId || "");
    sessionsFetcher.load(`/api/sessionsList?${queryParams.toString()}`);
  }, []);

  return (
    <SessionSelector
      sessions={sortedSessions}
      selectedSessions={selectedSessions}
      sampleSize={randomSampleSize}
      sortField={sortField}
      sortDirection={sortDirection}
      onSortChanged={onSortChanged}
      onSelectAllToggled={onSelectAllToggled}
      onSelectSessionToggled={onSelectSessionToggled}
      onSampleSizeChanged={onSampleSizeChanged}
      onRandomizeClicked={onRandomizeClicked}
    />
  );
}
