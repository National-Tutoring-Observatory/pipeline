import { Empty, EmptyContent, EmptyTitle } from "@/components/ui/empty";
import { AlertTriangle, Plus, X } from "lucide-react";
import { generateRunName } from "~/modules/runSets/helpers/generateRunName";
import type { RunDefinition } from "~/modules/runSets/runSets.types";

interface RunSetRunPreviewProps {
  name: string;
  runDefinitions: RunDefinition[];
  excludedDefinitions?: RunDefinition[];
  duplicateDefinitions?: RunDefinition[];
  sessionsCount: number;
  onRemoveCard: (key: string) => void;
  onRestoreCard: (key: string) => void;
}

export default function RunSetRunPreview({
  name,
  runDefinitions,
  excludedDefinitions = [],
  duplicateDefinitions = [],
  sessionsCount,
  onRemoveCard,
  onRestoreCard,
}: RunSetRunPreviewProps) {
  const hasContent =
    runDefinitions.length > 0 ||
    excludedDefinitions.length > 0 ||
    duplicateDefinitions.length > 0;

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
              {runDefinitions.length} run(s) • {sessionsCount} session(s)
              {excludedDefinitions.length > 0 && (
                <span className="text-gray-500">
                  {" "}
                  • {excludedDefinitions.length} excluded
                </span>
              )}
              {duplicateDefinitions.length > 0 && (
                <span className="text-amber-600">
                  {" "}
                  • {duplicateDefinitions.length} duplicate(s) will be skipped
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4 pb-4 2xl:grid-cols-3">
            {runDefinitions.map((definition) => (
              <div
                key={definition.key}
                className="group relative rounded-lg border bg-white p-3 text-sm"
              >
                <button
                  type="button"
                  onClick={() => onRemoveCard(definition.key)}
                  className="absolute top-2 right-2 rounded p-0.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  New Run
                </p>
                <RunDefinitionCardDetails name={name} definition={definition} />
              </div>
            ))}
            {excludedDefinitions.map((definition) => (
              <div
                key={definition.key}
                className="group relative rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-sm opacity-50"
              >
                <button
                  type="button"
                  onClick={() => onRestoreCard(definition.key)}
                  className="absolute top-2 right-2 rounded p-0.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  Excluded
                </p>
                <RunDefinitionCardDetails name={name} definition={definition} />
              </div>
            ))}
            {duplicateDefinitions.map((definition) => (
              <div
                key={definition.key}
                className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm opacity-60"
              >
                <div className="mb-2 flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  Already exists
                </div>
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  Skipped
                </p>
                <RunDefinitionCardDetails name={name} definition={definition} />
              </div>
            ))}
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

function RunDefinitionCardDetails({
  name,
  definition,
}: {
  name: string;
  definition: RunDefinition;
}) {
  return (
    <div className="space-y-1">
      <div>
        <p className="text-muted-foreground text-xs">Name</p>
        <p className="truncate font-mono text-xs">
          {generateRunName(name, definition.prompt, definition.modelCode)}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Prompt</p>
        <p className="truncate font-mono text-xs">
          {definition.prompt.promptName || definition.prompt.promptId} (v
          {definition.prompt.version})
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-xs">Model</p>
        <p className="truncate font-mono text-xs">{definition.modelCode}</p>
      </div>
    </div>
  );
}
