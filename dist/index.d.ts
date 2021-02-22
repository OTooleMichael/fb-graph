/// <reference types="node" />
import { Readable } from 'stream';
import Emitter from 'events';
import { AsyncStatus, CreateReportParams, FbAPIAuth, FBAPICallParams } from './core';
import { AdInsights, flattenActions, parseUserInputsToParams } from './tools';
export { AdInsights, flattenActions, parseUserInputsToParams };
interface ExchangeTokenParams {
    accessToken: string;
    appId: string;
    appSecret: string;
}
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
}
interface AdAccount {
    account_id?: string;
    name?: string;
    id: string;
}
interface Me {
    name: string;
    id: string;
}
export declare class FacebookAds {
    auth: FbAPIAuth;
    constructor({ accessToken, graphVersion }: {
        accessToken: string;
        graphVersion?: string;
    });
    insights(params: CreateReportParams): FbAdsInsights;
    callAPI<T>(params: FBAPICallParams): Promise<T>;
    me(): Promise<Me>;
    adaccounts(): Promise<AdAccount[]>;
}
