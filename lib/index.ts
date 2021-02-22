import {Readable} from 'stream'
import Emitter from 'events'
import {
	callAPI,
	checkAsyncStatus, createAsyncReport, downloadReport, AsyncStatus,
	requestPromise, GRAPH_VERSION, CreateReportParams, FbAPIAuth, FBAPICallParams
} from './core'
import { AdInsights, flattenActions, parseUserInputsToParams } from './tools';
export { AdInsights, flattenActions, parseUserInputsToParams }
interface ExchangeTokenParams {
  accessToken:string;
  appId:string;
  appSecret:string;
}
export async function getExchangeToken(params: ExchangeTokenParams){
  const {
    accessToken,
    appId,
    appSecret
  } = params
  const url = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`
  return requestPromise({
    method:'GET', url, qs:{}
  })
}
export class FbAdsInsights extends Emitter {
	auth: FbAPIAuth;
	params: CreateReportParams;
	reportId?: string;
	status?: AsyncStatus;
	totalRows: number;
	_limit: number
	constructor(auth: FbAPIAuth, params: CreateReportParams){
		super()
		this.auth = auth
		this.params = params
		this.params.accountId = this.params.accountId.replace('act_','')
		this.totalRows = 0
		this._limit = 0
	}
	limit(i: number){
		this._limit = i;
		return this
	}
	async prepare(){
		const {auth} = this
		const { accountId, pageSize, ...options } = this.params
		const reportId = await createAsyncReport(auth, {
		  accountId,
		  ...options
		})
		this.emit('progress',{
			event:'CREATED',
			reportId,
		})
		this.reportId = reportId
		for await( let status of checkAsyncStatus(auth, { reportId }) ){
			this.emit('progress',{
				event:'CHECKED',
				...status
			})
			if(status.isComplete){
				break
			}
		}
		return reportId
	}
	stream<T extends AdInsights.ReportRow>(){
		const stream = new Readable({
			objectMode:true,
			read:async ()=>{
				(async () => {
					for await (let row of this.generator<T>()){
						if (!stream.push(row)){
							await new Promise((resolve) => stream.once("drain", resolve))
						}
					}
					stream.push(null)
				})().catch(e=>{
					console.log(e,'ERROR')
					stream.emit('error', e)
				});
			}
		})
		return stream
	}
	async get<T extends AdInsights.ReportRow>(): Promise<T[]>{
		let rows:T[] = []
		for await(let row of this.generator<T>()){
			rows.push(row)
		}
		return rows
	}
	async *generator<T extends AdInsights.ReportRow>(){
		const { auth } = this
		const { pageSize } = this.params
		const reportId = await this.prepare()
		const generator = downloadReport<T>(auth, { reportId, pageSize }) 
		for await(let row of generator){
			this.totalRows = this.totalRows + 1
			this.emit('data',row)
			yield row
			if(this._limit && this.totalRows >= this._limit){
				this.emit('complete',{
					event:'LIMIT_REACHED',
					totalRows:this.totalRows
				})
				break;
			}
		}
		this.emit('complete',{
			event:'COMPLETE',
			totalRows:this.totalRows
		})
	}
}
interface AdAccount {
	account_id?: string;
	name?: string;
	id: string
}
interface Me {
	name: string
	id: string
}
export class FacebookAds {
	auth: FbAPIAuth;
	constructor({accessToken, graphVersion}: {accessToken: string, graphVersion?:string}){
		this.auth = {
			accessToken,
			graphVersion: graphVersion || GRAPH_VERSION
		}
	}
	insights(params: CreateReportParams){
		return new FbAdsInsights(this.auth, params)
	}
	callAPI<T>(params: FBAPICallParams){
		return callAPI<T>(this.auth, params)
	}
	async me(){
		return this.callAPI<Me>({
			method:'GET', path:'me'
		})
	}
	async adaccounts(){
		const { data:adAccounts } = await this.callAPI<{data:AdAccount[]}>({
			method:'GET', path:'me/adaccounts', params:{
				fields:'name,account_id,id'
			}
		})
		return adAccounts
	}
}
