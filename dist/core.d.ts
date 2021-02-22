import request from 'request';
import { AdInsights ***REMOVED*** from './tools';
export declare const GRAPH_VERSION = "v9.0";
export declare const GRAPH_DOMAIN = "https://graph.facebook.com";
export declare const GRAPH_VIDEO_DOMAIN = "https://graph-video.facebook.com";
export interface FbAPIAuth {
    accessToken: string;
    graphVersion: string;
***REMOVED***
interface ErrorAPIRes {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
***REMOVED***
export declare class FbException extends Error {
    type: string;
    code: number;
    fbtrace_id: string;
    request?: request.Options;
    constructor(error: ErrorAPIRes, reqOptions?: request.Options);
***REMOVED***
interface ReqParams {
    method: 'POST' | 'GET' | 'PUT' | 'DELETE';
    url: string;
    qs: Record<string, any>;
    form?: Record<string, any>;
***REMOVED***
export declare function requestPromise<T>(params: ReqParams): Promise<T>;
export interface FBAPICallParams {
    method: 'POST' | 'GET' | 'PUT' | 'DELETE';
    path: string;
    params?: any;
    files?: any;
    useMultipartFormData?: boolean;
    urlOverride?: string;
***REMOVED***
export declare function callAPI<T>(auth: FbAPIAuth, options: FBAPICallParams): Promise<T>;
export declare function createAsyncReport(auth: FbAPIAuth, { accountId, fields, breakdowns, ...options ***REMOVED***: CreateReportParams): Promise<string>;
interface AsyncCheck {
    "id": string;
    "account_id": string;
    "time_ref": number;
    "time_completed": number;
    "async_status": string;
    "async_percent_completion": number;
***REMOVED***
export interface AsyncStatus {
    reportId: string;
    isComplete: boolean;
    runningMillis: number;
    checkedCount: number;
    apiResponse: AsyncCheck;
***REMOVED***
export declare function checkAsyncStatus(auth: FbAPIAuth, { reportId ***REMOVED***: {
    reportId: string;
***REMOVED***): AsyncGenerator<AsyncStatus>;
interface DowloadReportReq {
    reportId: string;
    pageSize?: number;
***REMOVED***
export declare function downloadReport<T extends AdInsights.ReportRow = AdInsights.ReportRow>(auth: FbAPIAuth, { reportId, pageSize ***REMOVED***: DowloadReportReq): AsyncGenerator<T>;
export declare function page<T>(url: string): Promise<T>;
export interface CreateReportParams extends AdInsights.ReportParams {
    accountId: string;
    pageSize?: number;
***REMOVED***
export declare function reportStream<T extends AdInsights.ReportRow>(auth: FbAPIAuth, params: CreateReportParams): AsyncGenerator<T>;
export {***REMOVED***
