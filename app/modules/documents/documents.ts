
import 'app/documentsAdapters/documentDB/index.ts';
import 'app/documentsAdapters/local/index.ts';

import mongoose from 'mongoose';
import collectionSchema from './schemas/collection.schema';
import featureFlagSchema from './schemas/featureFlag.schema';
import fileSchema from './schemas/file.schema';
import migrationSchema from './schemas/migration.schema';
import projectSchema from './schemas/project.schema';
import promptSchema from './schemas/prompt.schema';
import promptVersionSchema from './schemas/promptVersion.schema';
import runSchema from './schemas/run.schema';
import sessionSchema from './schemas/session.schema';

const registerModels = () => {
  if (!mongoose.models.Project) {
    mongoose.model('Project', projectSchema);
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
  if (!mongoose.models.FeatureFlag) {
    mongoose.model('FeatureFlag', featureFlagSchema);
  }
  if (!mongoose.models.Migration) {
    mongoose.model('Migration', migrationSchema);
  }
}

registerModels();
