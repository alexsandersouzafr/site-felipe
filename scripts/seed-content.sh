#!/usr/bin/env bash
# Populates the database with sample content (biography, highlights, agenda
# events, blog posts, photos, videos, press photos, and contact messages) —
# enough of each to test pagination. Safe to re-run: every insert in
# supabase/seed.sql is guarded, so it never duplicates rows.
#
# Usage:
#   ./scripts/seed-content.sh "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
#   DATABASE_URL="postgresql://..." ./scripts/seed-content.sh
#
# Find the connection string in the Supabase dashboard:
#   Project Settings -> Database -> Connection string (URI, "Session" mode).
#
# Alternative with no psql/credentials needed: open the Supabase SQL Editor
# and paste the contents of supabase/seed.sql there instead of running this
# script.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_FILE="$SCRIPT_DIR/../supabase/seed.sql"

DB_URL="${1:-${DATABASE_URL:-}}"

if [[ -z "$DB_URL" ]]; then
  echo "Error: no database connection string provided." >&2
  echo >&2
  echo "Usage: $0 \"postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres\"" >&2
  echo "   or: DATABASE_URL=\"postgresql://...\" $0" >&2
  echo >&2
  echo "Find it in the Supabase dashboard under Project Settings > Database > Connection string." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql is not installed or not on PATH." >&2
  echo "Install the PostgreSQL client, or paste supabase/seed.sql into the Supabase SQL Editor instead." >&2
  exit 1
fi

if [[ ! -f "$SEED_FILE" ]]; then
  echo "Error: seed file not found at $SEED_FILE" >&2
  exit 1
fi

echo "Seeding content from $SEED_FILE ..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$SEED_FILE"
echo "Done."
