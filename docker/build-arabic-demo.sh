#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

export DSH_CLIENT_COMMIT_HASH="$(git rev-parse HEAD)"
docker compose -f compose.arabic-demo.yml build "$@"
