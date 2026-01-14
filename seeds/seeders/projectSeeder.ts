import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UserService } from '../../app/modules/users/user.js';
import { ProjectService } from '../../app/modules/projects/project.js';
import { FileService } from '../../app/modules/files/file.js';
import type { File as FileDocument } from '../../app/modules/files/files.types.js';
import { getProjectFileStoragePath } from '../../app/modules/uploads/helpers/projectFileStorage.js';
import uploadFile from '../../app/modules/uploads/services/uploadFile.js';
import splitMultipleSessionsIntoFiles from '../../app/modules/uploads/services/splitMultipleSessionsIntoFiles.js';
import getAttributeMappingFromFile from '../../app/modules/projects/helpers/getAttributeMappingFromFile.js';
import createSessionsFromFiles from '../../app/modules/projects/services/createSessionsFromFiles.server.js';
import { getSeededTeams } from './teamSeeder.js';
import { getSeededUsers } from './userSeeder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

const SEED_PROJECTS = [
  {
    name: 'Tutoring Transcripts Study 2024',
    files: [
      { name: 'test_upload.csv', type: 'CSV' }
    ],
  },
  {
    name: 'Tutoring Transcripts JSONL Study',
    files: [
      { name: 'test_upload.jsonl', type: 'JSONL' }
    ],
  }
];

export async function seedProjects() {
  const teams = await getSeededTeams();
  const users = await getSeededUsers();

  if (teams.length === 0) {
    console.warn('  ⚠️  No seeded teams found. Please run team seeder first.');
    return;
  }

  if (users.length === 0) {
    console.warn('  ⚠️  No seeded users found. Please run user seeder first.');
    return;
  }

  const admin = users.find(u => u.role === 'SUPER_ADMIN');
  if (!admin) {
    console.warn('  ⚠️  No admin user found.');
    return;
  }

  for (let i = 0; i < SEED_PROJECTS.length; i++) {
    const projectData = SEED_PROJECTS[i];
    const team = teams[i % teams.length]; // Distribute projects across teams

    try {
      // Check if project already exists
      const existing = await ProjectService.find({
        match: { name: projectData.name },
      });

      if (existing.length > 0) {
        console.log(`  ⏭️  Project '${projectData.name}' already exists, skipping...`);
        continue;
      }

      // Create project
      const project = await ProjectService.create({
        name: projectData.name,
        team: team._id,
        createdBy: admin._id,
        isUploadingFiles: false,
        isConvertingFiles: false,
        hasSetupProject: true,
        hasErrored: false,
      });

      console.log(`  ✓ Created project: ${projectData.name} (ID: ${project._id})`);

      // Create sessions from uploaded files and queue processing jobs
      console.log(`    → Processing files into sessions...`);
      const teamId = typeof project.team === 'string' ? project.team : project.team._id;
      await processProjectFiles(project._id, teamId, projectData.files);

      console.log(`  ✅ Project '${projectData.name}' seeded with ${projectData.files.length} files\n`);
    } catch (error) {
      console.error(`  ✗ Error creating project ${projectData.name}:`, error);
      throw error;
    }
  }
}

async function processProjectFiles(projectId: string, teamId: string, files: Array<{ name: string; type: string }>) {
  // Load fixture files as File objects
  const fixtureFiles: Array<{ file: File; type: string }> = [];
  for (const fileConfig of files) {
    const fixturePath = path.join(FIXTURES_DIR, fileConfig.name);
    if (fs.existsSync(fixturePath)) {
      const fileBuffer = fs.readFileSync(fixturePath);
      const mimeType = fileConfig.type === 'JSONL' ? 'application/jsonl' : 'text/csv';
      const fileObj = new File([fileBuffer], fileConfig.name, { type: mimeType });
      fixtureFiles.push({ file: fileObj, type: fileConfig.type as 'CSV' | 'JSONL' });
    }
  }

  if (fixtureFiles.length === 0) {
    console.warn(`      ⚠️  No fixture files found`);
    return;
  }

  // Get the admin user for createdBy field
  const admins = await UserService.find({ match: { role: 'SUPER_ADMIN' } });
  const adminUserId = admins[0]?._id;
  if (!adminUserId) {
    console.warn(`      ⚠️  No admin user found`);
    return;
  }

  // Step 1: Split CSV/JSONL files by session_id
  const filesToSplit = fixtureFiles.map(({ file }) => file);
  const splitFiles = await splitMultipleSessionsIntoFiles({ files: filesToSplit });
  console.log(`      ✓ Split ${fixtureFiles.length} file(s) into ${splitFiles.length} session(s)`);

  // Step 2: Get attribute mapping from first split file
  const attributesMapping = await getAttributeMappingFromFile({ file: splitFiles[0], team: teamId });
  console.log(`      ✓ Detected attribute mapping from file`);

  // Step 3: Upload split files to storage
  const uploadedFileIds: string[] = [];

  for (const splitFile of splitFiles) {
    const fileResult = await FileService.create({
      name: splitFile.name,
      project: projectId,
      fileType: 'application/json',
      createdBy: adminUserId,
    });

    const uploadPath = getProjectFileStoragePath(projectId, fileResult._id, splitFile.name);
    await uploadFile({ file: splitFile, uploadPath });

    await FileService.updateById(fileResult._id, { hasUploaded: true });

    uploadedFileIds.push(fileResult._id);
  }
  console.log(`      ✓ Uploaded ${uploadedFileIds.length} file(s)`);

  // Step 4: Create sessions and queue processing (same as app route)
  await createSessionsFromFiles({
    projectId,
    shouldCreateSessionModels: true,
    attributesMapping,
  });

  console.log(`      ✓ Sessions created and processing jobs queued`);
}

