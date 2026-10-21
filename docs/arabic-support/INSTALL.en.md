# Install the Arabic RTL fork

## Experienced users

Requirements: Git and Docker with Compose. From an empty working directory:

```bash
git clone https://github.com/tegolley/deepseek-harness-rtl-arabic.git
cd deepseek-harness-rtl-arabic
bash docker/build-arabic-demo.sh
docker compose -f compose.arabic-demo.yml up -d
docker compose -f compose.arabic-demo.yml logs --tail=30 dsh-arabic-demo
```

Open the `dsh web:` link printed in the logs on the Docker host. The demo listens only on `127.0.0.1:49251` and its URL includes an access token. Keep that link private. A model key is needed for live replies, not for opening the interface.

## Beginners

1. Install [Git](https://git-scm.com/downloads) and [Docker](https://docs.docker.com/get-docker/) with Compose. Leave Docker running.
2. Open a terminal. Copy the commands from the experienced-user section one line at a time.
3. The build installs locked dependencies and compiles the application. Allow several minutes and extra disk space; the tested image was about 5.5GB.
4. Copy the `dsh web:` URL from the last command into a browser on the same computer.
5. Type an Arabic sentence with an English name and a number in the composer. For example: `اكتب بالعربية عن Model X وسعره 123 ريال والإصدار Pro 2.` The text should align RTL.
6. Configure a model in the app if you want a real response. Store its key in the app's configuration, never in a committed file.

For a remote Docker host, forward the local-only port and then open the link in your local browser:

```bash
ssh -L 49251:127.0.0.1:49251 USER@HOST
```

Replace `USER` and `HOST` with your own SSH details. To stop the demo without deleting its saved Docker volume:

```bash
docker compose -f compose.arabic-demo.yml down
```

## Install from source

Use Node.js 24, Corepack, and Git. From this fork's repository root:

```bash
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm run build:artifacts
corepack pnpm dsh web
```

The app usually starts at `http://127.0.0.1:3080/` and prints its access link. Check the Arabic plugin and assembled build with:

```bash
corepack pnpm exec vitest run packages/client/ui-arabic-support/tests
corepack pnpm run build:check
```

The official npm command installs the upstream release. Use this fork's source or Docker path for Arabic RTL support.
