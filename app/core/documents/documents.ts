
import 'app/documentsAdapters/documentDB/index.ts';
import 'app/documentsAdapters/local/index.ts';

import mongoose from 'mongoose';
import projectSchema from './schemas/project.schema';

const registerModels = () => {
  if (!mongoose.models.Project) {
    mongoose.model('Project', projectSchema);
  }
}

registerModels();