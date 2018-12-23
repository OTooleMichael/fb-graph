const util = require("util");
const { Readable } = require('stream');
const {
	get,post,page,wait,
	checkAsyncStatus,createAsyncReport
} = require('./requests');
const {
	parseUserInputsToParams,flattenActions
} = require('./tools');
function AsyncDownload(rawRequest,options={}){
	Readable.call(this,{objectMode:true});
	const {accountId,startDate,endDate,metrics} = rawRequest;
	if(!accountId) throw new Error("Account Id is a required param!");
	this.userInput = (startDate && endDate && metrics);
	this.accountId = accountId;
	this.request = this.rawRequest = Object.assign({},rawRequest);
	if(this.userInput){
		this.params = parseUserInputsToParams(rawRequest)
		this.request = Object.assign({},this.params.params);
	}
	this.results ={rows:[],totalRows:0,pages:0};
	let defaults = AsyncDownload.defaults || {};
	this.options = Object.assign(defaults,options);
	this._shouldContinue = true;
	return this
}
AsyncDownload.prototype._read = async function(){
	this._shouldContinue = true;
	if(this._isReading) return
	this._isReading = true;
	try{
		await this._download();
	}catch(error){
		this._error(error);
	}
	return
}
AsyncDownload.prototype._error =function(error){
	if(!error) return;
	if(this.isStream){
		return this.emit('error',error);
	}
	throw error;
}
AsyncDownload.prototype._processData =function(data){
	this.results.totalRows += data.length;
	this.results.pages++;
	const {
		userInput,options,params,request
	} = this;
	if(userInput){
		try{
			data = flattenActions(
				options.customEventMap || {},
				data, 
				params.actions.join(),
				request.action_attribution_windows 
			);
		}catch(error){
			return this._error({
				title:"ERROR_PARSING_REPONSE",
				details:error
			});
		};
	};
	if(this.isStream){
		data.forEach(r=>{
			this._shouldContinue = this.push(r)
		});
		return;
	}
	this.results.rows = this.results.rows.concat(data);
	return
}
AsyncDownload.prototype._getNext = function(argument) {
	const { nextPage,reportId} = this;
	const { token,graphV } = this.options;
	const req = {
		path:reportId+"/insights",
		params:{limit:"500"},
		token,graphV
	};
	return nextPage === 1 ? get(req) : page(nextPage);
}
AsyncDownload.prototype._download = async function(){
	const { nextPage,isStream, _shouldContinue} = this;
	if( (isStream && !_shouldContinue) || !nextPage ){
		return this;
	}
	let res = null
	try{
		res = await this._getNext();
	}catch(error){
		if(error.message == 'Error accessing adreport job.'){
			console.log('TRY again')
			await wait(2000)
			res = await this._getNext();
		}else{
			throw error
		};
	};
	var {data,paging} = res;
	this._processData(data);
	this.nextPage = paging && paging.next;
	if(this.nextPage){
		await wait(550);
	}else if(isStream){
		this.push(null);
		return this.emit('complete',this.results);
	}
	if(!isStream || this._shouldContinue) return this._download();
	this._isReading = false;
	return this
}
AsyncDownload.prototype._startDownload = async function(reportId) {
	this.reportId = reportId;
	const {token,debug=false,graphV} = this.options;
	try{
		await checkAsyncStatus({
			path:reportId,token,debug,graphV
		});
		this.nextPage = 1;
		await this._download();
	}catch(error){
		this._error(error);
		return
	}
	if(this.isStream){
		return
	}
	return this.results
}
AsyncDownload.prototype._start = async function(){
	try{
		const {accountId,request} = this;
		const {token,debug,graphV} = this.options;
		let reportId = await createAsyncReport({
			accountId,token,
			params:Object.assign({},request),
			graphV
		});
		if(debug){
			console.log('REPORT CREATED: ID -',reportId);
		};
		return this._startDownload(reportId);
	}catch(error){
		this._error(error);
		return
	};
}
AsyncDownload.prototype.stream = function(){
	this.isStream = true;
	this._start()
	return this
}
AsyncDownload.prototype.run = function(cb){
	this.get().then(res=>cb(null,res)).catch(cb);
}
AsyncDownload.prototype.get = function(){
	this.isStream = false;
	return this._start();
}
util.inherits(AsyncDownload, Readable);
AsyncDownload.defaults = {};
AsyncDownload.setToken = function(token){
	AsyncDownload.defaults.token = token;
	return
}
AsyncDownload.setDefaults = function(options){
	let vals = AsyncDownload.defaults
	AsyncDownload.defaults = Object.assign(vals,options);
	return AsyncDownload.defaults;
}
module.exports = AsyncDownload;


