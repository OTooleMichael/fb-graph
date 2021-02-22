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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookAds = exports.FbAdsInsights = exports.getExchangeToken = exports.parseUserInputsToParams = exports.flattenActions = exports.AdInsights = void 0;
const stream_1 = require("stream");
const events_1 = __importDefault(require("events"));
const core_1 = require("./core");
const tools_1 = require("./tools");
Object.defineProperty(exports, "AdInsights", { enumerable: true, get: function () { return tools_1.AdInsights; } });
Object.defineProperty(exports, "flattenActions", { enumerable: true, get: function () { return tools_1.flattenActions; } });
Object.defineProperty(exports, "parseUserInputsToParams", { enumerable: true, get: function () { return tools_1.parseUserInputsToParams; } });
async function getExchangeToken(params) {
    const { accessToken, appId, appSecret } = params;
    const url = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`;
    return core_1.requestPromise({
        method: 'GET', url, qs: {}
    });
}
exports.getExchangeToken = getExchangeToken;
class FbAdsInsights extends events_1.default {
    constructor(auth, params) {
        super();
        this.auth = auth;
        this.params = params;
        this.params.accountId = this.params.accountId.replace('act_', '');
        this.totalRows = 0;
        this._limit = 0;
    }
    limit(i) {
        this._limit = i;
        return this;
    }
    async prepare() {
        var e_1, _a;
        const { auth } = this;
        const _b = this.params, { accountId, pageSize } = _b, options = __rest(_b, ["accountId", "pageSize"]);
        const reportId = await core_1.createAsyncReport(auth, Object.assign({ accountId }, options));
        this.emit('progress', {
            event: 'CREATED',
            reportId,
        });
        this.reportId = reportId;
        try {
            for (var _c = __asyncValues(core_1.checkAsyncStatus(auth, { reportId })), _d; _d = await _c.next(), !_d.done;) {
                let status = _d.value;
                this.emit('progress', Object.assign({ event: 'CHECKED' }, status));
                if (status.isComplete) {
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return reportId;
    }
    stream() {
        const stream = new stream_1.Readable({
            objectMode: true,
            read: async () => {
                (async () => {
                    var e_2, _a;
                    try {
                        for (var _b = __asyncValues(this.generator()), _c; _c = await _b.next(), !_c.done;) {
                            let row = _c.value;
                            if (!stream.push(row)) {
                                await new Promise((resolve) => stream.once("drain", resolve));
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    stream.push(null);
                })().catch(e => {
                    console.log(e, 'ERROR');
                    stream.emit('error', e);
                });
            }
        });
        return stream;
    }
    async get() {
        var e_3, _a;
        let rows = [];
        try {
            for (var _b = __asyncValues(this.generator()), _c; _c = await _b.next(), !_c.done;) {
                let row = _c.value;
                rows.push(row);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return rows;
    }
    generator() {
        return __asyncGenerator(this, arguments, function* generator_1() {
            var e_4, _a;
            const { auth } = this;
            const { pageSize } = this.params;
            const reportId = yield __await(this.prepare());
            const generator = core_1.downloadReport(auth, { reportId, pageSize });
            try {
                for (var generator_2 = __asyncValues(generator), generator_2_1; generator_2_1 = yield __await(generator_2.next()), !generator_2_1.done;) {
                    let row = generator_2_1.value;
                    this.totalRows = this.totalRows + 1;
                    this.emit('data', row);
                    yield yield __await(row);
                    if (this._limit && this.totalRows >= this._limit) {
                        this.emit('complete', {
                            event: 'LIMIT_REACHED',
                            totalRows: this.totalRows
                        });
                        break;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (generator_2_1 && !generator_2_1.done && (_a = generator_2.return)) yield __await(_a.call(generator_2));
                }
                finally { if (e_4) throw e_4.error; }
            }
            this.emit('complete', {
                event: 'COMPLETE',
                totalRows: this.totalRows
            });
        });
    }
}
exports.FbAdsInsights = FbAdsInsights;
class FacebookAds {
    constructor({ accessToken, graphVersion }) {
        this.auth = {
            accessToken,
            graphVersion: graphVersion || core_1.GRAPH_VERSION
        };
    }
    insights(params) {
        return new FbAdsInsights(this.auth, params);
    }
    callAPI(params) {
        return core_1.callAPI(this.auth, params);
    }
    async me() {
        return this.callAPI({
            method: 'GET', path: 'me'
        });
    }
    async adaccounts() {
        const { data: adAccounts } = await this.callAPI({
            method: 'GET', path: 'me/adaccounts', params: {
                fields: 'name,account_id,id'
            }
        });
        return adAccounts;
    }
}
exports.FacebookAds = FacebookAds;
