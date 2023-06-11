import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  getFirst,
  getOptionalInput,
  getOwnerAndRepo,
  getRepository,
  logWarning,
  waitTime
} from './utils';
import { components } from "@octokit/openapi-types";

async function checkWorkflow(token:string, owner:string, repo: string, statusToCheck: components["parameters"]["workflow-run-status"], currentRunId: string, runnerLabel: string): Promise<boolean> {
  let foundRunningJob = false;

  const octokit = github.getOctokit(token);

  const listWorkflowRunsForRepoResult = await octokit.rest.actions
  .listWorkflowRunsForRepo({
    owner,
    repo,
    status: statusToCheck
  });

  core.info(`Received status code: ${listWorkflowRunsForRepoResult.status}, number or results: ${listWorkflowRunsForRepoResult.data.total_count}`);

  let workFlowRunsFiltered = listWorkflowRunsForRepoResult.data.workflow_runs.filter((f)=> f.id != Number(currentRunId));

  const workFlowRunsMapped = workFlowRunsFiltered.map((x) => ({
    run_id: x.id,
    name: x.name
  }));

  for (const workFlowRun of workFlowRunsMapped) {
    const listJobsForWorkflowRunResult = await octokit.rest.actions
    .listJobsForWorkflowRun({
      owner,
      repo,
      run_id: workFlowRun.run_id
    });

    core.info(`Received status code: ${listJobsForWorkflowRunResult.status}, number or results: ${listJobsForWorkflowRunResult.data.total_count}`);

    for (const job of listJobsForWorkflowRunResult.data.jobs){
      if (job.labels.includes(runnerLabel)){
        foundRunningJob = true;
        break;
      }
    }
    if (foundRunningJob)
      break;
  }

  // conclusion is null when run is in progress
    core.info(`foundRunningJob for status ${statusToCheck}: ${foundRunningJob}`);

    return foundRunningJob;
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true});
    const currentRunId = core.getInput('currentRunId', {required: true});
    const runnerLabel = core.getInput('runnerLabel', {required: true});
    let fullRepo = getOptionalInput('repo');
    if (fullRepo === undefined) {
      fullRepo = getRepository();
    }

    core.info(`Checking if there are any running runners with lable ${runnerLabel} which are different to run id ${currentRunId}`);

    const [owner, repo] = getOwnerAndRepo(fullRepo);
    const octokit = github.getOctokit(token);

    var foundRunningJob = false

    // loop through all statuses to check if we have any other running jobs
    var statusesToCheck:components["parameters"]["workflow-run-status"][] = ["requested", "queued", "in_progress", "waiting"];
    for (const statusToCheck of statusesToCheck) {
      foundRunningJob = await checkWorkflow(token, owner, repo, statusToCheck, currentRunId, runnerLabel);
      if (foundRunningJob)
        break;
    }

    // conclusion is null when run is in progress
    core.info(`foundRunningJob: ${foundRunningJob}`);
    core.setOutput('foundRunningJob', foundRunningJob);

  } catch (ex) {
    core.setFailed(`Failed with error: ${ex}`);
  }
}

run();
