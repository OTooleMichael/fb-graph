import {
	callAPI,
	page,
	requestPromise,
	FBAPICallParams
} from './core'
import {
	GRAPH_VERSION, CreateReportParams, ReportParams, FbAPIAuth,
	AttributionWindow, Level
} from './constants'
import { FbAdsInsights } from './FbAdsInsights'
import { flattenActions, parseUserInputsToParams } from './tools';
export {
	FBAPICallParams,
	FbAdsInsights,
	flattenActions,
	parseUserInputsToParams,
	CreateReportParams,
	ReportParams
}
export const enums = {
	AttributionWindow,
	Level
}
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
	page<T>(url: string){
		return page<T>(url)
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
