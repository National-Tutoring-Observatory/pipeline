import { Button } from '@/components/ui/button';
import { Link, useParams } from "react-router";
import usePromptAuthorization from "~/modules/prompts/hooks/usePromptAuthorization";
import type { Prompt } from "~/modules/prompts/prompts.types";
import type { Team } from "../teams.types";

interface TeamPromptsProps {
  prompts: Prompt[];
  team: Team;
  onCreatePromptButtonClicked: () => void;
}

export default function TeamPrompts({ prompts, team, onCreatePromptButtonClicked }: TeamPromptsProps) {
  const params = useParams();
  const { canCreate } = usePromptAuthorization(params.id || null);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">Prompts</div>
        {canCreate && (
          <Button size="sm" onClick={onCreatePromptButtonClicked}>
            Create prompt
          </Button>
        )}
      </div>
      <div>
        {(prompts.length === 0) && (
          <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
            No prompts are associated with this team
          </div>
        )}
        {(prompts.length > 0) && (
          <div className="mt-4 border border-black/10 rounded-md ">
            {prompts.map((prompt: Prompt) => (
              canCreate ? (
                <Link
                  key={prompt._id}
                  to={`/prompts/${prompt._id}/${prompt.productionVersion}`}
                  className="block border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm"
                >
                  {prompt.name}
                </Link>
              ) : (
                <div
                  key={prompt._id}
                  className="block border-b border-black/10 p-4 last:border-0 text-sm"
                >
                  {prompt.name}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
