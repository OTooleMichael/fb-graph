///////////////// Ads Reports

function adsReport(acc,params,cb,stream_){
	createAsyncReport(acc,params,(err,id)=>{
		if(err) return cb(err)
		checkAsyncStatus(id,function(err,id){
			if(err) return cb(err);
			if(!stream_) return getReport(id,cb);
			if(stream_=="stream") return streamReport(id,cb);
		});
	});
}



function getReport(id,cb){
	var data =[];
	get(id+"/insights",{limit:"500"},response);
	var nextPage;
	function response(err,res){
		if(err)throw err;
		if(res.data){
			res.data.forEach(function(ob){data.push(ob)});
		}else if(res.error && res.error.message == '(#17) User request limit reached'){
			console.log('(#17) User request limit reached',"So we are waiting");
			if(!nextPage) throw "No Next Page in FB"
			setTimeout(()=>{
				curl('"'+nextPage+'"',response)
			},1000*60*20)
		}else{
			console.log("Fb report Error",res)
		}

		if(res.paging && res.paging.next){
			nextPage = res.paging.next;
			setTimeout(()=>{
				curl('"'+res.paging.next+'"',response)
			},500);
		}else{
			cb(null,data)
		}
	}
}

function streamReport(id,cb){
	var nextPage;
	if(id.includes("graph.facebook")){
		curl('"'+id+'"',response);
	}else{
		get(id+"/insights",{limit:"500"},response);
	}
	function response(err,res){
		if(err){
			return cb("error",err);
		}
		if(res.data){
			cb("data",res.data);
		}else if(res.error && res.error.message == '(#17) User request limit reached'){
			if(!nextPage) throw "No Next Page in FB"
			cb("error",{
				error:"LIMIT REACHED",
				nextPage:nextPage
			});
			setTimeout(()=>{
				curl('"'+nextPage+'"',response)
			},1000*60*20)
		}else{
			console.log("Fb report Error",res)
		}

		if(res.paging && res.paging.next){
			nextPage = res.paging.next;
			setTimeout(()=>{
				curl('"'+res.paging.next+'"',response)
			},500);
		}else{
			cb("complete");
		}
	}
}

///////////////// Insights

function pageInsights(page,params,cb){
	var options = {
		since:params.time_range.since,
		until:params.time_range.until,
		period:params.period || "day",
	};
	var metrics = params.metrics;
	getInsights(page,options,metrics,function(err,data){
		cb(err,data);
	});
}

function getInsights(path,options,metrics,cb){
	var now = new Date().toISOString().split("T")[0];
	var data = {};
	var req =  new Recursive(metrics,function(metric,callback){
		console.log("metric",metric);
		get(path+"/insights/"+metric,options,callback);
	});
	req.on("error",function(err){
		cb(err,null);
		req.stop();
	});
	req.on("res",function(res){
		if(!res.data[0]){
			console.log(req.current(),"§ this list items had no results");
			req.next()
			return
		};
		var metric = res.data[0].name;
		var list = res.data[0].values;
		var period = res.data[0].period;
		if(period == "lifetime"){
			data[now] = {
				period:period,
				date:new Date(now)
			};
			data[now][metric] = list[0].value;
		}else{
			for(var i = 0;i<list.length;i++){
				if(data[list[i].end_time] ==  undefined){
					data[list[i].end_time] = {
						date: new Date(list[i].end_time),
						period:period
					};
				}
				data[list[i].end_time][metric] = list[i].value
			}
		}
		req.next();
	});
	req.on("done",function(){
		var out = [];
		for(var l in data){out.push(data[l])}
		cb(null,out);
	});
	req.run();
}

function postInsights(page,params,cb){
	var options = {
		period:params.period || "lifetime",
	};
	if(params.time_range){
		options.since = params.time_range.since;
		options.until =params.time_range.until;
	}
	var metrics = params.metrics;
	var data = [];
	var current=0;
	get(page+"/posts",{},function(err,res){
		var posts = res.data;
		var req = new Recursive(posts,function(item,callback){
			current = data.push(item);
			getInsights(item.id,options,metrics,callback);
		});
		req.on("error",function(err){
			req.stop();
			cb(err,null);
		});
		req.on("res",function(res){
			data[current-1].data = res;
			req.next();
		});
		req.on("done",function(){
			cb(null,data);
		});
		req.run();
	})
}