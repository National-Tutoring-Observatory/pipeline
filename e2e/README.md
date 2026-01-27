# E2E Tests

End-to-end tests for the NTO Pipeline application using Playwright.

## Prerequisites

- Application server running on `http://localhost:5173`
- Existing project "Tutoring Transcripts Study 2024" with:
  - At least 2 sessions
  - At least 1 prompt available
  - At least 1 model configured

**Note:** The test suite includes tests that **create real data**:

- **Collections test** creates "E2E Test Collection" with runs
- **Runs test** creates "E2E Test Run"

These tests will create actual data in your database.

## First Time Setup

1. Start the application: `yarn app:dev`
2. Run the setup script:
   ```bash
   yarn test:e2e:setup
   ```
3. Brave Browser will open automatically
4. **Log in** with your GitHub account in the browser
5. Once logged in, click the **"Resume"** button in the Playwright Inspector window
6. Your auth state will be saved to `e2e/.auth/user.json` (gitignored)

**To re-capture auth state later** (if your session expires):

```bash
yarn test:e2e:setup
```

## Running Tests

Once setup is complete, you can run tests anytime (as long as the app is running):

```bash
# Run all e2e tests (from project root)
yarn test:e2e

# Run tests in UI mode (interactive)
yarn test:e2e:ui

# Run tests with browser visible
yarn test:e2e:headed

# Or run directly from e2e workspace
cd e2e
yarn test
yarn test:ui
yarn test:headed
```

**Note:** Tests will automatically reuse your saved authentication state, so you don't need to log in again.

## Test Suites

### Projects (`projects.spec.ts`)

- Display projects list
- Navigate to project detail
- Show edit/delete buttons
- Create project dialog and validation
- Breadcrumb navigation

### Collections (`collections.spec.ts`)

- **Create a new collection** (creates real data)
- Display collections list
- Navigate to collection detail
- CSV and JSONL download options
- Display sessions and runs
- Breadcrumb navigation

### Runs (`runs.spec.ts`)

- **Create a new run** (creates real data)
- Display runs list
- Navigate to run detail
- Show run metadata (annotation type, prompt, model)
- Sessions table display
- CSV and JSONL download options

### Prompts (`prompts.spec.ts`)

- Display prompts list
- Show annotation types
- Navigate to prompt detail
- Display versions
- Show prompt content and schema
- Sidebar navigation
- **Edit prompt title from list page**
- **Edit prompt title from detail page**

## Configuration

### Browser Selection

Tests can run on either Chrome or Brave browser. Set your preference using the `PLAYWRIGHT_BROWSER_EXECUTABLE_PATH` environment variable in your `.env` file:

**For Brave (macOS)**:

```bash
PLAYWRIGHT_BROWSER_EXECUTABLE_PATH='/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
```

**For Chrome (macOS)**:

```bash
PLAYWRIGHT_BROWSER_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```

**For Chrome (Linux)**:

```bash
PLAYWRIGHT_BROWSER_EXECUTABLE_PATH='/usr/bin/google-chrome'
```

**For default Chrome** (omit the variable entirely):

```bash
# PLAYWRIGHT_BROWSER_EXECUTABLE_PATH is not set
```

If the variable is not set, Playwright will use the default Chrome installation.

Full configuration can be found in `e2e/playwright.config.ts`.

## Notes

- Tests assume existing data and authenticated session
- Tests do not create or clean up data
- Tests are smoke tests covering happy paths
