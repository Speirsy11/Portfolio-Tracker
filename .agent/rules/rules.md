---
trigger: always_on
---

# Agent Instructions

- Always use `pnpm` instead of `npm` or `yarn`
- Add all new packages to the root `pnpm-workspace.yaml` file and use 'catalog:' to reference them in other packages/apps
- Before you submit a pull request, you **must** run `pnpm typecheck`, `pnpm lint`, and `pnpm format` to check for any issues. If any exist then you must fix them before submitting
- Name feature branches with the following convention: `feature/epic-name/feature-name`
- Name epic branches with the following convention: `epic/epic-name`
- Name release branches with the following convention: `release/epic-name`
- Name hotfix branches with the following convention: `hotfix/epic-name`
- Update .agent md files to reflect changes as you go
- Make sure you follow good practice and commit smaller chunks that make up a PR if it is large
