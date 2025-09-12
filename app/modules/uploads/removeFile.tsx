import path from 'path';
import fse from 'fs-extra';

export default async function removeFile({ path }: { path: string }): Promise<void> {

  await fse.remove(path);

}