import useProjectAuthorization from "~/modules/projects/hooks/useProjectAuthorization";

export default (teamId: string) => {
  const { canCreate } = useProjectAuthorization(teamId);

  if (!canCreate) return [];

  return [{
    action: 'CREATE',
    text: 'Create project'
  }];
}
