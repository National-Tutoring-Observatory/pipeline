export function getDatasetDir(version: number) {
  return `datasets/mtm/v${version}`;
}

export function getDatasetSessionPath(version: number, filename: string) {
  return `${getDatasetDir(version)}/${filename}`;
}

export function getDatasetManifestPath(version: number) {
  return `${getDatasetDir(version)}/manifest.json`;
}

export function getDatasetLatestPath() {
  return `datasets/mtm/latest.json`;
}
