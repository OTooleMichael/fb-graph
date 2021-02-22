/// <reference types="node" />
import { Readable ***REMOVED*** from 'stream';
import Emitter from 'events';
import { AsyncStatus, CreateReportParams, FbAPIAuth, FBAPICallParams ***REMOVED*** from './core';
import { AdInsights, flattenActions, parseUserInputsToParams ***REMOVED*** from './tools';
export { AdInsights, flattenActions, parseUserInputsToParams ***REMOVED***
interface ExchangeTokenParams {
    accessToken: string;
    appId: string;
    appSecret: string;
***REMOVED***
export declare function getExchangeToken(params: ExchangeTokenParams): Promise<unknown>;
export declare class FbAdsInsights extends Emitter {
    auth: FbAPIAuth;
    params: CreateReportParams;
    reportId?: string;
    status?: AsyncStatus;
    totalRows: number;
    _limit: number;
    constructor(auth: FbAPIAuth, params: CreateReportParams);
    limit(i: number): this;
    prepare(): Promise<string>;
    stream<T extends AdInsights.ReportRow>(): Readable;
    get<T extends AdInsights.ReportRow>(): Promise<T[]>;
    generator<T extends AdInsights.ReportRow>(): AsyncGenerator<T, void, unknown>;
***REMOVED***
interface AdAccount {
    account_id?: string;
    name?: string;
    id: string;
***REMOVED***
interface Me {
    name: string;
    id: string;
***REMOVED***
export declare class FacebookAds {
    auth: FbAPIAuth;
    constructor({ accessToken, graphVersion ***REMOVED***: {
        accessToken: string;
        graphVersion?: string;
***REMOVED***
    insights(params: CreateReportParams): FbAdsInsights;
    callAPI<T>(params: FBAPICallParams): Promise<T>;
    me(): Promise<Me>;
    adaccounts(): Promise<AdAccount[]>;
***REMOVED***
