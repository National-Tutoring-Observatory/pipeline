import { PromptService } from '../../app/modules/prompts/prompt.js';
import { PromptVersionService } from '../../app/modules/prompts/promptVersion.js';
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
  const teams = await getSeededTeams();

  if (teams.length === 0) {
    console.warn('  ⚠️  No seeded teams found. Please run other seeders first.');
    return;
  }

  const team = teams.find(t => t.name === 'Research Team Alpha') ?? teams[0];

  for (const promptData of SEED_PROMPTS) {
    try {
      // Check if prompt already exists
      const existing = await PromptService.find({
        match: { name: promptData.name },
      });

      if (existing.length > 0) {
        console.log(`  ⏭️  Prompt '${promptData.name}' already exists, skipping...`);
        continue;
      }

      // Create prompt
      const prompt = await PromptService.create({
        name: promptData.name,
        team: team._id,
        annotationType: promptData.annotationType,
        productionVersion: 1,
      });

      console.log(`  ✓ Created prompt: ${promptData.name} (ID: ${prompt._id})`);

      // Create initial version
      await PromptVersionService.create({
        name: promptData.versionName,
        prompt: prompt._id,
        version: 1,
        userPrompt: promptData.userPrompt,
        annotationSchema: promptData.annotationSchema,
        hasBeenSaved: true,
      });

      console.log(`    ✓ Created version 1 for prompt: ${promptData.name}`);

    } catch (error) {
      console.error(`  ✗ Error creating prompt ${promptData.name}:`, error);
      throw error;
    }
  }
}

export async function getSeededPrompts() {
  return PromptService.find({
    match: { name: { $in: SEED_PROMPTS.map(p => p.name) } },
  });
}
