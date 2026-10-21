# Arabic support fork

This fork starts from the official `deepseek-ai/deepseek-harness` repository. Arabic support lives in one isolated browser package, `packages/client/ui-arabic-support`. The only changes to upstream configuration are its Web roster row, Web bundle dependency, and TypeScript project reference. No private workspace files, credentials, or custom branding belong in this fork.

## Follow upstream

Add the official repository as a remote in a local checkout:

```sh
git remote add upstream https://github.com/deepseek-ai/deepseek-harness.git
git fetch upstream master
git switch master
git merge upstream/master
corepack pnpm install --frozen-lockfile
corepack pnpm run test:gui
DSH_SNAPSHOT=replay corepack pnpm run test:web
```

The `upstream-sync.yml` workflow performs the fetch and merge weekly, opens a pull request for a clean merge, and dispatches `arabic-support-ci.yml` on that update branch. A conflict leaves the default branch untouched and marks the sync run as failed for review. The standard-runner CI also tests ordinary pull requests. Keep failed updates open for diagnosis and merge only after tests and review pass. GitHub places pull-request workflows created by its default token in an approval-required state; the explicit `workflow_dispatch` runs the branch checks without that prompt. The upstream repository's own CI may require private runner labels unavailable in a public fork, so choose branch protection based on the fork's runnable checks. Repository settings must allow Actions to create pull requests and dispatch workflows. Do not automate publication from the sync workflow.

## Checks before publication

Run the package tests, `test:gui`, `test:web`, `build:artifacts`, and `build:check`. Review the entire fork diff against upstream, including workflow files, for credentials and private references. A clean source checkout and a package marked `private` keep this fork separate from npm publication.
