FROM node:24-bookworm

WORKDIR /app

RUN corepack enable

COPY . .

ARG DSH_CLIENT_COMMIT_HASH

RUN test -n "$DSH_CLIENT_COMMIT_HASH"

RUN corepack pnpm install --frozen-lockfile \
    && DSH_GATE_CONCURRENCY=2 corepack pnpm run build:artifacts

ENV DSH_HOME=/data \
    DSH_TELEMETRY_DISABLED=1 \
    DSH_DEMO_PUBLIC_URL=http://127.0.0.1:49251/ \
    DSH_DEMO_TRUSTED_HOST=127.0.0.1

EXPOSE 3080
VOLUME ["/data"]

CMD ["bash", "docker/arabic-demo-entrypoint.sh"]
