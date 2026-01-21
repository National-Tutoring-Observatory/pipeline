import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clsx from "clsx";
import map from "lodash/map";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import type { FetcherWithComponents } from "react-router";
import { Link } from "react-router";
import { SUPPORTED_FILE_TYPES } from "../constants";
import type { FileType } from "../files.types";
import getFileUploadAccepts from "../helpers/getFileUploadAccepts";

interface UploadFilesData {
  errors?: Record<string, string>;
  success?: boolean;
}

export default function UploadFiles({
  acceptedFiles,
  instructionsByType,
  isUploading,
  onDrop,
  onDeleteAcceptedFileClicked,
  fetcher,
  onUploadClick,
}: {
  acceptedFiles: { _id: string; name: string; type: string }[];
  instructionsByType: Record<FileType, { overview: string; link: string }>;
  isUploading: boolean;
  onDrop: (acceptedFiles: File[]) => void;
  onDeleteAcceptedFileClicked: (id: string) => void;
  fetcher: FetcherWithComponents<UploadFilesData>;
  onUploadClick: () => void;
}) {
  const [activeTab, setActiveTab] = useState<FileType>("CSV");
  const data = fetcher.data as UploadFilesData | undefined;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: getFileUploadAccepts(SUPPORTED_FILE_TYPES),
    onDrop,
  });

  let uploadButtonText = `Upload ${acceptedFiles.length} files`;

  if (isUploading) {
    uploadButtonText = `Uploading ${acceptedFiles.length} files`;
  }

  const uploadClassName = clsx(
    "border border-dashed border-black/20 p-8 rounded-md hover:bg-gray-50 dark:hover:bg-gray-50 text-center",
    {
      "opacity-40": isUploading,
    },
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4">
        <div className="grid gap-y-2">
          <div className="grid gap-y-2">
            <Label>Upload files</Label>
            <div className={uploadClassName} {...getRootProps()}>
              <input {...getInputProps()} disabled={isUploading} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>
            {data?.errors?.files && (
              <div className="text-destructive space-y-1 text-sm">
                <p>{data.errors.files}</p>
                <p>Check the File Instructions for the correct format.</p>
              </div>
            )}
          </div>
        </div>
        <div className="h-full">
          <Card className="h-full shadow-none">
            <CardHeader>
              <CardTitle>File Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as FileType)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  {SUPPORTED_FILE_TYPES.map((type) => (
                    <TabsTrigger key={type} value={type}>
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {SUPPORTED_FILE_TYPES.map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4">
                    <CardDescription>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: instructionsByType[type].overview,
                        }}
                      />
                    </CardDescription>
                    <Button variant="secondary" asChild>
                      <Link to={instructionsByType[type].link} target="_blank">
                        View help document
                      </Link>
                    </Button>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      {acceptedFiles.length > 0 && (
        <div className="mt-8">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="grid grid-cols-[500px_1fr_auto] items-center">
                  <TableHead className="flex items-center">Name</TableHead>
                  <TableHead className="flex items-center">Type</TableHead>
                  <TableHead className="flex items-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="block h-[350px] overflow-y-auto">
                {map(acceptedFiles, (acceptedFile) => {
                  return (
                    <TableRow
                      key={acceptedFile._id}
                      className="grid grid-cols-[500px_1fr_auto] items-center"
                    >
                      <TableCell className="font-medium">
                        {acceptedFile.name}
                      </TableCell>
                      <TableCell>{acceptedFile.type}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onDeleteAcceptedFileClicked(acceptedFile._id)
                          }
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-2 flex justify-center">
            <Button size="lg" disabled={isUploading} onClick={onUploadClick}>
              {uploadButtonText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
