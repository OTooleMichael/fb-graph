import {FacebookAds***REMOVED*** from './index'
import { flattenActions, parseUserInputsToParams ***REMOVED*** from './tools';
***REMOVED***
***REMOVED***
    const fb = new FacebookAds({ accessToken ***REMOVED***)
    const {params,actions***REMOVED*** = parseUserInputsToParams({
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***)
***REMOVED***
    let report = await fb.insights({
***REMOVED***
***REMOVED***
***REMOVED***).limit(100).on('progress',function(event){
***REMOVED***
***REMOVED***)
    for await(let row of report.generator()){
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
// function loadParams(params:{ startDate:Date, endDate?:Date ***REMOVED***): UserInputs{
// 	let { startDate, endDate = new Date() ***REMOVED*** = params;
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***   
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED*** 
***REMOVED***
***REMOVED***
// 	***REMOVED***
// ***REMOVED***
***REMOVED***
***REMOVED***
//     const { data:accounts ***REMOVED*** = await callAPI<{data:{id:string***REMOVED******REMOVED***>({
***REMOVED***
***REMOVED***
***REMOVED***
// ***REMOVED***)
***REMOVED***
***REMOVED***
***REMOVED***,
***REMOVED***
// ***REMOVED***)
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
//       ...parseUserInputsToParams(loadParams({startDate:new Date("2020-11-01")***REMOVED***)).params
// ***REMOVED***)
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
//   ***REMOVED***
***REMOVED***
***REMOVED***
***REMOVED***
//   ***REMOVED***
// ***REMOVED***
//   ***REMOVED***
***REMOVED***