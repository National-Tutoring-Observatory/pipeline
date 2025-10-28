export const MODELS_BY_COLLECTION: { [key: string]: string } = {
  projects: 'Project',
  teams: 'Team',
  users: 'User',
  files: 'File',
  collections: 'Collection',
  prompts: 'Prompt',
  promptVersions: 'PromptVersion',
  runs: 'Run',
  sessions: 'Session',
  featureFlags: 'FeatureFlag',
  queues: 'Queue'
}

export default (collection: string) => {
  return MODELS_BY_COLLECTION[collection];
}