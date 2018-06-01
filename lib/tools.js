function flattenActions(
	customEventMap,data,
	acts,attriList){
	var lib = customEventMap || {***REMOVED***
	attriList = attriList || ["1d_view","7d_view","28d_view","1d_click","7d_click","28d_click"];
	var out = [];
	acts = (typeof acts == "string") ? acts : acts.join();	
	data.forEach(function(ob,i){
		out[i]={***REMOVED***
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
					***REMOVED***else{
						title = ac.action_type.replace("offsite_conversion.fb_pixel_","");
					***REMOVED***

					if(actions == undefined || acts.includes(title)){
						attriList.forEach(function(attr){
							if(paid_){
								out[i]["paid_all"+val+"_"+attr] = out[i]["paid_all"+val+"_"+attr] ||0;
								out[i]["paid_all"+val+"_"+attr] += ac[attr]||0;
							***REMOVED***
							out[i][title+val+"_"+attr] = parseFloat(ac[attr])||0 ;
						***REMOVED***)
					***REMOVED***
				***REMOVED***);	
			***REMOVED***else if( /.*(impressions|clicks|reach|value|spend).*/gi.test(el) ){
				out[i][el]=parseFloat(ob[el]);
			***REMOVED***else{
				out[i][el]=ob[el];
			***REMOVED***
		***REMOVED***
	***REMOVED***);
	return out
***REMOVED***
///////////////// Tools
/*
The following functions are used to allow a compressed human request to Fb , which is returned as simple rows of json.
This is only for the FB Ads insights at the moment
*/
function parseUserInputsToParams(userInputs){
  var levels =[];
  var fields = [];
  var actions = [];
  var breakdowns = [];
  // these will make up the paramaters of the Post request;
  var postParams = {
    level:null,
    action_attribution_windows:userInputs.attributionWindow,
    time_range:{"since":userInputs.startDate,"until":userInputs.endDate***REMOVED***,
    time_increment:null,
    action_report_time:userInputs.attributionType
  ***REMOVED***
  var listToParse = userInputs.dimensions.concat(userInputs.metrics);
  // transform the dimensions / metrics logic into a facebook graph set of paramaters
  for(var i=0;i<listToParse.length;i++){
    var parts = listToParse[i].split("::");
    parts[1] = parts[1] || "";
    if( parts[1].includes("actions") ){
      actions.push(parts[0]); // keep for later to parse the response
***REMOVED***else if( parts[1].includes("breakdowns") ){
      breakdowns.push(parts[0]);
***REMOVED***else if(parts[1].includes("time_increment")){
      postParams.time_increment = timeToNumber(parts[0]); 
***REMOVED***else{
      fields.push(parts[0])
***REMOVED***
    if(parts[1].includes("level")){
      levels.push(parts[0]) // use to find the deepest level for the fb "level" param
***REMOVED***
  ***REMOVED***
  if(actions.length > 0){ // if the user requested any actions then add actions and action_values to the fields list
    fields.push("actions");
    fields.push("action_values");
  ***REMOVED***
  if(!postParams.time_increment) postParams.time_increment = "all_days";
  postParams.level = findLowestLevel(levels); // find the lowest/deepest level eg. (ad,ad_set,campaign,account)
  postParams.breakdowns = breakdowns.join(","); // transform to string
  postParams.fields = fields.join(",");
  return { 
    params:postParams,
    actions:actions // actions will be needed for parsing the response
  ***REMOVED***
***REMOVED***


//

function timeToNumber(time){
	var map = {
		day:1,
		week:7,
		month:30
	***REMOVED***
	return map[time]
***REMOVED***

function findLowestLevel(levels){
	var str = levels.join();
	if(str.search(/ad_id|ad_name/gi)>-1){
		return "ad"
	***REMOVED***else if(str.includes("adset")){
		return "adset"
	***REMOVED***else if(str.includes("campaign")){
		return "campaign"
	***REMOVED***else{
		return "account"
	***REMOVED***
***REMOVED***
module.exports = {
	parseUserInputsToParams,
	flattenActions
***REMOVED***
