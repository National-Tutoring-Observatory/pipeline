import { Empty, EmptyContent, EmptyTitle } from "@/components/ui/empty";
import type { PromptReference } from "~/modules/collections/collections.types";

function generateRunName(
  collectionName: string,
  prompt: PromptReference,
  model: string,
): string {
  const promptLabel = prompt.promptName
    ? `${prompt.promptName} v${prompt.version}`
    : prompt.promptId;

  const finalCollectionName = collectionName.trim() || "Untitled Collection";

  return `${finalCollectionName} - ${promptLabel} - ${model}`;
}

export default function CollectionRunPreview({
  name,
  selectedPrompts,
  selectedModels,
  selectedSessions,
}: {
  name: string;
  selectedPrompts: PromptReference[];
  selectedModels: string[];
  selectedSessions: string[];
}) {
  const hasContent = selectedPrompts.length > 0 && selectedModels.length > 0;

  return (
    <div
      className="sticky top-4 min-w-0 flex-1 self-start overflow-y-auto rounded-lg border bg-slate-50"
      style={{ height: "calc(100vh - 144px)" }}
    >
      {hasContent ? (
        <div className="space-y-4">
          <div className="sticky top-0 rounded-t-lg border-b bg-white px-4 py-4">
            <h3 className="mb-2 text-sm font-semibold">Generated Runs</h3>
            <p className="text-muted-foreground text-xs">
              {selectedPrompts.length * selectedModels.length} run(s) •{" "}
              {selectedSessions.length} session(s)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4 pb-4 2xl:grid-cols-3">
            {selectedPrompts.map((prompt) =>
              selectedModels.map((model) => (
                <div
                  key={`${prompt.promptId}-${model}`}
                  className="rounded-lg border bg-white p-3 text-sm"
                >
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    Run
                  </p>
                  <div className="space-y-1">
                    <div>
                      <p className="text-muted-foreground text-xs">Name</p>
                      <p className="truncate font-mono text-xs">
                        {generateRunName(name, prompt, model)}
                      </p>
                    </div>
                  </div>
                </div>
              )),
            )}
          </div>
        </div>
      ) : (
        <div className="sticky top-8 p-8">
          <Empty className="border border-slate-300">
            <EmptyContent>
              <EmptyTitle>Select prompts and models to preview runs</EmptyTitle>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  );
}
