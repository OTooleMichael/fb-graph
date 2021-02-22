import request from 'request'
import {
  wait, AdInsights
} from './tools'
export const GRAPH_VERSION = 'v9.0';
export const GRAPH_DOMAIN = 'https://graph.facebook.com'
export const GRAPH_VIDEO_DOMAIN = 'https://graph-video.facebook.com'
export interface FbAPIAuth {
  accessToken: string;
  graphVersion: string
}
interface ErrorAPIRes {
  message: string;
  type: string,
  code: number,
  fbtrace_id: string
}
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
  }
}
interface ReqParams {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  url: string;
  qs: Record<string, any>;
  form?: Record<string, any>;
}
export function requestPromise<T>(params: ReqParams): Promise<T> {
  const {
    method, url, qs, form
  } = params
  const options: request.Options = {
    method: method,
    uri: url,
    json: true,
    headers: {'User-Agent': `fbbizsdk-nodejs-v0.9.1`},
    body: form,
    qs
  }
  return new Promise(function(resolve,reject){
    request(options, function(err, response){
      if(err){
        return reject(err)
      }
      const { statusCode, headers, body } = response
      try{
        if(body.error){
          throw new FbException(body.error as ErrorAPIRes, options)
        }
        
        body.requestInfo = {
          statusCode
        }
        if(headers['x-fb-ads-insights-throttle']){
          body.requestInfo = {
            ...body.requestInfo,
            ...JSON.parse(headers['x-fb-ads-insights-throttle'] as string)
          }
        }
        return resolve(body)
      }catch(err){
        return reject(err)
      }
    })
  })
}

export interface FBAPICallParams {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  path: string;
  params?: any;
  files?: any;
  useMultipartFormData?: boolean;
  urlOverride?:string
}
function encodeParams(params: Record<string, any>): Record<string, string> {
  const output: Record<string, string> = {}
  Object.keys(params)
    .forEach((key:string) => {
      const param = params[key];
      if(typeof param === 'object'){
        output[key] = param ? JSON.stringify(param) : '';
      }else{
        output[key] = param
      }
    })
  return output
}

export function callAPI<T>( auth:FbAPIAuth, options: FBAPICallParams): Promise<T> {
  const { graphVersion, accessToken } = auth;
  let {
    method, path, params = {},
    urlOverride = '',
  } = options
  
  let data = {};

  if (method === 'POST' || method === 'PUT') {
    data = params;
    params = {};
  }
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
  })
}


// interface ReqestMetaInfo {
//   statusCode: number, 
//   app_id_util_pct?: number,
//   acc_id_util_pct?: number 
// }
export async function createAsyncReport(auth: FbAPIAuth, {
  accountId, fields, breakdowns, ...options
}: CreateReportParams){
  const params = {
    fields:fields ? fields.join(',') : '',
    breakdowns:breakdowns ? breakdowns.join(',') : '',
    ...options,
  }
  const res = await callAPI<{ report_run_id:string }>(auth, {
    path:`act_${accountId}/insights`,
    method:'POST',
    params
  })
	if(!res.report_run_id){
		throw new Error("NO_REPORT_ID")
	};
	return res.report_run_id
}
interface AsyncCheck {
    "id": string,
    "account_id": string,
    "time_ref": number,
    "time_completed": number,
    "async_status": string,
    "async_percent_completion": number
}
export interface AsyncStatus {
  reportId: string;
  isComplete: boolean;
  runningMillis: number;
  checkedCount: number;
  apiResponse:AsyncCheck
}
export async function *checkAsyncStatus(
  auth: FbAPIAuth, 
  { reportId }: { reportId:string }
): AsyncGenerator<AsyncStatus>{
  const started = Date.now()
  const incrInterval = 2000;
  let runningMillis = 0;
  let waitedI = 0
  while(true){
    waitedI++
    if(waitedI > 400){
      throw new Error('WAITING TOO LONG');
    }
    let waitInterval = waitedI*incrInterval;
	  waitInterval = waitInterval > 60*1000 ? 60*1000 : waitInterval;
    
    const res = await callAPI<AsyncCheck>(auth, {
      method:'GET',
      path:reportId
    })
    runningMillis = Date.now() - started
    const output: AsyncStatus = {
      reportId,
      isComplete: false,
      runningMillis,
      checkedCount: waitedI,
      apiResponse: res
    }
    const {
      async_status,
      async_percent_completion:percentComplete
    } = res
    if(async_status === 'Job Completed'){
      output.isComplete = true
      return output
    }
    yield output
    if(percentComplete === 100){
      await wait(200)
    }if(percentComplete > 0){
      await wait( Math.round( runningMillis*100 / percentComplete ) )
    }else{
      await wait( waitInterval )
    }
  }
}

interface ReportRes<T> {
  data:T[],
  paging?:{ next?:string } 
}

interface DowloadReportReq {
  reportId:string,
  pageSize?:number
}

export async function *downloadReport<T extends AdInsights.ReportRow = AdInsights.ReportRow>(
  auth: FbAPIAuth, { reportId, pageSize = 5000 }: DowloadReportReq
): AsyncGenerator<T>{
  const { data, paging } = await callAPI< ReportRes<T> >(auth, {
    method:'GET',
    path:reportId+"/insights",
    params:{
      limit:pageSize.toString()
    }
  })
  for(let row of data){
    yield row
  }
  let nextPage = paging?.next;
  while(nextPage){
    const { data, paging } = await page<ReportRes<T>>(nextPage);
    for(let row of data){
      yield row
    }
    nextPage = paging?.next;
  }
}
export function page<T>(url: string){
	return requestPromise<T>({method:'GET',url, qs:{}})
}

export interface CreateReportParams extends AdInsights.ReportParams{
  accountId: string;
  pageSize?: number;
}
export async function *reportStream<T extends AdInsights.ReportRow>(
  auth: FbAPIAuth, params: CreateReportParams
): AsyncGenerator<T>{
  const { accountId, pageSize, ...options } = params
  const reportId = await createAsyncReport(auth, {
    accountId,
    ...options
  })
  for await( let status of checkAsyncStatus(auth, { reportId }) ){
    if(status.isComplete){
      break
    }
  }
  const generator = downloadReport<T>(auth, { reportId, pageSize }) 
  for await(let row of generator){
    yield row
  }
}