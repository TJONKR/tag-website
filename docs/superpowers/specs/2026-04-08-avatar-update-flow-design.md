# Avatar Update Flow — Design Spec

## Context

The profile page currently displays reference photos directly in the right column. This exposes an implementation detail (AI generation input) as a visible profile element. The goal is to remove reference photos from the profile view and instead build a dedicated "Update Avatar" wizard flow where users upload reference photos, generate an AI avatar, and confirm or regenerate.

This is a standalone feature, decoupled from the existing lootbox/skin system. The generated image becomes the user's `avatar_url` in the `profiles` table.

## Flow Overview

```
Profile Card [Update Avatar button]
  → /portal/profile/avatar (separate page)
    → Step 1: Upload reference photos (up to 3)
    → Step 2: Loading screen (AI generation)
    → Step 3: View result → Confirm or Regenerate
      → Confirm: saves as avatar, redirects to /portal/profile
      → Regenerate: option to change photos (back to step 1) or regenerate same photos (back to step 2)
```

## Detailed Design

### 1. Profile Page Changes

**File:** `app/portal/profile/page.tsx`

- **Remove** the `<PhotoUpload>` section (lines 258-261) from the right column
- **Remove** the photo URL signing logic (lines 116-125) and related imports
- **Add** an "Update Avatar" button to the profile card (left column), visible below the avatar or skin image
- The button links to `/portal/profile/avatar`

The lootbox progress widget still references "Upload 3 reference photos" as a step. This step remains functional — users upload photos in the avatar wizard, which also satisfies the lootbox requirement.

### 2. Avatar Wizard Page

**File:** `app/portal/profile/avatar/page.tsx`

Server component that fetches current user photos and renders the client-side wizard.

**Data fetched server-side:**
- `getUser()` — current user
- `getUserPhotos(userId)` — existing reference photos
- Signed URLs for existing photos

Passes data to a client component `<AvatarWizard>`.

### 3. AvatarWizard Component

**File:** `lib/avatar/components/avatar-wizard.tsx`

Client component managing a 3-step wizard with local state.

**State:**
```ts
type WizardStep = 'photos' | 'generating' | 'result'

const [step, setStep] = useState<WizardStep>('photos')
const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null)
```

**Step 1 — Photos:**
- Reuses the existing `PhotoUpload` component (or a slightly adapted version) to display/upload/delete reference photos
- Shows a "Generate Avatar" button, enabled when user has >= 3 photos (`MAX_PHOTOS`)
- Clicking "Generate Avatar" calls `POST /api/avatar/generate` and transitions to step 2

**Step 2 — Generating:**
- Full-width loading state with animation
- Polls `GET /api/avatar/status?jobId=...` every 3 seconds (similar to `useSkinStatus` pattern)
- When complete, transitions to step 3 with the generated image URL

**Step 3 — Result:**
- Displays the generated avatar (large, 3:4 aspect ratio)
- Two action buttons:
  - **"Use as Avatar"** — calls `POST /api/avatar/confirm` which saves the URL as `avatar_url` in profiles, then redirects to `/portal/profile`
  - **"Try Again"** — dropdown or two sub-options:
    - "Regenerate" — same photos, goes back to step 2
    - "Change Photos" — goes back to step 1

### 4. New Feature Module: `lib/avatar/`

```
lib/avatar/
  components/
    avatar-wizard.tsx    — Main wizard component
  mutations.ts           — generateAvatar, confirmAvatar
  types.ts               — AvatarJob type
  hooks.ts               — useAvatarStatus (SWR polling hook)
```

### 5. API Routes

**`POST /api/avatar/generate`**
- Auth: requires authenticated user
- Validates user has >= 3 photos
- Fetches first reference photo signed URL
- Calls `generate2dSkin()` from `lib/lootbox/pipeline/generate-2d.ts` with a fixed avatar prompt
- Stores the generation job: creates a record in a new `avatar_jobs` table with status `'generating'`
- Fires generation async (using `waitUntil` from `@vercel/functions`)
- Returns `{ jobId: string }`

**`GET /api/avatar/status?jobId=...`**
- Returns `{ status: 'generating' | 'complete' | 'error', imageUrl?: string }`
- Client polls this until complete

**`POST /api/avatar/confirm`**
- Body: `{ jobId: string }`
- Validates the job belongs to the user and is complete
- Updates `profiles.avatar_url` with the generated image URL
- Returns `{ success: true }`

### 6. Database

**New table: `avatar_jobs`**
```sql
create table avatar_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  status text not null default 'generating', -- 'generating' | 'complete' | 'error'
  image_url text,
  prompt text not null,
  created_at timestamptz default now()
);
```

This is simpler than reusing `user_skins` — it's a lightweight job tracker for avatar generation only.

### 7. Avatar Generation Prompt

A single fixed prompt stored as a constant in `lib/avatar/mutations.ts`:

```ts
const AVATAR_PROMPT = 'Create a clean, professional portrait avatar based on this reference photo. Keep the likeness accurate. Simple background, good lighting, slightly stylized.'
```

This can be tuned later without code changes by moving it to an env variable or database config.

### 8. Reused Existing Code

- **`generate2dSkin()`** from `lib/lootbox/pipeline/generate-2d.ts` — the core AI generation function. Consider extracting it to a shared location like `lib/ai/generate-image.ts` since it's now used by two features.
- **`PhotoUpload`** component from `lib/photos/components/photo-upload.tsx` — reused in step 1 of the wizard. May need minor prop adjustments (e.g., hide the "unlock lootbox" text).
- **Photo API routes** — `POST/DELETE /api/profile/photos` remain unchanged, the wizard uses them.
- **SWR polling pattern** from `useSkinStatus` in `lib/lootbox/hooks.ts` — same pattern for `useAvatarStatus`.

### 9. UI Details

**Update Avatar button on profile card:**
- Small pencil/edit icon overlaying the avatar, or a text link "Update Avatar" below the avatar section
- Only visible on own profile

**Wizard page layout:**
- Centered content, max-width ~500px
- Back arrow to return to profile
- Step indicator (optional, since there are only 3 steps)
- Same card styling as rest of portal (`bg-tag-card`, `border-tag-border`)

**Loading state (step 2):**
- Centered spinner with "Generating your avatar..." text
- Subtle animation (pulse or shimmer on a placeholder card)

**Result state (step 3):**
- Generated image displayed large and centered
- Clear CTA buttons below

## What This Does NOT Change

- Lootbox system remains unchanged — skins, lootbox opening, equipping all work as before
- The lootbox progress widget's "Upload 3 reference photos" step still works (photos are in `user_photos` table regardless of where they were uploaded)
- Existing `AvatarUpload` component (simple file upload) can coexist but will be less prominent since the AI avatar flow is the primary path

## Verification

1. **Photo upload:** Navigate to `/portal/profile/avatar`, upload 3 photos, verify they appear
2. **Generation:** Click "Generate Avatar", verify loading state appears and polls correctly
3. **Result:** Verify generated image displays, "Use as Avatar" saves it to profile
4. **Regenerate:** Click "Try Again" → "Regenerate", verify new image is generated
5. **Change photos:** Click "Try Again" → "Change Photos", verify return to step 1
6. **Profile page:** Verify reference photos section is removed, "Update Avatar" button appears on profile card
7. **Lootbox compat:** Verify lootbox progress still tracks photo count correctly

## Tests

- `tests/routes/avatar-generate.test.ts`: API returns jobId, validates photo count, rejects unauthenticated
- `tests/routes/avatar-status.test.ts`: Returns correct status for generating/complete/error jobs
- `tests/routes/avatar-confirm.test.ts`: Updates avatar_url, rejects wrong user's job
- `tests/e2e/avatar-wizard.test.ts`: Full flow — upload photos, generate, confirm, verify profile updated
