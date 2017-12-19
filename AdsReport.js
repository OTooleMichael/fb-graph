var util = require("util");
const { Readable }= require('stream');

// this is an object to better control requests.
function AdsReport(fb,params){
	this.fb = fb;
	Readable.call(this,{
		objectMode:true
	});
	if(!params.accountId) throw new Error("Account Id is a required param!");
	this.userInput = (params.startDate && params.endDate && params.metrics);
	this.accountId = params.accountId;
	this.currentRequest = false;
	this._isReadPaused = true;
	this.request = params;
	if(this.userInput){
		this.userParams = this.fb.parseUserInputsToParams(params)
		this.request = this.userParams.params;
	};
	this.progress = {
		rowCount:0,
		pages:0
	}
	this._isCompleted = false;
	this._rows = [];
	return this;
}
// it inherits from Readable
util.inherits(AdsReport, Readable);
AdsReport.prototype._read = function (size) {
    this._isReadPaused = false;
    this._distibute();
    this._resume();
};
AdsReport.prototype._distibute = function()
{
	if(this._isReadPaused) return;
	while(this._rows.length && this.push(this._rows.shift())){
		// nothign here
	}
	this._isReadPaused = (this._rows.length > 0 )
	if(this._isCompleted && !this._isReadPaused ){
    	return this.push(null);
    }
}
AdsReport.prototype._resume = function() {
	if(this._rows.length > 1001) return null
	if(!this.currentRequest) return null;
	let waitTime = this.safeTime - Date.now();
	var req = this.currentRequest;
	if(waitTime > 0){
		setTimeout(()=>req(),waitTime)
	}
	else
	{
		this.currentRequest();
	}
	this.currentRequest = null;
	return this
};
AdsReport.prototype.stream = function() {
	this.isStream = true;
	this._start();
	return this
};

AdsReport.prototype.run = function(cb) {
	if(typeof cb !== "function") throw new Error("Cb required to run AdsReport");
	this.cb = cb;
	let rows = [];
	this.on('error',this.cb)
	.on('end',()=>{
		this.emit('complete');
		this.cb(null,rows);
	}).on('data',function(row){
		rows.push(row)
	})
	this._start();
	return this;
};
AdsReport.prototype._start = function(){
	this.fb.runAsyncReport({
		accountId:this.accountId,
		params:this.request
	},(err,id)=>{
		if(err) return this._error(err);
		this.id = id;
		return this._getReport();
	});
	return this
}
AdsReport.prototype._getReport = function(){
	var id = this.id;
	if(id.includes("graph.facebook")){
		this.fb.page(id,this._processReponse.bind(this));
	}else{
		var req = {
			path:id+"/insights",
			params:{
				limit:"500"
			}
		};
		this.fb.get(req,this._processReponse.bind(this));
	}
}
AdsReport.prototype._processReponse =function(err,res){
	if(err) return this._error(err);
	if(res.data){
		this._processData(res.data);
	}else if(res.error && res.error.message == '(#17) User request limit reached'){
		this._error({
			error:"LIMIT REACHED",
			nextPage:this.nextPage
		});
		this._validRetry = true;
		return
	}else if(res.error){
		return this._error({
			title:"FB_RES_ERROR",
			details:res.error
		})
	}else{
		return this._error({
			title:"FB_RES_ERROR",
			details:res
		});
	}
	if(res.paging && res.paging.next){
		this.nextPage = res.paging.next;
		this.safeTime =  Date.now() + 500;
		this.currentRequest = ()=>{
			this.fb.page(res.paging.next,this._processReponse.bind(this))
		};
		this._distibute();
		this._resume();
	}else{
		this._isCompleted = true;
		this._distibute();
		this.emit('complete',this.progress);
		return
	}
};
AdsReport.prototype.retry = function(){
	if(!this._validRetry) return this._error("CANNOT_RETRY");
	if(this._awaitingRetry) return this._error("RETRY_PENDING");
	console.log("this is a 20 mins wait now");
	this._awaitingRetry = true;
	this.safeTime =  Date.now() + 1000*60*20;
	this.currentRequest = ()=>{
		this.fb.page(this.nextPage,this._processReponse.bind(this));
	}
	this._resume();
}
AdsReport.prototype._processData = function(data){
	if(this.userInput){
		// if it was a userInput formatted request give a formatted answer;
		try{
			data = this.fb.flattenActions(data, this.userParams.actions.join(), this.userParams.params.action_attribution_windows );
			if(typeof this.processAfterFlatten === "function") data = this.processAfterFlatten(data);
		}catch(error){
			return this._error({
				title:"ERROR_PARSING_REPONSE",
				details:error
			});
		};
	};
	this.progress.rowCount += data.length;
	this.progress.pages ++;
	this._rows = this._rows.concat(data);
	return this
}
AdsReport.prototype._error = function(err){
	return this.emit('error',err);
}
// end of object

module.exports = AdsReport;