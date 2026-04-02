import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import type { FetcherWithComponents } from "react-router";
import { Link } from "react-router";
import { SUPPORTED_FILE_TYPES } from "../constants";
import type { FileType, UploadFilesData } from "../files.types";
import getFileUploadAccepts from "../helpers/getFileUploadAccepts";

export default function UploadFiles({
  acceptedFiles,
  instructionsByType,
  isUploading,
  onDrop,
  onDeleteAcceptedFileClicked,
  fetcher,
  onUploadClick,
  onLearnMoreClicked,
}: {
  acceptedFiles: { _id: string; name: string; type: string }[];
  instructionsByType: Record<FileType, { overview: string; link: string }>;
  isUploading: boolean;
  onDrop: (acceptedFiles: File[]) => void;
  onDeleteAcceptedFileClicked: (id: string) => void;
  fetcher: FetcherWithComponents<UploadFilesData>;
  onUploadClick: () => void;
  onLearnMoreClicked: () => void;
}) {
  const [activeTab, setActiveTab] = useState<FileType>("CSV");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
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
    "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
    {
      "border-primary/50 bg-primary/5": isDragActive,
      "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/50":
        !isDragActive,
      "opacity-40 cursor-not-allowed": isUploading,
    },
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4">
        <div className="grid gap-y-2">
          <div className="grid gap-y-2">
            <div className={uploadClassName} {...getRootProps()}>
              <input {...getInputProps()} disabled={isUploading} />
              <Upload className="text-muted-foreground/60 mb-3 h-10 w-10" />
              {isDragActive ? (
                <p className="text-primary font-medium">
                  Drop the files here ...
                </p>
              ) : (
                <p className="font-medium">
                  Drag & drop files here, or click to browse
                </p>
              )}
            </div>
            <div className="bg-card rounded-lg border p-3">
              <div className="text-muted-foreground flex items-center gap-2 text-xs leading-relaxed">
                <ShieldCheck className="text-primary size-4 shrink-0" />
                <span>
                  Your data is stored securely and never accessed, shared, or
                  published.&nbsp;
                  <button
                    type="button"
                    className="text-primary cursor-pointer font-semibold hover:underline"
                    onClick={onLearnMoreClicked}
                  >
                    Learn more
                  </button>
                </span>
              </div>
              <div className="mt-2 flex items-start gap-2 pl-0.5">
                <Checkbox
                  id="privacy-agree"
                  checked={privacyAccepted}
                  onCheckedChange={(checked) =>
                    setPrivacyAccepted(checked === true)
                  }
                />
                <label
                  htmlFor="privacy-agree"
                  className="cursor-pointer text-xs leading-relaxed"
                >
                  I understand that my data will be processed by the LLM
                  providers I select for annotation, and that Sandpiper will not
                  use my data for any other purpose.
                </label>
              </div>
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
                          disabled={isUploading}
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
            <Button
              size="lg"
              disabled={isUploading || !privacyAccepted}
              onClick={onUploadClick}
            >
              {uploadButtonText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
