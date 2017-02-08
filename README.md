# fb-graph


```javascript
	npm install fb-graph --save
```


## Usage

```javascript
	var FB = require("fb-graph");
	var config = {
		token:token,
		graphV:"2.7"
	***REMOVED***
	// global fb query object
	var fb = new FB(config)
	var options = {
	  accountId:"AcocuntID",
	  startDate:"2017-01-01",
	  endDate:"2017-01-02",
	  dimensions:[
	  	"day::time_increment",
	  	"account_name::level",
	  ],
	  metrics:[
	  	"spend",
	  	"clicks",
	  	"purchases::actions"
	  ],
	  attributionWindow:["7d_click"],
	  attributionType:"conversion"
	***REMOVED***
	fb.createAdsReport(options).run(function(err,rows){
		
	***REMOVED***);
```
