# Supabase auth email templates

These HTML files are the branded templates for Supabase's built-in auth emails
(Confirm signup, Reset password). Supabase substitutes `{{ .ConfirmationURL }}`
at send time; the link target is controlled by `emailRedirectTo` /
`redirectTo` in our code (`lib/auth/actions.ts`), which points at
`/auth/callback` so the PKCE code exchange works.

## Install

Supabase Dashboard → Authentication → Email Templates. Paste the HTML into
the corresponding template and save.

- `confirm-signup.html` → **Confirm signup**
- `invite.html` → **Invite user**
- `magic-link.html` → **Magic link**
- `change-email.html` → **Change email address**
- `password-reset.html` → **Reset password**
- `reauthentication.html` → **Reauthentication**

Leave the subject lines as you prefer; the body replaces the default template.

## Regenerate

Source lives in `lib/email/templates/supabase-*.tsx` (React Email). After
editing, regenerate HTML with:

```
pnpm render-auth-emails
```
