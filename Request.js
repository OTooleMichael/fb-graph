var curl = require("./Requests/curlRequests");
var https = require("./Requests/httpRequests");
function Request(options){
	if(options.curl){
		this._get = curl.get;
		this._post = curl.post;
		this._page = curl.page;
	}else{
		this._get = https.get;
		this._post = https.post;
		this._page = https.page;
	};
	this.graphV = options.graphV;
	this.access_token = options.access_token || options.token;
}
Request.prototype.setToken = function(token){
	this.access_token = token;
	return this
}
Request.prototype.page = function(page,cb){
	this._page(page,parseRes(cb));
	return this
}
Request.prototype.get = function(options,cb) {
	options = options || {};
	if(typeof options !== "object") throw new Error("must be an object "+options);
	options.graphV =  this.graphV;

	options.params = options.params || {};
	options.params.access_token = this.access_token || options.params.access_token;
	this._get(options,parseRes(cb))
	return this;
};
Request.prototype.post = function(options,cb) {
	options.graphV = this.graphV;
	options.params = options.params || {};
	options.params.access_token = this.access_token;
	this._post(options,parseRes(cb));
	return this;
};
Request.prototype.setRequestType = function(curl_https) {
	curl_https = curl_https.toUpperCase();
	if(curl_https == "CURL"){
		this._get = curl.get;
		this._post = curl.post;
	}else if(curl_https == "HTTPS"){
		this._get = https.get;
		this._post = https.post;
	}else{
		throw new Error("ONLY CURL or HTTPS are premitted")
	};
	return this;
};
// normalise errors
function parseRes(cb){
	return function(err,res){
		if(err) return cb(err);
		if(res.error) return cb(res.error);
		return cb(res);
	}
}

module.exports = Request;

