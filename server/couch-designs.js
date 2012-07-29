var events = require('events'),
	util = require('util'),
	fs = require('fs'),
	path = require('path'),
	couchdb = require('felix-couchdb'),
	client = couchdb.createClient(5984, 'localhost'),
	db = client.db('usf-food'),
	eventEmitter = new events.EventEmitter();


db.saveDesign('locations', {
	views: {
		"andros": {
			map: function (doc) {
				var result = clone(doc.andros);
				result.date = doc.date;
				var date = {
					date: doc.date
				};
				emit(doc._id, result);


				function clone(obj) {
					if (null === obj || "object" !== typeof obj) return obj;
					var copy = obj.constructor();
					for (var attr in obj) {
						if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
					}
					return copy;
				}
			}
		},
		"argos": {
			map: function (doc) {
				emit (doc._id, doc.argos);
			}
		},
		"champions": {
			map: function (doc) {
				emit (doc._id, doc.champions);
			}
		},
		"juniper": {
			map: function (doc) {
				emit (doc._id, doc.juniper);
			}
		},
		"palms": {
			map: function (doc) {
				emit (doc._id, doc.palms);
			}
		}
	}
});

/*
// test it
db.view('locations', 'andros', function() {
    console.log(arguments);
});
*/