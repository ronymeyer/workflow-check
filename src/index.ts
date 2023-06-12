import * as core from '@actions/core';
import { components } from "@octokit/openapi-types";
import { Octokit } from '@octokit/rest';
import {
  getOptionalInput,
  getOwnerAndRepo,
  getRepository
} from './utils';
import { createActionAuth } from "@octokit/auth-action";

async function checkWorkflow(octokit: Octokit, token: string, owner: string, repo: string, statusToCheck: components["parameters"]["workflow-run-status"], currentRunId: string, runnerLabel: string): Promise<boolean> {
  let foundRunningJob = false;

  core.info(`Start checking for status ${statusToCheck}.`);

  core.info(`Using owner ${owner} and repo ${repo}.`);

  const listWorkflowRunsForRepoResult = await octokit.request("GET /repos/{owner}/{repo}/actions/runs", {
    owner: owner,
    repo: repo,
    status: statusToCheck
  });
  /*
  // this call doesn't work, it looks like owner and repo don't get replaced in the URL
  octokit.rest.actions.listWorkflowRunsForRepo()
  const listWorkflowRunsForRepoResult = await octokit.actions.listWorkflowRunsForRepo({
    owner: owner,
    repo: repo,
    status: statusToCheck
  });
  */
  core.info(`Check Runs: Received status code: ${listWorkflowRunsForRepoResult.status}, number or results: ${listWorkflowRunsForRepoResult.data.total_count}.`);

  let workFlowRunsFiltered = listWorkflowRunsForRepoResult.data.workflow_runs.filter((f) => f.id != Number(currentRunId));

  const workFlowRunsMapped = workFlowRunsFiltered.map((x) => ({
    run_id: x.id,
    name: x.name
  }));

  for (const workFlowRun of workFlowRunsMapped) {
    core.info(`Checking for jobs with status ${statusToCheck} and runner lable ${runnerLabel}.`);
    const listJobsForWorkflowRunResult = await octokit.rest.actions
      .listJobsForWorkflowRun({
        owner,
        repo,
        run_id: workFlowRun.run_id
      });

    core.info(`Check Workflow Run ${workFlowRun.run_id} with name '${workFlowRun.name}'. Received status code: ${listJobsForWorkflowRunResult.status}, number or results: ${listJobsForWorkflowRunResult.data.total_count}.`);

    for (const job of listJobsForWorkflowRunResult.data.jobs) {
      if (job.labels.includes(runnerLabel)) {
        foundRunningJob = true;
        break;
      }
    }
    if (foundRunningJob)
      break;
  }

  // conclusion is null when run is in progress
  core.info(`End checking for status ${statusToCheck}. foundRunningJob: ${foundRunningJob}`);

  return foundRunningJob;
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const currentRunId = core.getInput('currentRunId', { required: true });
    const runnerLabel = core.getInput('runnerLabel', { required: true });
    let fullRepo = getOptionalInput('repo');
    if (fullRepo === undefined) {
      fullRepo = getRepository();
    }
    const [owner, repo] = getOwnerAndRepo(fullRepo);

    core.info(`Checking if there are any running runners with lable ${runnerLabel} which are different to run id ${currentRunId}`);

    var foundRunningJob = false

    const octokit = new Octokit();

    // loop through all statuses to check if we have any other running jobs
    var statusesToCheck: components["parameters"]["workflow-run-status"][] = ["pending", "requested", "queued", "in_progress"];
    for (const statusToCheck of statusesToCheck) {
      foundRunningJob = await checkWorkflow(octokit, token, owner, repo, statusToCheck, currentRunId, runnerLabel);
      if (foundRunningJob)
        break;
    }

    // conclusion is null when run is in progress
    core.info(`foundRunningJob: ${foundRunningJob}`);
    core.setOutput('foundRunningJob', foundRunningJob);

  } catch (ex) {
    const error = ensureError(ex)
    core.setFailed(`Failed with error: ${error.message}.`);
  }
}

function ensureError(value: unknown): Error {
  if (value instanceof Error) return value

  let stringified = '[Unable to stringify the thrown value]'
  try {
    stringified = JSON.stringify(value)
  } catch { }

  const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`)
  return error
}

run();
