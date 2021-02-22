import {Readable***REMOVED*** from 'stream'
import Emitter from 'events'
import {
	checkAsyncStatus, createAsyncReport, downloadReport, AsyncStatus,
***REMOVED*** from './core'
import {
	FbAPIAuth, CreateReportParams, ReportRow
***REMOVED*** from './constants'
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
	***REMOVED***
	limit(i: number){
		this._limit = i;
		return this
	***REMOVED***
	async prepare(){
		const {auth***REMOVED*** = this
		const { accountId, pageSize, ...options ***REMOVED*** = this.params
		const reportId = await createAsyncReport(auth, {
		  accountId,
		  ...options
		***REMOVED***)
		this.emit('progress',{
			event:'CREATED',
			reportId,
		***REMOVED***)
		this.reportId = reportId
		for await( const status of checkAsyncStatus(auth, { reportId ***REMOVED***) ){
			this.emit('progress',{
				event:'CHECKED',
				...status
			***REMOVED***)
			if(status.isComplete){
				break
			***REMOVED***
		***REMOVED***
		return reportId
	***REMOVED***
	stream<T extends ReportRow>(){
		const stream = new Readable({
			objectMode:true,
			read:async ()=>{
				(async () => {
					for await (const row of this.generator<T>()){
						if (!stream.push(row)){
							await new Promise((resolve) => stream.once("drain", resolve))
						***REMOVED***
					***REMOVED***
					stream.push(null)
				***REMOVED***)().catch(e=>{
					console.log(e,'ERROR')
					stream.emit('error', e)
				***REMOVED***);
			***REMOVED***
		***REMOVED***)
		return stream
	***REMOVED***
	async get<T extends ReportRow>(): Promise<T[]>{
		const rows:T[] = []
		for await(const row of this.generator<T>()){
			rows.push(row)
		***REMOVED***
		return rows
	***REMOVED***
	async *generator<T extends ReportRow>(){
		const { auth ***REMOVED*** = this
		const { pageSize ***REMOVED*** = this.params
		const reportId = await this.prepare()
		const generator = downloadReport<T>(auth, { reportId, pageSize ***REMOVED***)
		for await(const row of generator){
			this.totalRows = this.totalRows + 1
			this.emit('data',row)
			yield row
			if(this._limit && this.totalRows >= this._limit){
				this.emit('complete',{
					event:'LIMIT_REACHED',
					totalRows:this.totalRows
				***REMOVED***)
				break;
			***REMOVED***
		***REMOVED***
		this.emit('complete',{
			event:'COMPLETE',
			totalRows:this.totalRows
		***REMOVED***)
	***REMOVED***
***REMOVED***
