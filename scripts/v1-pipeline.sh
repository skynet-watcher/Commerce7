#!/usr/bin/env bash
# V1 sequence: typecheck → (optional migrate) → test → build
# CI runs the same steps via .github/workflows/ci.yml with Postgres.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=== V1 pipeline · typecheck ==="
pnpm typecheck

if [[ -n "${TEST_DATABASE_URL:-}" ]]; then
  echo ""
  echo "=== V1 pipeline · db:migrate (TEST_DATABASE_URL set) ==="
  DATABASE_URL="$TEST_DATABASE_URL" pnpm --filter @commerce7/api db:migrate
elif [[ -n "${DATABASE_URL:-}" ]]; then
  echo ""
  echo "=== V1 pipeline · db:migrate (DATABASE_URL set) ==="
  pnpm --filter @commerce7/api db:migrate
else
  echo ""
  echo "=== V1 pipeline · db:migrate (skipped) ==="
  echo "Set DATABASE_URL or TEST_DATABASE_URL to run migrations before tests."
fi

echo ""
echo "=== V1 pipeline · test ==="
pnpm test

echo ""
echo "=== V1 pipeline · build ==="
pnpm build

echo ""
echo "=== V1 pipeline · done ==="
