
function createAsyncReport(fb,options,cb){
	var params = options.params;
	var accountId = options.accountId;
	var req = {
		params:params,
		path:"act_"+accountId+"/insights"
	***REMOVED***
	fb.post(req,function(err,res){
		if(err) return cb(err);
		if(!res.report_run_id) return cb({
			title:"NO_REPORT_ID",
			deatils:res
		***REMOVED***);
		if(res.report_run_id){
			return cb(null,res.report_run_id)
		***REMOVED***else{
			return cb("no id found");
		***REMOVED***
	***REMOVED***);
***REMOVED***
function checkAsyncStatus(fb,options,cb){
	var waitingI = 0;
	var waited = 0; // 5000
	var timeOut = 2000;
	var req = {
		path:options.id,
		params:{***REMOVED***
	***REMOVED***
	waiting(req,cb);
	function waiting(req,cb){	
		fb.get(req,function(err,res){
			var complete_percent = parseInt(res.async_percent_completion); // 20
			if(err) return cb(err);
			if(waitingI > 0){
				waited += timeOut
				if(complete_percent == 0){
					timeOut = timeOut*(timeOut/500);
				***REMOVED***else{
					timeOut = Math.floor((waited*100)/complete_percent) - waited + 1000; // not 100%
					timeOut = (timeOut < 1 ) ? 1000 : timeOut; 
				***REMOVED***
			***REMOVED***
			if(res.async_status =="Job Completed"){
				return cb(null,req.path);
			***REMOVED***else if(!!res.async_status ){
				waitingI++;
				setTimeout(function(){
					waiting(req,cb)
				***REMOVED***,timeOut);
			***REMOVED***
		***REMOVED***);
	***REMOVED***
***REMOVED***



module.exports = {
	checkAsyncStatus:checkAsyncStatus,
	createAsyncReport:createAsyncReport
***REMOVED***




