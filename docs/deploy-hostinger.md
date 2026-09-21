# Deploying on Hostinger

The site runs as a managed Node.js app (hPanel calls them **Web Apps**), available on
the Business and Cloud plans. It cannot be published as a static export: `src/proxy.ts`,
the server actions and the Supabase session all need a live Node process.

## Build settings

| Field | Value |
| --- | --- |
| Application type | `next` |
| Node.js version | 22 (LTS) |
| Root directory | `/` |
| Build script | `build:webpack` — see *Build host limitations* |
| Output directory | `.next` |
| Entry file | — (Next apps run the standalone server Hostinger starts) |
| Package manager | `npm` — set it by hand, do not leave it on auto-detect |

Hostinger wraps the Next config to add `output: "standalone"` before building. Our
`next.config.ts` works with that wrapper because its default export is an object —
`withNextIntl(nextConfig)` returns the config, it is not a function. Keep it that way:
do not set `output` yourself, do not export a function, and do not rename the file
(only `next.config.{js,mjs,ts,mts}` are read; anything else is silently ignored).

## Build host limitations

The machine that builds the app is older than Next's native toolchain, and two settings
work around it. Both are already in the repository; the build script is the only one you
have to select in hPanel.

**The Next config is plain JavaScript** (`next.config.mjs`). Next compiles a TypeScript
config with SWC before reading it, and SWC's native binary cannot load there:

```
Attempted to load @next/swc-linux-x64-gnu, but an error occurred:
/lib64/libm.so.6: version `GLIBC_2.29' not found
⨯ Failed to load next.config.ts
Error: Cannot find module '.../6ab13f8fabe70.next.config'
```

Keep the config in `.mjs`. Do not convert it back to `next.config.ts`.

**The build runs on Webpack** (`build:webpack` → `next build --webpack`). Next 16 builds
with Turbopack by default, and Turbopack only runs from that same native binary. Webpack
falls back to the WebAssembly build of SWC, which works but is much slower — mind the
15-minute limit on the build step.

Everything local stays on Turbopack: `pnpm dev` and `pnpm build` are unchanged.

## Package manager

Pick **npm** in the build settings. Hostinger's builder runs pnpm through corepack and
resolves the newest release instead of the version in our `packageManager` field, so the
install dies when that binary is not in the image's corepack cache:

```
Error: Cannot find module '/home/<user>/.cache/node/corepack/v1/pnpm/12.5.1/bin/pnpm.cjs'
ERROR: Failed to install dependencies
```

`package-lock.json` is committed for that build, and both lockfiles describe the same
tree (verified with a full `npm run build` and the test suite). Local development stays
on pnpm; after adding or bumping a dependency, refresh the npm lockfile as well:

```bash
npm install --package-lock-only
```

Leaving the detection on auto picks pnpm again, because `pnpm-lock.yaml` is in the repo.

## Deploy source

Source can be the GitHub repository (every push to `master` redeploys), an uploaded
archive, or the Hostinger Connector. Build logs live under **Deployments**.

## Environment variables

Set them **before the first build**: `NEXT_PUBLIC_*` values are baked into the bundle
while it builds, so changing one later only takes effect after a redeploy.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` — the production origin, no trailing slash. It is the origin of
  the admin password-recovery link (`src/app/admin/actions.ts`); left unset it points
  the e-mail at `localhost`.
- `SUPABASE_SECRET_KEY` — without it the contact form answers "não foi possível enviar".
- `CONTACT_FORM_SECRET`

Optional: `CONTACT_IP_HASH_SALT`, and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` +
`TURNSTILE_SECRET_KEY` together to turn the CAPTCHA on. See `docs/supabase.md`.

Do not bulk-import `.env.local`: it carries local-only entries (`VERCEL_OIDC_TOKEN`).

## Supabase

- Apply every migration in `supabase/migrations/` to the production project.
- Auth → URL Configuration: set **Site URL** to the production domain and add
  `https://<domain>/admin/update-password` to the redirect list, or the recovery e-mail
  sends the conductor to a link that will not open.

## Keeping the site and the database awake

Two things go to sleep on this setup:

- The Node app is stopped after a stretch without traffic and starts again on the next
  request, so the first visit after a quiet period waits for the boot.
- A **free Supabase project is paused** when the database receives too few queries over a
  7-day window. Supabase warns the project owner by e-mail about a week before it happens,
  and a few requests a day are enough to avoid it.

`GET /api/health` runs one real query and answers `{"ok":true}`, with `cache-control:
no-store` so no cache can answer it without touching the database. Schedule it in
hPanel → **Cron Jobs**:

```
*/15 * * * * curl -fsS -o /dev/null https://<domain>/api/health
```

Hourly is already enough for the database; every 15 minutes also keeps the app warm for
visitors. An external uptime monitor pointed at the same URL does the same job and warns
you when the site is down.

## Check after the first deploy

1. **Contact form** — send a message and confirm it lands in the admin inbox. A "server"
   error means `SUPABASE_SECRET_KEY` did not reach the running app.
2. **Visitor rate limit** — `clientIpFromHeaders` reads `x-real-ip`, falling back to the
   last entry of `x-forwarded-for`. Confirm what Hostinger's proxy sends is the visitor's
   address and not an internal hop: if every visitor hashes to the same value, the
   "5 messages per 10 minutes per visitor" rule locks the form for everybody.
3. **Admin uploads** — save a cover image of a few MB. Server Actions accept 20 MB
   (`next.config.ts`), but the proxy in front of the app may cut the request earlier; the
   failure looks like a save that never completes.
4. **Cold start** — an idle app is stopped and restarted on the next request, so the
   first visit after a quiet period waits for the boot. A 5-minute uptime ping keeps it warm.
