import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter.js';
import type { File as FileDocument } from '../../app/modules/files/files.types.js';
import type { Project } from '../../app/modules/projects/projects.types.js';
import { getProjectFileStoragePath } from '../../app/modules/uploads/helpers/projectFileStorage.js';
import uploadFile from '../../app/modules/uploads/services/uploadFile.js';
import { getSeededTeams } from './teamSeeder.js';
import { getSeededUsers } from './userSeeder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

const SEED_PROJECTS = [
  {
    name: 'Tutoring Transcripts Study 2024',
    files: [
      'test_file.csv'
    ],
  }
];

async function uploadFileToStorage(
  filePath: string,
  projectId: string,
  fileDocumentId: string
): Promise<void> {
  // Read the file from fixtures
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  // Create a File-like object (we only handle CSV files)
  const fileObj = {
    arrayBuffer: async () => fileBuffer.buffer,
    type: 'text/csv',
    size: fileBuffer.length,
  };

  // Get storage path
  const uploadPath = getProjectFileStoragePath(projectId, fileDocumentId, fileName);

  // Upload to storage using the uploadFile service
  await uploadFile({ file: fileObj, uploadPath });

  console.log(`    ✓ Uploaded file to storage: ${fileName}`);
}

export async function seedProjects() {
  const documents = getDocumentsAdapter();
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
      const existing = await documents.getDocuments<Project>({
        collection: 'projects',
        match: { name: projectData.name },
        sort: {},
      });

      if (existing.data.length > 0) {
        console.log(`  ⏭️  Project '${projectData.name}' already exists, skipping...`);
        continue;
      }

      // Create project
      const projectResult = await documents.createDocument<Project>({
        collection: 'projects',
        update: {
          name: projectData.name,
          team: team._id,
          createdBy: admin._id,
          isUploadingFiles: false,
          isConvertingFiles: false,
          hasSetupProject: true,
          hasErrored: false,
        },
      });

      console.log(`  ✓ Created project: ${projectData.name} (ID: ${projectResult.data._id})`);

      // Upload files
      for (const fileName of projectData.files) {
        const fixturePath = path.join(FIXTURES_DIR, fileName);

        // Check if fixture file exists
        if (!fs.existsSync(fixturePath)) {
          console.warn(`    ⚠️  Fixture file not found: ${fileName}, skipping...`);
          continue;
        }

        // Get file stats
        const stats = fs.statSync(fixturePath);
        const ext = path.extname(fileName).toLowerCase();
        let fileType = 'application/octet-stream';
        if (ext === '.csv') fileType = 'text/csv';
        else if (ext === '.json') fileType = 'application/json';
        else if (ext === '.vtt') fileType = 'text/vtt';

        // Create file document
        const fileResult = await documents.createDocument<FileDocument>({
          collection: 'files',
          update: {
            name: fileName,
            project: projectResult.data._id,
            fileType,
            createdBy: admin._id,
          },
        });

        console.log(`    ✓ Created file document: ${fileName} (ID: ${fileResult.data._id})`);

        // Upload file to storage
        await uploadFileToStorage(
          fixturePath,
          projectResult.data._id,
          fileResult.data._id
        );

        // Mark file as uploaded
        await documents.updateDocument({
          collection: 'files',
          match: { _id: fileResult.data._id },
          update: { hasUploaded: true },
        });
      }

      // Create sessions from uploaded files and queue processing jobs
      console.log(`    → Processing files into sessions...`);
      await processProjectFiles(projectResult.data._id, team._id);

      console.log(`  ✅ Project '${projectData.name}' seeded with ${projectData.files.length} files\n`);
    } catch (error) {
      console.error(`  ✗ Error creating project ${projectData.name}:`, error);
      throw error;
    }
  }
}

async function processProjectFiles(projectId: string, teamId: string) {
  // Import the service that creates sessions and queues processing jobs
  const createSessionsFromFiles = (await import('../../app/modules/projects/services/createSessionsFromFiles.server.js')).default;

  // Call the service to create sessions and queue background jobs
  await createSessionsFromFiles({
    projectId,
    shouldCreateSessionModels: true,
    attributesMapping: undefined,
  });

  console.log(`      ✓ Sessions created and processing jobs queued`);
}
