"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const tools_1 = require("./tools");
const accessToken = 'EAAZAH1TQISB8BAAh8pcScMCnPzt5KSEGF87ZCpxJo9adB6wijBc4m5xxy4hntZBDp6zBntcz1TfluiOPGZAViUtKaX32u9W0wgPtbVZCVBpyIFnjjS0HIil5ZCeCrbOUDttF2JSYfWbHjO4SgStbuv';
const appSecret = '967b81d33cbab8c33e9d92fa5a37273b';
const appId = '448475229614645';
const ACCOUNTS = [
    //	"831026960357094", // INT
    //	"579905742135885", // FR
    "111882249020036" // DE NFD
];
async function start() {
    var e_1, _a;
    const fb = new index_1.FacebookAds({ accessToken });
    const { params, actions } = tools_1.parseUserInputsToParams({
        reportFields: [
            'date',
            'clicks',
            'unique_clicks',
            'spend',
            'adset_name',
            'campaign_name',
            'campaign_id',
            'adset_id',
            'view_content::action',
            'purchase::action'
        ],
        attributionWindow: [],
        startDate: '2020-11-01',
        endDate: '2020-12-01',
        attributionType: 'conversion'
    });
    console.log(params);
    let report = await fb.insights(Object.assign({ accountId: 'act_831026960357094' }, params)).limit(100).on('progress', function (event) {
        console.log(event);
    });
    try {
        for (var _b = __asyncValues(report.generator()), _c; _c = await _b.next(), !_c.done;) {
            let row = _c.value;
            console.log(row);
            console.log(tools_1.flattenActions(row, undefined, actions));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
start();
// function loadParams(params:{ startDate:Date, endDate?:Date }): UserInputs{
// 	let { startDate, endDate = new Date() } = params;
// 	return {
// 		startDate:startDate.toISOString().split('T')[0],
// 		endDate:endDate.toISOString().split('T')[0],
// 		dimensions:[
// 			"day::time_increment",
// 			"device_platform::breakdowns",
// 			"adset_id::level",
// 			"adset_name::level",
// 			"campaign_id::level",
// 			"campaign_name::level",
// 			"account_id::level",
// 			"account_name::level",
// 		],
// 		metrics:[
// 			"spend",
// 			"clicks",
// 			"impressions",
// 			"reach",
// 			// "social_clicks",
// 			"unique_clicks",
// 			"link_click::actions",
// 			'leads::actions'   
// 		],
// 		attributionWindow:[
//       AdInsights.AttributionWindow.click_1d,
//       AdInsights.AttributionWindow.click_7d,
//       AdInsights.AttributionWindow.click_28d, 
//     ],
// 		attributionType:"impression"
// 	};
// }
// async function start(){
//     const REFRESH_TOKEN = 'EAAGX4sbAcjUBALF5TOgZCcjimai4jm5LgCd0alLptdqVJ08vjpbZBh8ubHQyz5q5uPUPL0QmY41cWDpLDIQ7XsxY1RlYdHU6rmMrwm2nJMI9Bqn0ARvf7Tofii1TPMViJpGJpNnhx5g6CZC6ZChezPThBy2DSiv0HN63UOTtUS5EQaGhqUko'
//     const { data:accounts } = await callAPI<{data:{id:string}}>({
//       method:'GET',
//       path:'me/adaccounts',
//       accessToken:REFRESH_TOKEN
//     })
//     console.log(accounts)
//     await getExchangeToken({
//       accessToken:REFRESH_TOKEN,
//       appId,appSecret
//     })
//     return
//     const accountId = "111882249020036"
//     const report = reportStream<any>({
//       accountId,
//       accessToken,
//       ...parseUserInputsToParams(loadParams({startDate:new Date("2020-11-01")})).params
//     })
//     let i = 0;
//     for await(let row of report){
//       console.log('SEcond',i)
//       if(i % 100 === 0){
//         console.log(row)
//       }
//       i++
//       if(i > 55){
//         break
//       }
//     }
//   }
//   start()
