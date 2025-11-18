import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import remove from 'lodash/remove';
import { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';
import UploadFiles from "../components/uploadFiles";
import type { FileType } from '../files.types';
import getInstructionsByFileType from '../helpers/getInstructionsByFileType';

interface UploadFilesContainerProps {
  onUploadFiles: ({ acceptedFiles, fileType }: { acceptedFiles: any[], fileType: FileType }) => void;
}

class UploadFilesContainer extends Component<UploadFilesContainerProps> {

  state = {
    acceptedFiles: [],
    fileType: 'CSV' as FileType,
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
    const { acceptedFiles, fileType } = this.state;
    this.props.onUploadFiles({ acceptedFiles, fileType });
  }

  onFileTypeChanged = (fileType: FileType) => {
    if (fileType) {
      this.setState({ fileType });
    }
  }

  render() {

    const { acceptedFiles, fileType, isUploading } = this.state;

    return (
      <UploadFiles
        acceptedFiles={acceptedFiles}
        fileType={fileType}
        instructions={getInstructionsByFileType({ fileType })}
        isUploading={isUploading}
        onDrop={this.onDrop}
        onDeleteAcceptedFileClicked={this.onDeleteAcceptedFileClicked}
        onUploadFilesClicked={this.onUploadFilesClicked}
        onFileTypeChanged={this.onFileTypeChanged}
      />
    )
  }
};

export default UploadFilesContainer;
