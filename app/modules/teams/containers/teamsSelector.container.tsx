import get from "lodash/get";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import TeamsSelector from "../components/teamsSelector";

export default function TeamsSelectorContainer({
  team,
  onTeamSelected,
}: {
  team: string | null;
  onTeamSelected: (selectedTeam: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const teamsFetcher = useFetcher();

  const onToggleDropdown = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  useEffect(() => {
    teamsFetcher.load(`/api/availableTeams`);
  }, []);

  const teams = get(teamsFetcher, "data.teams.data", []);

  return (
    <TeamsSelector
      selectedTeam={team}
      teams={teams}
      isOpen={isOpen}
      isLoading={teamsFetcher.state === "loading"}
      onToggleDropdown={onToggleDropdown}
      onTeamSelected={onTeamSelected}
    />
  );
}
