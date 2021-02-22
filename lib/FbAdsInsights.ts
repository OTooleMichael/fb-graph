import {Readable} from 'stream'
import Emitter from 'events'
import {
	checkAsyncStatus, createAsyncReport, downloadReport, AsyncStatus,
} from './core'
import {
	FbAPIAuth, CreateReportParams, ReportRow
} from './constants'
export default class FbAdsInsights extends Emitter {
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
		for await( const status of checkAsyncStatus(auth, { reportId }) ){
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
	stream<T extends ReportRow>(){
		const stream = new Readable({
			objectMode:true,
			read:async ()=>{
				(async () => {
					for await (const row of this.generator<T>()){
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
	async get<T extends ReportRow>(): Promise<T[]>{
		const rows:T[] = []
		for await(const row of this.generator<T>()){
			rows.push(row)
		}
		return rows
	}
	async *generator<T extends ReportRow>(){
		const { auth } = this
		const { pageSize } = this.params
		const reportId = await this.prepare()
		const generator = downloadReport<T>(auth, { reportId, pageSize })
		for await(const row of generator){
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
