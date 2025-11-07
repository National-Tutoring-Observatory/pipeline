import fse from 'fs-extra';
import filterDocumentsByMatch from '../helpers/filterDocumentsByMatch';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';

export default async ({
  collection,
  match,
}: {
  collection: string,
  match: {} | any,
}) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    let data = filterDocumentsByMatch(json, match);

    return data.length;

  } catch (error) {
    return error;
  }

}
