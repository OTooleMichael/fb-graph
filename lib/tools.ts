export function wait(time: number = 200){
	return new Promise(res=>setTimeout(res,time))
}
export type GetArrayElementType<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;

const BREAKDOWNS = [
	'app_store_clicks','newsfeed_avg_position','newsfeed_clicks','relevance_score','newsfeed_impressions'
] as const
const FIELDS = [
	'adset_id', 'adset_name', 'campaign_name', 'campaign_id','account_id','account_name',
	'spend','clicks', 'imporessions',
	'reach', 'unique_clicks', 'actions','action_values',
	'device_platform'
] as const
export namespace AdInsights {
	export type time_increment = 'monthly' | 'all_days' | number
	export enum Level {
		ad = 'ad',
		adset = 'adset',
		campaign = 'campaign',
		account = 'account'
	}
	export enum AttributionWindow {
		view_1d= '1d_view',
		view_7d = '7d_view',
		view_28d = '28d_view',
		click_1d = '1d_click', 
		click_7d = '7d_click', 
		click_28d = '28d_click', 
		dda = 'dda', 
		default = 'default'
	}
	type BaseAction = Partial<Record<AdInsights.AttributionWindow, string>>
	export type InsightAction = BaseAction & {
		action_type: string;
		value: string;
	} 
	export type ReportField = GetArrayElementType<typeof FIELDS>
	export type ReportBreakdown = GetArrayElementType<typeof BREAKDOWNS>
	export type DateFields = 'date_start' | 'date_stop'
	type BaseReportRow = Partial<Record<ReportField | DateFields, string>>
	export type ReportRow = BaseReportRow & {
		actions?: InsightAction[],
		action_values?: InsightAction[]
	}
	export interface ReportParams {
		time_increment: AdInsights.time_increment;
		level:AdInsights.Level;
		action_attribution_windows:AdInsights.AttributionWindow[];
		time_range:{
			since:string;
			until:string;
		},
		action_report_time:'impression' | 'conversion' | 'mixed',
		fields:AdInsights.ReportField[];
		breakdowns:AdInsights.ReportBreakdown[];
	}
}

const VAL_REG = /(impressions|clicks|reach|value|spend)/i
export function flattenActions<T extends Record<string, string | number> = Record<string, string | number>> (
	data: AdInsights.ReportRow,
	customEventMap: Record<string, string> = {},
	actionsList: string | string[] = [],
	attriList?: AdInsights.AttributionWindow[]
): T {
	const attributionWindowList = attriList || Object.values(AdInsights.AttributionWindow);
	const userRequestedActions = (typeof actionsList === "string") ? [actionsList] : actionsList;	
	const row: Record<string, string | number> = {}
	Object.entries(data).forEach(function([el, ob]){
		if(!ob){
			return
		}
		if(el === "actions" || el === "action_values"){
			// actions are returned as a nested array. All actions are returned even if only one is desired
			const actions = ob as AdInsights.InsightAction[];
			actions.forEach(function(ac){
				const val = el === "actions" ? "" : "_value";
				let title = customEventMap[ac.action_type] || ac.action_type;
					title = title.replace("offsite_conversion.fb_pixel_","")

				if( userRequestedActions.includes(title) ){
					attributionWindowList.forEach(function(attr){
						let value = (ac[attr] ? parseFloat(ac[attr] as string) : 0) || 0
						row[title + val + "_" + attr] = value;
					})
				}
			});
			return	
		}
		const value = ob as string
		if( VAL_REG.test(el) ){
			row[el] = parseFloat(value);
			return
		}
		row[el] = value;
		return
	})
	return row as T
};
const LEVEL_MAP: Record<string, AdInsights.Level> = {
	'adset_name':AdInsights.Level.adset,
	'adset_id':AdInsights.Level.adset,
	'campaign_id':AdInsights.Level.campaign,
	'campaign_name':AdInsights.Level.campaign,
	'ad_id':AdInsights.Level.ad,
	'ad_name':AdInsights.Level.ad
}
type UserReportField = AdInsights.ReportField | AdInsights.ReportBreakdown | 'day' | 'date' | 'week' | 'month' | `${string}::action`
export interface UserInputs {
	reportFields:UserReportField[];
	attributionWindow:AdInsights.AttributionWindow[];
	startDate:string;
	endDate:string;
	attributionType:'impression' | 'conversion' | 'mixed'
}
const DATE_FIELDS = ['day','date','week','month','all_days']
export function parseUserInputsToParams(userInputs: UserInputs): { actions:string[], params:AdInsights.ReportParams }{
	var levels = [];
	var actions = [];
	// these will make up the paramaters of the Post request;
	const postParams: AdInsights.ReportParams = {
		time_increment:'all_days' as AdInsights.time_increment,
		level:AdInsights.Level.account,
		action_attribution_windows:userInputs.attributionWindow,
		time_range:{
			"since":userInputs.startDate,
			"until":userInputs.endDate
		},
		action_report_time:userInputs.attributionType,
		fields:[],
		breakdowns:[]
	};
	const listToParse = userInputs.reportFields;
	if(listToParse.includes('day') || listToParse.includes('date')){
		postParams.time_increment = 1
	}else if(listToParse.includes('week')){
		postParams.time_increment = 7
	}else if(listToParse.includes('month')){
		postParams.time_increment = 28
	}
	
	// transform the dimensions / metrics logic into a facebook graph set of paramaters
	for(let el of listToParse){
		let [ col, meta = ''] = el.split("::");
		if(DATE_FIELDS.includes(col)){
			continue
		}
		if( meta.includes("action") ){
			actions.push(col); // keep for later to parse the response
		}else if(BREAKDOWNS.includes(col as AdInsights.ReportBreakdown) || meta.includes("breakdowns") ){
			postParams.breakdowns.push(col as AdInsights.ReportBreakdown);
		}else if(meta.includes("time_increment")){
			postParams.time_increment = timeToNumber(col as 'day' | 'week' | 'month') || "all_days"; 
		}else{
			postParams.fields.push(col as AdInsights.ReportField)
		}
		if( meta.includes("level") ){
			levels.push(col) // use to find the deepest level for the fb "level" param
		}
		if(Object.keys(LEVEL_MAP).includes(col)){
			levels.push(LEVEL_MAP[col])
		}
	};
	if(actions.length > 0){ // if the user requested any actions then add actions and action_values to the fields list
		postParams.fields.push("actions");
		postParams.fields.push("action_values");
	};
	postParams.level = findLowestLevel(levels); // find the lowest/deepest level eg. (ad,ad_set,campaign,account)
  return { 
    params:postParams,
    actions:actions // actions will be needed for parsing the response
  }
}

const TIME_MAP = {
	day:1,
	week:7,
	month:28
};
function timeToNumber(time: 'day' | 'week' | 'month'): number{
	return TIME_MAP[time]
}

function findLowestLevel(levels: string[]): AdInsights.Level {
	var str = levels.join();
	if(str.search(/ad_id|ad_name/gi)>-1){
		return AdInsights.Level.ad
	}else if(str.includes("adset")){
		return AdInsights.Level.adset
	}else if(str.includes("campaign")){
		return AdInsights.Level.campaign
	}else{
		return AdInsights.Level.account
	}
}