"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const rest_1 = require("@octokit/rest");
const utils_1 = require("./utils");
function checkWorkflow(token, owner, repo, statusToCheck, currentRunId, runnerLabel) {
    return __awaiter(this, void 0, void 0, function* () {
        let foundRunningJob = false;
        const octokit = new rest_1.Octokit();
        octokit.actions.listWorkflowRunsForRepo();
        const listWorkflowRunsForRepoResult = yield octokit.rest.actions.listWorkflowRunsForRepo({
            owner: owner,
            repo: repo,
            status: statusToCheck
        });
        core.info(`Received status code: ${listWorkflowRunsForRepoResult.status}, number or results: ${listWorkflowRunsForRepoResult.data.total_count}`);
        let workFlowRunsFiltered = listWorkflowRunsForRepoResult.data.workflow_runs.filter((f) => f.id != Number(currentRunId));
        const workFlowRunsMapped = workFlowRunsFiltered.map((x) => ({
            run_id: x.id,
            name: x.name
        }));
        for (const workFlowRun of workFlowRunsMapped) {
            const listJobsForWorkflowRunResult = yield octokit.rest.actions
                .listJobsForWorkflowRun({
                owner,
                repo,
                run_id: workFlowRun.run_id
            });
            core.info(`Received status code: ${listJobsForWorkflowRunResult.status}, number or results: ${listJobsForWorkflowRunResult.data.total_count}`);
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
        core.info(`foundRunningJob for status ${statusToCheck}: ${foundRunningJob}`);
        return foundRunningJob;
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('token', { required: true });
            const currentRunId = core.getInput('currentRunId', { required: true });
            const runnerLabel = core.getInput('runnerLabel', { required: true });
            let fullRepo = (0, utils_1.getOptionalInput)('repo');
            if (fullRepo === undefined) {
                fullRepo = (0, utils_1.getRepository)();
            }
            const [owner, repo] = (0, utils_1.getOwnerAndRepo)(fullRepo);
            core.info(`Full Repot ${fullRepo}, owner ${owner}, repo ${repo}`);
            core.info(`Checking if there are any running runners with lable ${runnerLabel} which are different to run id ${currentRunId}`);
            var foundRunningJob = false;
            // loop through all statuses to check if we have any other running jobs
            var statusesToCheck = ["requested", "queued", "in_progress", "pending"];
            for (const statusToCheck of statusesToCheck) {
                foundRunningJob = yield checkWorkflow(token, owner, repo, statusToCheck, currentRunId, runnerLabel);
                if (foundRunningJob)
                    break;
            }
            // conclusion is null when run is in progress
            core.info(`foundRunningJob: ${foundRunningJob}`);
            core.setOutput('foundRunningJob', foundRunningJob);
        }
        catch (ex) {
            core.setFailed(`Failed with error: ${ex}`);
        }
    });
}
run();
