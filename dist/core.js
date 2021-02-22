"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportStream = exports.page = exports.downloadReport = exports.checkAsyncStatus = exports.createAsyncReport = exports.callAPI = exports.requestPromise = exports.FbException = exports.GRAPH_VIDEO_DOMAIN = exports.GRAPH_DOMAIN = exports.GRAPH_VERSION = void 0;
const request_1 = __importDefault(require("request"));
const tools_1 = require("./tools");
exports.GRAPH_VERSION = 'v9.0';
exports.GRAPH_DOMAIN = 'https://graph.facebook.com';
exports.GRAPH_VIDEO_DOMAIN = 'https://graph-video.facebook.com';
class FbException extends Error {
    constructor(error, reqOptions) {
        super(error.message);
        this.type = error.type;
        this.code = error.code;
        this.fbtrace_id = error.fbtrace_id;
        this.request = reqOptions;
    }
}
exports.FbException = FbException;
function requestPromise(params) {
    const { method, url, qs, form } = params;
    const options = {
        method: method,
        uri: url,
        json: true,
        headers: { 'User-Agent': `fbbizsdk-nodejs-v0.9.1` },
        body: form,
        qs
    };
    return new Promise(function (resolve, reject) {
        request_1.default(options, function (err, response) {
            if (err) {
                return reject(err);
            }
            const { statusCode, headers, body } = response;
            try {
                if (body.error) {
                    throw new FbException(body.error, options);
                }
                body.requestInfo = {
                    statusCode
                };
                if (headers['x-fb-ads-insights-throttle']) {
                    body.requestInfo = Object.assign(Object.assign({}, body.requestInfo), JSON.parse(headers['x-fb-ads-insights-throttle']));
                }
                return resolve(body);
            }
            catch (err) {
                return reject(err);
            }
        });
    });
}
exports.requestPromise = requestPromise;
function encodeParams(params) {
    const output = {};
    Object.keys(params)
        .forEach((key) => {
        const param = params[key];
        if (typeof param === 'object') {
            output[key] = param ? JSON.stringify(param) : '';
        }
        else {
            output[key] = param;
        }
    });
    return output;
}
function callAPI(auth, options) {
    const { graphVersion, accessToken } = auth;
    let { method, path, params = {}, urlOverride = '', } = options;
    let data = {};
    if (method === 'POST' || method === 'PUT') {
        data = params;
        params = {};
    }
    params['access_token'] = accessToken;
    const domain = urlOverride || exports.GRAPH_DOMAIN;
    let url = [
        domain, graphVersion, path
    ].join('/');
    return requestPromise({
        method,
        url,
        qs: encodeParams(params),
        form: Object.keys(data).length ? data : undefined
    });
}
exports.callAPI = callAPI;
// interface ReqestMetaInfo {
//   statusCode: number, 
//   app_id_util_pct?: number,
//   acc_id_util_pct?: number 
// }
async function createAsyncReport(auth, _a) {
    var { accountId, fields, breakdowns } = _a, options = __rest(_a, ["accountId", "fields", "breakdowns"]);
    const params = Object.assign({ fields: fields ? fields.join(',') : '', breakdowns: breakdowns ? breakdowns.join(',') : '' }, options);
    const res = await callAPI(auth, {
        path: `act_${accountId}/insights`,
        method: 'POST',
        params
    });
    if (!res.report_run_id) {
        throw new Error("NO_REPORT_ID");
    }
    ;
    return res.report_run_id;
}
exports.createAsyncReport = createAsyncReport;
function checkAsyncStatus(auth, { reportId }) {
    return __asyncGenerator(this, arguments, function* checkAsyncStatus_1() {
        const started = Date.now();
        const incrInterval = 2000;
        let runningMillis = 0;
        let waitedI = 0;
        while (true) {
            waitedI++;
            if (waitedI > 400) {
                throw new Error('WAITING TOO LONG');
            }
            let waitInterval = waitedI * incrInterval;
            waitInterval = waitInterval > 60 * 1000 ? 60 * 1000 : waitInterval;
            const res = yield __await(callAPI(auth, {
                method: 'GET',
                path: reportId
            }));
            runningMillis = Date.now() - started;
            const output = {
                reportId,
                isComplete: false,
                runningMillis,
                checkedCount: waitedI,
                apiResponse: res
            };
            const { async_status, async_percent_completion: percentComplete } = res;
            if (async_status === 'Job Completed') {
                output.isComplete = true;
                return yield __await(output);
            }
            yield yield __await(output);
            if (percentComplete === 100) {
                yield __await(tools_1.wait(200));
            }
            if (percentComplete > 0) {
                yield __await(tools_1.wait(Math.round(runningMillis * 100 / percentComplete)));
            }
            else {
                yield __await(tools_1.wait(waitInterval));
            }
        }
    });
}
exports.checkAsyncStatus = checkAsyncStatus;
function downloadReport(auth, { reportId, pageSize = 5000 }) {
    return __asyncGenerator(this, arguments, function* downloadReport_1() {
        const { data, paging } = yield __await(callAPI(auth, {
            method: 'GET',
            path: reportId + "/insights",
            params: {
                limit: pageSize.toString()
            }
        }));
        for (let row of data) {
            yield yield __await(row);
        }
        let nextPage = paging === null || paging === void 0 ? void 0 : paging.next;
        while (nextPage) {
            const { data, paging } = yield __await(page(nextPage));
            for (let row of data) {
                yield yield __await(row);
            }
            nextPage = paging === null || paging === void 0 ? void 0 : paging.next;
        }
    });
}
exports.downloadReport = downloadReport;
function page(url) {
    return requestPromise({ method: 'GET', url, qs: {} });
}
exports.page = page;
function reportStream(auth, params) {
    return __asyncGenerator(this, arguments, function* reportStream_1() {
        var e_1, _a, e_2, _b;
        const { accountId, pageSize } = params, options = __rest(params, ["accountId", "pageSize"]);
        const reportId = yield __await(createAsyncReport(auth, Object.assign({ accountId }, options)));
        try {
            for (var _c = __asyncValues(checkAsyncStatus(auth, { reportId })), _d; _d = yield __await(_c.next()), !_d.done;) {
                let status = _d.value;
                if (status.isComplete) {
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) yield __await(_a.call(_c));
            }
            finally { if (e_1) throw e_1.error; }
        }
        const generator = downloadReport(auth, { reportId, pageSize });
        try {
            for (var generator_1 = __asyncValues(generator), generator_1_1; generator_1_1 = yield __await(generator_1.next()), !generator_1_1.done;) {
                let row = generator_1_1.value;
                yield yield __await(row);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (generator_1_1 && !generator_1_1.done && (_b = generator_1.return)) yield __await(_b.call(generator_1));
            }
            finally { if (e_2) throw e_2.error; }
        }
    });
}
exports.reportStream = reportStream;
