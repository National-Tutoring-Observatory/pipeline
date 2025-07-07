import { useFetcher, useNavigation, useParams } from "react-router";
import SessionSelector from "../components/sessionSelector";
import { useEffect } from "react";

export default function SessionSelectorContainer() {

  const sessionsFetcher = useFetcher();

  const params = useParams();

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('project', params.projectId || "");
    sessionsFetcher.load(`/api/sessionsList?${queryParams.toString()}`);
  }, [])

  return (
    <SessionSelector
      sessions={sessionsFetcher.data?.sessions?.data}
    />
  );
}