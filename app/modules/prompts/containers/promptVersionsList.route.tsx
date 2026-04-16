import { redirect } from "react-router";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import PromptAuthorization from "../authorization";
import type { Route } from "./+types/promptVersionsList.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth({ request });

  const url = new URL(request.url);
  const promptId = url.searchParams.get("prompt");

  if (!promptId) {
    return redirect("/");
  }

  const prompt = await PromptService.findById(promptId);

  if (!prompt) {
    return redirect("/");
  }

  if (!PromptAuthorization.canView(user, prompt)) {
    return redirect("/");
  }

  const result = await PromptVersionService.find({
    match: { prompt: promptId, hasBeenSaved: true },
    sort: { version: -1 },
  });
  const promptVersions = { data: result };
  return { promptVersions };
}
