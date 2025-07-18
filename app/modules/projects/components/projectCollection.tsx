import { Button } from "@/components/ui/button";
import type { CreateCollection, Collection } from "~/modules/collections/collections.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import CollectionCreatorContainer from "~/modules/collections/containers/collectionCreator.container";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router";
import type { Run } from "~/modules/runs/runs.types";
import map from 'lodash/map';
import find from 'lodash/find';
import providers from "~/modules/prompts/providers";
import annotationTypes from "~/modules/prompts/annotationTypes";
import { Badge } from "@/components/ui/badge";

export default function ProjectCollection({
  collection,
  runs,
  onSetupCollection,
  onExportCollectionButtonClicked,
  onAddRunButtonClicked,
}: {
  collection: Collection,
  runs: Run[],
  onSetupCollection: ({ selectedSessions, selectedRuns }: CreateCollection) => void,
  onExportCollectionButtonClicked: ({ exportType }: { exportType: string }) => void,
  onAddRunButtonClicked: () => void,
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
      {(collection.hasSetup) && (
        <div className="mt-8">
          <div className="text-xs text-muted-foreground">Runs</div>
          <div className="border rounded-md h-80 overflow-y-auto mt-2">
            <div className="flex justify-end border-b p-2">
              <Button onClick={onAddRunButtonClicked}>Add run</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Annotation type</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {map(runs, (run: Run) => {
                  return (
                    <TableRow key={run._id}>
                      <TableCell className="font-medium">
                        <Link to={`/projects/${run.project}/runs/${run._id}`}>
                          {run.name}
                        </Link>
                      </TableCell>
                      <TableCell>{find(providers, { provider: run.model })?.name}</TableCell>
                      <TableCell>{find(annotationTypes, { value: run.annotationType })?.name}</TableCell>
                      <TableCell>
                        <div>
                          {run.prompt}
                        </div>
                        <div>
                          <Badge >
                            Version {run.promptVersion}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {run.isComplete ? 'Complete' : 'Not complete'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {(!collection.hasSetup) && (
        <CollectionCreatorContainer onSetupCollection={onSetupCollection} />
      )}
    </div>
  );
}