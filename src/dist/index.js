"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core = require("@actions/core");
var rest_1 = require("@octokit/rest");
var utils_1 = require("./utils");
var auth_action_1 = require("@octokit/auth-action");
function checkWorkflow(octokit, owner, repo, statusToCheck, currentRunId, runnerLabel) {
    return __awaiter(this, void 0, Promise, function () {
        var foundRunningJob, listWorkflowRunsForRepoResult, workFlowRunsFiltered, workFlowRunsMapped, _i, workFlowRunsMapped_1, workFlowRun, listJobsForWorkflowRunResult, _a, _b, job;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    foundRunningJob = false;
                    core.info("Start checking for status " + statusToCheck + ".");
                    core.info("Using owner " + owner + " and repo " + repo + ".");
                    return [4 /*yield*/, octokit.request("GET /repos/{owner}/{repo}/actions/runs", {
                            owner: owner,
                            repo: repo,
                            status: statusToCheck
                        })];
                case 1:
                    listWorkflowRunsForRepoResult = _c.sent();
                    /*
                    // this call doesn't work, it looks like owner and repo don't get replaced in the URL
                    octokit.rest.actions.listWorkflowRunsForRepo()
                    const listWorkflowRunsForRepoResult = await octokit.actions.listWorkflowRunsForRepo({
                      owner: owner,
                      repo: repo,
                      status: statusToCheck
                    });
                    */
                    core.info("Check Runs: Received status code: " + listWorkflowRunsForRepoResult.status + ", number or results: " + listWorkflowRunsForRepoResult.data.total_count + ".");
                    workFlowRunsFiltered = listWorkflowRunsForRepoResult.data.workflow_runs.filter(function (f) { return f.id != Number(currentRunId); });
                    workFlowRunsMapped = workFlowRunsFiltered.map(function (x) { return ({
                        run_id: x.id,
                        name: x.name
                    }); });
                    _i = 0, workFlowRunsMapped_1 = workFlowRunsMapped;
                    _c.label = 2;
                case 2:
                    if (!(_i < workFlowRunsMapped_1.length)) return [3 /*break*/, 5];
                    workFlowRun = workFlowRunsMapped_1[_i];
                    core.info("Checking for jobs with status " + statusToCheck + " and runner label " + runnerLabel + ".");
                    if (statusToCheck == "pending") {
                        core.info("There are pending jobs, for pending jobs there is no run_id yet, so we can't get the label.");
                        foundRunningJob = true;
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, octokit.rest.actions
                            .listJobsForWorkflowRun({
                            owner: owner,
                            repo: repo,
                            run_id: workFlowRun.run_id
                        })];
                case 3:
                    listJobsForWorkflowRunResult = _c.sent();
                    core.info("Check Workflow Run " + workFlowRun.run_id + " with name '" + workFlowRun.name + "'. Received status code: " + listJobsForWorkflowRunResult.status + ", number or results: " + listJobsForWorkflowRunResult.data.total_count + ".");
                    for (_a = 0, _b = listJobsForWorkflowRunResult.data.jobs; _a < _b.length; _a++) {
                        job = _b[_a];
                        if (job.labels.includes(runnerLabel)) {
                            foundRunningJob = true;
                            break;
                        }
                    }
                    if (foundRunningJob)
                        return [3 /*break*/, 5];
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    // conclusion is null when run is in progress
                    core.info("End checking for status " + statusToCheck + ". foundRunningJob: " + foundRunningJob);
                    return [2 /*return*/, foundRunningJob];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, Promise, function () {
        var currentRunId, runnerLabel, fullRepo, _a, owner, repo, foundRunningJob, auth, authentication, octokit, statusesToCheck, _i, statusesToCheck_1, statusToCheck, ex_1, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    currentRunId = core.getInput('currentRunId', { required: true });
                    runnerLabel = core.getInput('runnerLabel', { required: true });
                    fullRepo = utils_1.getOptionalInput('repo');
                    if (fullRepo === undefined) {
                        fullRepo = utils_1.getRepository();
                    }
                    _a = utils_1.getOwnerAndRepo(fullRepo), owner = _a[0], repo = _a[1];
                    core.info("Checking if there are any running runners with label " + runnerLabel + " which are different to run id " + currentRunId);
                    foundRunningJob = false;
                    auth = auth_action_1.createActionAuth();
                    return [4 /*yield*/, auth()];
                case 1:
                    authentication = _b.sent();
                    core.info("Auth token type " + authentication.tokenType + ", token " + authentication.token.length + ", owner " + owner + ", repo " + repo);
                    octokit = new rest_1.Octokit({ auth: authentication.token });
                    statusesToCheck = ["pending", "requested", "queued", "in_progress"];
                    _i = 0, statusesToCheck_1 = statusesToCheck;
                    _b.label = 2;
                case 2:
                    if (!(_i < statusesToCheck_1.length)) return [3 /*break*/, 5];
                    statusToCheck = statusesToCheck_1[_i];
                    return [4 /*yield*/, checkWorkflow(octokit, owner, repo, statusToCheck, currentRunId, runnerLabel)];
                case 3:
                    foundRunningJob = _b.sent();
                    if (foundRunningJob)
                        return [3 /*break*/, 5];
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    // conclusion is null when run is in progress
                    core.info("foundRunningJob: " + foundRunningJob);
                    core.setOutput('foundRunningJob', foundRunningJob);
                    return [3 /*break*/, 7];
                case 6:
                    ex_1 = _b.sent();
                    error = ensureError(ex_1);
                    core.setFailed("Failed with error: " + error.message + ".");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function ensureError(value) {
    if (value instanceof Error)
        return value;
    var stringified = '[Unable to stringify the thrown value]';
    try {
        stringified = JSON.stringify(value);
    }
    catch (_a) { }
    var error = new Error("This value was thrown as is, not through an Error: " + stringified);
    return error;
}
run();

//# sourceMappingURL=index.js.map
