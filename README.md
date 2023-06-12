# workflow-check

[![build-test](https://github.com/ronymeyer/workflow-check/actions/workflows/test.yml/badge.svg)](https://github.com/ronymeyer/workflow-check/actions/workflows/test.yml)

A Github Action that checks if there are any other pending or in progress workflows for given runner label.
In case the workflow is pending we don't get yet a runner id, so we can't check the label and the check returns true.

## Usage

### Inputs

* `token` - Your Github API token. You can just use `${{ secrets.GITHUB_TOKEN }}`
* `currentRunId` - The run id of the current runner, required to exclude from results. Use `${{ github.run_id }}`
* `runnerLabel` - Label to be checked for other running workflows

### Outputs

* `foundRunningJob` - `true` if other running jobs have been found, `false` otherwise. In GitHub Actions the out put has to be compared to string. In bash booleans can be used. See [Create a check run](https://docs.github.com/rest/reference/checks#create-a-check-run)

## Example Workflow

```yaml
name: 'release-version'
on:
  pull_request:
  push:
    branches:
      - master
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
      	uses: ronymeyer/workflow-check@v0.0.4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          currentRunId: ${{ github.run_id }}
          runnerLabel: "ubuntu-latest"
          
      - name: Release
      	if: ${{ steps.check-ci.outputs.foundRunningJob == 'true' }}
        run: # Release scripts
```

## License

The scripts and documentation in this project are released under the [MIT License](https://github.com/ronymeyer/workflow-status/blob/main/LICENSE)