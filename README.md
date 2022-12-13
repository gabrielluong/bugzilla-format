# Bugzilla Format

Checks that the pull request title and commit messages are using the correct Bugzilla format:

Bug xxxxx - Short description

## Usage

```yaml
name: Bugzilla Format

on:
  pull_request_target:
    types: [opened, synchronize, reopened, edited, ready_for_review]
    branches:
      - main

jobs:
  bugzilla_format:
    runs-on: ubuntu-latest
    steps:
      - name: Bugzilla Format
        uses: gabrielluong/bugzilla-format@1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to a new release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```
