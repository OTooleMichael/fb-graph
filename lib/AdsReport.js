const util = require("util");
const { Readable ***REMOVED*** = require('stream');
const {
	get,post,page,wait,
	checkAsyncStatus,createAsyncReport
***REMOVED*** = require('./requests');
const {
	parseUserInputsToParams,flattenActions
***REMOVED*** = require('./tools');
function AsyncDownload(rawRequest,options={***REMOVED***){
	Readable.call(this,{objectMode:true***REMOVED***);
	const {accountId,startDate,endDate,metrics***REMOVED*** = rawRequest;
	if(!accountId) throw new Error("Account Id is a required param!");
	this.userInput = (startDate && endDate && metrics);
	this.accountId = accountId;
	this.request = this.rawRequest = rawRequest;
	if(this.userInput){
		this.params = parseUserInputsToParams(rawRequest)
		this.request = this.params.params;
	***REMOVED***
	this.results ={rows:[],totalRows:0,pages:0***REMOVED***
	let defaults = AsyncDownload.defaults || {***REMOVED***
	this.options = Object.assign(defaults,options);
	this._shouldContinue = true;
	return this
***REMOVED***
AsyncDownload.prototype._read = async function(){
	this._shouldContinue = true;
	if(this._isReading) return
	this._isReading = true;
	try{
		await this._download();
	***REMOVED***catch(error){
		this._error(error);
	***REMOVED***
	return
***REMOVED***
AsyncDownload.prototype._error =function(error){
	if(!error) return;
	if(this.isStream){
		return this.emit('error',error);
	***REMOVED***
	throw error;
***REMOVED***
AsyncDownload.prototype._processData =function(data){
	this.results.totalRows += data.length;
	this.results.pages++;
	const {
		userInput,options,params,request
	***REMOVED*** = this;
	if(userInput){
		try{
			data = flattenActions(
				options.customEventMap || {***REMOVED***,
				data, 
				params.actions.join(),
				request.action_attribution_windows 
			);
		***REMOVED***catch(error){
			return this._error({
				title:"ERROR_PARSING_REPONSE",
				details:error
			***REMOVED***);
		***REMOVED***
	***REMOVED***
	if(this.isStream){
		data.forEach(r=>{
			this._shouldContinue = this.push(r)
		***REMOVED***);
		return;
	***REMOVED***
	this.results.rows = this.results.rows.concat(data);
	return
***REMOVED***
AsyncDownload.prototype._getNext = function(argument) {
	const { nextPage,reportId***REMOVED*** = this;
	const { token,graphV ***REMOVED*** = this.options;
	const req = {
		path:reportId+"/insights",
		params:{limit:"500"***REMOVED***,
		token,graphV
	***REMOVED***
	return nextPage === 1 ? get(req) : page(nextPage);
***REMOVED***
AsyncDownload.prototype._download = async function(){
	const { nextPage,isStream, _shouldContinue***REMOVED*** = this;
	if( (isStream && !_shouldContinue) || !nextPage ){
		return this;
	***REMOVED***
	let res = await this._getNext();
	var {data,paging***REMOVED*** = res;
	this._processData(data);
	this.nextPage = paging && paging.next;
	if(this.nextPage){
		await wait(550);
	***REMOVED***else if(isStream){
		this.push(null);
		return this.emit('complete',this.results);
	***REMOVED***
	if(!isStream || this._shouldContinue) return this._download();
	this._isReading = false;
	return this
***REMOVED***
AsyncDownload.prototype._startDownload = async function(reportId) {
	this.reportId = reportId;
	const {token,debug=false***REMOVED*** = this.options;
	try{
		await checkAsyncStatus({
			path:reportId,token,debug
		***REMOVED***);
		this.nextPage = 1;
		await this._download();
	***REMOVED***catch(error){
		this._error(error);
		return
	***REMOVED***
	if(this.isStream){
		return
	***REMOVED***
	return this.results
***REMOVED***
AsyncDownload.prototype._start = async function(){
	try{
		const {accountId,request***REMOVED*** = this;
		const {token,debug***REMOVED*** = this.options;
		let reportId = await createAsyncReport({
			accountId,token,params:request
		***REMOVED***);
		if(debug){
			console.log('REPORT CREATED: ID -',reportId);
		***REMOVED***
		return this._startDownload(reportId);
	***REMOVED***catch(error){
		this._error(error);
		return
	***REMOVED***
***REMOVED***
AsyncDownload.prototype.stream = function(){
	this.isStream = true;
	this._***REMOVED***
	return this
***REMOVED***
AsyncDownload.prototype.run = function(cb){
	this.get().then(res=>cb(null,res)).catch(cb);
***REMOVED***
AsyncDownload.prototype.get = function(){
	this.isStream = false;
	return this._***REMOVED***
***REMOVED***
util.inherits(AsyncDownload, Readable);
AsyncDownload.defaults = {***REMOVED***
AsyncDownload.setToken = function(token){
	AsyncDownload.defaults.token = token;
	return
***REMOVED***
AsyncDownload.setDefaults = function(options){
	let vals = AsyncDownload.defaults
	AsyncDownload.defaults = Object.assign(vals,options);
	return AsyncDownload.defaults;
***REMOVED***
module.exports = AsyncDownload;


