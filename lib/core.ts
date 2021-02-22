import request from 'request'
import {
  wait, AdInsights
***REMOVED*** from './tools'
export const GRAPH_VERSION = 'v9.0';
export const GRAPH_DOMAIN = 'https://graph.facebook.com'
export const GRAPH_VIDEO_DOMAIN = 'https://graph-video.facebook.com'
export interface FbAPIAuth {
  accessToken: string;
  graphVersion: string
***REMOVED***
interface ErrorAPIRes {
  message: string;
  type: string,
  code: number,
  fbtrace_id: string
***REMOVED***
export class FbException extends Error {
  type: string;
  code: number;
  fbtrace_id: string;
  request?: request.Options
  constructor(error: ErrorAPIRes, reqOptions?: request.Options){
    super(error.message)
    this.type = error.type
    this.code = error.code
    this.fbtrace_id = error.fbtrace_id
    this.request = reqOptions
  ***REMOVED***
***REMOVED***
interface ReqParams {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  url: string;
  qs: Record<string, any>;
  form?: Record<string, any>;
***REMOVED***
export function requestPromise<T>(params: ReqParams): Promise<T> {
  const {
    method, url, qs, form
  ***REMOVED*** = params
  const options: request.Options = {
    method: method,
    uri: url,
    json: true,
    headers: {'User-Agent': `fbbizsdk-nodejs-v0.9.1`***REMOVED***,
    body: form,
    qs
  ***REMOVED***
  return new Promise(function(resolve,reject){
    request(options, function(err, response){
      if(err){
        return reject(err)
  ***REMOVED***
      const { statusCode, headers, body ***REMOVED*** = response
      try{
        if(body.error){
          throw new FbException(body.error as ErrorAPIRes, options)
***REMOVED***
        
        body.requestInfo = {
          statusCode
***REMOVED***
        if(headers['x-fb-ads-insights-throttle']){
          body.requestInfo = {
            ...body.requestInfo,
            ...JSON.parse(headers['x-fb-ads-insights-throttle'] as string)
  ***REMOVED***
***REMOVED***
        return resolve(body)
  ***REMOVED***catch(err){
        return reject(err)
  ***REMOVED***
***REMOVED***)
  ***REMOVED***)
***REMOVED***

export interface FBAPICallParams {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  path: string;
  params?: any;
  files?: any;
  useMultipartFormData?: boolean;
  urlOverride?:string
***REMOVED***
function encodeParams(params: Record<string, any>): Record<string, string> {
  const output: Record<string, string> = {***REMOVED***
  Object.keys(params)
    .forEach((key:string) => {
      const param = params[key];
      if(typeof param === 'object'){
        output[key] = param ? JSON.stringify(param) : '';
  ***REMOVED***else{
        output[key] = param
  ***REMOVED***
***REMOVED***)
  return output
***REMOVED***

export function callAPI<T>( auth:FbAPIAuth, options: FBAPICallParams): Promise<T> {
  const { graphVersion, accessToken ***REMOVED*** = auth;
  let {
    method, path, params = {***REMOVED***,
    urlOverride = '',
  ***REMOVED*** = options
  
  let data = {***REMOVED***

  if (method === 'POST' || method === 'PUT') {
    data = params;
    params = {***REMOVED***
  ***REMOVED***
  params['access_token'] = accessToken;
  const domain = urlOverride || GRAPH_DOMAIN;
  let url = [
    domain, graphVersion,  path
  ].join('/')
  
  return requestPromise<T>({
    method, 
    url, 
    qs:encodeParams(params),
    form:Object.keys(data).length ? data : undefined
  ***REMOVED***)
***REMOVED***


// interface ReqestMetaInfo {
//   statusCode: number, 
//   app_id_util_pct?: number,
//   acc_id_util_pct?: number 
// ***REMOVED***
export async function createAsyncReport(auth: FbAPIAuth, {
  accountId, fields, breakdowns, ...options
***REMOVED***: CreateReportParams){
  const params = {
    fields:fields ? fields.join(',') : '',
    breakdowns:breakdowns ? breakdowns.join(',') : '',
    ...options,
  ***REMOVED***
  const res = await callAPI<{ report_run_id:string ***REMOVED***>(auth, {
    path:`act_${accountId***REMOVED***/insights`,
    method:'POST',
    params
  ***REMOVED***)
	if(!res.report_run_id){
		throw new Error("NO_REPORT_ID")
	***REMOVED***
	return res.report_run_id
***REMOVED***
interface AsyncCheck {
    "id": string,
    "account_id": string,
    "time_ref": number,
    "time_completed": number,
    "async_status": string,
    "async_percent_completion": number
***REMOVED***
export interface AsyncStatus {
  reportId: string;
  isComplete: boolean;
  runningMillis: number;
  checkedCount: number;
  apiResponse:AsyncCheck
***REMOVED***
export async function *checkAsyncStatus(
  auth: FbAPIAuth, 
  { reportId ***REMOVED***: { reportId:string ***REMOVED***
): AsyncGenerator<AsyncStatus>{
  const started = Date.now()
  const incrInterval = 2000;
  let runningMillis = 0;
  let waitedI = 0
  while(true){
    waitedI++
    if(waitedI > 400){
      throw new Error('WAITING TOO LONG');
***REMOVED***
    let waitInterval = waitedI*incrInterval;
	  waitInterval = waitInterval > 60*1000 ? 60*1000 : waitInterval;
    
    const res = await callAPI<AsyncCheck>(auth, {
      method:'GET',
      path:reportId
***REMOVED***)
    runningMillis = Date.now() - started
    const output: AsyncStatus = {
      reportId,
      isComplete: false,
      runningMillis,
      checkedCount: waitedI,
      apiResponse: res
***REMOVED***
    const {
      async_status,
      async_percent_completion:percentComplete
***REMOVED*** = res
    if(async_status === 'Job Completed'){
      output.isComplete = true
      return output
***REMOVED***
    yield output
    if(percentComplete === 100){
      await wait(200)
***REMOVED***if(percentComplete > 0){
      await wait( Math.round( runningMillis*100 / percentComplete ) )
***REMOVED***else{
      await wait( waitInterval )
***REMOVED***
  ***REMOVED***
***REMOVED***

interface ReportRes<T> {
  data:T[],
  paging?:{ next?:string ***REMOVED*** 
***REMOVED***

interface DowloadReportReq {
  reportId:string,
  pageSize?:number
***REMOVED***

export async function *downloadReport<T extends AdInsights.ReportRow = AdInsights.ReportRow>(
  auth: FbAPIAuth, { reportId, pageSize = 5000 ***REMOVED***: DowloadReportReq
): AsyncGenerator<T>{
  const { data, paging ***REMOVED*** = await callAPI< ReportRes<T> >(auth, {
    method:'GET',
    path:reportId+"/insights",
    params:{
      limit:pageSize.toString()
***REMOVED***
  ***REMOVED***)
  for(let row of data){
    yield row
  ***REMOVED***
  let nextPage = paging?.next;
  while(nextPage){
    const { data, paging ***REMOVED*** = await page<ReportRes<T>>(nextPage);
    for(let row of data){
      yield row
***REMOVED***
    nextPage = paging?.next;
  ***REMOVED***
***REMOVED***
export function page<T>(url: string){
	return requestPromise<T>({method:'GET',url, qs:{***REMOVED******REMOVED***)
***REMOVED***

export interface CreateReportParams extends AdInsights.ReportParams{
  accountId: string;
  pageSize?: number;
***REMOVED***
export async function *reportStream<T extends AdInsights.ReportRow>(
  auth: FbAPIAuth, params: CreateReportParams
): AsyncGenerator<T>{
  const { accountId, pageSize, ...options ***REMOVED*** = params
  const reportId = await createAsyncReport(auth, {
    accountId,
    ...options
  ***REMOVED***)
  for await( let status of checkAsyncStatus(auth, { reportId ***REMOVED***) ){
    if(status.isComplete){
      break
***REMOVED***
  ***REMOVED***
  const generator = downloadReport<T>(auth, { reportId, pageSize ***REMOVED***) 
  for await(let row of generator){
    yield row
  ***REMOVED***
***REMOVED***