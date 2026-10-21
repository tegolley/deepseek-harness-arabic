#!/usr/bin/env bash
set -euo pipefail

bind_address="$(hostname -i | awk '{print $1}')"
if [[ -z "$bind_address" ]]; then
  echo "Could not determine the container IP address" >&2
  exit 1
fi

exec node apps/cli/lib/bin.js \
  --profile web \
  --no-open \
  --host "$bind_address" \
  --port 3080 \
  --public-url "$DSH_DEMO_PUBLIC_URL" \
  --trusted-host "$DSH_DEMO_TRUSTED_HOST"
