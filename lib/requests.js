const {promisify***REMOVED*** = require('util');
const request = require('request');
const GRAPH_VERSION = '3.0';
const BASE = 'https://graph.facebook.com/v';
const requestP = function(payload){
	const type = payload.type;
	delete payload.type;
	return new Promise(function(resolve,reject){
		return request[type](payload,function(err,_,body){
			if(err) return reject(err);
			try{
				body = JSON.parse(body)
			***REMOVED***catch(_){***REMOVED***
			if(body.error) return reject(body.error);
			return resolve(body);
		***REMOVED***)
	***REMOVED***);
***REMOVED***
const wait = (time)=>new Promise(res=>setTimeout(res,time||200));
function post(options){
	let {
		token,
		graphV=GRAPH_VERSION,
		path,
		params={***REMOVED***
	***REMOVED*** = options;
	params = Object.assign({***REMOVED***,params);
	if(!path){
		let e = "Path must be defined "+JSON.stringify(options)
		throw new Error(e);
	***REMOVED***
	let url = `${BASE***REMOVED***${graphV***REMOVED***/${path***REMOVED***`;
	params.access_token = token || params.access_token;
	for(var el in params){
		params[el] = (typeof params[el] == "object" ) ? JSON.stringify(params[el]) : params[el];
	***REMOVED***
	return requestP({
		type:'post',url,form:params
	***REMOVED***);
***REMOVED***
function get(options){
	let {
		token,path,
		graphV=GRAPH_VERSION,
		params = {***REMOVED***
	***REMOVED*** = options;
	params = Object.assign({***REMOVED***,params);
	if(!path){
		let e = "Path must be defined "+JSON.stringify(options)
		throw new Error(e);
	***REMOVED***
	const url = `${BASE***REMOVED***${graphV***REMOVED***/${path***REMOVED***`;
	params.access_token = token || params.access_token;
	for(var el in params){
		params[el] = (typeof params[el] == "object" ) ? JSON.stringify(params[el]) : params[el];
	***REMOVED***
	return requestP({
		type:'get',
		url,
		qs:params
	***REMOVED***);
***REMOVED***
async function createAsyncReport(options){
	options.path = `act_${options.accountId***REMOVED***/insights`;
	let res = await post(options);
	if(!res.report_run_id){
		let e = new Error("NO_REPORT_ID");
		e.details = res;
		throw e;
	***REMOVED***
	return res.report_run_id
***REMOVED***
async function checkAsyncStatus(req,waitParams={***REMOVED***){
	let {waitedI=0,started***REMOVED*** = waitParams;
	if(waitedI > 400){
		let e = new Error('WAITING TOO LONG');
		e.waitParams = waitParams;
	***REMOVED***
	started = started || Date.now();
	const incrInterval = 2000;
	let waitInterval = waitedI*incrInterval;
	waitInterval = waitInterval > 60*1000 ? 60*1000 : waitInterval;
	let res = await get(req);
	const {
		async_status,
		async_percent_completion:completedPer
	***REMOVED*** = res;
	if(async_status === 'Job Completed' || completedPer === 100){
		return req.path;
	***REMOVED***else{
		waitedI++;
		const waited = Date.now() - started;
		const waitTime = completedPer > 0 ? 
			Math.round(waited*100/completedPer)
			: waitInterval;
		if(waitTime > 50*1000 || req.debug){
			console.log('WAITING '+waitTime,completedPer);
		***REMOVED***
		await wait(waitInterval);
		return checkAsyncStatus(req,{waitedI,started***REMOVED***);
	***REMOVED***
***REMOVED***
function page(url){
	return requestP({type:'get',url***REMOVED***)
***REMOVED***

module.exports = {
	get,post,page,wait,
	checkAsyncStatus,createAsyncReport
***REMOVED***




