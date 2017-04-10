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
	***REMOVED***
	this.progress = {
		rowCount:0,
		pages:0
	***REMOVED***
	this.rows = [];
	return this;
***REMOVED***
// it inherits from EventEmitter
util.inherits(AdsReport, EventEmitter);

AdsReport.prototype.stream = function() {
	this.isStream = true;
	this._***REMOVED***
	return this;
***REMOVED***
AdsReport.prototype.run = function(cb) {
	if(typeof cb !== "function") throw new Error("Cb rewuired to run AdsReport");
	this.cb = cb;
	this._***REMOVED***
	return this;
***REMOVED***
AdsReport.prototype._start = function(){
	this.fb.runAsyncReport({
		accountId:this.accountId,
		params:this.request
	***REMOVED***,(err,id)=>{
		if(err) return this._error(err);
		this.id = id;
		return this._getReport();
	***REMOVED***);
	return this
***REMOVED***
AdsReport.prototype._getReport = function(){
	var id = this.id;
	if(id.includes("graph.facebook")){
		this.fb.page(id,this._processReponse.bind(this));
	***REMOVED***else{
		var req = {
			path:id+"/insights",
			params:{
				limit:"500"
			***REMOVED***
		***REMOVED***
		this.fb.get(req,this._processReponse.bind(this));
	***REMOVED***
***REMOVED***
AdsReport.prototype._processReponse =function(err,res){
	this.nextPage;
	if(err) return this._error(err);
	if(res.data){
		this._processData(res.data);
	***REMOVED***else if(res.error && res.error.message == '(#17) User request limit reached'){
		this._error({
			error:"LIMIT REACHED",
			nextPage:this.nextPage
		***REMOVED***);
		this._validRetry = true;
		return
	***REMOVED***else if(res.error){
		return this._error({
			title:"FB_RES_ERROR",
			details:res.error
		***REMOVED***)
	***REMOVED***else{
		return this._error({
			title:"FB_RES_ERROR",
			details:res
		***REMOVED***);
	***REMOVED***
	if(res.paging && res.paging.next){
		this.nextPage = res.paging.next;
		setTimeout(()=>{
			this.fb.page(res.paging.next,this._processReponse.bind(this))
		***REMOVED***,500);
	***REMOVED***else{
		return this._respond("complete");
	***REMOVED***
***REMOVED***
AdsReport.prototype.retry = function(){
	if(!this._validRetry) return this._error("CANNOT_RETRY");
	if(this._awaitingRetry) return this._error("RETRY_PENDING");
	console.log("this is a 20 mins wait now");
	this._awaitingRetry = true;
	setTimeout(()=>{
		this.fb.page(this.nextPage,this._processReponse.bind(this))
	***REMOVED***,1000*60*20)
***REMOVED***
AdsReport.prototype._processData = function(data){
	if(this.userInput){
		// if it was a userInput formatted request give a formatted answer;
		try{
			data = this.fb.flattenActions(data, this.userParams.actions.join(), this.userParams.params.action_attribution_windows );
			if(typeof this.processAfterFlatten === "function") data = this.processAfterFlatten(data);
		***REMOVED***catch(error){
			return this._error({
				title:"ERROR_PARSING_REPONSE",
				details:error
			***REMOVED***);
		***REMOVED***
	***REMOVED***
	this.progress.rowCount += data.length;
	this.progress.pages ++;
	if(this.isStream){
		return this._respond("data",data);
	***REMOVED***else{
		this.rows = this.rows.concat(data);
	***REMOVED***
	return this
***REMOVED***
AdsReport.prototype._error = function(err){
	return this._respond("error",err);
***REMOVED***
AdsReport.prototype._respond = function(type,data){
	data = (type === "complete") ? this.progress : data;
	if(this.isStream){
		return this.emit(type,data);
	***REMOVED***
	if(type == "error"){
		return this.cb(data);
	***REMOVED***else if(type == "complete"){
		return this.cb(null,this.rows);
	***REMOVED***
	return this
***REMOVED***
// end of object

module.exports = AdsReport;