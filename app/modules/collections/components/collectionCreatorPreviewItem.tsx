import type { PromptReference } from "../collections.types";

const CollectionCreatorPreviewItem = ({
  prompt,
  model
}: {
  prompt: PromptReference,
  model: string
}) => {
  return (
    <div className="bg-white rounded-lg border p-3 text-sm">
      <p className="font-medium mb-2">Run</p>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">Prompt</p>
          <p className="text-sm font-mono truncate">{prompt.promptName || prompt.promptId} (v{prompt.version})</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Model</p>
          <p className="text-sm font-mono truncate">{model}</p>
        </div>
      </div>
    </div>
  );
};

export default CollectionCreatorPreviewItem;
