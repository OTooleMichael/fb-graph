import {Readable***REMOVED*** from 'stream'
import Emitter from 'events'
import {
	callAPI,
	checkAsyncStatus, createAsyncReport, downloadReport, AsyncStatus,
	requestPromise, GRAPH_VERSION, CreateReportParams, FbAPIAuth, FBAPICallParams
***REMOVED*** from './core'
import { AdInsights, flattenActions, parseUserInputsToParams ***REMOVED*** from './tools';
export { AdInsights, flattenActions, parseUserInputsToParams ***REMOVED***
interface ExchangeTokenParams {
  accessToken:string;
  appId:string;
  appSecret:string;
***REMOVED***
export async function getExchangeToken(params: ExchangeTokenParams){
  const {
    accessToken,
    appId,
    appSecret
  ***REMOVED*** = params
  const url = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId***REMOVED***&client_secret=${appSecret***REMOVED***&fb_exchange_token=${accessToken***REMOVED***`
  return requestPromise({
    method:'GET', url, qs:{***REMOVED***
  ***REMOVED***)
***REMOVED***
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
		for await( let status of checkAsyncStatus(auth, { reportId ***REMOVED***) ){
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
	stream<T extends AdInsights.ReportRow>(){
		const stream = new Readable({
			objectMode:true,
			read:async ()=>{
				(async () => {
					for await (let row of this.generator<T>()){
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
	async get<T extends AdInsights.ReportRow>(): Promise<T[]>{
		let rows:T[] = []
		for await(let row of this.generator<T>()){
			rows.push(row)
		***REMOVED***
		return rows
	***REMOVED***
	async *generator<T extends AdInsights.ReportRow>(){
		const { auth ***REMOVED*** = this
		const { pageSize ***REMOVED*** = this.params
		const reportId = await this.prepare()
		const generator = downloadReport<T>(auth, { reportId, pageSize ***REMOVED***) 
		for await(let row of generator){
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
interface AdAccount {
	account_id?: string;
	name?: string;
	id: string
***REMOVED***
interface Me {
	name: string
	id: string
***REMOVED***
export class FacebookAds {
	auth: FbAPIAuth;
	constructor({accessToken, graphVersion***REMOVED***: {accessToken: string, graphVersion?:string***REMOVED***){
		this.auth = {
			accessToken,
			graphVersion: graphVersion || GRAPH_VERSION
		***REMOVED***
	***REMOVED***
	insights(params: CreateReportParams){
		return new FbAdsInsights(this.auth, params)
	***REMOVED***
	callAPI<T>(params: FBAPICallParams){
		return callAPI<T>(this.auth, params)
	***REMOVED***
	async me(){
		return this.callAPI<Me>({
			method:'GET', path:'me'
		***REMOVED***)
	***REMOVED***
	async adaccounts(){
		const { data:adAccounts ***REMOVED*** = await this.callAPI<{data:AdAccount[]***REMOVED***>({
			method:'GET', path:'me/adaccounts', params:{
				fields:'name,account_id,id'
			***REMOVED***
		***REMOVED***)
		return adAccounts
	***REMOVED***
***REMOVED***
