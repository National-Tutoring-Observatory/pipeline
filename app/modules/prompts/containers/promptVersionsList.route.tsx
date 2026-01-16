import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import type { User } from "~/modules/users/users.types";
import PromptAuthorization from "../authorization";
import type { Route } from "./+types/promptVersionsList.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const url = new URL(request.url);
  const promptId = url.searchParams.get('prompt');

  if (!promptId) {
    return redirect('/');
  }

  const prompt = await PromptService.findById(promptId);

  if (!prompt) {
    return redirect('/');
  }

  if (!PromptAuthorization.canView(user, prompt)) {
    return redirect('/');
  }

  const result = await PromptVersionService.find({ match: { prompt: promptId }, sort: { version: -1 } });
  const promptVersions = { data: result };
  return { promptVersions };
}
