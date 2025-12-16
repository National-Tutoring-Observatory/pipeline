import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import map from 'lodash/map';
import { Link } from "react-router";

import { Collection } from "@/components/ui/collection";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import dayjs from 'dayjs';
import { EllipsisVertical } from "lucide-react";
import getPromptsEmptyAttributes from "../helpers/getPromptsEmptyAttributes";
import getPromptsItemActions from "../helpers/getPromptsItemActions";
import getPromptsItemAttributes from "../helpers/getPromptsItemAttributes";
import promptsActions from "../helpers/promptsActions";
import promptsFilters from "../helpers/promptsFilters";
import promptsSortOptions from "../helpers/promptsSortOptions";
import type { Prompt } from "../prompts.types";

interface PromptsProps {
  prompts: Prompt[];
  searchValue: string,
  currentPage: number,
  totalPages: number,
  filtersValues: {},
  sortValue: string,
  onActionClicked: (action: string) => void;
  onItemActionClicked: ({ id, action }: { id: string, action: string }) => void,
  onSearchValueChanged: (searchValue: string) => void,
  onPaginationChanged: (currentPage: number) => void,
  onFiltersValueChanged: (filterValue: any) => void,
  onSortValueChanged: (sortValue: any) => void
  onCreatePromptButtonClicked: () => void;
  onEditPromptButtonClicked: (prompt: Prompt) => void;
  onDeletePromptButtonClicked: (prompt: Prompt) => void;
}

export default function Prompts({
  prompts,
  filtersValues,
  sortValue,
  searchValue,
  currentPage,
  totalPages,
  onCreatePromptButtonClicked,
  onEditPromptButtonClicked,
  onDeletePromptButtonClicked,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged,
  onSortValueChanged
}: PromptsProps) {
  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        Prompts
      </h1>
      {(prompts.length === 0) && (
        <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
          No prompts created
          <div className="mt-3">
            <Button onClick={onCreatePromptButtonClicked}>Create prompt</Button>
          </div>
        </div>
      )}
      <Collection
        items={prompts}
        itemsLayout="list"
        actions={promptsActions}
        filters={promptsFilters}
        sortOptions={promptsSortOptions}
        hasSearch
        hasPagination
        filtersValues={filtersValues}
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        emptyAttributes={getPromptsEmptyAttributes()}
        getItemAttributes={getPromptsItemAttributes}
        getItemActions={getPromptsItemActions}
        onActionClicked={onActionClicked}
        onItemActionClicked={onItemActionClicked}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onFiltersValueChanged={onFiltersValueChanged}
        onSortValueChanged={onSortValueChanged}

      />
      {(prompts.length > 0) && (
        <div className="border rounded-md">
          <div className="flex justify-end border-b p-2">
            <Button onClick={onCreatePromptButtonClicked}>Create prompt</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead className="w-[300px]">Annotation type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {map(prompts, (prompt) => {
                return (
                  <TableRow key={prompt._id}>
                    <TableCell className="font-medium">
                      <Link to={`/prompts/${prompt._id}/${prompt.productionVersion}`} className="block w-full">
                        {prompt.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">

                      {prompt.annotationType}
                    </TableCell>
                    <TableCell>{dayjs(prompt.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
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
                          <DropdownMenuItem onClick={() => onEditPromptButtonClicked(prompt)}>
                            Edit
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
                          <DropdownMenuItem>Favorite</DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onDeletePromptButtonClicked(prompt)}>
                            Delete
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
  );
}
