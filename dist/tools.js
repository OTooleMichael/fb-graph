"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUserInputsToParams = exports.flattenActions = exports.AdInsights = exports.wait = void 0;
function wait(time = 200) {
    return new Promise(res => setTimeout(res, time));
}
exports.wait = wait;
const BREAKDOWNS = [
    'app_store_clicks', 'newsfeed_avg_position', 'newsfeed_clicks', 'relevance_score', 'newsfeed_impressions'
];
const FIELDS = [
    'adset_id', 'adset_name', 'campaign_name', 'campaign_id', 'account_id', 'account_name',
    'spend', 'clicks', 'imporessions',
    'reach', 'unique_clicks', 'actions', 'action_values',
    'device_platform'
];
var AdInsights;
(function (AdInsights) {
    let Level;
    (function (Level) {
        Level["ad"] = "ad";
        Level["adset"] = "adset";
        Level["campaign"] = "campaign";
        Level["account"] = "account";
    })(Level = AdInsights.Level || (AdInsights.Level = {}));
    let AttributionWindow;
    (function (AttributionWindow) {
        AttributionWindow["view_1d"] = "1d_view";
        AttributionWindow["view_7d"] = "7d_view";
        AttributionWindow["view_28d"] = "28d_view";
        AttributionWindow["click_1d"] = "1d_click";
        AttributionWindow["click_7d"] = "7d_click";
        AttributionWindow["click_28d"] = "28d_click";
        AttributionWindow["dda"] = "dda";
        AttributionWindow["default"] = "default";
    })(AttributionWindow = AdInsights.AttributionWindow || (AdInsights.AttributionWindow = {}));
})(AdInsights = exports.AdInsights || (exports.AdInsights = {}));
const VAL_REG = /(impressions|clicks|reach|value|spend)/i;
function flattenActions(data, customEventMap = {}, actionsList = [], attriList) {
    const attributionWindowList = attriList || Object.values(AdInsights.AttributionWindow);
    const userRequestedActions = (typeof actionsList === "string") ? [actionsList] : actionsList;
    const row = {};
    Object.entries(data).forEach(function ([el, ob]) {
        if (!ob) {
            return;
        }
        if (el === "actions" || el === "action_values") {
            // actions are returned as a nested array. All actions are returned even if only one is desired
            const actions = ob;
            actions.forEach(function (ac) {
                const val = el === "actions" ? "" : "_value";
                let title = customEventMap[ac.action_type] || ac.action_type;
                title = title.replace("offsite_conversion.fb_pixel_", "");
                if (userRequestedActions.includes(title)) {
                    attributionWindowList.forEach(function (attr) {
                        let value = (ac[attr] ? parseFloat(ac[attr]) : 0) || 0;
                        row[title + val + "_" + attr] = value;
                    });
                }
            });
            return;
        }
        const value = ob;
        if (VAL_REG.test(el)) {
            row[el] = parseFloat(value);
            return;
        }
        row[el] = value;
        return;
    });
    return row;
}
exports.flattenActions = flattenActions;
;
const LEVEL_MAP = {
    'adset_name': AdInsights.Level.adset,
    'adset_id': AdInsights.Level.adset,
    'campaign_id': AdInsights.Level.campaign,
    'campaign_name': AdInsights.Level.campaign,
    'ad_id': AdInsights.Level.ad,
    'ad_name': AdInsights.Level.ad
};
const DATE_FIELDS = ['day', 'date', 'week', 'month', 'all_days'];
function parseUserInputsToParams(userInputs) {
    var levels = [];
    var actions = [];
    // these will make up the paramaters of the Post request;
    const postParams = {
        time_increment: 'all_days',
        level: AdInsights.Level.account,
        action_attribution_windows: userInputs.attributionWindow,
        time_range: {
            "since": userInputs.startDate,
            "until": userInputs.endDate
        },
        action_report_time: userInputs.attributionType,
        fields: [],
        breakdowns: []
    };
    const listToParse = userInputs.reportFields;
    if (listToParse.includes('day') || listToParse.includes('date')) {
        postParams.time_increment = 1;
    }
    else if (listToParse.includes('week')) {
        postParams.time_increment = 7;
    }
    else if (listToParse.includes('month')) {
        postParams.time_increment = 28;
    }
    // transform the dimensions / metrics logic into a facebook graph set of paramaters
    for (let el of listToParse) {
        let [col, meta = ''] = el.split("::");
        if (DATE_FIELDS.includes(col)) {
            continue;
        }
        if (meta.includes("action")) {
            actions.push(col); // keep for later to parse the response
        }
        else if (BREAKDOWNS.includes(col) || meta.includes("breakdowns")) {
            postParams.breakdowns.push(col);
        }
        else if (meta.includes("time_increment")) {
            postParams.time_increment = timeToNumber(col) || "all_days";
        }
        else {
            postParams.fields.push(col);
        }
        if (meta.includes("level")) {
            levels.push(col); // use to find the deepest level for the fb "level" param
        }
        if (Object.keys(LEVEL_MAP).includes(col)) {
            levels.push(LEVEL_MAP[col]);
        }
    }
    ;
    if (actions.length > 0) { // if the user requested any actions then add actions and action_values to the fields list
        postParams.fields.push("actions");
        postParams.fields.push("action_values");
    }
    ;
    postParams.level = findLowestLevel(levels); // find the lowest/deepest level eg. (ad,ad_set,campaign,account)
    return {
        params: postParams,
        actions: actions // actions will be needed for parsing the response
    };
}
exports.parseUserInputsToParams = parseUserInputsToParams;
const TIME_MAP = {
    day: 1,
    week: 7,
    month: 28
};
function timeToNumber(time) {
    return TIME_MAP[time];
}
function findLowestLevel(levels) {
    var str = levels.join();
    if (str.search(/ad_id|ad_name/gi) > -1) {
        return AdInsights.Level.ad;
    }
    else if (str.includes("adset")) {
        return AdInsights.Level.adset;
    }
    else if (str.includes("campaign")) {
        return AdInsights.Level.campaign;
    }
    else {
        return AdInsights.Level.account;
    }
}
