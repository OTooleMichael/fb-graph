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
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod ***REMOVED***
***REMOVED***
***REMOVED***
exports.FacebookAds = exports.FbAdsInsights = exports.getExchangeToken = exports.parseUserInputsToParams = exports.flattenActions = exports.AdInsights = void 0;
const stream_1 = require("stream");
const events_1 = __importDefault(require("events"));
const core_1 = require("./core");
***REMOVED***
Object.defineProperty(exports, "AdInsights", { enumerable: true, get: function () { return tools_1.AdInsights; ***REMOVED*** ***REMOVED***);
Object.defineProperty(exports, "flattenActions", { enumerable: true, get: function () { return tools_1.flattenActions; ***REMOVED*** ***REMOVED***);
Object.defineProperty(exports, "parseUserInputsToParams", { enumerable: true, get: function () { return tools_1.parseUserInputsToParams; ***REMOVED*** ***REMOVED***);
async function getExchangeToken(params) {
    const { accessToken, appId, appSecret ***REMOVED*** = params;
    const url = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId***REMOVED***&client_secret=${appSecret***REMOVED***&fb_exchange_token=${accessToken***REMOVED***`;
    return core_1.requestPromise({
        method: 'GET', url, qs: {***REMOVED***
***REMOVED***
***REMOVED***
exports.getExchangeToken = getExchangeToken;
class FbAdsInsights extends events_1.default {
    constructor(auth, params) {
        super();
        this.auth = auth;
        this.params = params;
        this.params.accountId = this.params.accountId.replace('act_', '');
        this.totalRows = 0;
        this._limit = 0;
***REMOVED***
    limit(i) {
        this._limit = i;
        return this;
***REMOVED***
    async prepare() {
    ***REMOVED***
        const { auth ***REMOVED*** = this;
        const _b = this.params, { accountId, pageSize ***REMOVED*** = _b, options = __rest(_b, ["accountId", "pageSize"]);
        const reportId = await core_1.createAsyncReport(auth, Object.assign({ accountId ***REMOVED***, options));
        this.emit('progress', {
            event: 'CREATED',
            reportId,
    ***REMOVED***
        this.reportId = reportId;
    ***REMOVED***
            for (var _c = __asyncValues(core_1.checkAsyncStatus(auth, { reportId ***REMOVED***)), _d; _d = await _c.next(), !_d.done;) {
                let status = _d.value;
                this.emit('progress', Object.assign({ event: 'CHECKED' ***REMOVED***, status));
                if (status.isComplete) {
                    break;
        ***REMOVED***
    ***REMOVED***
***REMOVED***
        catch (e_1_1) { e_1 = { error: e_1_1 ***REMOVED*** ***REMOVED***
    ***REMOVED***
        ***REMOVED***
                if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
    ***REMOVED***
        ***REMOVED*** if (e_1) throw e_1.error; ***REMOVED***
***REMOVED***
        return reportId;
***REMOVED***
    stream() {
        const stream = new stream_1.Readable({
            objectMode: true,
            read: async () => {
                (async () => {
                    var e_2, _a;
                ***REMOVED***
                        for (var _b = __asyncValues(this.generator()), _c; _c = await _b.next(), !_c.done;) {
                            let row = _c.value;
                            if (!stream.push(row)) {
                                await new Promise((resolve) => stream.once("drain", resolve));
                    ***REMOVED***
                ***REMOVED***
            ***REMOVED***
                    catch (e_2_1) { e_2 = { error: e_2_1 ***REMOVED*** ***REMOVED***
                ***REMOVED***
                    ***REMOVED***
                ***REMOVED***
                ***REMOVED***
                    ***REMOVED*** if (e_2) throw e_2.error; ***REMOVED***
            ***REMOVED***
                    stream.push(null);
        ***REMOVED***)().catch(e => {
                    console.log(e, 'ERROR');
                    stream.emit('error', e);
            ***REMOVED***
    ***REMOVED***
    ***REMOVED***
        return stream;
***REMOVED***
    async get() {
        var e_3, _a;
        let rows = [];
    ***REMOVED***
            for (var _b = __asyncValues(this.generator()), _c; _c = await _b.next(), !_c.done;) {
                let row = _c.value;
                rows.push(row);
    ***REMOVED***
***REMOVED***
        catch (e_3_1) { e_3 = { error: e_3_1 ***REMOVED*** ***REMOVED***
    ***REMOVED***
        ***REMOVED***
    ***REMOVED***
    ***REMOVED***
        ***REMOVED*** if (e_3) throw e_3.error; ***REMOVED***
***REMOVED***
        return rows;
***REMOVED***
    generator() {
        return __asyncGenerator(this, arguments, function* generator_1() {
            var e_4, _a;
            const { auth ***REMOVED*** = this;
            const { pageSize ***REMOVED*** = this.params;
            const reportId = yield __await(this.prepare());
            const generator = core_1.downloadReport(auth, { reportId, pageSize ***REMOVED***);
        ***REMOVED***
                for (var generator_2 = __asyncValues(generator), generator_2_1; generator_2_1 = yield __await(generator_2.next()), !generator_2_1.done;) {
                    let row = generator_2_1.value;
                    this.totalRows = this.totalRows + 1;
                    this.emit('data', row);
                    yield yield __await(row);
                    if (this._limit && this.totalRows >= this._limit) {
                        this.emit('complete', {
                            event: 'LIMIT_REACHED',
                            totalRows: this.totalRows
                    ***REMOVED***
                        break;
            ***REMOVED***
        ***REMOVED***
    ***REMOVED***
            catch (e_4_1) { e_4 = { error: e_4_1 ***REMOVED*** ***REMOVED***
        ***REMOVED***
            ***REMOVED***
                    if (generator_2_1 && !generator_2_1.done && (_a = generator_2.return)) yield __await(_a.call(generator_2));
        ***REMOVED***
            ***REMOVED*** if (e_4) throw e_4.error; ***REMOVED***
    ***REMOVED***
            this.emit('complete', {
                event: 'COMPLETE',
                totalRows: this.totalRows
        ***REMOVED***
    ***REMOVED***
***REMOVED***
***REMOVED***
exports.FbAdsInsights = FbAdsInsights;
class FacebookAds {
    constructor({ accessToken, graphVersion ***REMOVED***) {
        this.auth = {
            accessToken,
            graphVersion: graphVersion || core_1.GRAPH_VERSION
        ***REMOVED***
***REMOVED***
    insights(params) {
        return new FbAdsInsights(this.auth, params);
***REMOVED***
    callAPI(params) {
        return core_1.callAPI(this.auth, params);
***REMOVED***
    async me() {
        return this.callAPI({
            method: 'GET', path: 'me'
    ***REMOVED***
***REMOVED***
    async adaccounts() {
        const { data: adAccounts ***REMOVED*** = await this.callAPI({
            method: 'GET', path: 'me/adaccounts', params: {
                fields: 'name,account_id,id'
    ***REMOVED***
    ***REMOVED***
        return adAccounts;
***REMOVED***
***REMOVED***
exports.FacebookAds = FacebookAds;
