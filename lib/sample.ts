import {FacebookAds} from './index'
import { flattenActions, parseUserInputsToParams } from './tools';
const accessToken = 'dfadfsaf'
async function start(){
    const fb = new FacebookAds({ accessToken })
    const {params,actions} = parseUserInputsToParams({
        reportFields:[
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
        attributionWindow:[],
        startDate:'2020-11-01',
        endDate:'2020-12-01',
        attributionType:'conversion'
    })
    console.log(params)
    let report = await fb.insights({
        accountId:'act_12345643234',
        ...params
    }).limit(100).on('progress',function(event){
        console.log(event)
    })
    for await(let row of report.generator()){
        console.log(row)
        console.log(flattenActions(row, undefined, actions))
    }
}
start()
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