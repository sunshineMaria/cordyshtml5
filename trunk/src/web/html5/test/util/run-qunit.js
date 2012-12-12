/*
Courtesy https://gist.github.com/1305062

Added saving the HTML Result along with saving of JUnit type XML.

qunitoutputgenerator has to be added to the test suite.

*/

var system = require('system');

// Now let's get a file system handle.
fs = require("fs");


var outputTestResultHTML = "";

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
	var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 30001, //< Default Max Timout is 3s
		start = new Date().getTime(),
		condition = false,
		interval = setInterval(function() {
			if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
				// If not time-out yet and condition not yet fulfilled
				condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
			} else {
				if(!condition) {
					// If condition still not fulfilled (timeout but condition is 'false')
					console.log("'waitFor()' timeout");
					phantom.exit(1);
				} else {
					// Condition fulfilled (timeout and/or condition is 'true')
					console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
					typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
					clearInterval(interval); //< Stop this interval
					
				}
			}
		}, 100); //< repeat check every 250ms
};

function onLoadFinished() {
	writeTestResultHTML();
	writeTestResultXML();
};




if (system.args.length !== 4) {
	console.log('Usage: run-qunit.js URL outputHTMFile outputXMLFile');
	phantom.exit(1);
}

var page = require('webpage').create();

// evaluates getTestResultXML in the qunitputgenerator to get the XML in Junit Style
writeTestResultXML = function()
{
	var outputTestResultXML = page.evaluate(function () { return getTestResultXML() });
	fs.write(system.args[3], outputTestResultXML, "w");
};

// evaluates getTestResultHTML in the qunitputgenerator to get the HTML output
writeTestResultHTML = function () {
	var outputTestResultHTML = page.evaluate(function () { return getTestResultHTML() });
	fs.write(system.args[2], outputTestResultHTML, "w");
};

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg, lineNumber, source) {
	console.log(msg);
 };
 

// Called on page open
page.open(system.args[1], function(status){
	if (status !== "success") {
		console.log("Unable to access network");
		phantom.exit(1);
	} else {
		waitFor(function () {
			return page.evaluate(function(){ 
		   
				var el = document.getElementById('qunit-testresult');
				if (el && el.innerText.match('completed')) {
					return true;
				}
				return false;
			});
		}, function(){
			var failedNum = page.evaluate(function(){
				var el = document.getElementById('qunit-testresult');
				//console.log(el.innerText);
				try {
					return el.getElementsByClassName('failed')[0].innerHTML;
				} catch (e) { }
				return 10000;
			
			});

			onLoadFinished();
			phantom.exit((parseInt(failedNum, 10) > 0) ? 1 : 0);
		}, 300000);
	}
});



