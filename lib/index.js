"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const github = __importStar(require("@actions/github"));
const utils_1 = require("./utils");
function run() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('token', { required: true });
            const workflow = core.getInput('workflow', { required: true });
            const branch = core.getInput('branch');
            const event = utils_1.getOptionalInput('event');
            const wait = core.getBooleanInput('wait');
            let fullRepo = utils_1.getOptionalInput('repo');
            if (fullRepo === undefined) {
                fullRepo = utils_1.getRepository();
            }
            const [owner, repo] = utils_1.getOwnerAndRepo(fullRepo);
            core.info(`Checking result of ${workflow} from ${fullRepo}:${branch}`);
            const octokit = github.getOctokit(token);
            let status = null;
            let conclusion = null;
            const result = yield octokit.rest.actions
                .listWorkflowRuns({
                owner,
                repo,
                workflow_id: workflow,
                branch,
                event,
                per_page: 1
            });
            for (const latest of result.data.workflow_runs) {
                status = (_a = latest.status) !== null && _a !== void 0 ? _a : null;
                conclusion = (_b = latest.conclusion) !== null && _b !== void 0 ? _b : null;
            }
            if (status !== null && conclusion !== null) {
                core.info(`status: ${status}`);
                core.info(`conclusion: ${conclusion}`);
                core.setOutput('status', status);
                core.setOutput('conclusion', conclusion);
            }
            else {
                utils_1.logWarning('Workflow run is missing');
            }
        }
        catch (ex) {
            core.setFailed(`Failed with error: ${ex}`);
        }
    });
}
run();
