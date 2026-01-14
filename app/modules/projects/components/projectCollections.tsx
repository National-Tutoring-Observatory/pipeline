import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import map from 'lodash/map';
import { EllipsisVertical, Plus } from "lucide-react";
import { Link, useParams } from "react-router";
import type { Collection } from "~/modules/collections/collections.types";

export default function ProjectCollections({
  collections,
  onEditCollectionButtonClicked,
  onDuplicateCollectionButtonClicked
}: {
  collections: Collection[],
  onEditCollectionButtonClicked: (collection: Collection) => void,
  onDuplicateCollectionButtonClicked: (collection: Collection) => void,
}) {
  const params = useParams();

  return (
    <div className="mt-8">
      {(collections.length === 0) && (
        <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
          No collections created
          <div className="mt-3">
            <Link to={`/projects/${params.id}/create-collection`}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Collection
              </Button>
            </Link>
          </div>
        </div>
      )}
      {(collections.length > 0) && (
        <div className="border rounded-md">
          <div className="flex justify-end border-b p-2">
            <Link to={`/projects/${params.id}/create-collection`}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Collection
              </Button>
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {map(collections, (collection) => {
                return (
                  <TableRow key={collection._id}>
                    <TableCell className="font-medium">
                      <Link to={`/projects/${collection.project}/collections/${collection._id}`}>
                        {collection.name}
                      </Link>
                    </TableCell>
                    <TableCell>{dayjs(collection.createdAt).format('ddd, MM/D/YY - h:mma')}</TableCell>
                    <TableCell className="text-right flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                          >
                            <EllipsisVertical />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => onEditCollectionButtonClicked(collection)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicateCollectionButtonClicked(collection)}>
                            Duplicate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}