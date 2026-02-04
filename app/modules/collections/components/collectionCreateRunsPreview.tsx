import { Empty, EmptyContent, EmptyTitle } from "@/components/ui/empty";
import { AlertTriangle } from "lucide-react";
import type { PromptReference } from "../collections.types";

interface CollectionCreateRunsPreviewProps {
  selectedPrompts: PromptReference[];
  selectedModels: string[];
  newRunsCount: number;
  duplicateCount: number;
  isPromptModelUsed: (
    promptId: string,
    promptVersion: number,
    modelCode: string,
  ) => boolean;
}

export default function CollectionCreateRunsPreview({
  selectedPrompts,
  selectedModels,
  newRunsCount,
  duplicateCount,
  isPromptModelUsed,
}: CollectionCreateRunsPreviewProps) {
  const hasContent = selectedPrompts.length > 0 && selectedModels.length > 0;

  return (
    <div
      className="sticky top-4 min-w-0 flex-1 self-start overflow-y-auto rounded-lg border bg-slate-50"
      style={{ height: "calc(100vh - 144px)" }}
    >
      {hasContent ? (
        <div className="space-y-4">
          <div className="sticky top-0 rounded-t-lg border-b bg-white px-4 py-4">
            <h3 className="mb-2 text-sm font-semibold">Run Preview</h3>
            <p className="text-muted-foreground text-xs">
              {newRunsCount} new run(s) will be created
              {duplicateCount > 0 && (
                <span className="text-amber-600">
                  {" "}
                  • {duplicateCount} duplicate(s) will be skipped
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4 pb-4 2xl:grid-cols-3">
            {selectedPrompts.map((prompt) =>
              selectedModels.map((model) => {
                const isDuplicate = isPromptModelUsed(
                  prompt.promptId,
                  prompt.version,
                  model,
                );
                return (
                  <div
                    key={`${prompt.promptId}-${prompt.version}-${model}`}
                    className={`rounded-lg border p-3 text-sm ${
                      isDuplicate
                        ? "border-amber-200 bg-amber-50 opacity-60"
                        : "bg-white"
                    }`}
                  >
                    {isDuplicate && (
                      <div className="mb-2 flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Already exists
                      </div>
                    )}
                    <p className="text-muted-foreground mb-2 text-xs font-medium">
                      {isDuplicate ? "Skipped" : "New Run"}
                    </p>
                    <div className="space-y-1">
                      <div>
                        <p className="text-muted-foreground text-xs">Prompt</p>
                        <p className="truncate font-mono text-xs">
                          {prompt.promptName} (v{prompt.version})
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Model</p>
                        <p className="truncate font-mono text-xs">{model}</p>
                      </div>
                    </div>
                  </div>
                );
              }),
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
