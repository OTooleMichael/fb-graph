const AdsReport = require("./AdsReport");
const Requests = require('./requests');
function getExchangeToken(tkn,cb){
	var url = '"https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token'
	url+='&client_id='+config.appId+'&client_secret='+config.appSecret+'&fb_exchange_token='+tkn+'"';
	curl(url,cb);
***REMOVED***

function FBAds(config={***REMOVED***){
	let defaults = FBAds.defaults
	this.config = Object.assign(defaults,config);
	return this;
***REMOVED***
FBAds.Requests = Requests;
FBAds.AdsReport = AdsReport;
FBAds.defaults = {***REMOVED***
FBAds.setToken = function(token){
	FBAds.defaults.token = token;
	return
***REMOVED***
FBAds.setDefaults = function(options){
	let vals = FBAds.defaults
	FBAds.defaults = Object.assign(vals,options);
	return FBAds.defaults
***REMOVED***	
FBAds.prototype.createAdsReport = function(params){
	/*
	This is a sample input object 
	N.B a typical FB Marketing request can also be sen
	{
	  accountId:"122343262",
	  startDate:"2016-01-01",
	  endDate:"2016-01-01",
	  dimensions:[
	  	"day::time_increment",
	  	"adset_name::level",
	  	"campaign_id::level",
	  	"campaign_name::level",
	  	"account_id::level",
	  	"account_name::level",
	  ],
	  metrics:[
	  	"spend",
	  	"likes::actions"
	  ],
	  attributionWindow:["1d_view","7d_view","28d_view","1d_click","7d_click","28d_click"],
	  attributionType:"conversion"
	***REMOVED***
	*/
	// AdsReport can be used as a streamable ( .stream() ) or a direct cb ( .run(cb) )
	// 
	return new AdsReport(params,this.config);
***REMOVED***

module.exports = FBAds

