USF Food
==

An experiment with Node.js, Express, and CouchDB.

A server that returns the food being served at the USF dining hall's for a specified week. This will later be integrated into a Phonegap based app.

See (sample-output.json).

Components
--

- server.js - Uses express to return the menu for a specific week
- menu.js - Gets menu's from CouchDB
- scraper.js - Populates CouchDB with specified weeks menu's by scraping the USF dining website

Future Improvements
--
- Improve server.js to provide a way to access only the menu for a specific location, a specific day, or a specific section, not an entire week
