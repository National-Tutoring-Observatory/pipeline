import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import clsx from 'clsx';
import map from 'lodash/map';
import { useDropzone } from 'react-dropzone';
import Flag from '~/modules/featureFlags/components/flag';
import type { FileStructure, FileType } from '../files.types';

export default function UploadFiles({
  acceptedFiles,
  fileType,
  fileStructure,
  isUploading,
  onDrop,
  onDeleteAcceptedFileClicked,
  onUploadFilesClicked,
  onFileTypeChanged,
  onFileStructureChanged
}: {
  acceptedFiles: { _id: string, name: string, type: string }[],
  fileType: FileType,
  fileStructure: FileStructure,
  isUploading: boolean,
  onDrop: (acceptedFiles: any) => void,
  onDeleteAcceptedFileClicked: (id: string) => void,
  onUploadFilesClicked: () => void,
  onFileTypeChanged: (fileType: FileType) => void,
  onFileStructureChanged: (fileStructure: FileStructure) => void
}) {

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
          <div className="grid gap-y-2 mb-4">
            <div className="grid gap-y-2 mb-4">
              <Label>
                Choose a file type
              </Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={fileType}
                onValueChange={onFileTypeChanged}
              >
                <ToggleGroupItem value="CSV" aria-label="Toggle bold">
                  CSV
                </ToggleGroupItem>
                <ToggleGroupItem value="JSON" aria-label="Toggle italic">
                  JSON
                </ToggleGroupItem>
                <ToggleGroupItem value="JSONL" aria-label="Toggle strikethrough">
                  JSONL
                </ToggleGroupItem>
                <ToggleGroupItem value="VTT" aria-label="Toggle bold">
                  VTT
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid gap-y-2 mb-4">
              <Label>
                Choose how your data is organised
              </Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={fileStructure}
                onValueChange={onFileStructureChanged}
                disabled={fileType !== 'CSV'}
              >
                <ToggleGroupItem value="MULTIPLE" aria-label="Toggle bold">
                  Multiple sessions per file
                </ToggleGroupItem>
                <ToggleGroupItem value="SINGLE" aria-label="Toggle bold">
                  Single sessions per file
                </ToggleGroupItem>
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
          <div>
            <div className="grid gap-y-2">
              <Label>
                Instructions
              </Label>
              <div>
                Instructions for upload the data type will go here...
              </div>
            </div>
          </div>
        </div>
      </Flag>
      <div className={uploadClassName} {...getRootProps()}>
        <input {...getInputProps()} disabled={isUploading} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>
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
      )}
    </div>
  )

}
