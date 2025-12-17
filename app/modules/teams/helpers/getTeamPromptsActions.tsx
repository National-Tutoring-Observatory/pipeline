import usePromptAuthorization from "~/modules/prompts/hooks/usePromptAuthorization";

export default (teamId: string) => {
  const { canCreate } = usePromptAuthorization(teamId);

  if (!canCreate) return [];

  return [{
    action: 'CREATE',
    text: 'Create prompt'
  }];
}
