import {
	callAPI,
	page,
	requestPromise,
	FBAPICallParams
***REMOVED*** from './core'
import {
	GRAPH_VERSION, CreateReportParams, ReportParams, FbAPIAuth,
	AttributionWindow, Level
***REMOVED*** from './constants'
import FbAdsInsights from './FbAdsInsights'
***REMOVED***
export {
	FBAPICallParams,
	FbAdsInsights,
	flattenActions,
	parseUserInputsToParams,
	CreateReportParams,
	ReportParams
***REMOVED***
export const enums = {
	AttributionWindow,
	Level
***REMOVED***
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
	page<T>(url: string){
		return page<T>(url)
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
