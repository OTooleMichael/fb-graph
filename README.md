# fb-graph


```javascript
	npm install fb-graph --save
```


## Usage

```typescript
import { FacebookAds, flattenActions, parseUserInputsToParams ***REMOVED*** from 'fb-graph'
const accessToken = 'XXXXXXXXX'
const fb = new FacebookAds({ accessToken ***REMOVED***)
const { params, actions ***REMOVED*** = parseUserInputsToParams({ // turns understandable fields into a Fb insights request
	reportFields:[
		'date',
		'clicks',
		'unique_clicks',
		'spend',
		'adset_name',
		'campaign_name',
		'campaign_id',
		'adset_id',
		'view_content::action',
		'purchase::action'
	],
	attributionWindow:[],
	startDate:'2020-11-01',
	endDate:'2020-12-01',
	attributionType:'conversion'
***REMOVED***)
const report = fb.insights({
	accountId:'act_12345677898765',
	...params
***REMOVED***).limit(100)
for await(let row of report.generator()){
	console.log(row)
	console.log( flattenActions(row, {
		'offsite_conversion.custom.1148622891903620':'my_pruchace_event'
	***REMOVED***, actions) ) // flattens out "Action" and "action_value" fields, parses numbers and remaps action names
***REMOVED***

```

Watch for progress during long Async Reports
```typescript
const report = fb.insights({
	accountId:'act_12345677898765',
	...params
***REMOVED***).on('progress',function({event, ...metaData***REMOVED***){
	console.log(event)
	console.log(metaData)
***REMOVED***)
```


```typescript

const reportStream = fb.insights({
	accountId:'act_12345677898765',
	...params
***REMOVED***).stream()

reportStream.on('data',function(row){
	console.log(row)
***REMOVED***).on('complete',function(metaData){
	console.log('DONE')
***REMOVED***)

```

```typescript

const reportRows = await fb.insights({
	accountId:'act_12345677898765',
	...params
***REMOVED***).get()

reportRows.forEach(function(row){
	console.log(row)
***REMOVED***)

```