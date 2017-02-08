var FB = require("./index");
var token = "SOME_PRIVATE_TOKEN";
var pixelEvents = {
	"offsite_conversion.custom.12345":"custom_purchase",
	"offsite_conversion.custom.54321":"custom_mail_signup"
}; // custom pixel events are returned when actions are requested. This allows a user to rename these going in and in the reponse
getReport();
function getReport(){
	var config = {
		token:token,
		customEventMap:pixelEvents,
		curl:false, // we can use curl (machine binding) OR node https module
		graphV:"2.7"
	};
	// global fb query object
	var fb = new FB(config);
	// one specific request example (can also format as might be expected by facebook);

	var options = {
	  accountId:"111882249020036",
	  startDate:"2017-01-01",
	  endDate:"2017-01-02",
	  dimensions:[
	  	"day::time_increment",
	  	"account_name::level",
	  ],
	  metrics:[
	  	"spend",
	  	"clicks",
	  	"paid_pattern::actions",
	  	"paid_material::actions",
	  	"paid_course::actions"
	  ],
	  attributionWindow:["7d_click"],
	  attributionType:"conversion"
	};

	var req = fb.createAdsReport(options); // create an AdsReport Object
	req.run(function(err,res){ // run with a callback
		if(err) return console.log("ERROR",err);
		console.log("RESPONSE",res);
	});
};



//
function fbRequest(accountId,dates){
	// a sample Request
	return {
	  accountId:accountId,
	  startDate:dates.startDate,
	  endDate:dates.endDate,
	  dimensions:[
	  	"day::time_increment",
	  	"device_platform::breakdowns",
	  	"adset_id::level",
	  	"adset_name::level",
	  	"campaign_id::level",
	  	"campaign_name::level",
	  	"account_id::level",
	  	"account_name::level"
	  ],
	  metrics:[
	  	"spend",
	  	"clicks",
	  	"impressions",
	  	"reach",
	  	"social_clicks",
	  	"unique_clicks",
	  	"unique_impressions",
	  	"website_clicks",
	  	"link_click::actions",
	  	"complete_registration::actions",
	  	"purchase::actions",
	  	"view_content::actions",
	  	"add_to_cart::actions"
	  ],
	  attributionWindow:["1d_view","7d_view","28d_view","1d_click","7d_click","28d_click"],
	  attributionType:"conversion"
	};
}