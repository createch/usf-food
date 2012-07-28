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
	

module.exports = {
	
	getMenu: function () {
		// accepts any date in the format getMenu(month, day, year)
		// return the menu as a JSON document for that date
		// the appropriate menu is the menu for this week's sunday
		
		var month = arguments[0] - 1 ;
		var day = arguments[1];
		var year = arguments[2];
		var callback = arguments[3];
						
		var date = new Date (year, month, day);
				
		// console.log ("Date provided: " + date.toDateString());
			
		sunday = new Date(date.getFullYear(),date.getMonth(),date.getDate()-date.getDay());
		
		// console.log ("Sunday result: " + sunday.toDateString());

		
		// the docs name is in this format with the date of the nearest sunday
		var doc_name = (sunday.getMonth() + 1) + "_" + sunday.getDate() + "_" + sunday.getFullYear();
			
		// console.log ("Doc name is " + doc_name);
					
		db.getDoc(doc_name, function (err, doc){

			// the document doesn't exist yet
			if (err) {
				callback(err, null);
			}
			
			else {
				// console.log (doc);
				callback(null, doc);
			}
		});
		
	}
};
