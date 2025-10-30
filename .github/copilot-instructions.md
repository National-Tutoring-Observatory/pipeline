# NTO Pipeline - Copilot Instructions

## Repository Overview

This is the **NTO (National Tutoring Observatory) Pipeline**, a React-based web application designed for analyzing one-on-one tutoring data. The app enables researchers to normalize, de-identify, and automatically annotate tutoring transcripts using large language models (LLMs). Users can create custom prompts, organize work into projects/runs/sessions, and export annotated data in CSV/JSON formats.

**Repository size**: ~446 source files (excluding node_modules), ~276MB total
**Primary language**: TypeScript (React 19)
**Framework**: React Router v7 with SSR
**Build tool**: Vite 6
**Package manager**: Yarn 1.22+ (preferred) or npm
**Node version**: 20.x (as per Dockerfile and CI)
**UI Framework**: Tailwind CSS 4 with shadcn/ui components (Radix UI)

## Build & Validation Commands

### Prerequisites
1. **Node.js 20.x or higher** is required
2. **Yarn 1.22+** is the preferred package manager (though npm will work)
3. **Environment file**: Copy `.env.example` to `.env` before running the app

### Installation
Always run installation with frozen lockfile to match CI:
```bash
yarn install --frozen-lockfile
```
**Time**: ~30-40 seconds
**Note**: You may see a warning about `package-lock.json` - this is expected and safe to ignore

### TypeCheck
Run before committing to catch type errors (required by CI):
```bash
yarn typecheck
```
**Time**: ~7-8 seconds
**What it does**: Runs `react-router typegen && tsc` to generate route types and check TypeScript

### Build
Always run before testing production behavior:
```bash
yarn build
```
**Time**: ~8-10 seconds
**What it does**: 
1. Runs `node ./app/adapters.js` to generate storage adapter imports
2. Runs `react-router build` to create production build in `./build/`
**Expected warnings**: You'll see warnings about unused imports (useCallback, icons, etc.) - these are safe to ignore

### Development Server
```bash
yarn dev
```
**Port**: http://localhost:5173
**What it does**: Runs adapters.js first, then starts dev server with HMR

### Production Server
```bash
yarn start
```
**Port**: 5173 (configurable via PORT env var)
**Prerequisites**: Must run `yarn build` first

### Workers (Background Jobs)
```bash
yarn workers
```
or
```bash
cd workers && yarn workers
```
**What it does**: Starts BullMQ workers for background task processing
**Prerequisites**: Workers have their own `package.json` and need separate `yarn install`

## CI/CD Validation

### GitHub Actions Workflows

**1. TypeCheck Workflow** (`.github/workflows/typecheck.yml`)
- **Triggers**: Pull requests and pushes to main
- **Node version**: 22
- **Steps**:
  1. `yarn install --frozen-lockfile`
  2. `yarn run typecheck`
- **To replicate locally**: Run the exact same commands above

**2. Release Workflow** (`.github/workflows/release.yml`)
- **Triggers**: Tags matching `v[0-9]+.[0-9]+.[0-9]+` (e.g., v1.2.3)
- **What it does**: Builds Docker image and deploys to AWS ECS
- **Docker build uses**: Node 20-alpine and npm (not yarn)
- **Build command in Docker**: `npm run build` (after `npm ci`)

### Pre-commit Checklist
Before committing, always:
1. ✅ Run `yarn typecheck` - must pass with no errors
2. ✅ Run `yarn build` - must complete successfully
3. ✅ If modifying storage/document adapters, ensure `app/adapters.js` runs correctly

## Architecture Overview

### Adapter Pattern for Storage & Database

The application uses a **plugin-based adapter pattern** to support multiple storage and database backends without changing business logic:

**Storage Adapters** (`app/storageAdapters/`):
- Handle file storage operations (upload, download, remove, request)
- Two implementations: `local/` (filesystem) and `awsS3/` (AWS S3)
- Each adapter registers itself via `registerStorageAdapter()` with a common interface
- Selected at runtime via `STORAGE_ADAPTER` env variable
- Interface: `{ name, download, upload, remove, request }`

**Document Adapters** (`app/documentsAdapters/`):
- Handle database operations (CRUD for collections)
- Two implementations: `local/` (in-memory) and `documentDB/` (MongoDB/DocumentDB)
- Each adapter registers itself via `registerDocumentsAdapter()` with a common interface
- Selected at runtime via `DOCUMENTS_ADAPTER` env variable
- Interface: `{ name, getDocuments, createDocument, getDocument, updateDocument, deleteDocument }`

**How it works**:
1. On startup, `app/adapters.js` scans `storageAdapters/` and generates `app/modules/storage/storage.ts`
2. This file imports all adapter implementations, causing them to self-register
3. Application code calls `getStorageAdapter()` or `getDocumentsAdapter()` to get the active adapter
4. Adapters are selected based on env variables, making backend switching seamless

### React Router Error Handling Pattern

The codebase follows a **consistent error handling convention** for React Router loaders and actions:

**Loaders** (data fetching):
- Use `redirect()` for authentication/authorization failures
- Return redirect responses to guide users to appropriate pages
- Example: `if (!user) return redirect('/')`

**Actions** (mutations):
- Use `throw new Error()` for validation and business logic failures
- Throw errors for missing/invalid data, unauthorized access
- Errors are caught by React Router's error boundary
- Example: `if (!name) throw new Error("Name is required")`

**Why this pattern?**
- Loaders redirect on auth failures (user should be redirected somewhere)
- Actions throw on validation failures (user should see error in context)
- Consistent across all routes for predictable behavior

### Directory Structure

```
/app/                           # Main application code
  /modules/                     # Feature modules (23 modules)
    /projects/                  # Project management
    /prompts/                   # Prompt editor & versions
    /sessions/                  # Session viewer & annotations
    /annotations/               # Annotation handling
    /teams/                     # Team & user management
    /files/                     # File upload/management
    /runs/                      # Run execution & downloads
    /collections/               # Collection management
    /llm/                       # LLM provider integration
    /authentication/            # GitHub OAuth authentication
    /dashboard/                 # Main dashboard
    /support/                   # Support articles
    /featureFlags/              # Feature flag system
    /storage/                   # Storage abstraction layer
    /dialogs/                   # Dialog management
    /app/                       # App shell & sidebar
    /documents/                 # Document DB abstraction layer
    /events/                    # Event handling
    /queues/                    # BullMQ queue management
    /uploads/                   # Upload utilities
    /users/                     # User management
  /uikit/                       # Reusable UI components (shadcn/ui)
    /components/ui/             # 25+ UI components
    /hooks/                     # Custom React hooks
    /lib/                       # UI utilities
  /storageAdapters/             # Storage implementations (plugin pattern)
    /local/                     # Local filesystem storage
    /awsS3/                     # AWS S3 storage
  /documentsAdapters/           # Database implementations (plugin pattern)
    /local/                     # Local in-memory DB
    /documentDB/                # AWS DocumentDB (MongoDB)
  adapters.js                   # IMPORTANT: Generates storage imports
  routes.ts                     # React Router v7 route config
  root.tsx                      # Root layout component
  app.css                       # Global styles (Tailwind)
  entry.client.tsx              # Client entry point
  entry.server.tsx              # Server entry point
  functions/                    # Utility functions

/workers/                       # Background job workers (separate package)
  /runners/                     # Worker runner implementations
  /helpers/                     # Worker utilities
  index.js                      # Worker entry point
  package.json                  # Separate dependencies

/documentation/                 # User-facing documentation (19 .md files)
  Welcome.md                    # Overview & how-to-use
  projects.md, prompts.md, etc. # Feature documentation

/public/assets/                 # Static assets (favicon, etc.)
/data/                          # Local data storage (gitignored)
/storage/                       # Local file storage (gitignored)
```

### Key Configuration Files

- **package.json**: Main dependencies and scripts
- **tsconfig.json**: TypeScript config with path aliases (`@/*` → `./app/uikit/*`, `~/*` → `./app/*`)
- **vite.config.ts**: Vite config with React Router, Tailwind, and tsconfig paths plugins
- **react-router.config.ts**: React Router v7 config (SSR enabled)
- **components.json**: shadcn/ui configuration
- **.env**: Environment variables (copy from `.env.example`)
- **Dockerfile**: Multi-stage Docker build (uses Node 20-alpine, npm, not yarn)
- **.gitignore**: Excludes `build/`, `node_modules/`, `.env`, `data/`, `storage/`, `tmp/`, `.react-router/`

### Important Build Artifacts (Gitignored)

- `./build/` - Production build output
- `./.react-router/` - Generated route types
- `./app/modules/storage/storage.ts` - Auto-generated by adapters.js (DO NOT EDIT MANUALLY)

## Critical Build Process

### The Adapters System

**IMPORTANT**: The `app/adapters.js` script MUST run before build/dev:
- **What it does**: Scans `app/storageAdapters/` and auto-generates `app/modules/storage/storage.ts`
- **Why**: This file imports all storage adapter implementations
- **When**: Both `yarn build` and `yarn dev` run it automatically
- **Manual**: `node ./app/adapters.js` (rarely needed)

If you add/remove storage adapters, the build will automatically regenerate the imports.

## Environment Configuration

### Required Environment Variables
```bash
# .env file (copy from .env.example)

# Storage adapter (LOCAL or AWS_S3)
STORAGE_ADAPTER='LOCAL'

# Documents adapter (LOCAL or DOCUMENT_DB)
DOCUMENTS_ADAPTER='LOCAL'

# LLM Provider (AI_GATEWAY or OPENAI)
LLM_PROVIDER='AI_GATEWAY'

# Session encryption (generate with: openssl rand -hex 64)
SESSION_SECRET='...'

# GitHub OAuth (for authentication)
GITHUB_CLIENT_ID='...'
GITHUB_CLIENT_SECRET='...'
SUPER_ADMIN_GITHUB_ID='...'

# Auth callback
AUTH_CALLBACK_URL='http://localhost:5173/auth/callback'

# Redis (for BullMQ workers)
REDIS_URL='redis://localhost:6379'
```

### Optional Environment Variables
- AWS credentials (if using AWS_S3 or DOCUMENT_DB)
- AI Gateway credentials (if using AI_GATEWAY)
- OpenAI key (if using OPENAI provider)

## Troubleshooting: Root Causes

When encountering issues, focus on understanding and fixing the root cause rather than working around problems:

### Type errors during build
**Root cause**: TypeScript compilation errors in your code or missing type definitions
**Diagnosis**: Run `yarn typecheck` to see detailed error messages with file locations
**Fix**: Address the type errors in the indicated files. Don't ignore type errors.
**Note**: Build warnings about unused imports (useCallback, icons) are expected and safe to ignore - these are not errors.

### Storage imports not found
**Root cause**: The `app/adapters.js` script failed or didn't run, so `app/modules/storage/storage.ts` wasn't generated
**Diagnosis**: Check if `app/modules/storage/storage.ts` exists and contains imports
**Fix**: 
1. Manually run `node ./app/adapters.js` to see any errors
2. Verify storage adapter directories have proper `index.ts` files
3. Check that adapters call `registerStorageAdapter()` correctly
**Prevention**: Both `yarn build` and `yarn dev` run this automatically

### Module not found errors
**Root cause**: Stale or corrupted dependencies, or mismatched lock file
**Diagnosis**: Check if `node_modules/` or `.react-router/` have stale generated code
**Fix**: 
1. Delete `node_modules/`, `.react-router/`, and optionally `build/`
2. Run `yarn install --frozen-lockfile` (matches CI exactly)
3. Run `yarn typecheck` to verify types, then `yarn build`
**Prevention**: Always use `--frozen-lockfile` to match the lock file

### Workers failing to start
**Root cause**: Workers have a separate `package.json` and their dependencies weren't installed
**Diagnosis**: Check if `workers/node_modules/` exists
**Fix**: Run `cd workers && yarn install` to install worker dependencies
**Note**: Workers are a separate package to keep their dependencies isolated

### Port 5173 already in use
**Root cause**: Another dev server or process is already using the port
**Diagnosis**: Run `lsof -i :5173` (Unix) or `netstat -ano | findstr :5173` (Windows)
**Fix**: Kill the existing process or set a different port: `PORT=3000 yarn dev`
**Alternative**: Configure a different default port in your environment

## Path Aliases

When importing files, use these aliases:
- `@/*` → `./app/uikit/*` (UI components)
- `~/*` → `./app/*` (app modules)

Examples:
```typescript
import { Button } from '@/components/ui/button'
import { getProjects } from '~/modules/projects/queries'
```

## Testing

**No automated test suite currently exists**. Manual testing recommended:
1. Run `yarn dev` and test features in browser
2. Check console for errors
3. Verify builds succeed with `yarn build`
4. Run `yarn typecheck` for type safety

## Key Dependencies

### Production
- **React 19** & **React DOM 19**: UI framework
- **React Router 7**: Routing with SSR
- **Mongoose 8**: MongoDB/DocumentDB ORM
- **BullMQ 5**: Background job queue (requires Redis)
- **AWS SDK v3**: S3 storage integration
- **OpenAI SDK**: LLM integration
- **Tailwind CSS 4**: Styling
- **Radix UI**: Component primitives
- **dayjs**: Date handling
- **archiver**: ZIP file creation

### Development
- **TypeScript 5.8**: Type checking
- **Vite 6**: Build tool & dev server
- **@react-router/dev**: React Router tooling

## Best Practices

1. **Always use frozen lockfile**: `yarn install --frozen-lockfile` matches CI exactly
2. **Run typecheck before committing**: Catches issues early
3. **Test builds locally**: Don't rely on CI to catch build failures
4. **Use path aliases**: Prefer `@/*` and `~/*` over relative paths
5. **Check .env setup**: Many features require environment variables
6. **Keep adapters.js in sync**: When changing storage adapters, verify generated code
7. **Respect gitignore**: Don't commit `.env`, `build/`, `data/`, `storage/`, or `.react-router/`
8. **Node version**: Use Node 20.x to match Docker and production environment
9. **Module structure**: Each module typically has `components/`, `containers/`, and sometimes `queries/`, `mutations/`

## Quick Reference

**Full build & validation cycle** (recommended before PR):
```bash
yarn install --frozen-lockfile
yarn typecheck
yarn build
```

**Start development**:
```bash
cp .env.example .env
# Edit .env as needed
yarn install --frozen-lockfile
yarn dev
```

**Add storage adapter**:
1. Create directory in `app/storageAdapters/yourAdapter/`
2. Add `index.ts` with adapter implementation
3. Run `yarn build` (adapters.js auto-generates imports)
4. Update `STORAGE_ADAPTER` in `.env`

---

**Trust these instructions**. Only search for additional information if these instructions are incomplete or you encounter unexpected behavior not covered here.