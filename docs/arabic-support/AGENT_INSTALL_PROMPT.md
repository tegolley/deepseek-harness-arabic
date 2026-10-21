# Installation prompt for an AI coding agent

Copy the prompt below into an agent working in an authorized checkout of this fork.

```text
Install and verify the Arabic-support fork of DeepSeek Harness in an isolated local Docker container.

You are already inside the fork checkout. Read README.ar.md, docs/arabic-support/INSTALL.ar.md, and compose.arabic-demo.yml first. Do not use an unrelated workspace configuration or copy private plugins. Do not commit, publish, or transmit credentials. Do not call any model API during installation.

1. Confirm the checkout has packages/client/ui-arabic-support and the Web bundle registers it. Record the current commit and confirm the worktree state before changing anything.
2. Confirm Docker and Compose are available, port 49251 is free, and the existing containers will not be changed.
3. Build with `bash docker/build-arabic-demo.sh`. If a build fails, diagnose and fix only this fork's files, then repeat the build.
4. Start with `docker compose -f compose.arabic-demo.yml up -d`. Confirm the new container is running and the Web server is listening on localhost:49251. Obtain the private startup URL from its logs but never paste the token into a public report.
5. Run `corepack pnpm exec vitest run packages/client/ui-arabic-support/tests` and `corepack pnpm run build:check` in the checkout. Verify the built Web bundle includes the Arabic plugin.
6. If an approved browser tool is available, open the private startup URL and inspect Arabic, mixed-script, numbers, and English-only presentation. Do not claim visual verification if no browser check ran.
7. Report the exact checks and results, the local access instructions without exposing the token, any remaining limitation, and how to stop only this demo container. Leave unrelated services untouched.
```
