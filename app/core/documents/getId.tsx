import fse from 'fs-extra';
import findOrCreateDocuments from './findOrCreateDocuments';

export default async () => {

  await findOrCreateDocuments({ collection: 'config' });

  const json = await fse.readJson(`./data/config.json`);

  const currentId = json.id;

  json.id = json.id + 1;

  await fse.writeJson(`./data/config.json`, json);

  return currentId;

}