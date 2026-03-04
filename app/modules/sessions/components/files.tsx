import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import map from "lodash/map";
import { Upload } from "lucide-react";
import { Link } from "react-router";
import getDateString from "~/modules/app/helpers/getDateString";
import type { File } from "~/modules/files/files.types";

interface FilesProps {
  files: File[];
  projectId: string;
  canUpdate: boolean;
  isProcessing: boolean;
}

export default function Files({
  files,
  projectId,
  canUpdate,
  isProcessing,
}: FilesProps) {
  return (
    <div className="mt-8">
      {canUpdate && (
        <div className="mb-4 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            disabled={isProcessing}
            asChild={!isProcessing}
          >
            <Link to={`/projects/${projectId}/upload-files`}>
              <Upload className="mr-1 h-4 w-4" />
              Upload Files
            </Link>
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>File type</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {map(files, (file) => (
              <TableRow key={file._id}>
                <TableCell className="font-medium">{file.name}</TableCell>
                <TableCell>{getDateString(file.createdAt)}</TableCell>
                <TableCell>{file.fileType}</TableCell>
                <TableCell className="flex justify-end text-right"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
