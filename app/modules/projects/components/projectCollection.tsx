import { Button } from "@/components/ui/button";
import type { CreateCollection, Collection } from "~/modules/collections/collections.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import CollectionCreatorContainer from "~/modules/collections/containers/collectionCreator.container";

export default function ProjectCollection({
  collection,
  onStartCollectionClicked,
  onExportCollectionButtonClicked,
}: {
  collection: Collection,
  onStartCollectionClicked: ({ selectedSessions, selectedRuns }: CreateCollection) => void,
  onExportCollectionButtonClicked: ({ exportType }: { exportType: string }) => void
}) {

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 relative">
        <div className="flex justify-between">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {collection.name}
          </h1>
          <div>
            {((!collection.hasExportedCSV || !collection.hasExportedJSONL)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    disabled={collection.isExporting}
                    className="data-[state=open]:bg-muted text-muted-foreground flex"
                  >
                    <Download />
                    {collection.isExporting ? <span>Exporting</span> : <span>Export</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExportCollectionButtonClicked({ exportType: 'CSV' })}>
                    As Table (.csv file)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExportCollectionButtonClicked({ exportType: 'JSON' })}>
                    JSONL (.jsonl file)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      {(!collection.hasSetup) && (
        <CollectionCreatorContainer collection={collection} onStartCollectionClicked={onStartCollectionClicked} />
      )}
    </div>
  );
}