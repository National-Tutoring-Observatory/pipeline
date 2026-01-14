
import 'app/documentsAdapters/documentDB/index.ts';
import 'app/documentsAdapters/local/index.ts';

import mongoose from 'mongoose';
import collectionSchema from './schemas/collection.schema';
import sessionSchema from './schemas/session.schema';

const registerModels = () => {
  if (!mongoose.models.Session) {
    mongoose.model('Session', sessionSchema);
  }
  if (!mongoose.models.Collection) {
    mongoose.model('Collection', collectionSchema);
  }
}

registerModels();
