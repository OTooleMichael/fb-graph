var exec = require('child_process').exec;
function execute(command, callback){
    exec(command, {maxBuffer: 1024 * 2000}, function(error, stdout, stderr){ callback(error, stdout); });
};

function curl(command,cb){
	if(typeof cb !== "function") throw new Error("NOT A CB "+cb);
	execute("curl "+command,function(err,res){
		if(err){
			cb(err);
			return
		}
		try{
			var res = JSON.parse(res);
			cb(res.error,res);
		}catch(e){
			cb(err,res);
		}	
	});
}

function get(options,cb){
	var params = options.params;
	var path = options.path;
	var fbGraphApiVerion = options.graphV || "2.7"; 
	if(!path) throw new Error("path must be defined "+JSON.stringify(options));
	var command = " -G  ";
	var url = "https://graph.facebook.com/v"+fbGraphApiVerion+"/"+path;
	for(var el in params){
		var par = (typeof params[el] == "object" ) ? JSON.stringify(params[el]) : params[el];
		command+= '-d "'+el+'='+encodeURIComponent(par)+'" ';
	}
	// command+='-d "access_token='+config.long_token+'"  ';
	command+=' "'+url+'"';
	curl(command,cb);
}


function post(options,cb){
	var params = options.params;
	var path = options.path;
	var fbGraphApiVerion = options.graphV || "2.7"; 
	if(!path) throw new Error("path must be defined "+JSON.stringify(options));


	var command = " -X POST ";
	var url = "https://graph.facebook.com/v"+fbGraphApiVerion+"/"+path;
	for(var el in params){
		var par = (typeof params[el] == "object" ) ? JSON.stringify(params[el]) : params[el];
		//par = (el == "time_range") ? encodeURIComponent(par) : par;
		command+= "-F '"+el+'='+par+"' ";
	}
	// command+='-F "access_token='+config.long_token+'"  ';
	command+=' "'+url+'"';
	curl(command,cb);
}

module.exports = {
	get:get,
	post:post,
	page:function(page,cb){
		return curl('"'+page+'"',cb);
	}
}