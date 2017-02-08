var Request = require("./Request");
var AdsReport = require("./AdsReport");
var basicMethods = require("./basicMethods");
function getExchangeToken(tkn,cb){
	var url = '"https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token'
	url+='&client_id='+config.appId+'&client_secret='+config.appSecret+'&fb_exchange_token='+tkn+'"';
	curl(url,cb);
}

function FBAds(config){
	this.config = config;
	if(config.token) this.token = config.token;
	if(config.customEventMap) this.customEventMap = config.customEventMap;
	this._request = new Request(config);
	return this;
}
FBAds.prototype.get = function(options,cb){
	this._request.get(options,cb);
	return this
};
FBAds.prototype.post = function(options,cb){
	this._request.post(options,cb);
	return this
};

FBAds.prototype.page = function(options,cb){
	this._request.page(options,cb);
	return this
};

FBAds.prototype.createAsyncReport = function(options,cb){
	basicMethods.createAsyncReport(this,options,cb);
	return this
};
FBAds.prototype.checkAsyncStatus = function(options,cb){
	basicMethods.checkAsyncStatus(this,options,cb);
	return this
};
FBAds.prototype.runAsyncReport = function(options,cb){
	this.createAsyncReport(options,(err,id)=>{
		if(err) return cb(err);
		this.checkAsyncStatus({
			id:id
		},cb);
	});
	return this
};
FBAds.prototype.setToken = function(token){
	this._request.setToken(token);
	this.token = token;
	return this
};

FBAds.prototype.setToken = function(customEventMap) {
	this.customEventMap = customEventMap;
	return this
};

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
	};
	*/
	// AdsReport can be used as a streamable ( .stream() ) or a direct cb ( .run(cb) )
	// 
	return new AdsReport(this,params);
};

FBAds.prototype.flattenActions = function (data,acts,attriList){
	var lib = this.customEventMap || {};
	attriList = attriList || ["1d_view","7d_view","28d_view","1d_click","7d_click","28d_click"];
	var out = [];
	acts = (typeof acts == "string") ? acts : acts.join();	
	data.forEach(function(ob,i){
		out[i]={};
		for(var el in ob){
			if(el=="actions" || el == "action_values"){
				// actions are returned as a nested array. All actions are returned even if only one is desired
				var actions = ob[el];
				actions.forEach(function(ac){
					var val = (el=="actions") ? "":"_val";
					var title;
					var paid_ = false;
					if(lib[ac.action_type]){
						title = lib[ac.action_type];
						if(title.includes("paid_")) paid_ = true;
					}else{
						title = ac.action_type.replace("offsite_conversion.fb_pixel_","");
					}

					if(actions == undefined || acts.includes(title)){
						attriList.forEach(function(attr){
							if(paid_){
								out[i]["paid_all"+val+"_"+attr] = out[i]["paid_all"+val+"_"+attr] ||0;
								out[i]["paid_all"+val+"_"+attr] += ac[attr]||0;
							}
							out[i][title+val+"_"+attr] = ac[attr]||0 ;
						})
					}
				});	
			}else if( /.*(impressions|clicks|reach|value).*/gi.test(el) ){
				out[i][el]=parseFloat(ob[el]);
			}else{
				out[i][el]=ob[el];
			}
		}
	});
	return out
};
///////////////// Tools
/*
The following functions are used to allow a compressed human request to Fb , which is returned as simple rows of json.
This is only for the FB Ads insights at the moment
*/
FBAds.prototype.parseUserInputsToParams = function(userInputs){
  var levels =[];
  var fields = [];
  var actions = [];
  var breakdowns = [];
  // these will make up the paramaters of the Post request;
  var postParams = {
    level:null,
    action_attribution_windows:userInputs.attributionWindow,
    time_range:{"since":userInputs.startDate,"until":userInputs.endDate},
    time_increment:null,
    action_report_time:userInputs.attributionType
  };
  var listToParse = userInputs.dimensions.concat(userInputs.metrics);
  // transform the dimensions / metrics logic into a facebook graph set of paramaters
  for(var i=0;i<listToParse.length;i++){
    var parts = listToParse[i].split("::");
    parts[1] = parts[1] || "";
    if( parts[1].includes("actions") ){
      actions.push(parts[0]); // keep for later to parse the response
    }else if( parts[1].includes("breakdowns") ){
      breakdowns.push(parts[0]);
    }else if(parts[1].includes("time_increment")){
      postParams.time_increment = timeToNumber(parts[0]); 
    }else{
      fields.push(parts[0])
    }
    if(parts[1].includes("level")){
      levels.push(parts[0]) // use to find the deepest level for the fb "level" param
    }
  };
  if(actions.length > 0){ // if the user requested any actions then add actions and action_values to the fields list
    fields.push("actions");
    fields.push("action_values");
  };
  if(!postParams.time_increment) postParams.time_increment = "all_days";
  postParams.level = findLowestLevel(levels); // find the lowest/deepest level eg. (ad,ad_set,campaign,account)
  postParams.breakdowns = breakdowns.join(","); // transform to string
  postParams.fields = fields.join(",");
  return { 
    params:postParams,
    actions:actions // actions will be needed for parsing the response
  }
}


//

function timeToNumber(time){
	var map = {
		day:1,
		week:7,
		month:30
	};
	return map[time]
}

function findLowestLevel(levels){
	var str = levels.join();
	if(str.search(/ad_id|ad_name/gi)>-1){
		return "ad"
	}else if(str.includes("adset")){
		return "adset"
	}else if(str.includes("campaign")){
		return "campaign"
	}else{
		return "account"
	}
}


module.exports = FBAds