import DEFAULT_PROMPTS from "../helpers/defaultPrompts";
import { PromptService } from "../prompt";
import { PromptVersionService } from "../promptVersion";

export default async function createDefaultPrompts(
  teamId: string,
  userId: string,
): Promise<void> {
  for (const definition of DEFAULT_PROMPTS) {
    const prompt = await PromptService.create({
      name: definition.name,
      annotationType: definition.annotationType,
      team: teamId,
      productionVersion: 1,
      createdBy: userId,
    });

    await PromptVersionService.create({
      name: "initial",
      prompt: prompt._id,
      version: 1,
      userPrompt: definition.userPrompt,
      annotationSchema: definition.annotationSchema,
      hasBeenSaved: true,
    });
  }
}
