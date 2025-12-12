import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter.js';
import type { Prompt, PromptVersion } from '../../app/modules/prompts/prompts.types.js';
import { getSeededTeams } from './teamSeeder.js';

const SEED_PROMPTS = [
  {
    name: 'Student Engagement Analysis',
    annotationType: 'PER_SESSION',
    versionName: 'initial',
    userPrompt: 'Analyze the following tutoring exchange and rate the student engagement level (High, Medium, Low). Consider factors like question asking, response length, and initiative.\n',
    annotationSchema: [
      {
        isSystem: true,
        fieldKey: '_id',
        fieldType: 'string',
        value: '',
      },
      {
        isSystem: true,
        fieldKey: 'identifiedBy',
        fieldType: 'string',
        value: 'AI',
      },
      {
        isSystem: false,
        fieldType: 'string',
        fieldKey: 'engagement_level',
        value: '',
      },
    ],
  },
  {
    name: 'Teacher Feedback Classification',
    annotationType: 'PER_SESSION',
    versionName: 'initial',
    userPrompt: 'Classify the teacher feedback in this exchange into one of these categories: Praise, Corrective, Questioning, Instruction, or Mixed.\n',
    annotationSchema: [
      {
        isSystem: true,
        fieldKey: '_id',
        fieldType: 'string',
        value: '',
      },
      {
        isSystem: true,
        fieldKey: 'identifiedBy',
        fieldType: 'string',
        value: 'AI',
      },
      {
        isSystem: false,
        fieldType: 'string',
        fieldKey: 'feedback_type',
        value: '',
      },
    ],
  },
  {
    name: 'Praise classification',
    annotationType: 'PER_UTTERANCE',
    versionName: 'initial',
    userPrompt: 'Identify each utterance where the teacher has given praise to the student. Only annotate an utterance if praise was given\n',
    annotationSchema: [
      {
        isSystem: true,
        fieldKey: '_id',
        fieldType: 'string',
        value: '',
      },
      {
        isSystem: true,
        fieldKey: 'identifiedBy',
        fieldType: 'string',
        value: 'AI',
      },
      {
        isSystem: false,
        fieldType: 'boolean',
        fieldKey: 'given_praise',
        value: '',
      },
    ],
  },
];

export async function seedPrompts() {
  const documents = getDocumentsAdapter();
  const teams = await getSeededTeams();

  if (teams.length === 0) {
    console.warn('  ⚠️  No seeded teams found. Please run other seeders first.');
    return;
  }

  const team = teams.find(t => t.name === 'Research Team Alpha') ?? teams[0];

  for (const promptData of SEED_PROMPTS) {
    try {
      // Check if prompt already exists
      const existing = await documents.getDocuments<Prompt>({
        collection: 'prompts',
        match: { name: promptData.name },
        sort: {},
      });

      if (existing.data.length > 0) {
        console.log(`  ⏭️  Prompt '${promptData.name}' already exists, skipping...`);
        continue;
      }

      // Create prompt
      const promptResult = await documents.createDocument<Prompt>({
        collection: 'prompts',
        update: {
          name: promptData.name,
          team: team._id,
          annotationType: promptData.annotationType,
          productionVersion: 1,
        },
      });

      console.log(`  ✓ Created prompt: ${promptData.name} (ID: ${promptResult.data._id})`);

      // Create initial version
      await documents.createDocument<PromptVersion>({
        collection: 'promptVersions',
        update: {
          name: promptData.versionName,
          prompt: promptResult.data._id,
          version: 1,
          userPrompt: promptData.userPrompt,
          annotationSchema: promptData.annotationSchema,
          hasBeenSaved: true,
        },
      });

      console.log(`    ✓ Created version 1 for prompt: ${promptData.name}`);

    } catch (error) {
      console.error(`  ✗ Error creating prompt ${promptData.name}:`, error);
      throw error;
    }
  }
}

export async function getSeededPrompts() {
  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<Prompt>({
    collection: 'prompts',
    match: { name: { $in: SEED_PROMPTS.map(p => p.name) } },
    sort: {},
  });
  return result.data;
}
