import { Button } from '@/components/ui/button';
import { Link } from "react-router";
import type { Prompt } from "~/modules/prompts/prompts.types";
import type { Team } from "../teams.types";

interface TeamPromptsProps {
  prompts: Prompt[];
  team: Team;
  canCreatePrompts: boolean;
  onCreatePromptButtonClicked: () => void;
}

export default function TeamPrompts({ prompts, team, canCreatePrompts, onCreatePromptButtonClicked }: TeamPromptsProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">Prompts</div>
        {(canCreatePrompts) && (
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
              canCreatePrompts ? (
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
