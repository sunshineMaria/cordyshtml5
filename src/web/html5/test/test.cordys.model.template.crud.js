(function (window, $) {

	module("Model Plugin with Templating and Crude Operations Test");

	var orderDemoModel = new $.cordys.model({
		objectName: "OrderDemo",
		isReadOnly: false,
		defaults: {
			namespace: "http://schemas.cordys.com/html5sdk/orderdemo/1.0",
			async: false,
			dataType: "json",
			error: function () {
				return false;
			}
		},
		template: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", {
			name: "StatusMessage",
			type: "string",
			computed: function () {
				return this.OrderID() + " " + this.Status()
			}
		}, {
			name: "Birthday",
			type: "string",
			path: "OrderDate"
		}]
	});


	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /InsertTemplateTestRequest/,
		responseText: {
			tuple:
				{
					'new': {
						OrderDemo: {
							"OrderID": "160",
							"Customer": "fj",
							"Employee": "ss",
							"OrderDate": "2012-07-10T10:29:16.140000001",
							"Product": "aa",
							"Quantity": "4",
							"Discount": "21",
							"Status": "RECOVERED",
							"Notes": "Create Order Demo1"
						}
					}
				}
		}
	});


	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateTemplateTestRequest/,
		responseText: {
			tuple:
				{
					'new': {
						OrderDemo: {
							"OrderID": "1160",
							"Customer": "fj",
							"Employee": "ss",
							"OrderDate": "2012-07-10T10:29:16.140000002",
							"Product": "aa",
							"Quantity": "4",
							"Discount": "21",
							"Status": "JUMPED",
							"Notes": "Create Order Demo2"
						}
					}
				}
		}
	});

	// Insert a new Business Object using create with the template. See that the observables added from template definition are not send
	// The objects that are returned back should get merged with the existing observables
	// Changes in the observables added by templating should not trigger updates
	test("Add Business Object with templating", 31, function () {
		stop();

		// Insert a new Business Object using create with the template. See that the observables added from template definition are not send
		orderDemoModel.addBusinessObject({ OrderID: 160, Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Status: "CREATED", Notes: "Create Order Demo", "OrderDate": "2012-07-10T10:29:16.140000000" });
		var orders = orderDemoModel.OrderDemo();
		equal(orders.length, 1, "Added BO, but not synchronized yet. 1 record in the model");

		ok(ko.isObservable(orders[0].Cost), "Observable added even if attribute is not present in response");
		strictEqual(typeof (orders[0].Cost()), "undefined", "Added observable has undefined value");

		ok(ko.isObservable(orders[0].Status), "Observable added even if attribute is not present in template");
		strictEqual(orders[0].Status(), "CREATED", "Added observable has correct value");


		ok(ko.isObservable(orders[0].StatusMessage), "Observable added for computed field");
		strictEqual(orders[0].StatusMessage(), "160 CREATED", "Computed field has correct value");

		ok(ko.isObservable(orders[0].Birthday), "Observable added for field with path even if the path does not exist");
		strictEqual(orders[0].Birthday(), "2012-07-10T10:29:16.140000000", "Field with path has correct value");

		orders[0].Status("COMPLETED");

		response = orderDemoModel.create({
			method: "InsertTemplateTestRequest",
			beforeSend: function (jqXHR, settings) {
				// The request should only contain the attributes that were originally there, not the ones added by templating
				// TODO - This actually will create problems where you have some attribute that needs to be persisted. Needs to look into this.
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><InsertTemplateTestRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>COMPLETED</Status><Notes>Create Order Demo</Notes><OrderDate>2012-07-10T10:29:16.140000000</OrderDate></OrderDemo></new></tuple></InsertTemplateTestRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML sent for create");
			}
		});

		// The objects that are returned back should get merged with the existing observables
		orderDemoObjects = orderDemoModel.OrderDemo();
		strictEqual(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		strictEqual(orderDemoObjects[0].Notes(), "Create Order Demo1", "Observable merged with the response data after insert");

		ok(ko.isObservable(orders[0].Cost), "Observable merged even if attribute is not present in response after insert");
		strictEqual(typeof (orders[0].Cost()), "undefined", "Merged observable has undefined value after insert");

		ok(ko.isObservable(orders[0].Status), "Observable merged even if attribute is not present in template after insert");
		strictEqual(orders[0].Status(), "RECOVERED", "Merged observable has correct value after insert");


		ok(ko.isObservable(orders[0].StatusMessage), "Observable merged for computed field after insert");
		strictEqual(orders[0].StatusMessage(), "160 RECOVERED", "Merged Computed field has correct value after insert");

		ok(ko.isObservable(orders[0].Birthday), "Observable merged for field with path even if the path does not exist after insert");
		strictEqual(orders[0].Birthday(), "2012-07-10T10:29:16.140000001", "Merged field with path has correct value after insert");


		orders[0].Cost(10000);

		// Changes in the observables added by templating should not trigger updates
		orderDemoModel.synchronize({
			method: "UpdateTemplateTestRequest",
			beforeSend: function (jqXHR, settings) {
				// TODO - Fix this. The object appears changed to KO
				//ok(false, "Error : Changes in the observables added by templating triggered update");
			}
		});

		orders[0].Status("DISCOVERED");

		// Changes in the observables added by templating should not trigger updates
		orderDemoModel.synchronize({
			method: "UpdateTemplateTestRequest",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateTemplateTestRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>1160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000002</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>JUMPED</Status><Notes>Create Order Demo2</Notes></OrderDemo></old><new><OrderDemo><OrderID>1160</OrderID><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>DISCOVERED</Status><Notes>Create Order Demo2</Notes><OrderDate>2012-07-10T10:29:16.140000002</OrderDate></OrderDemo></new></tuple></UpdateTemplateTestRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML sent for update");
			}
		});



		strictEqual(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		strictEqual(orderDemoObjects[0].Notes(), "Create Order Demo2", "Observable merged with the response data");

		ok(ko.isObservable(orders[0].Cost), "Observable merged even if attribute is not present in response");
		// TODO - Fix this. If the attribute is not returned, then we need to set it as undefined
		strictEqual(typeof (orders[0].Cost()), "undefined", "Merged observable has undefined value after update");

		ok(ko.isObservable(orders[0].Status), "Observable merged even if attribute is not present in template after update");
		strictEqual(orders[0].Status(), "JUMPED", "Merged observable has correct value after update");


		ok(ko.isObservable(orders[0].StatusMessage), "Observable merged for computed field after update");
		strictEqual(orders[0].StatusMessage(), "1160 JUMPED", "Merged Computed field has correct value after update");

		ok(ko.isObservable(orders[0].Birthday), "Observable merged for field with path even if the path does not exist after update");
		strictEqual(orders[0].Birthday(), "2012-07-10T10:29:16.140000002", "Merged field with path has correct value after update");


		start();
	});



})(window, jQuery)