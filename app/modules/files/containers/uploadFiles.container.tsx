import React, { Component } from 'react';
import UploadFiles from "../components/uploadFiles";
import map from 'lodash/map';
import { v4 as uuidv4 } from 'uuid';
import remove from 'lodash/remove';
import cloneDeep from 'lodash/cloneDeep';

class UploadFilesContainer extends Component {

  state = {
    acceptedFiles: [],
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
    })
    console.log(clonedAcceptedFiles);

  }

  render() {
    return (
      <UploadFiles
        acceptedFiles={this.state.acceptedFiles}
        onDrop={this.onDrop}
        onDeleteAcceptedFileClicked={this.onDeleteAcceptedFileClicked}
      />
    )
  }
};

export default UploadFilesContainer;