/*
	
	Populates CouchDB with specified week's menu
	Scrapes the USF dining website

	scraper.js is independent of server.js and menu.js

*/

var jsdom = require('jsdom'),
	events = require('events'),
	util = require('util'),
	fs = require('fs'),
	path = require('path'),
	couchdb = require('felix-couchdb'),
	client = couchdb.createClient(5984, 'localhost'),
	db = client.db('usf-food');


// this is global, as it is used by updatedMenus() and updated by getMenu()
// and needs to be reset in the globalCallback, otherwise the asny nature of node screws up the counter
var number_of_scrapes = 0;

// to loop backwards in time, just run the scraper with the begin_week and end_week commands
// below will save the menus from week 4 weeks ago to 1 weeks ago
var begin_week = -1;
var end_week = -4;
function repeater(i) {
	console.log("\n\n=====================");
	console.log("Working on week #" + i);
	if (i !== end_week) {
		asyncwork(i, function() {

			number_of_scrapes = 0;
			repeater(i - 1);

		});
	}
}
repeater(begin_week);

function asyncwork(week, globalCallback) {


	var eventEmitter = new events.EventEmitter();

	// figure out the last sunday
	var today = new Date();
	var thisSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - (7 * week));

	var dateString = (thisSunday.getMonth() + 1) + "_" + thisSunday.getDate() + "_" + thisSunday.getFullYear();

	console.log ("Week's date is " + dateString);

	var menus = {
		"date": dateString,
		"andros": {},
		"argos": {},
		"champions": {},
		"juniper": {},
		"palms": {}
	};

	function updateMenus(callback) {

		// the number of times we're going to call getMenu()
		// used to figure out when all the scrapes have finished running
		number_of_scrapes = 0;
		var end_number_of_scrapes = 14;


		getMenu("argos", thisSunday, 1);
		getMenu("argos", thisSunday, 639);
		getMenu("argos", thisSunday, 16);
		getMenu("argos", thisSunday, 17);

		getMenu("andros", thisSunday, 16);
		getMenu("andros", thisSunday, 17);
		getMenu("andros", thisSunday, 18);

		getMenu("champions", thisSunday, 16);
		getMenu("champions", thisSunday, 17);

		getMenu("juniper", thisSunday, 1);
		getMenu("juniper", thisSunday, 639);
		getMenu("juniper", thisSunday, 16);
		getMenu("juniper", thisSunday, 17);

		getMenu("palms", thisSunday, 16);

		// when each scrape has finished, it emits a scraped signal
		eventEmitter.on('scraped', function(params) {

			console.log( params.consolePrefix + "Finished scraping" );

			// we've finished scraping, save the menu to couch
			if (number_of_scrapes === end_number_of_scrapes) {
				callback();
			}
		});

/*
		// auto trigger
		end_number_of_scrapes = 0;
		*/
	}


	// what happens after we update the menu
	updateMenus(function() {

		/* save the results to output.txt */
		var output = JSON.stringify(menus);
		var file = path.join(__dirname, "output.txt");
		fs.open(file, "w", "0644", function(err, fd) {
			if (err) throw err;
			fs.write(fd, output, 0, "utf8", function(err, written) {
				if (err) throw err;
				fs.closeSync(fd);
			});
		});


		/* save the results to couch */

		db.getDoc(menus.date, function(err, doc) {
			// find out if the document exists already
			// if it does, treat it as an update
			// meaning add the _rev parameter to the local JSON
			// the document doesn't exist yet
			if (err) {
				saveMenu();
			}

			// the document already exists
			else {
				console.log("The document already exists, revision is: " + doc["_rev"]);
				menus["_rev"] = doc["_rev"];
				saveMenu();
			}
		});

		function saveMenu() {
			// save to couch
			db.saveDoc(menus.date, menus, function(err, ok) {
				if (err) throw new Error(JSON.stringify(err));
				util.puts('\n\n-> Saved the menu to couch as ' + menus.date);

				eventEmitter.removeAllListeners('scraped');
				globalCallback();
			});
		}
	});


	function getMenu() { // getMenu(location, date, meal, callback)
		"use strict";

		// has optional callback
		var location = arguments[0],
			date = arguments[1],
			meal = arguments[2],
			callback = arguments[3];

		var locationParam, dateParam, mealParam = meal,
			itemCount = 0,
			self = this;

		// set the location string for to be used in the URL
		switch (location) {
		case "argos":
			locationParam = "menu%20-%20Fresh%20Food%20Company";
			break;
		case "andros":
			locationParam = "menu%20-%20The%20Bulls%20Den%20Cafe";
			break;
		case "champions":
			locationParam = "menu%20-%20Champions%20Choice";
			break;
		case "juniper":
			locationParam = "menu%20-%20Juniper%20Dining";
			break;
		case "palms":
			locationParam = "menu%20-%20On%20Top%20of%20the%20Palms";
			break;
		default:
			console.error("Error with given location");
			process.exit(0);
			break;
		}

		dateParam = (date.getMonth() + 1) + "_" + date.getDate() + "_" + date.getFullYear();
		// console.log (dateParam);
		// console.log (locationParam);
		var url = 'http://www.campusdish.com/en-US/CSS/UnivSouthFlorida/LocationsMenus/menuJuniperDining.htm?LocationName=' + locationParam + '&MealID=' + mealParam + '&OrgID=137351&Date=' + dateParam + '&ShowPrice=False&ShowNutrition=True';
		
		var consolePrefix = "[ " + location + ":" + meal + " ]	";

		console.log (consolePrefix + "Requesting: " + url);

		jsdom.env(url, ['http://code.jquery.com/jquery-1.7.min.js'], function(errors, window) {
			var $ = window.$;

			var section;
			$.each($("#ucFiveDayMenu_MenuArea table"), function() {

				// if we are in the table that says the section
				if ($(this).attr("class") === "ConceptTab") {
					section = $(this).text().trim();
					// console.log("+++++++++++ " + section + " +++++++++++");
				}

				// otherwise we are in a table that lists the food for a section
				else {

					var day = 0; // 0 = sunday
					// loop through each day of the current table
					$.each($(this).find(".menuBorder"), function() {
						// console.log("===== Day "+ day +" =====");
						// loop through each day of the current table
						$.each($(this).find(".recipeLink"), function() {

							var food = $(this).text().trim().toLowerCase().capitalize();
							var url = $(this).attr('href');

							// set up the json object, and keep in mind that if a property doesn't exist yet, we need to create it!
							if (typeof menus[location][day] === "undefined") {
								menus[location][day] = {};
								// console.log ("result[day] is result[" + day + "]");
							}
							if (typeof menus[location][day][section] === "undefined") {
								menus[location][day][section] = {};
								// console.log ("result[day] is result[" + day + "]");
							}
							if (typeof menus[location][day][section][itemCount] == "undefined") menus[location][day][section][itemCount] = {
								name: "",
								url: ""
							};

							menus[location][day][section][itemCount].name = food;
							menus[location][day][section][itemCount].url = url;

							itemCount++;
						});
						day++;
					});
				}
			});

			if (typeof callback !== "undefined") callback();

			number_of_scrapes++;
			eventEmitter.emit('scraped', {
				"consolePrefix" : consolePrefix,
				"location": location,
				"meal" : meal,
				dateParam : dateParam
			});
		});
	}
}

/* Extras */

String.prototype.trim = function() {
	"use strict";
	return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.ltrim = function() {
	"use strict";
	return this.replace(/^\s+/, "");
};
String.prototype.rtrim = function() {
	"use strict";
	return this.replace(/\s+$/, "");
};

String.prototype.capitalize = function() {
	return this.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
		return p1 + p2.toUpperCase();
	});
};
