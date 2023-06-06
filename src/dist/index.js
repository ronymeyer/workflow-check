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
var github = require("@actions/github");
var utils_1 = require("./utils");
function run() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, Promise, function () {
        var token, workflow, branch, event, wait, fullRepo, _e, owner, repo, octokit, status, conclusion, result, first, ex_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 2, , 3]);
                    token = core.getInput('token', { required: true });
                    workflow = core.getInput('workflow', { required: true });
                    branch = core.getInput('branch');
                    event = utils_1.getOptionalInput('event');
                    wait = core.getBooleanInput('wait');
                    fullRepo = utils_1.getOptionalInput('repo');
                    if (fullRepo === undefined) {
                        fullRepo = utils_1.getRepository();
                    }
                    _e = utils_1.getOwnerAndRepo(fullRepo), owner = _e[0], repo = _e[1];
                    core.info("Checking result of " + workflow + " from " + fullRepo + ":" + branch);
                    octokit = github.getOctokit(token);
                    status = null;
                    conclusion = null;
                    return [4 /*yield*/, octokit.rest.actions
                            .listWorkflowRuns({
                            owner: owner,
                            repo: repo,
                            workflow_id: workflow,
                            branch: branch,
                            event: event,
                            per_page: 1
                        })];
                case 1:
                    result = _f.sent();
                    core.info("Received status code " + result.status + ", number or results: " + result.data.total_count);
                    first = result.data.workflow_runs.find(function (e) { return typeof e !== 'undefined'; });
                    status = (_b = (_a = first) === null || _a === void 0 ? void 0 : _a.status, (_b !== null && _b !== void 0 ? _b : null));
                    conclusion = (_d = (_c = first) === null || _c === void 0 ? void 0 : _c.conclusion, (_d !== null && _d !== void 0 ? _d : null));
                    // conclusion is null when run is in progress
                    if (status !== null) {
                        core.info("status: " + status);
                        core.info("conclusion: " + conclusion);
                        core.setOutput('status', status);
                        core.setOutput('conclusion', conclusion);
                    }
                    else {
                        utils_1.logWarning('Workflow run is missing');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    ex_1 = _f.sent();
                    core.setFailed("Failed with error: " + ex_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
run();

//# sourceMappingURL=index.js.map
