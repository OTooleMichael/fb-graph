import {Readable} from 'stream'
import {
	checkAsyncStatus, createAsyncReport, downloadReport, AsyncStatus,
} from './core'
import {
	FbAPIAuth, CreateReportParams, ReportRow
} from './constants'
interface EventComplete {
    event:'COMPLETE' | 'LIMIT_REACHED',
    totalRows: number
}
type EventProgress = {
    event:'CREATED',
    reportId: string,
} | (AsyncStatus & {
    event:'CHECKED'
})
export declare interface FbAdsInsights<RowT extends ReportRow = ReportRow>{
    on(event: 'progress', listener: (event: EventProgress) => void): this;
    on(event: 'data', listener: (row: RowT)=>void): this;
    on(event: 'complete', listener: (event: EventComplete)=> void): this;
    on(event: 'error', listener: (error: Error)=> void): this;
    on(event: string, listener: Function): this;
}
export class FbAdsInsights<RowT extends ReportRow = ReportRow> extends Readable {
	auth: FbAPIAuth;
	params: CreateReportParams;
	reportId?: string;
	status?: AsyncStatus;
	totalRows: number;
	_limit: number;
    _started: boolean;
	constructor(auth: FbAPIAuth, params: CreateReportParams){
		super({ objectMode:true })
        this._started = false
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
    async _read(){
        this._started = true;
        (async () => {
            for await (const row of this.generator<RowT>()){
                if (!this.push(row)){
                    await new Promise((resolve) => this.once("drain", resolve))
                }
            }
            this.push(null)
        })().catch(e=>{
            this.emit('error', e)
        });
    }
	async get<T extends RowT>(): Promise<T[]>{
        if(this._started){
            throw new Error('Report already called')
        }
        this._started = true
		const rows:T[] = []
		for await(const row of this.generator<T>()){
			rows.push(row)
		}
		return rows
	}
	async *generator<T extends RowT>(){
        if(this._started){
            throw new Error('Report already called')
        }
        this._started = true
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
