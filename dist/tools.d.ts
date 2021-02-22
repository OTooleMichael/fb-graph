export declare function wait(time?: number): Promise<unknown>;
export declare type GetArrayElementType<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;
declare const BREAKDOWNS: readonly ["app_store_clicks", "newsfeed_avg_position", "newsfeed_clicks", "relevance_score", "newsfeed_impressions"];
declare const FIELDS: readonly ["adset_id", "adset_name", "campaign_name", "campaign_id", "account_id", "account_name", "spend", "clicks", "imporessions", "reach", "unique_clicks", "actions", "action_values", "device_platform"];
export declare namespace AdInsights {
    export type time_increment = 'monthly' | 'all_days' | number;
    export enum Level {
        ad = "ad",
        adset = "adset",
        campaign = "campaign",
        account = "account"
    }
    export enum AttributionWindow {
        view_1d = "1d_view",
        view_7d = "7d_view",
        view_28d = "28d_view",
        click_1d = "1d_click",
        click_7d = "7d_click",
        click_28d = "28d_click",
        dda = "dda",
        default = "default"
    }
    type BaseAction = Partial<Record<AdInsights.AttributionWindow, string>>;
    export type InsightAction = BaseAction & {
        action_type: string;
        value: string;
    };
    export type ReportField = GetArrayElementType<typeof FIELDS>;
    export type ReportBreakdown = GetArrayElementType<typeof BREAKDOWNS>;
    export type DateFields = 'date_start' | 'date_stop';
    type BaseReportRow = Partial<Record<ReportField | DateFields, string>>;
    export type ReportRow = BaseReportRow & {
        actions?: InsightAction[];
        action_values?: InsightAction[];
    };
    export interface ReportParams {
        time_increment: AdInsights.time_increment;
        level: AdInsights.Level;
        action_attribution_windows: AdInsights.AttributionWindow[];
        time_range: {
            since: string;
            until: string;
        };
        action_report_time: 'impression' | 'conversion' | 'mixed';
        fields: AdInsights.ReportField[];
        breakdowns: AdInsights.ReportBreakdown[];
    }
    export {};
}
export declare function flattenActions<T extends Record<string, string | number> = Record<string, string | number>>(data: AdInsights.ReportRow, customEventMap?: Record<string, string>, actionsList?: string | string[], attriList?: AdInsights.AttributionWindow[]): T;
declare type UserReportField = AdInsights.ReportField | AdInsights.ReportBreakdown | 'day' | 'date' | 'week' | 'month' | `${string}::action`;
export interface UserInputs {
    reportFields: UserReportField[];
    attributionWindow: AdInsights.AttributionWindow[];
    startDate: string;
    endDate: string;
    attributionType: 'impression' | 'conversion' | 'mixed';
}
export declare function parseUserInputsToParams(userInputs: UserInputs): {
    actions: string[];
    params: AdInsights.ReportParams;
};
export {};
