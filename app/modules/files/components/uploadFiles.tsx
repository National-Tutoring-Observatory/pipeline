import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import clsx from 'clsx';
import map from 'lodash/map';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router';
import Flag from '~/modules/featureFlags/components/flag';
import type { FileType } from '../files.types';
import getFileUploadAccepts from '../helpers/getFileUploadAccepts';

export default function UploadFiles({
  acceptedFiles,
  fileType,
  instructions,
  isUploading,
  onDrop,
  onDeleteAcceptedFileClicked,
  onUploadFilesClicked,
  onFileTypeChanged,
}: {
  acceptedFiles: { _id: string, name: string, type: string }[],
  fileType: FileType,
  instructions: { overview: string, link: string },
  isUploading: boolean,
  onDrop: (acceptedFiles: any) => void,
  onDeleteAcceptedFileClicked: (id: string) => void,
  onUploadFilesClicked: () => void,
  onFileTypeChanged: (fileType: FileType) => void
}) {

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept: getFileUploadAccepts([fileType]), onDrop });

  let uploadButtonText = `Upload ${acceptedFiles.length} files`;

  if (isUploading) {
    uploadButtonText = `Uploading ${acceptedFiles.length} files`;
  }

  const uploadClassName = clsx('border border-dashed border-black/20 p-8 rounded-md hover:bg-gray-50 dark:hover:bg-gray-50 text-center', {
    'opacity-40': isUploading
  })

  return (
    <div>
      <Flag flag="HAS_NEW_UPLOADS_FLOW">
        <div className="grid grid-cols-2 gap-x-4">
          <div className="grid gap-y-2">
            <div className="grid gap-y-2 mb-4">
              <Label>
                Choose a file type
              </Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={fileType}
                disabled={acceptedFiles.length > 0}
                onValueChange={onFileTypeChanged}
              >
                <ToggleGroupItem value="CSV" aria-label="Toggle bold">
                  CSV
                </ToggleGroupItem>
                {/* <ToggleGroupItem value="JSON" aria-label="Toggle italic">
                  JSON
                </ToggleGroupItem>
                <ToggleGroupItem value="JSONL" aria-label="Toggle strikethrough">
                  JSONL
                </ToggleGroupItem>
                <ToggleGroupItem value="VTT" aria-label="Toggle bold">
                  VTT
                </ToggleGroupItem> */}
              </ToggleGroup>
            </div>
            <div className="grid gap-y-2">
              <Label>
                Upload files
              </Label>
              <div className={uploadClassName} {...getRootProps()}>
                <input {...getInputProps()} disabled={isUploading} />
                {
                  isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
                }
              </div>
            </div>
          </div>
          <div className="h-full">
            <Card className='h-full shadow-none'>
              <CardHeader>
                <CardTitle>
                  Instructions for {fileType}
                </CardTitle>
                <CardDescription>
                  <div dangerouslySetInnerHTML={{ __html: instructions.overview }} />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-2">
                  For more detailed instructions, please read our help document.
                </div>
                <Button variant="secondary" asChild>
                  <Link
                    to={instructions.link}
                    target="_blank"
                  >
                    View help document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Flag >
      {(acceptedFiles.length > 0) && (
        <div className="mt-8">
          <div className="border rounded-md">
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
                    <TableRow key={acceptedFile._id} className="grid grid-cols-[500px_1fr_auto] items-center">
                      <TableCell className="font-medium">
                        {acceptedFile.name}
                      </TableCell>
                      <TableCell>{acceptedFile.type}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => onDeleteAcceptedFileClicked(acceptedFile._id)}>
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
              disabled={isUploading}
              onClick={onUploadFilesClicked}
            >
              {uploadButtonText}
            </Button>
          </div>
        </div>
      )
      }
    </div >
  )

}
