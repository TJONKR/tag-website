# Claude Code Team Configuration

This document explains the Claude Code setup for our team. You can apply these settings to get a smoother experience with fewer permission prompts.

## Quick Start

1. Pull the latest changes from the repo
2. The `.claude/` folder contains shared settings that apply automatically
3. (Optional) Add personal overrides in `.claude/settings.local.json`

---

## Recommended Tools

### Claude Code for VS Code (Chat UI)

Instead of using the terminal, you can use the **Claude Code VS Code extension** for a chat-based UI experience:

1. Install from VS Code Marketplace: search for "Claude Code"
2. Authenticate with your Anthropic account
3. Use the chat panel in the sidebar instead of the terminal

Benefits:
- Familiar chat interface
- Inline code suggestions
- File context automatically included
- No terminal required

### Claude History Viewer

View your Claude Code session history, diffs, and statistics (pretty new at the moment so no perfect):

- **Repository:** [github.com/anthropics/claude-history-viewer](https://github.com/anthropics/claude-history-viewer)
- Features: session history, file diffs, conversation stats, cost tracking

### Claude in Chrome Extension

**THIS DOES NOT WORK (YET(?)) WITH WSL!**

Browser automation and testing directly from Claude Code:

- **Install:** [Chrome Web Store](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
- **Docs:** [code.claude.com/docs/en/chrome](https://code.claude.com/docs/en/chrome)

**Features:**
- Navigate pages, click buttons, fill forms, scroll
- Debug web apps (read console logs, DOM state)
- Test user flows and form validation
- Work with authenticated apps (Google Docs, Gmail, Notion) without API setup
- Extract data from websites
- Record browser sessions as GIFs

**Usage:**
```bash
# Update CLI (requires v2.0.73+)
claude update

# Launch with Chrome enabled
claude --chrome

# Verify connection
/chrome
```

**Limitations:**
- Chrome only (not Brave, Arc, etc.)
- No WSL support (run Claude Code natively on Windows/macOS)
- Requires visible browser (no headless mode)
- Currently in beta

### MCP Servers (Model Context Protocol)

MCP servers extend Claude's capabilities with external tools and data sources.

**Setup:** Create `.claude/settings.local.json` (gitignored) for MCP servers with API keys:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": {}
    },
    "firecrawl-mcp": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Available MCP Servers:**

| Server | Purpose | Get API Key |
|--------|---------|-------------|
| `supabase` | Direct database access, run queries | No key needed (uses project auth) |
| `firecrawl-mcp` | Web scraping, crawling, data extraction | [firecrawl.dev](https://firecrawl.dev) |

> **Security:** Always put MCP configs with API keys in `settings.local.json` (gitignored), never in `settings.json` (committed).

After adding MCP servers, restart Claude Code for them to connect.

### Default Model

This project uses **Opus** (`claude-opus-4`) by default, configured in `.claude/settings.json`.

**To switch to Sonnet** (faster, cheaper), use one of these options:

**Option 1: Per-session** (terminal)
```bash
claude --model sonnet
```

**Option 2: VS Code extension**
- Open Claude Code settings in VS Code
- Change the model in the dropdown

**Option 3: Personal override** (`.claude/settings.local.json`)
```json
{
  "model": "claude-sonnet-4"
}
```

**Option 4: Environment variable** (add to `~/.bashrc` or `~/.zshrc`)
```bash
export ANTHROPIC_MODEL=claude-sonnet-4
```

> **Note:** Opus is more capable but slower and more expensive. Sonnet is faster and cheaper for simpler tasks.

### Testing Workflow

By default, Claude will write and run tests for significant changes (new features, bug fixes, post-plan implementations). This includes:
- Writing tests in `tests/e2e/` or `tests/routes/`
- Running `pnpm test` and iterating until all tests pass
- Running `pnpm typecheck` and `pnpm lint` as final verification

**To skip testing for a specific task**, include one of these phrases in your request:
- `no tests`
- `skip tests`
- `quick mode`

**Examples:**
```
Add a logout button, no tests
Fix the typo in the header, skip tests
Quick mode - update the color to blue
```

**To permanently disable testing:**
Delete the entire "Testing Workflow" section from `.claude/CLAUDE.md` (lines 113-158). This completely removes the testing behavior.

---

## What's Configured

### 1. Automatic Permissions (No Prompts)

Located in: `.claude/settings.json`

These commands run without asking for permission each time:

| Category | Commands | Why It's Safe |
|----------|----------|---------------|
| **File Reading** | All file reads | Read-only, just gathering info. Sensitive files are blocked (see below). |
| **File Editing** | Edit/Write any file | Allows Claude to work autonomously. Protected files require permission (see below). |
| **File Exploration** | `ls`, `cat`, `head`, `tail`, `tree`, `find`, `stat`, `file` | Read-only directory/file inspection |
| **Search** | `grep`, `rg` (ripgrep) | Read-only text search |
| **Git (read)** | `git status`, `git log`, `git diff`, `git branch`, `git show`, `git blame` | Read-only git operations |
| **pnpm scripts** | `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm clean`, `pnpm ui:add` | Only known safe scripts |

#### Standard Scripts (should be in every project)

These scripts should be available in `package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev --turbo` | Start dev server with Turbopack |
| `build` | `next build` | Build for production |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint |
| `lint:fix` | `next lint --fix` | Fix lint errors automatically |
| `format` | `prettier --write .` | Format all files with Prettier |
| `format:check` | `prettier --check .` | Check formatting without changing |
| `typecheck` | `tsc -p tsconfig.json --noEmit` | TypeScript type checking |
| `clean` | `pnpm dlx rimraf node_modules pnpm-lock.yaml .next` | Clean build artifacts |
| `ui:add` | `pnpm dlx shadcn@latest add` | Add shadcn/ui components |
| `test` | `pnpm exec playwright test` | Run all Playwright tests |
| `test:e2e` | `pnpm exec playwright test --project=e2e` | Run E2E tests only |
| `test:routes` | `pnpm exec playwright test --project=routes` | Run route tests only |

> **Note:** If any of these scripts are missing, Claude will add them to `package.json`.

### 2. Protected Files (Require Permission)

These files require explicit permission to edit - if Claude asks, it's a significant change:

| File | Reason |
|------|--------|
| `package.json` | Dependencies and scripts |
| `pnpm-lock.yaml` | Dependency lock file |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind configuration |
| `.eslintrc.json` | ESLint rules |
| `.prettierrc.json` | Prettier formatting rules |
| `.gitignore` | Git ignore patterns |
| `middleware.ts` | Request middleware (security) |
| `.claude/settings.json` | Claude permissions |
| `.claude/settings.local.json` | Local Claude settings |

### 3. Blocked (Always Denied)

These are always blocked for security:

| Pattern | Reason |
|---------|--------|
| `.env`, `.env.*` | Contains secrets, API keys |
| `secrets/` folder | Sensitive data |
| `*.pem`, `*.key` | Private keys |
| Files with `credentials` or `secret` in name | Sensitive data |
| `rm -rf` | Destructive, could delete everything |
| `sudo` | Privilege escalation |

### 3. VSCode Settings

Located in: `.vscode/settings.json`

| Setting | Value | Reason |
|---------|-------|--------|
| `workbench.editor.focusOnOpen` | `false` | Prevents Claude from stealing focus when it opens/creates files. You stay on your current tab. |

---

## Claude Configuration Files Explained

There are several files in `.claude/` - here's what each does:

| File | Who reads it | Purpose |
|------|--------------|---------|
| `settings.json` | Claude Code (system) | Permissions config - what commands are allowed/denied |
| `settings.local.json` | Claude Code (system) | Your personal permission overrides (gitignored) |
| `CLAUDE.md` | **Claude (AI)** | Project instructions Claude reads every session. Put tech stack, conventions, "always/never do X" here. |
| `rules/*.md` | **Claude (AI)** | Modular instructions for Claude, can apply to specific file paths |
| `README.md` | **Humans** | This file! Documentation for your team about the setup |

**Key distinction:**
- `CLAUDE.md` and `rules/` = Instructions **for the AI** (Claude reads these)
- `README.md` = Documentation **for humans** (your colleagues read this)
- `settings.json` = System config (permissions, not instructions)

### File Structure

```
.claude/
├── settings.json          # Shared permissions (committed to git)
├── settings.local.json    # Personal overrides (NOT committed - add to .gitignore)
├── CLAUDE.md              # AI instructions - project context
├── README.md              # Human docs - this file
└── rules/
    └── code-style.md      # AI instructions - code style rules
```

> **Important:** Add `.claude/settings.local.json` and `CLAUDE.local.md` to your `.gitignore` to keep personal settings out of the repo.

---

## How to Customize

### Editing Settings Files

**To modify shared settings (affects all team members):**
1. Edit `.claude/settings.json` directly
2. Commit and push the changes
3. Team members pull to get the updated permissions

**To modify AI instructions (affects all team members):**
1. Edit `.claude/CLAUDE.md` for project context
2. Edit files in `.claude/rules/` for specific rules
3. Commit and push

**To modify personal settings (only affects you):**
1. Edit `.claude/settings.local.json` (not committed)
2. Create `CLAUDE.local.md` in project root (not committed)

### Settings File Syntax

The `settings.json` uses pattern matching:

```json
{
  "permissions": {
    "allow": [
      "Read",                    // Allow all file reads
      "Edit",                    // Allow all file edits
      "Bash(pnpm dev)",          // Allow exact command
      "Bash(pnpm dev:*)",        // Allow command with any args
      "Bash(git status:*)"       // Allow git status with any flags
    ],
    "deny": [
      "Read(.env)",              // Block specific file
      "Read(**/.env.*)",         // Block pattern (glob)
      "Edit(package.json)",      // Require permission for this file
      "Bash(rm -rf:*)",          // Block dangerous command
      "Bash(sudo:*)"             // Block privilege escalation
    ]
  }
}
```

**Pattern rules:**
- `*` matches anything within a single argument
- `**` matches across path segments (glob pattern)
- Exact matches take precedence over patterns
- `deny` takes precedence over `allow`

### Add Personal Overrides

Create `.claude/settings.local.json` for settings that only apply to you:

```json
{
  "permissions": {
    "allow": [
      "Bash(docker:*)"
    ]
  }
}
```

### Add Personal Notes

Create `CLAUDE.local.md` in the project root for personal context Claude should know about your setup.

---

## Applying These Settings

**Option A: Automatic**
Just pull the repo. The `.claude/settings.json` applies automatically.

**Option B: Manual**
If you want to review/modify first:
1. Check `.claude/settings.json` for permissions
2. Check `.vscode/settings.json` for editor settings
3. Modify as needed

---

## Project Structure (Company Standard)

This is the agreed-upon project structure for all projects:

```
project-root/
├── app/                        # Next.js App Router (routing layer only)
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── [feature]/              # Feature routes (e.g., /courses)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── api/                    # API routes (thin layer)
│       └── [feature]/          # e.g., /api/courses
│           └── route.ts        # Just auth/validation, calls lib functions
│
├── components/                 # General components (NOT feature-bound)
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/                 # Layout components (header, sidebar, etc.)
│   └── [shared-component].tsx  # Other shared components
│
├── hooks/                      # General hooks (NOT feature-bound)
│   └── use-media-query.ts
│
├── lib/                        # Feature modules (core business logic)
│   ├── db/                     # Database connection & utilities
│   │   ├── index.ts            # Singleton connection (used by all features)
│   │   ├── migrations/         # Database migrations
│   │   └── schema.ts           # Global DB schema (if using Drizzle/Prisma)
│   │
│   └── [feature]/              # Feature module (e.g., courses)
│       ├── hooks.ts            # useCourses - client state (SWR/TanStack Query)
│       ├── queries.ts          # Read operations (SELECT) → DB
│       ├── mutations.ts        # Write operations (INSERT/UPDATE/DELETE) → DB
│       ├── types.ts            # TypeScript types for this feature
│       ├── schema.ts           # Zod validation schemas (optional)
│       └── components/         # Feature-bound components
│           ├── course-card.tsx
│           └── course-list.tsx
│
└── .claude/                    # Claude Code configuration
    └── ...
```

### Data Flow

**Client-side (with hooks):**
```
React Component
    ↓
useCourses() hook (manages cache/state via SWR)
    ↓
fetch('/api/courses')
    ↓
API Route (/app/api/courses/route.ts) - auth & validation only
    ↓
queries.ts / mutations.ts (business logic)
    ↓
Database (via lib/db singleton)
```

**Server-side (Server Components / Server Actions):**
```
Server Component or Server Action
    ↓
queries.ts / mutations.ts (direct call, no hook)
    ↓
Database (via lib/db singleton)
```

### Naming Conventions

| File | Purpose | Example |
|------|---------|---------|
| `queries.ts` | Read operations (GET) | `getCourses()`, `getCourseById()` |
| `mutations.ts` | Write operations (POST/PUT/DELETE) | `createCourse()`, `updateCourse()`, `deleteCourse()` |
| `hooks.ts` | Client-side state management (SWR) | `useCourses()`, `useCourse(id)` |
| `types.ts` | TypeScript interfaces/types | `Course`, `CreateCourseInput` |
| `schema.ts` | Zod validation schemas | `courseSchema`, `createCourseSchema` |

### Rules

1. **`/app` is for routing only** - Keep pages thin. No business logic.
2. **API routes are thin** - Only auth, validation, then call `lib/[feature]` functions.
3. **General vs Feature-bound:**
   - If used by 2+ features → `/components` or `/hooks`
   - If used by 1 feature only → `/lib/[feature]/components` or inside the feature module
4. **Database access only through `lib/db`** - Never import DB client directly in components/routes.
5. **Feature modules are self-contained** - Everything for "courses" lives in `/lib/courses`.

---

## Troubleshooting

### Too many permission prompts?
Add the command pattern to the `allow` list in `.claude/settings.json`

### Want to block something dangerous?
Add the pattern to the `deny` list in `.claude/settings.json`

### Claude doesn't understand the project?
Edit `.claude/CLAUDE.md` with project context, tech stack, and conventions

### Claude makes style mistakes?
Edit `.claude/rules/code-style.md` with your code style rules

### Settings not applying?
1. Make sure the file is valid JSON (no trailing commas)
2. Restart Claude Code / reload VS Code window
3. Check that `.claude/settings.local.json` isn't overriding

---

## Questions?

For more help:
- Claude Code docs: https://docs.anthropic.com/claude-code
- Report issues: https://github.com/anthropics/claude-code/issues
