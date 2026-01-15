# NTO Pipeline - Agent Instructions

## Overview

NTO (National Tutoring Observatory) Pipeline - React-based web application for analyzing one-on-one tutoring data. The app enables researchers to normalize, de-identify, and automatically annotate tutoring transcripts using large language models (LLMs).

**Stack**: TypeScript, React 19, React Router v7 (SSR), Vite 6, Tailwind CSS 4, shadcn/ui, Mongoose, BullMQ, Yarn

## Essential Commands

### Installation & Setup
```bash
# Install dependencies (always use frozen lockfile to match CI)
yarn install --frozen-lockfile

# Setup environment
cp .env.example .env
# Edit .env as needed
```

### Development
```bash
# Start development server (port 5173)
yarn app:dev

# Start Redis (required for workers and Socket.IO)
yarn local:redis

# Start background workers (in separate terminal)
yarn workers:dev
```

### Build & Validation
```bash
# Type checking (required before commits)
yarn typecheck

# Production build
yarn app:build

# Production server
yarn app:prod
```

### Testing
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run specific test file
yarn test app/modules/collections/__tests__/authorization.test.ts

# Run tests with coverage
yarn test:coverage
```

### Data Migrations
```bash
# Generate new migration
yarn migration:generate <Name Of Migration>
# Example: yarn migration:generate Backfill User Emails
# Creates: app/migrations/YYYYMMDDHHmmss-backfill-user-emails.ts

# Migration guidelines:
# - Only implement the up() function (no down - rollbacks not supported)
# - Add verbose console.log statements for debugging
# - Return { success: failed === 0, message: string, stats: { migrated, failed } }
```

### Pre-commit Checklist
1. ✅ `yarn typecheck` - must pass with no errors
2. ✅ `yarn app:build` - must complete successfully

## Architecture Overview

### Monorepo Structure

The project is organized as a Yarn workspace monorepo:

```
pipeline/
├── app/                    # Main React/Node.js application
│   ├── modules/           # Feature modules
│   ├── uikit/             # Reusable UI components (shadcn/ui)
│   ├── lib/               # Database schemas, utilities
│   ├── storageAdapters/   # Storage implementations (local, AWS S3)
│   ├── documentsAdapters/ # Database implementations (local, DocumentDB)
│   ├── migrations/        # Data migration files
│   └── adapters.js        # Auto-generates storage imports
├── workers/                # BullMQ worker processes (workspace)
├── localMode/              # Local development utilities (workspace)
├── test/                   # Test setup and helpers
├── server.ts              # Express server entry point
└── package.json           # Root with workspaces
```

### Module Organization Pattern

Each feature module in `app/modules/` follows this structure:

```
module/
├── containers/         # Route handlers (loaders + actions)
├── components/         # React UI components
├── services/          # Business logic (*.server.ts)
├── helpers/           # Utility functions
├── authorization.ts   # Permission checks
├── module.ts          # Service class
├── module.types.ts    # TypeScript types
└── __tests__/        # Tests
```

**Core Modules**:
- **Data Management**: `projects`, `runs`, `sessions`, `collections`
- **LLM/Annotations**: `prompts`, `annotations`
- **Access Control**: `teams`, `users`, `authentication`, `authorization`
- **Infrastructure**: `storage`, `queues`, `sockets`

### Service Pattern

All data operations go through service classes with a consistent interface:

```typescript
export class ProjectService {
  static async find(options?: FindOptions): Promise<Project[]>
  static async findById(id: string): Promise<Project | null>
  static async create(data: CreateProjectInput): Promise<Project>
  static async updateById(id: string, updates: Partial<Project>): Promise<Project | null>
  static async deleteById(id: string): Promise<boolean>
  static async paginate(options): Promise<{ data, count, totalPages }>
}
```

**FindOptions Interface**:
- `match`: MongoDB query object
- `sort`: Sort criteria
- `skip`/`limit`: Pagination
- `populate`: Relations to expand

### React Router Pattern

Routes use React Router v7's loader/action pattern:

```typescript
// Data fetching on server
export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getUser(request)
  if (!user) return redirect('/')

  const project = await ProjectService.findById(params.projectId)
  if (!ProjectAuthorization.canView(user, project)) {
    throw new Error("Access denied")
  }

  return { project }
}

// Mutations on server
export async function action({ request, params }: Route.ActionArgs) {
  const user = await getUser(request)
  if (!user) throw new Error("Authentication required")

  const payload = await request.json()

  // Intent-based routing
  if (payload.intent === 'UPDATE_PROJECT') {
    const project = await ProjectService.updateById(params.projectId, payload.data)
    return data({ success: true, project })
  }

  return data({ errors: { general: 'Invalid intent' } }, { status: 400 })
}

// Client component
export default function ProjectRoute() {
  const { project } = useLoaderData<typeof loader>()
  const submit = useSubmit()

  const handleUpdate = () => {
    submit(JSON.stringify({ intent: 'UPDATE_PROJECT', data: {...} }), {
      method: 'POST',
      encType: 'application/json'
    })
  }
}
```

### Authorization Pattern

Every module has an authorization file with consistent methods:

```typescript
export const ProjectAuthorization = {
  canCreate(user: User, teamId: string): boolean
  canView(user: User, project: Project): boolean
  canUpdate(user: User, project: Project): boolean
  canDelete(user: User, project: Project): boolean
}
```

Authorization checks are done in route loaders/actions:
- **Loaders**: Use `redirect()` for auth failures
- **Actions**: Return `data({ errors: {...} }, { status: 400/403/500 })` for errors

### Background Jobs (BullMQ + Redis)

Jobs are processed by workers in the `workers/` workspace:

**Job Creation Pattern**:
```typescript
import { createTaskJob } from '~/modules/queues/helpers/createTaskJob'

// Create parent job with child jobs
await createTaskJob({
  name: 'ANNOTATE_RUN:START',
  data: { runId, userId },
  children: sessions.map(session => ({
    name: 'ANNOTATE_RUN:PROCESS',
    data: { runId, sessionId }
  }))
})
```

**Common Job Types**:
- `ANNOTATE_RUN:START/PROCESS/FINISH` - LLM annotation pipeline
- `CONVERT_FILES_TO_SESSIONS:START/PROCESS/FINISH` - File conversion
- `DELETE_PROJECT:DATA/FINISH` - Cascading deletion
- `RUN_MIGRATION` - Data migrations

### Real-Time Updates (Socket.IO)

Use the `useHandleSockets` hook for real-time data updates:

```typescript
import { useHandleSockets } from '~/modules/sockets/hooks/useHandleSockets'

useHandleSockets({
  event: 'ANNOTATE_RUN',
  matches: [{ task: 'ANNOTATE_RUN:START', status: 'FINISHED' }],
  callback: (payload) => {
    // Revalidate route data
    revalidator.revalidate()
  }
})
```

### Storage Adapters

The app uses a pluggable adapter system for file storage:

- **Local Adapter**: Filesystem storage in `storage/` directory
- **AWS S3 Adapter**: S3 bucket with presigned URLs

Selected via `STORAGE_ADAPTER` environment variable.

**Usage**:
```typescript
import { getStorageAdapter } from '~/modules/storage/storage'

const adapter = getStorageAdapter()
await adapter.upload({ file, uploadPath })
await adapter.download(path)
await adapter.remove(path)
const url = await adapter.request(path) // Presigned URL
```

**IMPORTANT**: `app/adapters.js` auto-generates storage adapter imports:
- Runs automatically before `yarn app:build` and `yarn app:dev`
- Scans `app/storageAdapters/` and generates `app/modules/storage/storage.ts`
- **DO NOT edit** `app/modules/storage/storage.ts` manually

### Database (MongoDB + Mongoose)

**Connection**: Single connection established in `app/lib/database.ts`

**Schemas**: Located in `app/lib/schemas/`
- `project.schema.ts` - Projects with metadata and status
- `run.schema.ts` - Runs: annotation tasks with sessions and prompts
- `session.schema.ts` - Individual sessions with utterances
- `collection.schema.ts` - Collections grouping multiple runs
- `prompt.schema.ts` - Prompt templates
- `user.schema.ts` - Users with roles and team assignments
- `team.schema.ts` - Teams containing projects and users
- `file.schema.ts` - File references and metadata
- `audit.schema.ts` - Audit logs

**Service Layer**: Always use service classes (e.g., `ProjectService`) instead of direct model access.

## Path Aliases

```typescript
import { Button } from '@/components/ui/button'  // @/* → ./app/uikit/*
import { getProjects } from '~/modules/projects/queries'  // ~/* → ./app/*
```

## Code Conventions

### File Naming
- **Files**: camelCase (`userProfile.tsx`, `dataLoader.ts`)
- **Directories**: lowercase (`components/`, `modules/`)
- **Components**: File camelCase, export PascalCase
  ```typescript
  // File: jobDialog.tsx
  export const JobDialog = () => { ... }
  ```

### Formatting
- **2 spaces** for indentation (no tabs)
- **No trailing whitespace**
- **Single newline** at end of file
- **Always save files** after editing to apply auto-formatting

### Comments
Only comment complex logic or non-obvious behavior:

```typescript
// ✅ Good - explains WHY
// Workaround: Safari requires explicit height for flex containers
// See: https://bugs.webkit.org/show_bug.cgi?id=137730
className="h-full flex"

// Rate limit: OpenAI allows 3 requests/minute for this endpoint
await delay(20000)

// ❌ Bad - states the obvious
// Set the user name
const userName = user.name

// Update role
await UserService.updateById(userId, { role: 'admin' })
```

### Error Handling in Routes

**Loaders** - Use `redirect()` for authentication failures:
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request)
  if (!user) return redirect('/')
  // ...
}
```

**Actions** - Return explicit error responses:
```typescript
export async function action({ request }: Route.ActionArgs) {
  const user = await getUser(request)
  if (!user) throw new Error("Authentication required")

  const payload = await request.json()

  if (!payload.name) {
    return data({ errors: { name: 'Name is required' } }, { status: 400 })
  }

  // Success
  return data({ success: true })
}
```

**Client-side Error Handling**:
```typescript
const fetcher = useFetcher()

useEffect(() => {
  if (fetcher.data?.errors) {
    toast.error(fetcher.data.errors.general || 'An error occurred')
  }
}, [fetcher.data])
```

### Dialog and Action Naming

Use clear, two-part naming for dialogs in route files:

```typescript
// Dialog opener - opens the dialog
const openEditProjectDialog = (project: Project) => {
  addDialog(<EditProjectDialog
    project={project}
    onEditProjectClicked={submitEditProject}  // Pass the submit function
  />)
}

// Action submitter - submits to server
const submitEditProject = (project: Project) => {
  submit(JSON.stringify({ intent: 'UPDATE_PROJECT', project }), {
    method: 'PUT',
    encType: 'application/json'
  })
}

// ❌ Avoid - confusing similar names
const onEditProjectButtonClicked = (project: Project) => {  // Opens dialog
  addDialog(<EditProjectDialog
    project={project}
    onEditProjectClicked={onEditProjectClicked}  // Wrong! May cause confusion
  />)
}

const onEditProjectClicked = (project: Project) => {  // Submits action
  submit(...)
}
```

This pattern clarifies intent and prevents wiring dialogs to wrong callbacks.

## UI Components

### Component Library
- **Radix UI**: Headless, accessible primitives
- **shadcn/ui**: Pre-built components in `app/uikit/components/ui/`
- **Tailwind CSS 4**: Utility-first styling
- **Lucide React**: Icons
- **next-themes**: Dark/light mode
- **Sonner**: Toast notifications
- **Motion**: Modern animation library

### Component Patterns

```typescript
// Use cn() for className merging
import { cn } from '@/lib/utils'

<div className={cn("base-styles", className)} />

// Use theme-aware CSS variables
className="bg-background text-foreground border-border"

// Import icons
import { ChevronDown } from 'lucide-react'
<ChevronDown className="h-4 w-4" />
```

## Environment Configuration

### Required Variables
```bash
# Storage adapter (LOCAL or AWS_S3)
STORAGE_ADAPTER='LOCAL'

# LLM Provider (AI_GATEWAY or OPENAI)
LLM_PROVIDER='AI_GATEWAY'

# Session encryption (generate with: openssl rand -hex 64)
SESSION_SECRET='...'

# GitHub OAuth
GITHUB_CLIENT_ID='...'
GITHUB_CLIENT_SECRET='...'
SUPER_ADMIN_GITHUB_ID='...'
AUTH_CALLBACK_URL='http://localhost:5173/auth/callback'

# Redis (choose one)
REDIS_LOCAL='true'                  # Local Redis (development)
# REDIS_URL='redis://localhost:6379' # External Redis URL (production)
```

### Optional Variables
- AWS credentials (if using AWS_S3 or DOCUMENT_DB)
- AI Gateway credentials (if using AI_GATEWAY)
- OpenAI key (if using OPENAI provider)

## Testing Patterns

### Running Tests
```bash
# All tests
yarn test

# Specific module
yarn test app/modules/collections

# Watch mode
yarn test:watch

# With coverage
yarn test:coverage
```

### Test Structure
```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('ProjectAuthorization', () => {
  let user: User
  let project: Project

  beforeEach(() => {
    user = createMockUser()
    project = createMockProject()
  })

  it('allows team admins to create projects', () => {
    const canCreate = ProjectAuthorization.canCreate(user, 'team123')
    expect(canCreate).toBe(true)
  })
})
```

## Security Considerations

### Authentication & Authorization
- **Always check authentication** before implementing features that require login
- **Verify permissions** using authorization modules (e.g., `ProjectAuthorization.canView()`)
- **Follow established patterns** - Use `redirect()` in loaders, return error responses in actions

### Data Protection
- **Tutoring transcripts are confidential** - Handle with appropriate care
- **Never log sensitive information**
- **Validate all inputs** and sanitize outputs
- **Use .env for secrets** - Never commit credentials

### Example Permission Check
```typescript
export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getUser(request)
  if (!user) return redirect('/')

  const project = await ProjectService.findById(params.projectId)
  if (!project) throw new Response("Not Found", { status: 404 })

  if (!ProjectAuthorization.canView(user, project)) {
    throw new Error("Access denied")
  }

  return { project }
}
```

## Common Development Tasks

### Adding a New Feature Module

1. Create module directory: `app/modules/newFeature/`
2. Add service class: `newFeature.ts` (with CRUD methods)
3. Add types: `newFeature.types.ts`
4. Add authorization: `authorization.ts`
5. Create route: `containers/newFeature.route.tsx` (loader + action)
6. Create components: `components/`
7. Add tests: `__tests__/`
8. Register route in `app/routes.ts`

### Adding a Background Job

1. Add job handler in `workers/runners/tasks.ts` or `workers/runners/general.ts`
2. Create job with `createTaskJob()` helper
3. Add Socket.IO event emission for real-time updates
4. Use `useHandleSockets` hook in UI to listen for completion

### Adding a New Storage Adapter

1. Create directory: `app/storageAdapters/newAdapter/`
2. Implement interface: `download`, `upload`, `remove`, `request`
3. Call `registerStorageAdapter()` with adapter object
4. Run `yarn app:build` - adapters.js will auto-generate imports

## Troubleshooting

### Type Errors During Build
**Cause**: TypeScript compilation errors
**Fix**: Run `yarn typecheck` to see detailed errors
**Note**: Build warnings about unused imports are expected and safe to ignore

### Storage Imports Not Found
**Cause**: `app/adapters.js` didn't run or failed
**Fix**: Manually run `node ./app/adapters.js` to see errors

### Module Not Found Errors
**Cause**: Stale or corrupted dependencies
**Fix**:
```bash
rm -rf node_modules .react-router build
yarn install --frozen-lockfile
yarn typecheck
yarn app:build
```

### Workers Failing to Start
**Cause**: Missing dependencies or Redis configuration
**Fix**: Run `yarn install` at root (handles all workspaces) and ensure Redis is running

### Port 5173 Already in Use
**Cause**: Another process using the port
**Fix**: `lsof -i :5173` to find process, then kill it
**Alternative**: `PORT=3000 yarn app:dev`

## Collections Feature

**Status**: Phase 1 Complete (Foundation)

See detailed documentation:
- `COLLECTION_CREATE_PLAN.md` - Full feature implementation plan
- Additional phase documentation may exist

**Phase 1 Includes**:
- CollectionService CRUD operations
- CollectionAuthorization module (team-based access)
- Updated projectCollections.route with proper error handling
- Comprehensive test coverage

**To Continue**:
1. Check phase documentation for next steps
2. Tests run via: `yarn test -- app/modules/collections/__tests__/`
3. Build: `yarn app:build` - must pass before commit

## Additional Resources

- **Contributing Guide**: See `CONTRIBUTING.md` for Docker Compose setup
- **Copilot Instructions**: See `.github/copilot-instructions.md` for detailed guidelines
- **API Documentation**: See `documentation/` directory for feature specs

## Quick Reference

**Full build & validation cycle** (recommended before PR):
```bash
yarn install --frozen-lockfile
yarn typecheck
yarn app:build
```

**Start development**:
```bash
cp .env.example .env
# Edit .env as needed
yarn install --frozen-lockfile
yarn app:dev
```

**Bash Context Note**: Commands run in the workspace root by default. Don't pass `cwd` parameter—it's unnecessary.
