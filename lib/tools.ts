import {
	BREAKDOWNS, ReportRow,
	AttributionWindow,
	InsightAction, Level,
	ReportField, ReportBreakdown, time_increment,
	ReportParams
} from './constants'
export function wait(time: number = 200){
	return new Promise(res=>setTimeout(res,time))
}
export type GetArrayElementType<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;

const VAL_REG = /(impressions|clicks|reach|value|spend)/i
export function flattenActions<T extends Record<string, string | number> = Record<string, string | number>> (
	data: ReportRow,
	customEventMap: Record<string, string> = {},
	actionsList: string | string[] = [],
	attriList?: AttributionWindow[]
): T {
	const attributionWindowList = attriList || Object.values(AttributionWindow);
	const userRequestedActions = (typeof actionsList === "string") ? [actionsList] : actionsList;
	const row: Record<string, string | number> = {}
	Object.entries(data).forEach(function([el, ob]){
		if(!ob){
			return
		}
		if(el === "actions" || el === "action_values"){
			// actions are returned as a nested array. All actions are returned even if only one is desired
			const actions = ob as InsightAction[];
			actions.forEach(function(ac){
				const val = el === "actions" ? "" : "_value";
				let title = customEventMap[ac.action_type] || ac.action_type;
					title = title.replace("offsite_conversion.fb_pixel_","")

				if( userRequestedActions.includes(title) ){
					attributionWindowList.forEach(function(attr){
						const windowValue = (ac[attr] ? parseFloat(ac[attr] as string) : 0) || 0
						row[title + val + "_" + attr] = windowValue;
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
const LEVEL_MAP: Record<string, Level> = {
	'adset_name':Level.adset,
	'adset_id':Level.adset,
	'campaign_id':Level.campaign,
	'campaign_name':Level.campaign,
	'ad_id':Level.ad,
	'ad_name':Level.ad
}
type UserReportField = ReportField | ReportBreakdown | 'day' | 'date' | 'week' | 'month' | `${string}::action`
export interface UserInputs {
	reportFields:UserReportField[];
	attributionWindow:AttributionWindow[];
	startDate:string;
	endDate:string;
	attributionType:'impression' | 'conversion' | 'mixed'
}
const DATE_FIELDS = ['day','date','week','month','all_days']
export function parseUserInputsToParams(userInputs: UserInputs): { actions:string[], params:ReportParams }{
	const levels = [];
	const actions = [];
	// these will make up the paramaters of the Post request;
	const postParams: ReportParams = {
		time_increment:'all_days' as time_increment,
		level:Level.account,
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
	for(const el of listToParse){
		const [ col, meta = ''] = el.split("::");
		if(DATE_FIELDS.includes(col)){
			continue
		}
		if( meta.includes("action") ){
			actions.push(col); // keep for later to parse the response
		}else if(BREAKDOWNS.includes(col as ReportBreakdown) || meta.includes("breakdowns") ){
			postParams.breakdowns.push(col as ReportBreakdown);
		}else if(meta.includes("time_increment")){
			postParams.time_increment = timeToNumber(col as 'day' | 'week' | 'month') || "all_days";
		}else{
			postParams.fields.push(col as ReportField)
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
    actions // actions will be needed for parsing the response
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

function findLowestLevel(levels: string[]): Level {
	const str = levels.join();
	if(str.search(/ad_id|ad_name/gi)>-1){
		return Level.ad
	}else if(str.includes("adset")){
		return Level.adset
	}else if(str.includes("campaign")){
		return Level.campaign
	}else{
		return Level.account
	}
}