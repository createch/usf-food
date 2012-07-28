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
	
	week: function (args) {
						
		var date = new Date (args.year, args.month, args.day);
		// console.log ("Date provided: " + date.toDateString());
			
		sunday = new Date(date.getFullYear(),date.getMonth(),date.getDate()-date.getDay());
		// console.log ("Sunday result: " + sunday.toDateString());

		
		// the docs name is in this format with the date of the nearest sunday
		var doc_name = (sunday.getMonth() + 1) + "_" + sunday.getDate() + "_" + sunday.getFullYear();
			
		// console.log ("Doc name is " + doc_name);
					
		db.getDoc(doc_name, function (err, doc){

			// the document doesn't exist yet
			if (err) {
				args.callback(err, null, args.res);
			}
			
			else {
				// console.log (doc);
				args.callback(null, doc, args.res);
			}
		});
		
	}
};
