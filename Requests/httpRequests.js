var https = require("https");
var querystring = require('querystring');

function post(options,cb){
	if(typeof options !== "object") throw new Error("not an object "+options);
	options.requestType = "POST";
	fbRequest(options,cb);
}
function get(options,cb){
	if(typeof options !== "object") throw new Error("not an object "+options);
	options.requestType = "GET";
	fbRequest(options,cb);
}
function page(page,cb){
	var parts = page.split(".com");
	var options = {
	  hostname: parts[0]+'.com',
	  port: 443,
	  path: parts[1],
	  method: "GET",
	};
	var str = '';
	var req = https.request( options, function (res){
	    res.setEncoding("utf-8");
	    res.on('data', function (chunk) {
	        str += chunk;
	    });
	    res.on('end', function () {
	    	var data;
	    	try{
	    		data = JSON.parse(str);
	    	}catch(e){
	    		data = str;
	    	}
	        cb(null,data);
	    });
	});
	req.write(query,"utf-8");
	req.on('error', function(e) {
	    console.log('Problem with request: ' + e.message);
	    cb(e,null);
	});
	req.end();
}
function fbRequest(options,cb){
	if(!options.requestType) throw new Error("requestType Required "+JSON.stringify(options));
	var params = options.params;
	var path = options.path;
	var requestType = options.requestType.toUpperCase();
	var fbGraphApiVerion = options.graphV || "2.7"; 
	// this is super mega bullshit
	var query = "";
	for(var el in params){
		var t = typeof params[el];
		var part = (t !== "number" && t !== "string") ? JSON.stringify(params[el]) : params[el];
		if(requestType === "GET") 	part = encodeURIComponent(part); // dont encode for POST. DONT ASK WHY
		query+=el+"="+part+"&";
	}
	query = query.substring(0,query.length - 1);
	query  =  (requestType === "GET")  ? "?"+query : query; // query must be ? prefixed // i changed it back, I dont hink its working except for this one specific case. YAY Facebook!

	var fullPath = '/v'+fbGraphApiVerion+'/'+path;
	// have to do this for get
	if(requestType === "GET") fullPath += query;
	var content = (requestType == "GET") ? 'application/x-www-form-urlencoded' : "multipart/form-data";

	var request = {
	  hostname: 'graph.facebook.com',
	  port: 443,
	  path: fullPath,
	  method: requestType,
	  headers: {
	        "Content-Type": content,
	        "Content-Length": query.length
	    }
	};
	var str = '';
	var req = https.request( request, function (res){
	    res.setEncoding("utf-8");
	    res.on('data', function (chunk) {
	        str += chunk;
	    });
	    res.on('end', function () {
	    	var data;
	    	try{
	    		data = JSON.parse(str);
	    	}catch(e){
	    		data = str;
	    	}
	        cb(null,data);
	    });
	});
	req.write(query,"utf-8");
	req.on('error', function(e) {
	    console.log('Problem with request: ' + e.message);
	    cb(e,null);
	});
	req.end();
}

module.exports = {
	get:get,
	post:post,
	page:page
}

