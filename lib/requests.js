const {promisify} = require('util');
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
			}catch(_){};
			if(body.error) return reject(body.error);
			return resolve(body);
		})
	});
};
const wait = (time)=>new Promise(res=>setTimeout(res,time||200));
function post(options){
	const {
		token,
		graphV=GRAPH_VERSION,
		path,
		params={}
	} = options;
	if(!path){
		let e = "Path must be defined "+JSON.stringify(options)
		throw new Error(e);
	}
	let url = `${BASE}${graphV}/${path}`;
	params.access_token = token || params.access_token;
	for(var el in params){
		params[el] = (typeof params[el] == "object" ) ? JSON.stringify(params[el]) : params[el];
	};
	return requestP({
		type:'post',url,form:params
	});
};
function get(options){
	const {
		token,path,
		graphV=GRAPH_VERSION,
		params = {}
	} = options;
	if(!path){
		let e = "Path must be defined "+JSON.stringify(options)
		throw new Error(e);
	}
	const url = `${BASE}${graphV}/${path}`;
	params.access_token = token || params.access_token;
	for(var el in params){
		params[el] = (typeof params[el] == "object" ) ? JSON.stringify(params[el]) : params[el];
	};
	return requestP({
		type:'get',
		url,
		qs:params
	});
}
async function createAsyncReport(options){
	options.path = `act_${options.accountId}/insights`;
	let res = await post(options);
	if(!res.report_run_id){
		let e = new Error("NO_REPORT_ID");
		e.details = res;
		throw e;
	};
	return res.report_run_id
}
async function checkAsyncStatus(req,waitParams={}){
	let {waitedI=0,started} = waitParams;
	if(waitedI > 400){
		let e = new Error('WAITING TOO LONG');
		e.waitParams = waitParams;
	}
	started = started || Date.now();
	const incrInterval = 2000;
	let waitInterval = waitedI*incrInterval;
	waitInterval = waitInterval > 60*1000 ? 60*1000 : waitInterval;
	let res = await get(req);
	const {
		async_status,
		async_percent_completion:completedPer
	} = res;
	if(async_status === 'Job Completed' || completedPer === 100){
		return req.path;
	}else{
		waitedI++;
		const waited = Date.now() - started;
		const waitTime = completedPer > 0 ? 
			Math.round(waited*100/completedPer)
			: waitInterval;
		if(waitTime > 50*1000 || req.debug){
			console.log('WAITING '+waitTime,completedPer);
		}
		await wait(waitInterval);
		return checkAsyncStatus(req,{waitedI,started});
	};
}
async function start(){
	let req = {path:'609025676141221',token:TOKEN};
	let res = await checkAsyncStatus(req)
	console.log(res);
}
function page(url){
	return requestP({type:'get',url})
}

module.exports = {
	get,post,page,wait,
	checkAsyncStatus,createAsyncReport
}




