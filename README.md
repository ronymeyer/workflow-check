# workflow-check

[![build-test](https://github.com/ronymeyer/workflow-check/actions/workflows/test.yml/badge.svg)](https://github.com/ronymeyer/workflow-check/actions/workflows/test.yml)

A Github Action that checks another workflow's latest check

## Usage

### Inputs

* `token` - Your Github API token. You can just use `${{ secrets.GITHUB_TOKEN }}`
* `workflow` - The **filename** of the workflow to check
* `branch` - Branch name to check. Defaults to `master`
* `repo` - (Optional) Repository to check
* `event` - (Optional) Event to validate, see [Events that trigger workflows](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) to get the full list

### Outputs

* `status` & `conclusion` - Result of Github API. For a list of the possible `status` and `conclusion` options, see [Create a check run](https://docs.github.com/rest/reference/checks#create-a-check-run)
* Please note that `conclusion` may be null when the workflow is currently running

## Example Workflow

```yaml
name: 'release-version'
on:
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        
      - name: Build
        run: # Build scripts
        
      - name: Check CI
      	id: check-ci
      	uses: ronymeyer/workflow-check@v0.0.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          workflow: ci.yml
          event: push
          branch: development
          
      - name: Release
      	if: ${{ steps.check-ci.outputs.conclusion == 'success' }}
        run: # Release scripts
```

## License

The scripts and documentation in this project are released under the [MIT License](https://github.com/ronymeyer/workflow-status/blob/main/LICENSE)