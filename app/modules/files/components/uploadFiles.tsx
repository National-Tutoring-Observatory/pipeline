import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone';
import map from 'lodash/map';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

export default function UploadFiles({
  acceptedFiles,
  isUploading,
  onDrop,
  onDeleteAcceptedFileClicked,
  onUploadFilesClicked
}: {
  acceptedFiles: { _id: string, name: string, type: string }[],
  isUploading: boolean,
  onDrop: (acceptedFiles: any) => void,
  onDeleteAcceptedFileClicked: (id: string) => void,
  onUploadFilesClicked: () => void,
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