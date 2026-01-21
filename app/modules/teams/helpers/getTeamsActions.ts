import useTeamAuthorization from "../hooks/useTeamAuthorization";

export default () => {
  const { canCreate } = useTeamAuthorization();

  if (!canCreate) return [];

  return [
    {
      action: "CREATE",
      text: "Create team",
    },
  ];
};
