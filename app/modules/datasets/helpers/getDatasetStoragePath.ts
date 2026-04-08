export function getDatasetDir(version: number) {
  return `storage/datasets/mtm/v${version}`;
}

export function getDatasetSessionPath(version: number, filename: string) {
  return `${getDatasetDir(version)}/${filename}`;
}

export function getDatasetManifestPath(version: number) {
  return `${getDatasetDir(version)}/manifest.json`;
}

export function getDatasetLatestPath() {
  return `storage/datasets/mtm/latest.json`;
}

export function getMtmFullDatasetZipPath() {
  return `storage/datasets/mtm/mtm-full-dataset.zip`;
}
