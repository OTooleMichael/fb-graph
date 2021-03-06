export type GetArrayElementType<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;
export const GRAPH_VERSION = 'v9.0';
export const GRAPH_DOMAIN = 'https://graph.facebook.com'
export const GRAPH_VIDEO_DOMAIN = 'https://graph-video.facebook.com'
// https://developers.facebook.com/docs/marketing-api/insights/parameters#fields
export const BREAKDOWNS = [
	'app_store_clicks','newsfeed_avg_position','newsfeed_clicks','relevance_score','newsfeed_impressions'
] as const

export const DIMENSION_FIELDS = [
    'account_id', 'account_name',
    'campaign_name', 'campaign_id',
	'adset_id', 'adset_name', 
    'ad_id', 'ad_name',

    'attribution_setting', 'buying_type',
    'canvas_avg_view_percent', 'canvas_avg_view_time',
    'catalog_segment_value', 'conversion_rate_ranking',
    'objective', 
] as const
export const NUMERIC_FIELDS = [  
    'outbound_clicks', 'unique_actions',
    'full_view_impressions', 'inline_post_engagement',
	'spend','clicks', 'impressions',
	'reach', 'unique_clicks', 'actions','action_values',
	'device_platform'
] as const
export const FIELDS = [
    ...DIMENSION_FIELDS,
    ...NUMERIC_FIELDS
] as const
export interface FbAPIAuth {
    accessToken: string;
    graphVersion: string
}
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
type BaseAction = Partial<Record<AttributionWindow, string>>
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
    time_increment: time_increment;
    level:Level;
    action_attribution_windows:AttributionWindow[];
    time_range:{
        since:string;
        until:string;
    },
    action_report_time:'impression' | 'conversion' | 'mixed',
    fields:ReportField[];
    breakdowns:ReportBreakdown[];
}
export interface CreateReportParams extends ReportParams{
    accountId: string;
    pageSize?: number;
}