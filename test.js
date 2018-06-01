const Fb = require('./index');
const REQ = {
  accountId:"XXXXXXX",
  startDate:'2018-04-01',
  endDate:'2018-04-30',
  dimensions:[
  	"day::time_increment",
    "device_platform::breakdowns",
    "adset_id::level",
    "adset_name::level",
    "campaign_id::level",
    "campaign_name::level",
    "account_id::level",
    "account_name::level",
  ],
  metrics:[
  	"spend",
  	"clicks",
    "impressions",
    "reach" 
  ],
  attributionWindow:["1d_click"],//,"7d_click","28d_click"],
  attributionType:"impression" //. this is just an artifact only spend matters
};
async function start(){
	let fb = new Fb({token:TOKEN,debug:true});
	let req = fb.createAdsReport(REQ);
	let stream = await req.stream();
	let i = 0;
	stream.on('data',function(row){
		if(i%50 ===0 ){
			console.log(row,i)
		};
		if(i === 140){
			console.log('PAUSING ')
			this.pause();
			setTimeout(e=>{
				console.log('START AGIN')
				this.resume()
			},5000)
		}
	});
	stream.on('error',e=>console.log(e));
	stream.on('complete',function (res) {
		console.log(res)
	})
}
start().catch(console.log);