import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { PromptReference } from "../collections.types";
import CollectionCreatorPreviewItem from "./collectionCreatorPreviewItem";

const CollectionCreatorPreview = ({
  selectedPrompts,
  selectedModels,
  selectedSessions,
}: {
  selectedPrompts: PromptReference[],
  selectedModels: string[],
  selectedSessions: string[]
}) => {
  return (
    <div className="sticky top-12 bg-gray-50 flex-1 min-w-0 rounded-lg border max-h-[calc(100vh-180px)] overflow-y-auto">
      <div>
        <div className="sticky top-0 bg-gray-50 p-4">
          <h3 className="font-semibold text-sm mb-2">Generated Runs</h3>
          <p className="text-xs text-muted-foreground">
            {selectedPrompts.length * selectedModels.length} run(s) • {selectedSessions.length} session(s)
          </p>
        </div>
        {selectedPrompts.length > 0 && selectedModels.length > 0 ? (
          <div className="grid grid-cols-2 2xl:grid-cols-3 gap-2 p-4">
            {selectedPrompts.map((prompt) =>
              selectedModels.map((model) => (
                <CollectionCreatorPreviewItem
                  key={`${prompt.promptId}-${model}`}
                  prompt={prompt}
                  model={model}
                />
              ))
            )}
          </div>
        ) : (
          <div className="border m-4 rounded-md">
            <Empty>
              <EmptyHeader>

                <EmptyTitle>No runs are setup</EmptyTitle>
                <EmptyDescription>
                  Select prompts and models to preview runs
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionCreatorPreview;
