import { useLoaderData } from "react-router";
import Prompt from '../components/prompt';
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/prompt.route";
import type { Prompt as PromptType, PromptVersion } from "../prompts.types";
import getDocuments from "~/core/documents/getDocuments";

export async function loader({ params }: Route.LoaderArgs) {
  const prompt = await getDocument({ collection: 'prompts', match: { _id: parseInt(params.id) } }) as { data: PromptType };
  const promptVersions = await getDocuments({ collection: 'promptVersions', match: { prompt: parseInt(params.id) } }) as { data: PromptVersion[] };
  return { prompt, promptVersions };
}

export default function PromptRoute() {

  const data = useLoaderData();

  const { prompt, promptVersions } = data;

  return (
    <Prompt
      prompt={prompt.data}
      promptVersions={promptVersions.data}
    />
  );
}