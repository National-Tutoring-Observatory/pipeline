import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import map from 'lodash/map';
import { Link } from "react-router";

import type { Prompt } from "../prompts.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import dayjs from 'dayjs'

interface PromptsProps {
  prompts: Prompt[];
  onCreatePromptButtonClicked: () => void;
  onEditPromptButtonClicked: (prompt: Prompt) => void;
  onDeletePromptButtonClicked: (prompt: Prompt) => void;
}

export default function Prompts({
  prompts,
  onCreatePromptButtonClicked,
  onEditPromptButtonClicked,
  onDeletePromptButtonClicked
}: PromptsProps) {
  return (
    <div className="max-w-5xl mx-auto p-8">
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
                      <Link to={`/prompts/${prompt._id}/latest`} className="block w-full">
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
