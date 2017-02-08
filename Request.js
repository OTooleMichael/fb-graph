var curl = require("./Requests/curlRequests");
var https = require("./Requests/httpRequests");
function Request(options){
	if(options.curl){
		this._get = curl.get;
		this._post = curl.post;
		this._page = curl.page;
	***REMOVED***else{
		this._get = https.get;
		this._post = https.post;
		this._page = https.page;
	***REMOVED***
	this.graphV = options.graphV;
	this.access_token = options.access_token || options.token;
***REMOVED***
Request.prototype.setToken = function(token){
	this.access_token = token;
	return this
***REMOVED***
Request.prototype.page = function(page,cb){
	this._page(page,parseRes(cb));
	return this
***REMOVED***
Request.prototype.get = function(options,cb) {
	options = options || {***REMOVED***
	if(typeof options !== "object") throw new Error("must be an object "+options);
	options.graphV =  this.graphV;

	options.params = options.params || {***REMOVED***
	options.params.access_token = this.access_token || options.params.access_token;
	this._get(options,parseRes(cb))
	return this;
***REMOVED***
Request.prototype.post = function(options,cb) {
	options.graphV = this.graphV;
	options.params = options.params || {***REMOVED***
	options.params.access_token = this.access_token;
	this._post(options,parseRes(cb));
	return this;
***REMOVED***
Request.prototype.setRequestType = function(curl_https) {
	curl_https = curl_https.toUpperCase();
	if(curl_https == "CURL"){
		this._get = curl.get;
		this._post = curl.post;
	***REMOVED***else if(curl_https == "HTTPS"){
		this._get = https.get;
		this._post = https.post;
	***REMOVED***else{
		throw new Error("ONLY CURL or HTTPS are premitted")
	***REMOVED***
	return this;
***REMOVED***
// normalise errors
function parseRes(cb){
	return function(err,res){
		if(err) return cb(err);
		if(res.error) return cb(res.error);
		return cb(null,res);
	***REMOVED***
***REMOVED***

module.exports = Request;

