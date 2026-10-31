# LearnYou

Your personal learning library: docs, PDFs, links, YouTube videos, playlists and channels, organized by folder and date. Web (Next.js) and mobile (Expo) apps, synced through Supabase. Runs entirely on free tiers.

## Structure

```
apps/web         Next.js 16 (App Router, Cache Components) — glass UI, Supabase SSR auth
apps/mobile      Expo SDK 58 (Expo Router) — Liquid Glass on iOS 26, BlurView fallback
packages/core       Zod schemas, folder tree, date grouping, formatting
packages/ui-tokens  Design tokens shared by both apps
packages/youtube    YouTube URL parsing (video / playlist / channel / @handle)
supabase/migrations Postgres schema + row-level security
```

## One-time setup (all free)

1. **Supabase**: create a free project at <https://supabase.com/dashboard>.
   - SQL editor → run `supabase/migrations/20261031000000_init.sql`.
   - Settings → API → copy the Project URL and anon key into `apps/web/.env.local` and `apps/mobile/.env`.
2. **GitHub OAuth**: GitHub → Settings → Developer settings → OAuth Apps → New.
   - Callback URL: `https://<project>.supabase.co/auth/v1/callback`
   - Paste the client ID/secret into Supabase → Authentication → Providers → GitHub.
3. **Google OAuth**: Google Cloud Console → APIs & Services → Credentials → OAuth client (Web).
   - Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`
   - Paste into Supabase → Authentication → Providers → Google.
4. **Redirect URLs**: in Supabase → Authentication → URL Configuration, add:
   - `http://localhost:3000/auth/callback` (web dev) and your deployed web URL + `/auth/callback`
   - `learnyou://auth/callback` (mobile) and, for Expo Go, the `exp://…/--/auth/callback` URL it prints

## Develop

```bash
pnpm install
pnpm --filter @learnyou/web dev      # http://localhost:3000
pnpm --filter @learnyou/mobile dev   # Expo; press i / a, or scan with Expo Go
pnpm typecheck && pnpm exec vitest run packages
```

## Free-tier notes

- Free Supabase projects pause after 7 days idle; `.github/workflows/supabase-keepalive.yml` pings daily (add `SUPABASE_URL` and `SUPABASE_ANON_KEY` repo secrets).
- Mobile without store fees: Android, install the APK directly (`npx eas-cli build -p android --profile preview`). iPhone, use the web app via "Add to Home Screen", or a free-Apple-ID dev build.
