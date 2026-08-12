# 01 — Auth gate and session

**What to build:** The conductor can sign in, sign out, and reset a password; only an authenticated administrator reaches protected `/admin` pages.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Email/password login and logout work against Supabase Auth.
- [x] Forgot-password email flow is available from the login screen.
- [x] Unauthenticated and non-admin users cannot access protected admin routes.
