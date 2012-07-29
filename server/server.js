/*
	
	A server that returns the menus for usf dining in JSON
	CouchDB is used to store the JSON

	scraper.js is executed to update Couch
	getMenu.js returns the json for a specific week, it is called by server.js as needed

	GET /
		Returns Hello World!

	GET /getMenu/4/30/2012
		Returns the couched JSON for that date's week
		Sample output available in sample-output.json
*/

var events = require('events'),
	util = require('util'),
	fs = require('fs'),
	path = require('path'),
	couchdb = require('felix-couchdb'),
	client = couchdb.createClient(5984, 'localhost'),
	db = client.db('usf-food'),
	eventEmitter = new events.EventEmitter(),
	app = require('express').createServer(),
	getMenu = require('./menu');

// console log prefixes
var prefix = {
	req : "[ Request ]	",
	res : "[ Response ]	"
};



app.enable("jsonp callback");

app.get('/week/:month/:day/:year', function(req, res) {

	console.log(prefix.req + req.url);

	var menu = {
		month: req.params.month - 1,
		day: req.params.day,
		year: req.params.year,
		res: res
	};

	getMenu.week(menu, outputDoc);

});

app.get('/week/:location/:month/:day/:year', function(req, res) {

	console.log(prefix.req + req.url);

	var menu = {
		month: req.params.month - 1,
		day: req.params.day,
		year: req.params.year,
		res: res,
		location: req.params.location
	};

	getMenu.locationWeek(menu, outputDoc);

});



function outputDoc(err, doc) {
	// this is args

	if (err !== null) {
		console.error(err);
		this.res.json(err);
	} else {
		console.log(prefix.res + this.docName);
		this.res.json(doc);
	}
}



app.get('*', function(req, res) {
	res.send('Hello World!');
});
app.listen(8000);
