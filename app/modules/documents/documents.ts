
import 'app/documentsAdapters/documentDB/index.ts';
import 'app/documentsAdapters/local/index.ts';

import mongoose from 'mongoose';
import projectSchema from './schemas/project.schema';
import teamSchema from './schemas/team.schema';
import userSchema from './schemas/user.schema';
import promptSchema from './schemas/prompt.schema';
import promptVersionSchema from './schemas/promptVersion.schema';
import fileSchema from './schemas/file.schema';
import sessionSchema from './schemas/session.schema';
import runSchema from './schemas/run.schema';
import collectionSchema from './schemas/collection.schema';

const registerModels = () => {
  if (!mongoose.models.Project) {
    mongoose.model('Project', projectSchema);
  }
  if (!mongoose.models.Team) {
    mongoose.model('Team', teamSchema);
  }
  if (!mongoose.models.User) {
    mongoose.model('User', userSchema);
  }
  if (!mongoose.models.Prompt) {
    mongoose.model('Prompt', promptSchema);
  }
  if (!mongoose.models.PromptVersion) {
    mongoose.model('PromptVersion', promptVersionSchema);
  }
  if (!mongoose.models.File) {
    mongoose.model('File', fileSchema);
  }
  if (!mongoose.models.Session) {
    mongoose.model('Session', sessionSchema);
  }
  if (!mongoose.models.Run) {
    mongoose.model('Run', runSchema);
  }
  if (!mongoose.models.Collection) {
    mongoose.model('Collection', collectionSchema);
  }
}

registerModels();