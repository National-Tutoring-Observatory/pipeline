import {
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import type { User } from "~/modules/users/users.types";
import PromptAuthorization from "../authorization";
import PromptEditor from "../components/promptEditor";
import { PromptService } from "../prompt";
import { PromptVersionService } from "../promptVersion";
import type { Route } from "./+types/promptEditor.route";
import SavePromptVersionDialogContainer from "./savePromptVersionDialogContainer";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const prompt = await PromptService.findById(params.id);

  if (!prompt) {
    return redirect("/");
  }

  if (!PromptAuthorization.canView(user, prompt)) {
    return redirect("/");
  }

  const promptVersion = await PromptVersionService.findOne({
    version: Number(params.version),
    prompt: params.id,
  });

  if (!promptVersion) {
    return redirect("/");
  }

  return { prompt: { data: prompt }, promptVersion: { data: promptVersion } };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { intent, entityId, payload = {} } = await request.json();

  const { name, userPrompt, annotationSchema } = payload;

  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const promptVersion = await PromptVersionService.findById(entityId);

  if (!promptVersion) {
    throw new Error("Prompt version not found");
  }

  const promptId =
    typeof promptVersion.prompt === "string"
      ? promptVersion.prompt
      : promptVersion.prompt._id;
  const prompt = await PromptService.findById(promptId);

  if (!prompt) {
    throw new Error("Prompt not found");
  }

  if (!PromptAuthorization.canUpdate(user, prompt)) {
    throw new Error("Access denied");
  }

  switch (intent) {
    case "UPDATE_PROMPT_VERSION":
      await PromptVersionService.updateById(entityId, {
        name,
        userPrompt,
        annotationSchema,
        hasBeenSaved: true,
        updatedAt: new Date().toISOString(),
      });
      return {};
    case "MAKE_PROMPT_VERSION_PRODUCTION":
      await PromptService.updateById(promptId, {
        productionVersion: Number(params.version),
      });
      return {};
    default:
      return {};
  }
}

export function shouldRevalidate({
  formMethod,
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod === "POST" && formAction === "/api/promptVersionAlignment") {
    return false;
  }
  return defaultShouldRevalidate;
}

export default function PromptEditorRoute() {
  const data = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();

  const { prompt, promptVersion } = data;

  const onSavePromptVersion = ({
    name,
    userPrompt,
    annotationSchema,
  }: {
    name: string;
    userPrompt: string;
    annotationSchema: any[];
  }) => {
    addDialog(
      <SavePromptVersionDialogContainer
        userPrompt={userPrompt}
        annotationSchema={annotationSchema}
        team={prompt.data.team}
        onSaveClicked={() => {
          submit(
            JSON.stringify({
              intent: "UPDATE_PROMPT_VERSION",
              entityId: promptVersion.data._id,
              payload: { name, userPrompt, annotationSchema },
            }),
            { method: "PUT", encType: "application/json" },
          );
        }}
      />,
    );
  };

  const onMakePromptVersionProduction = () => {
    submit(
      JSON.stringify({
        intent: "MAKE_PROMPT_VERSION_PRODUCTION",
        entityId: promptVersion.data._id,
        payload: {},
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  return (
    <PromptEditor
      promptVersion={promptVersion.data}
      isLoading={navigation.state === "loading"}
      onSavePromptVersion={onSavePromptVersion}
      isProduction={
        prompt.data.productionVersion === promptVersion.data.version
      }
      onMakePromptVersionProduction={onMakePromptVersionProduction}
    />
  );
}
