# Seeds

This directory contains scripts for seeding the database with test data.

## Overview

The seeds system helps you quickly populate the database with realistic test data including:
- **Users**: Test users with different roles (admin, regular users)
- **Teams**: Research teams with ownership relationships
- **Projects**: Projects with uploaded files from the fixtures directory
- **Files**: Actual file uploads to storage (CSV, VTT, etc.)

## Prerequisites

Before running seeds, ensure:
1. **Redis is running**: `yarn local:redis` (in a separate terminal)
2. **Workers are running** (optional, for file processing): `yarn workers:dev` (in a separate terminal)

## Usage

### Run All Seeds
```bash
yarn seeds
```

### Run Specific Seeds
```bash
# Seed only users
yarn seeds --users

# Seed only teams
yarn seeds --teams

# Seed only prompts
yarn seeds --prompts

# Seed only projects (includes file uploads)
yarn seeds --projects
```

### Clean Data Before Seeding
```bash
# Clean all data and reseed
yarn seeds --clean

# Clean only
yarn seeds --clean --users
```

### Combine Options
```bash
# Clean and seed users and teams only
yarn seeds --clean --users --teams
```

## Seeded Data

### Users
- **testadmin**: Super admin user (githubId: 100001)
- **testuser1**: Regular user (githubId: 100002)
- **testuser2**: Regular user (githubId: 100003)

### Teams
- **Research Team Alpha**: Owned by testadmin
- **Education Lab Beta**: Owned by testadmin

### Prompts
- **Student Engagement Analysis**: Analyzes student engagement levels
- **Teacher Feedback Classification**: Classifies types of teacher feedback
- **Math Problem Solving Strategy**: Identifies problem-solving strategies

### Projects
Projects are created with files from the `./seeds/fixtures` directory:

1. **Tutoring Transcripts Study 2024**
   - `test_file.csv`

## How It Works

The seeding process works as follows:
1. Loading fixture files from the `seeds/fixtures` directory.
2. Creating users, teams, prompts, and projects in the database.
3. Uploading files to storage using the configured storage adapter (LOCAL or AWS_S3).
4. Storing files in the correct project directory structure: `storage/{projectId}/files/{fileId}/{filename}`.
5. Creating session documents for each uploaded file.
### Background Processing
After seeding, files need to be processed into session data (JSON format):
- **Automatic processing**: Requires workers to be running (`yarn workers:dev`)
- **Jobs are queued** via BullMQ and processed by workers
- Sessions will have `hasConverted: false` until workers process them
- Check the workers output to see file processing progress

**To fully seed with processed sessions:**
```bash
# Terminal 1: Start Redis
yarn local:redis

# Terminal 2: Start Workers
yarn workers:dev

# Terminal 3: Run Seeds
yarn seeds

# Workers will automatically process the uploaded files
### Storage Adapters
The seeds work with both storage adapters:
- **LOCAL**: Files stored in `./storage` directory
- **AWS_S3**: Files uploaded to configured S3 bucket

### Data Relationships
Seeds maintain proper relationships:
- Users are added to teams with ADMIN role
- Projects are associated with teams
- Files are linked to projects
- All entities have proper `createdBy` references

## Development

### Adding New Seeds

1. Create a new seeder file in `./seeders/`:
```typescript
// seeders/newSeeder.ts
import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter.js';

export async function seedNewEntity() {
  const documents = getDocumentsAdapter();

  // Your seeding logic here
}
```

2. Add the seeder to `index.ts`:
```typescript
if (options.all || options.newEntity) {
  console.log('🎯 Seeding new entity...');
  const { seedNewEntity } = await import('./seeders/newSeeder.js');
  await seedNewEntity();
  console.log('✅ New entity seeded\n');
}
```

3. Update the cleaner if needed:
```typescript
// seeders/cleaner.ts
await documents.deleteMany({
  collection: 'newentities',
  match: { /* your criteria */ },
});
```

### Testing Seeds
```bash
# Run seeds in development
yarn seeds

# Check the database
# - LOCAL adapter: Check ./data/*.json files
# - DocumentDB adapter: Query MongoDB directly

# Check storage
# - LOCAL adapter: Check ./storage directory
# - AWS_S3 adapter: Check S3 bucket
```

## Troubleshooting

### "No seeded users/teams found"
Run the seeds in order:
```bash
yarn seeds --users
yarn seeds --teams
yarn seeds --projects
```

Or run all at once:
```bash
yarn seeds
```

### "Fixture file not found"
Ensure fixture files exist in `./fixtures` directory:
- `test_data_63_ForAnnotationTool.-.test_data_63.csv`
- `conversation.csv`
- `875691052_captions (1).vtt`
- `884473571_captions (1).vtt`

### Storage Errors
Check your environment configuration:
- `STORAGE_ADAPTER` is set correctly (LOCAL or AWS_S3)
- For AWS_S3: Verify AWS credentials and bucket access
- For LOCAL: Ensure write permissions to `./storage` directory

### Duplicate Data
If you see "already exists, skipping" messages, the data is already seeded.
To reseed, run with `--clean`:
```bash
yarn seeds --clean
```

## Best Practices

1. **Use seeds for development**: Don't commit seeded data to git
2. **Keep fixtures realistic**: Use real data samples (anonymized)
3. **Test both adapters**: Verify seeds work with LOCAL and AWS_S3
4. **Clean before testing**: Use `--clean` to start fresh
5. **Add documentation**: Document any new seed data structures
