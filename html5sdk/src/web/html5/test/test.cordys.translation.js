(function (window, $) {

    module("Translation Plugin test");

	$.mockjax({
		url: '*/com.cordys.translation.gateway.TranslationGateway.wcp',
		responseXML: "<browserpreferences><language>en-US</language></browserpreferences>"
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /jsBundle_nl-NL/,
		responseText: {
			tuple: {
				old: {
					dictionary: {
						label:[
							{
								"@textidentifier": "Employees",
								"nl-NL": "Werknemers"
							},
							{
								"@textidentifier": "Orders",
								"nl-NL": "Bestellingen"
							},
							{
								"@textidentifier": "The capital of {0} is {1}.",
								"nl-NL": "De hoofdstad van {0} is {1}."
							}
						]
					}
				}
			}
		}
	});
	
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /jsBundle_/,
		responseText: {
			tuple: {
				old: {
					dictionary: {
						label:[
							{
								"@textidentifier": "Employees",
								"en-US": "Employees"
							},
							{
								"@textidentifier": "Orders",
								"en-US": "Orders"
							},
							{
								"@textidentifier": "The capital of {0} is {1}.",
								"en-US": "The capital of {0} is {1}."
							}
						]
					}
				}
			}
		}
	});

	test("Translate texts in default language", 2, function () {
		stop();
		$.cordys.translation.getBundle("jsBundle").done(function(mBundle) {
			equal(mBundle.getMessage("Employees"), "Employees", "Translate Employees");
			equal(mBundle.getMessage("The capital of {0} is {1}.", "UK", "London"), "The capital of UK is London.", "Translate with insertions");
			start();
		});
	});

	test("Translate texts in Dutch", 2, function () {
		stop();
		$.cordys.translation.getBundle("jsBundle", "nl-NL").done(function(mBundle) {
			equal(mBundle.getMessage("Employees"), "Werknemers", "Translate Employees");
			equal(mBundle.getMessage("The capital of {0} is {1}.", "UK", "London"), "De hoofdstad van UK is London.", "Translate with insertions");
			start();
		});
	});

})(window, jQuery)