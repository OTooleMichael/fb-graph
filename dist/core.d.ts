import request from 'request';
import { AdInsights } from './tools';
export declare const GRAPH_VERSION = "v9.0";
export declare const GRAPH_DOMAIN = "https://graph.facebook.com";
export declare const GRAPH_VIDEO_DOMAIN = "https://graph-video.facebook.com";
export interface FbAPIAuth {
    accessToken: string;
    graphVersion: string;
}
interface ErrorAPIRes {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
}
export declare class FbException extends Error {
    type: string;
    code: number;
    fbtrace_id: string;
    request?: request.Options;
    constructor(error: ErrorAPIRes, reqOptions?: request.Options);
}
interface ReqParams {
    method: 'POST' | 'GET' | 'PUT' | 'DELETE';
    url: string;
    qs: Record<string, any>;
    form?: Record<string, any>;
}
export declare function requestPromise<T>(params: ReqParams): Promise<T>;
export interface FBAPICallParams {
    method: 'POST' | 'GET' | 'PUT' | 'DELETE';
    path: string;
    params?: any;
    files?: any;
    useMultipartFormData?: boolean;
    urlOverride?: string;
}
export declare function callAPI<T>(auth: FbAPIAuth, options: FBAPICallParams): Promise<T>;
export declare function createAsyncReport(auth: FbAPIAuth, { accountId, fields, breakdowns, ...options }: CreateReportParams): Promise<string>;
interface AsyncCheck {
    "id": string;
    "account_id": string;
    "time_ref": number;
    "time_completed": number;
    "async_status": string;
    "async_percent_completion": number;
}
export interface AsyncStatus {
    reportId: string;
    isComplete: boolean;
    runningMillis: number;
    checkedCount: number;
    apiResponse: AsyncCheck;
}
export declare function checkAsyncStatus(auth: FbAPIAuth, { reportId }: {
    reportId: string;
}): AsyncGenerator<AsyncStatus>;
interface DowloadReportReq {
    reportId: string;
    pageSize?: number;
}
export declare function downloadReport<T extends AdInsights.ReportRow = AdInsights.ReportRow>(auth: FbAPIAuth, { reportId, pageSize }: DowloadReportReq): AsyncGenerator<T>;
export declare function page<T>(url: string): Promise<T>;
export interface CreateReportParams extends AdInsights.ReportParams {
    accountId: string;
    pageSize?: number;
}
export declare function reportStream<T extends AdInsights.ReportRow>(auth: FbAPIAuth, params: CreateReportParams): AsyncGenerator<T>;
export {};
