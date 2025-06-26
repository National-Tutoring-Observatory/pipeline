import React, { Component } from 'react';
import UploadFiles from "../components/uploadFiles";
import map from 'lodash/map';
import { v4 as uuidv4 } from 'uuid';
import remove from 'lodash/remove';
import cloneDeep from 'lodash/cloneDeep';

interface UploadFilesContainerProps {
  onUploadFiles: (acceptedFiles: any[]) => void;
}

class UploadFilesContainer extends Component<UploadFilesContainerProps> {

  state = {
    acceptedFiles: [],
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
    this.props.onUploadFiles(this.state.acceptedFiles);
  }

  render() {
    return (
      <UploadFiles
        acceptedFiles={this.state.acceptedFiles}
        isUploading={this.state.isUploading}
        onDrop={this.onDrop}
        onDeleteAcceptedFileClicked={this.onDeleteAcceptedFileClicked}
        onUploadFilesClicked={this.onUploadFilesClicked}
      />
    )
  }
};

export default UploadFilesContainer;