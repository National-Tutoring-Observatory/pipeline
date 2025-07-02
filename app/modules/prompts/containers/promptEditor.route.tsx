import getDocument from "~/core/documents/getDocument";
import PromptEditor from "../components/promptEditor";
import type { Route } from "./+types/promptEditor.route";
import type { PromptVersion } from "../prompts.types";
import { useLoaderData } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {

  const promptVersion = await getDocument({ collection: 'promptVersions', match: { version: parseInt(params.version), prompt: parseInt(params.id) } }) as { data: PromptVersion };

  return { promptVersion };
}

export default function PromptEditorRoute() {

  const data = useLoaderData();

  const { promptVersion } = data;

  return (
    <PromptEditor
      promptVersion={promptVersion.data}
    />
  )
}