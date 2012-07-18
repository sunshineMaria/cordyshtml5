/*
 Returns the result of the test execution in Junit Style XML Format

 Output Format

 <testsuites>
	<testsuite name="testsuite">
		<testcase classname="Employees Test" name="Get Employees json">
			<success message="3 employees found" type="success"/>
			<success message="Davolio is first Employee" type="success"/>
		</testcase>
		<testcase classname="Employees Test" name="Get Employees xml">
			<success message="3 employees found" type="success"/>
			<failure message="Davolio is first Employee" type="failed"/>
			<system-out>Expected: &quot;Davolios&quot;Result: &quot;Davolio&quot;Diff: &quot;Davolios&quot; &quot;Davolio&quot; Source:	 at http://localhost/cordys/html5/test/test.cordys.ajax.js:129</system-out>
		</testcase>
		<testcase classname="Process Plugin test" name="Remove Attachment">
			<success message="Compare Request XML" type="success"/>
			<success message="Filename is sample" type="success"/>
		</testcase>
	</testsuite>
</testsuites>

*/
function getTestResultXML() {
	var outputXML = "<testsuites> <testsuite name=\"testsuite\">";

	var testResultRoot = $("#qunit-tests");
	var passedTestResults = testResultRoot.find(">li.pass,>li.fail");

	// traverse through the modules
	$.each(passedTestResults, function (testIndex, testResult) {
		outputXML += "<testcase ";

		var moduleName = $(testResult).find("strong span.module-name").text();
		var testName = $(testResult).find("strong span.test-name").text();


		outputXML += " classname=\"" + moduleName + "\"";
		outputXML += " name=\"" + testName + "\"";
		outputXML += ">";

		var passedTestCases = $(testResult).find(">ol>li.pass,ol>li.fail");

		// traverse through all the failed and succeeded tests
		$.each(passedTestCases, function (testCaseIndex, testCase) {

			var className = $(testCase).attr("class");
			var testMessage = $(testCase).find(".test-message").text();
			outputXML += (className === "pass") ? "<success" : "<failure";
			outputXML += (className === "pass") ? " type =\"success\"" : " type =\"failed\"";
			outputXML += " message =\"" + testMessage + "\"";
			outputXML += "/>";

			// add details in case of failures
			if (className === "fail") {
				console.log("Test Failed. Module: " + moduleName + ". TestName: " + testName);
				var details = $(testCase).find("table").text();
				console.log("Details : " + details);
				outputXML += "<system-out>"
				outputXML += details;
				outputXML += "</system-out>"

			}
		});

		outputXML += "</testcase>"

	});
	outputXML += "</testsuite></testsuites>";

	return outputXML;
}

// path to jquery css files for referring in the output htm
var PATH_TO_QUNIT_CSS = "http://srv-nl-crd134/cordys/html5/jquery/qunit.css";

/*
Returns the result of the execution HTML

Takes the body of the test result and adds the qunit css.

*/
function getTestResultHTML() {
	var outputTestResultHTML = "<html><head><link href=\"" + PATH_TO_QUNIT_CSS + "\" rel=\"stylesheet\" type=\"text/css\"></link></head>"
	outputTestResultHTML += document.body.outerHTML;
	outputTestResultHTML += "</html>";

	return outputTestResultHTML;
}