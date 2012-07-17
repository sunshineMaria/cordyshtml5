function getTestResultXML() {
	var outputXML = "<testsuites> <testsuite name=\"testsuite\">";

	var testResultRoot = $("#qunit-tests");
	var passedTestResults = testResultRoot.find(">li.pass,>li.fail");

	// travers through the modules
	$.each(passedTestResults, function (testIndex, testResult) {
		outputXML += "<testcase ";

		var moduleName = $(testResult).find("strong span.module-name").text();
		var testName = $(testResult).find("strong span.test-name").text();


		outputXML += " classname=\"" + moduleName + "\"";
		outputXML += " name=\"" + testName + "\"";
		outputXML += ">";

		var passedTestCases = $(testResult).find(">ol>li.pass,ol>li.fail");

		// travers through all the failed and succeeded tests
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