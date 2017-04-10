var util = require("util");
var EventEmitter = require('events').EventEmitter;

// this is an object to better control requests.
function AdsReport(fb,params){
	this.fb = fb;
	EventEmitter.call(this);
	if(!params.accountId) throw new Error("Account Id is a required param!");
	this.userInput = (params.startDate && params.endDate && params.metrics);
	this.accountId = params.accountId;
	this.request = params;
	if(this.userInput){
		this.userParams = this.fb.parseUserInputsToParams(params)
		this.request = this.userParams.params;
	};
	this.progress = {
		rowCount:0,
		pages:0
	}
	this.rows = [];
	return this;
}
// it inherits from EventEmitter
util.inherits(AdsReport, EventEmitter);

AdsReport.prototype.stream = function() {
	this.isStream = true;
	this._start();
	return this;
};
AdsReport.prototype.run = function(cb) {
	if(typeof cb !== "function") throw new Error("Cb rewuired to run AdsReport");
	this.cb = cb;
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
	this.nextPage;
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
		setTimeout(()=>{
			this.fb.page(res.paging.next,this._processReponse.bind(this))
		},500);
	}else{
		return this._respond("complete");
	}
};
AdsReport.prototype.retry = function(){
	if(!this._validRetry) return this._error("CANNOT_RETRY");
	if(this._awaitingRetry) return this._error("RETRY_PENDING");
	console.log("this is a 20 mins wait now");
	this._awaitingRetry = true;
	setTimeout(()=>{
		this.fb.page(this.nextPage,this._processReponse.bind(this))
	},1000*60*20)
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
	if(this.isStream){
		return this._respond("data",data);
	}else{
		this.rows = this.rows.concat(data);
	}
	return this
}
AdsReport.prototype._error = function(err){
	return this._respond("error",err);
}
AdsReport.prototype._respond = function(type,data){
	data = (type === "complete") ? this.progress : data;
	if(this.isStream){
		return this.emit(type,data);
	}
	if(type == "error"){
		return this.cb(data);
	}else if(type == "complete"){
		return this.cb(null,this.rows);
	}
	return this
};
// end of object

module.exports = AdsReport;