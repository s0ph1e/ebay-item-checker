ebay-item-checker
=================

Script checks item's prices on ebay and notifies if it found items with low price

Description
-----------

**package.json** - project dependencies

**config.js** contains:

 - email for notifications, 
 - delays between checks, 
 - ebay queries and desired maximum prices for items,
 - and other settings.


**app.js** sends requests on timeout and parses response to find items which cost less than price in config. If such items were found script sends e-mail with links to results.

Installation
------------

0. Install node.js and npm (if you haven't them installed)
1. Clone repo `git clone git@github.com:s0ph1e/ebay-item-checker.git`
2. Perform `npm install` to load all dependencies
3. Run application `node app.js`
