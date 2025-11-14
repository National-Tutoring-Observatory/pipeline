import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import remove from 'lodash/remove';
import { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import UploadFiles from "../components/uploadFiles";
import type { FileStructure, FileType } from '../files.types';

interface UploadFilesContainerProps {
  onUploadFiles: ({ acceptedFiles, fileType, fileStructure }: { acceptedFiles: any[], fileType: FileType, fileStructure: FileStructure }) => void;
}

class UploadFilesContainer extends Component<UploadFilesContainerProps> {

  state = {
    acceptedFiles: [],
    fileType: 'CSV' as FileType,
    fileStructure: 'MULTIPLE' as FileStructure,
    isUploading: false,
  }

  onDrop = (acceptedFiles: any) => {
    this.setState({
      acceptedFiles: map(acceptedFiles, (acceptedFile) => {
        acceptedFile._id = uuidv4();
        return acceptedFile
      })
    });
  }

  onDeleteAcceptedFileClicked = (id: string) => {
    const clonedAcceptedFiles = cloneDeep(this.state.acceptedFiles);

    // @ts-ignore
    remove(clonedAcceptedFiles, { _id: id });
    this.setState({
      acceptedFiles: clonedAcceptedFiles
    });

  }

  onUploadFilesClicked = () => {
    this.setState({ isUploading: true });
    const { acceptedFiles, fileType, fileStructure } = this.state;
    this.props.onUploadFiles({ acceptedFiles, fileType, fileStructure });
  }

  onFileTypeChanged = (fileType: FileType) => {
    if (fileType) {
      let fileStructure = this.state.fileStructure;
      if (fileType !== 'CSV') {
        fileStructure = 'SINGLE';
      }
      if (fileType === 'JSONL') {
        fileStructure = 'MULTIPLE';
      }
      this.setState({ fileType, fileStructure });
    }
  }

  onFileStructureChanged = (fileStructure: FileStructure) => {
    this.setState({ fileStructure });
  }

  render() {

    const { acceptedFiles, fileType, fileStructure, isUploading } = this.state;

    return (
      <UploadFiles
        acceptedFiles={acceptedFiles}
        fileType={fileType}
        fileStructure={fileStructure}
        isUploading={isUploading}
        onDrop={this.onDrop}
        onDeleteAcceptedFileClicked={this.onDeleteAcceptedFileClicked}
        onUploadFilesClicked={this.onUploadFilesClicked}
        onFileTypeChanged={this.onFileTypeChanged}
        onFileStructureChanged={this.onFileStructureChanged}
      />
    )
  }
};

export default UploadFilesContainer;
