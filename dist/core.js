***REMOVED***
var __rest = (this && this.__rest) || function (s, e) {
    var t = {***REMOVED***
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
***REMOVED***
    return t;
***REMOVED***
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); ***REMOVED***
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
***REMOVED***
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {***REMOVED***, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; ***REMOVED***, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); ***REMOVED***); ***REMOVED*** ***REMOVED***
    function resume(n, v) { try { step(g[n](v)); ***REMOVED*** catch (e) { settle(q[0][3], e); ***REMOVED*** ***REMOVED***
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); ***REMOVED***
    function fulfill(value) { resume("next", value); ***REMOVED***
    function reject(value) { resume("throw", value); ***REMOVED***
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); ***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod ***REMOVED***
***REMOVED***
***REMOVED***
exports.reportStream = exports.page = exports.downloadReport = exports.checkAsyncStatus = exports.createAsyncReport = exports.callAPI = exports.requestPromise = exports.FbException = exports.GRAPH_VIDEO_DOMAIN = exports.GRAPH_DOMAIN = exports.GRAPH_VERSION = void 0;
const request_1 = __importDefault(require("request"));
***REMOVED***
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
***REMOVED***
***REMOVED***
exports.FbException = FbException;
function requestPromise(params) {
    const { method, url, qs, form ***REMOVED*** = params;
    const options = {
        method: method,
        uri: url,
        json: true,
        headers: { 'User-Agent': `fbbizsdk-nodejs-v0.9.1` ***REMOVED***,
        body: form,
        qs
    ***REMOVED***
    return new Promise(function (resolve, reject) {
        request_1.default(options, function (err, response) {
            if (err) {
                return reject(err);
    ***REMOVED***
            const { statusCode, headers, body ***REMOVED*** = response;
        ***REMOVED***
                if (body.error) {
                    throw new FbException(body.error, options);
        ***REMOVED***
                body.requestInfo = {
                    statusCode
                ***REMOVED***
                if (headers['x-fb-ads-insights-throttle']) {
                    body.requestInfo = Object.assign(Object.assign({***REMOVED***, body.requestInfo), JSON.parse(headers['x-fb-ads-insights-throttle']));
        ***REMOVED***
                return resolve(body);
    ***REMOVED***
            catch (err) {
                return reject(err);
    ***REMOVED***
    ***REMOVED***
***REMOVED***
***REMOVED***
exports.requestPromise = requestPromise;
function encodeParams(params) {
    const output = {***REMOVED***
    Object.keys(params)
        .forEach((key) => {
        const param = params[key];
        if (typeof param === 'object') {
            output[key] = param ? JSON.stringify(param) : '';
***REMOVED***
        else {
            output[key] = param;
***REMOVED***
***REMOVED***
    return output;
***REMOVED***
function callAPI(auth, options) {
    const { graphVersion, accessToken ***REMOVED*** = auth;
    let { method, path, params = {***REMOVED***, urlOverride = '', ***REMOVED*** = options;
    let data = {***REMOVED***
    if (method === 'POST' || method === 'PUT') {
        data = params;
        params = {***REMOVED***
***REMOVED***
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
***REMOVED***
***REMOVED***
exports.callAPI = callAPI;
// interface ReqestMetaInfo {
//   statusCode: number, 
//   app_id_util_pct?: number,
//   acc_id_util_pct?: number 
// ***REMOVED***
async function createAsyncReport(auth, _a) {
    var { accountId, fields, breakdowns ***REMOVED*** = _a, options = __rest(_a, ["accountId", "fields", "breakdowns"]);
    const params = Object.assign({ fields: fields ? fields.join(',') : '', breakdowns: breakdowns ? breakdowns.join(',') : '' ***REMOVED***, options);
    const res = await callAPI(auth, {
        path: `act_${accountId***REMOVED***/insights`,
        method: 'POST',
        params
***REMOVED***
    if (!res.report_run_id) {
        throw new Error("NO_REPORT_ID");
***REMOVED***
    ;
    return res.report_run_id;
***REMOVED***
exports.createAsyncReport = createAsyncReport;
function checkAsyncStatus(auth, { reportId ***REMOVED***) {
    return __asyncGenerator(this, arguments, function* checkAsyncStatus_1() {
        const started = Date.now();
        const incrInterval = 2000;
        let runningMillis = 0;
        let waitedI = 0;
        while (true) {
            waitedI++;
            if (waitedI > 400) {
                throw new Error('WAITING TOO LONG');
    ***REMOVED***
            let waitInterval = waitedI * incrInterval;
            waitInterval = waitInterval > 60 * 1000 ? 60 * 1000 : waitInterval;
            const res = yield __await(callAPI(auth, {
                method: 'GET',
                path: reportId
    ***REMOVED***));
            runningMillis = Date.now() - started;
            const output = {
                reportId,
                isComplete: false,
                runningMillis,
                checkedCount: waitedI,
                apiResponse: res
            ***REMOVED***
            const { async_status, async_percent_completion: percentComplete ***REMOVED*** = res;
            if (async_status === 'Job Completed') {
                output.isComplete = true;
                return yield __await(output);
    ***REMOVED***
            yield yield __await(output);
            if (percentComplete === 100) {
                yield __await(tools_1.wait(200));
    ***REMOVED***
            if (percentComplete > 0) {
                yield __await(tools_1.wait(Math.round(runningMillis * 100 / percentComplete)));
    ***REMOVED***
            else {
                yield __await(tools_1.wait(waitInterval));
    ***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
exports.checkAsyncStatus = checkAsyncStatus;
function downloadReport(auth, { reportId, pageSize = 5000 ***REMOVED***) {
    return __asyncGenerator(this, arguments, function* downloadReport_1() {
        const { data, paging ***REMOVED*** = yield __await(callAPI(auth, {
            method: 'GET',
            path: reportId + "/insights",
            params: {
                limit: pageSize.toString()
    ***REMOVED***
***REMOVED***));
        for (let row of data) {
            yield yield __await(row);
***REMOVED***
        let nextPage = paging === null || paging === void 0 ? void 0 : paging.next;
        while (nextPage) {
            const { data, paging ***REMOVED*** = yield __await(page(nextPage));
            for (let row of data) {
                yield yield __await(row);
    ***REMOVED***
            nextPage = paging === null || paging === void 0 ? void 0 : paging.next;
***REMOVED***
***REMOVED***
***REMOVED***
exports.downloadReport = downloadReport;
function page(url) {
    return requestPromise({ method: 'GET', url, qs: {***REMOVED*** ***REMOVED***);
***REMOVED***
exports.page = page;
function reportStream(auth, params) {
    return __asyncGenerator(this, arguments, function* reportStream_1() {
        var e_1, _a, e_2, _b;
        const { accountId, pageSize ***REMOVED*** = params, options = __rest(params, ["accountId", "pageSize"]);
        const reportId = yield __await(createAsyncReport(auth, Object.assign({ accountId ***REMOVED***, options)));
    ***REMOVED***
            for (var _c = __asyncValues(checkAsyncStatus(auth, { reportId ***REMOVED***)), _d; _d = yield __await(_c.next()), !_d.done;) {
                let status = _d.value;
                if (status.isComplete) {
                    break;
        ***REMOVED***
    ***REMOVED***
***REMOVED***
        catch (e_1_1) { e_1 = { error: e_1_1 ***REMOVED*** ***REMOVED***
    ***REMOVED***
        ***REMOVED***
                if (_d && !_d.done && (_a = _c.return)) yield __await(_a.call(_c));
    ***REMOVED***
        ***REMOVED*** if (e_1) throw e_1.error; ***REMOVED***
***REMOVED***
        const generator = downloadReport(auth, { reportId, pageSize ***REMOVED***);
    ***REMOVED***
            for (var generator_1 = __asyncValues(generator), generator_1_1; generator_1_1 = yield __await(generator_1.next()), !generator_1_1.done;) {
                let row = generator_1_1.value;
                yield yield __await(row);
    ***REMOVED***
***REMOVED***
        catch (e_2_1) { e_2 = { error: e_2_1 ***REMOVED*** ***REMOVED***
    ***REMOVED***
        ***REMOVED***
                if (generator_1_1 && !generator_1_1.done && (_b = generator_1.return)) yield __await(_b.call(generator_1));
    ***REMOVED***
        ***REMOVED*** if (e_2) throw e_2.error; ***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
exports.reportStream = reportStream;
