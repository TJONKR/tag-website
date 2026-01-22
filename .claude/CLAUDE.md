# Project Instructions

## Overview
<!-- Describe your project here -->

## Tech Stack
- Next.js 15 (App Router with Turbopack)
- React 19
- TypeScript
- pnpm (package manager)
- Supabase (database & auth)
- SWR (client-side data fetching)
- Zod (validation)
- Tailwind CSS
- shadcn/ui + Radix UI (components)
- Vercel AI SDK (AI features)
- Playwright (E2E testing)

## Component Guidelines
- **Always check shadcn/ui first** before creating custom components
- shadcn components live in `components/ui/`
- Use CSS variables from `app/globals.css` for colors:
  - `--primary`, `--primary-hover`, `--primary-light`, `--primary-lighter`
  - `--secondary`, `--muted`, `--accent`, `--destructive`
  - `--background`, `--foreground`, `--card`, `--popover`
  - `--border`, `--input`, `--ring`
- Use `cn()` from `lib/utils` for conditional classes
- Use Lucide React for icons

### Adding shadcn/ui Components
When a shadcn component is needed but not yet installed, use the CLI to add it:
```bash
pnpm ui:add <component-name>
```

Examples:
- `pnpm ui:add button` - Add button component
- `pnpm ui:add dialog` - Add dialog component
- `pnpm ui:add table` - Add table component

Available components: https://ui.shadcn.com/docs/components
Always use the CLI instead of manually creating shadcn components.

## Project Structure

```
app/                    → Routing only (pages, layouts, API routes)
components/             → General shared components (NOT feature-bound)
components/ui/          → shadcn/ui components
hooks/                  → General shared hooks (NOT feature-bound)
lib/                    → Feature modules
lib/db/                 → Database singleton & migrations
lib/[feature]/          → Feature-specific code (see below)
```

### Feature Module Structure (`lib/[feature]/`)
Each feature is self-contained:
- `queries.ts` - Read operations (SELECT) → Database
- `mutations.ts` - Write operations (INSERT/UPDATE/DELETE) → Database
- `hooks.ts` - Client-side hooks (useCourses, etc.) using SWR
- `types.ts` - TypeScript interfaces
- `schema.ts` - Zod validation schemas
- `components/` - Feature-bound components

### Data Flow
**Client-side:** Component → SWR hook → API route → queries/mutations → Supabase
**Server-side:** Server Component → queries/mutations → Supabase (direct)

## Common Commands
- `pnpm install` - Install dependencies
- `pnpm dev` - Start dev server (Turbopack)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix lint errors
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting without changes
- `pnpm typecheck` - TypeScript check
- `pnpm clean` - Remove node_modules, lock file, and .next
- `pnpm test` - Run all Playwright tests
- `pnpm test:e2e` - Run E2E tests only
- `pnpm test:routes` - Run route tests only

### Required Scripts
If any of these scripts are missing from `package.json`, add them:
```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "clean": "pnpm dlx rimraf node_modules pnpm-lock.yaml .next",
    "test": "pnpm exec playwright test",
    "test:e2e": "pnpm exec playwright test --project=e2e",
    "test:routes": "pnpm exec playwright test --project=routes"
  }
}
```

## Code Standards
- 2-space indentation (configured in Prettier)
- Use clear, descriptive variable names
- Keep `/app` routes thin - no business logic
- Keep API routes thin - only auth/validation, then call lib functions
- Feature-bound components go in `lib/[feature]/components/`
- General components (used by 2+ features) go in `/components`

## Testing Workflow

**REQUIRED:** You MUST write and run tests for significant changes. This is not optional.

> **Skip ONLY if:** The user explicitly says "no tests", "skip tests", or "quick mode".

### Plan Mode: Required Tests Section
When creating a plan, you MUST include a "Tests" section that specifies:
- What tests will be written
- Which files they'll be in (`tests/e2e/` or `tests/routes/`)
- What scenarios they'll cover

Example plan format:
```
## Implementation Steps
1. Create component...
2. Add API route...

## Tests
- `tests/e2e/feature-name.test.ts`: User can complete the flow
- `tests/routes/api-name.test.ts`: API returns correct responses
```

### When to Write Tests (REQUIRED)
You MUST write tests for:
- New features or components
- Bug fixes (regression tests to prevent recurrence)
- API route changes
- After completing a planned implementation (post-plan mode)

Skip tests for:
- Typo fixes, comment changes, formatting
- Config file adjustments
- Simple copy/text changes
- Exploratory changes the user will review

### Test Structure
```
tests/
  e2e/           → End-to-end user flow tests
  routes/        → API route tests
```

### Test Conventions
- File naming: `feature-name.test.ts`
- Use descriptive test names: `test('user can submit form with valid data')`
- Test happy paths, error states, and edge cases
- Keep tests focused and independent

### Verification Loop
After implementing features or completing a plan:
1. Write appropriate tests in `tests/e2e/` or `tests/routes/`
2. Run `pnpm test` (or specific project: `pnpm test:e2e`, `pnpm test:routes`)
3. If tests fail → analyze error → fix code → re-run tests
4. Repeat until all tests pass
5. Run `pnpm typecheck && pnpm lint`
6. If errors → fix → re-run
7. Only consider the task complete when all checks pass

### Test Commands
- `pnpm test` - Run all tests
- `pnpm test:e2e` - E2E tests only
- `pnpm test:routes` - Route tests only
- `pnpm test:debug` - Debug mode for failing tests

## Important Notes
- Database access ONLY through Supabase client (singleton pattern)
- Never import DB client directly in components or routes
- Sensitive files (.env, secrets, keys) are blocked from Claude
- Use web search when looking up documentation, APIs, or recent changes to libraries
