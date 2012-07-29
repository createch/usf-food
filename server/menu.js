/*

	menu.js provides the getMenu function to server.js

	getMenu requests a specific sunday's menu from CouchDB

*/


var events = require('events'),
	util = require('util'),
	fs = require('fs'),
	path = require('path'),
	couchdb = require('felix-couchdb'),
	client = couchdb.createClient(5984, 'localhost'),
	db = client.db('usf-food'),
	eventEmitter = new events.EventEmitter();
	
	/*
		menu.week
		menu.day
		menu.week.location
		menu.day.location
	*/

module.exports = {

	// TODO: Need to find a better name for args

	week: function (args, callback) {
						
		var date = new Date (args.year, args.month, args.day);
		// console.log ("Date provided: " + date.toDateString());
		
		args.sunday = sundayDateString(date);
		
		args.docName = "document-" + args.sunday;
		
		getDoc(args, callback);

	},

	locationWeek: function(args, callback) {

		var date = new Date (args.year, args.month, args.day);
		args.sunday = sundayDateString(date);

		args.docName = "view-" + args.location + "-" + args.sunday;

		db.view('locations', args.location, function() {
			
			var err = arguments[0];
			var doc = arguments[1] || undefined;

			if (err !== null) {
				callback.call(args, err, null);
			}
			else {
				callback.call(args, null, doc);
			}

		});
	}
};

function sundayDateString(date) {
	// returns the sunday for this week as a string like this: 8_5_2012
	// documents are named like this in couch
	var sunday = new Date(date.getFullYear(),date.getMonth(),date.getDate()-date.getDay());
	return (sunday.getMonth() + 1) + "_" + sunday.getDate() + "_" + sunday.getFullYear();
}

function getDoc(args, callback) {

	db.getDoc(args.sunday, function (err, doc){

		// the document doesn't exist yet
		if (err) {
			callback.call(args, err, null);
		}
		// document found
		else {
			callback.call(args, null, doc);
		}
	});
}