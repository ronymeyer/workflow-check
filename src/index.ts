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


async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true});
    const currentRunId = core.getInput('currentRunId', {required: true});
    const runnerLabel = core.getInput('runnerLabel', {required: true});
    let fullRepo = getOptionalInput('repo');
    if (fullRepo === undefined) {
      fullRepo = getRepository();
    }

    const [owner, repo] = getOwnerAndRepo(fullRepo);

    core.info(`Checking if there are any running runners with lable ${runnerLabel} which are different to run id ${currentRunId}`);

    const octokit = github.getOctokit(token);

    let foundRunningJob = false;
    let status: string | null = null;
    let conclusion: string | null = null;

    const statusToCheck = "in_progress";
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
      core.info(`foundRunningJob: ${foundRunningJob}`);

      core.setOutput('foundRunningJob', foundRunningJob);
  } catch (ex) {
    core.setFailed(`Failed with error: ${ex}`);
  }
}

run();
