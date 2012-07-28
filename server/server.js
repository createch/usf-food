/*
	
	A server that returns the menus for usf dining in JSON
	CouchDB is used to store the JSON

	scraper.js is executed to update Couch
	menu.js returns the json for a specific week, it is called by server.js as needed

	GET /
		Returns Hello World!

	GET /menu/4/30/2012
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
	menu = require('./menu');

app.enable("jsonp callback");

// console response prefixes
var prefix = {
	req : "[ Request ]	",
	res : "[ Response ]	",
	err : "[ Error ]"
};

app.get('/week/:month/:day/:year', function(req, res) {

	console.log(prefix.req + req.route.path);

	menu.week({
		month: req.params.month - 1,
		day: req.params.day,
		year: req.params.year,
		callback: outputDoc,
		res: res
	});

});



app.get('*', function(req, res) {
	res.send('Hello World!');
});

function outputDoc(err, doc, res) {
	if (err !== null) {
		console.error(err);
		res.json(err);
	} else {
		console.log(prefix.res + "Document: " + doc._id);
		res.json(doc);
	}
}

app.listen(8000);
