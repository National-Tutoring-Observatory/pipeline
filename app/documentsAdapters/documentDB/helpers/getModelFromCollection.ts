const MODELS_BY_COLLECTION: { [key: string]: string } = {
  projects: 'Project'
}

export default (collection: string) => {
  return MODELS_BY_COLLECTION[collection];
}