(function (window, $) {

	module("Model Plugin with Fields and Crude Operations Test");

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
		fields: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", {
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
		data: /InsertFieldsTestRequest/,
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
		data: /UpdateFieldsTestRequest/,
		responseText: {
			tuple:
				{
					'new': {
						OrderDemo: {
							"OrderID": "1160",
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

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /SyncFieldsTestRequest/,
		responseText: {
			tuple:
				
			[
				{
					old: {
						OrderDemo: {
							"OrderID": "158",
							"Customer": "fj",
							"Employee": "ss",
							"OrderDate": "2012-07-10 10:29:16.140000000",
							"Status": "DISCOVERED",
							"Notes": "test",
							OrderDemoLines: {
								"Product": "Tyre",
								"Quantity": "160",
								"Price": "2000",
								"ShippedFrom": "Africa"
							}
						}
					}
				},
				{
					old: {
						OrderDemo: {
							"OrderID": "159",
							"Customer": "csc",
							"Employee": "ss",
							"Discount": "21",
							"Status": "CREATED",
							"Cost": "1",
							OrderDemoLines: [{
								"Product": "Rim",
								"Quantity": "160",
								"Price": "2600"
							}, {
								"Product": "Steering",
								"Quantity": "40",
								"Price": "2000"
							}
							]
						}
					}
				}
			 ]
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteFieldsTestRequest/,
		responseText: {
			tuple:
				{
					'new': {
						OrderDemo: {
							"OrderID": "1160",
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

	// Insert a new Business Object using create with the fields attribute. See that the observables added from fields definition are not send
	// The objects that are returned back should get merged with the existing observables
	// Changes in the observables added by fields attribute should not trigger updates
	test("Add Business Object with fields attribute", 32, function () {
		stop();

		// Insert a new Business Object using create with the fields attribute. See that the observables added from fields definition are not send
		orderDemoModel.addBusinessObject({ OrderID: 160, Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Status: "CREATED", Notes: "Create Order Demo", "OrderDate": "2012-07-10T10:29:16.140000000" });
		var orders = orderDemoModel.OrderDemo();
		equal(orders.length, 1, "Added BO, but not synchronized yet. 1 record in the model");

		ok(ko.isObservable(orders[0].Cost), "Observable added even if attribute is not present in response");
		strictEqual(typeof (orders[0].Cost()), "undefined", "Added observable has undefined value");

		ok(ko.isObservable(orders[0].Status), "Observable added even if attribute is not present in fields");
		strictEqual(orders[0].Status(), "CREATED", "Added observable has correct value");


		ok(ko.isObservable(orders[0].StatusMessage), "Observable added for computed field");
		strictEqual(orders[0].StatusMessage(), "160 CREATED", "Computed field has correct value");

		ok(ko.isObservable(orders[0].Birthday), "Observable added for field with path even if the path does not exist");
		strictEqual(orders[0].Birthday(), "2012-07-10T10:29:16.140000000", "Field with path has correct value");

		orders[0].Status("COMPLETED");

		response = orderDemoModel.create({
			method: "InsertFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><InsertFieldsTestRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>COMPLETED</Status><Notes>Create Order Demo</Notes><OrderDate>2012-07-10T10:29:16.140000000</OrderDate><BirthDate/><Cost/></OrderDemo></new></tuple></InsertFieldsTestRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML sent for create");
			}
		});

		// The objects that are returned back should get merged with the existing observables
		orderDemoObjects = orderDemoModel.OrderDemo();
		strictEqual(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		strictEqual(orderDemoObjects[0].Notes(), "Create Order Demo1", "Observable merged with the response data after insert");

		ok(ko.isObservable(orders[0].Cost), "Observable merged even if attribute is not present in response after insert");
		strictEqual(typeof (orders[0].Cost()), "undefined", "Merged observable has undefined value after insert");

		ok(ko.isObservable(orders[0].Status), "Observable merged even if attribute is not present in fields after insert");
		strictEqual(orders[0].Status(), "RECOVERED", "Merged observable has correct value after insert");


		ok(ko.isObservable(orders[0].StatusMessage), "Observable merged for computed field after insert");
		strictEqual(orders[0].StatusMessage(), "160 RECOVERED", "Merged Computed field has correct value after insert");

		ok(ko.isObservable(orders[0].Birthday), "Observable merged for field with path even if the path does not exist after insert");
		strictEqual(orders[0].Birthday(), "2012-07-10T10:29:16.140000001", "Merged field with path has correct value after insert");


		orders[0].Cost(10000);

		// Changes in the observables added by fields attribute should not trigger updates
		/*orderDemoModel.synchronize({
		method: "UpdateFieldsTestRequest",
		beforeSend: function (jqXHR, settings) {
		// TODO - Fix this. The object appears changed to KO
		//ok(false, "Error : Changes in the observables added by fields attribute triggered update");
		}
		});*/

		orders[0].Status("DISCOVERED");

		// Changes in the observables added by fields attribute should not trigger updates
		orderDemoModel.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateFieldsTestRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>DISCOVERED</Status><Notes>Create Order Demo1</Notes><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><BirthDate/><Cost>10000</Cost></OrderDemo></new></tuple></UpdateFieldsTestRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML sent for update");
			}
		});



		strictEqual(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		strictEqual(orderDemoObjects[0].Notes(), "Create Order Demo2", "Observable merged with the response data");

		strictEqual(orderDemoObjects[0].Customer(), undefined, "Observable set to undefined if not found with the response data after updation");

		ok(ko.isObservable(orders[0].Cost), "Observable merged even if attribute is not present in response");
		strictEqual(typeof (orders[0].Cost()), "undefined", "Merged observable has undefined value after update");

		ok(ko.isObservable(orders[0].Status), "Observable merged even if attribute is not present in fields after update");
		strictEqual(orders[0].Status(), "JUMPED", "Merged observable has correct value after update");


		ok(ko.isObservable(orders[0].StatusMessage), "Observable merged for computed field after update");
		strictEqual(orders[0].StatusMessage(), "1160 JUMPED", "Merged Computed field has correct value after update");

		ok(ko.isObservable(orders[0].Birthday), "Observable merged for field with path even if the path does not exist after update");
		strictEqual(orders[0].Birthday(), "2012-07-10T10:29:16.140000002", "Merged field with path has correct value after update");


		start();
	});

	test("Update and Delete Business Object with fields attribute", function () {
		stop();

		orderDemoModel.clear();
		var objects = orderDemoModel.putData({
			tuple:
			[
				{
					old: {
						OrderDemo: {
							"OrderID": "158",
							"Customer": "fj",
							"Employee": "ss",
							"OrderDate": "2012-07-10 10:29:16.140000000",
							"Status": "CREATED",
							"Notes": "test",
							OrderDemoLines: {
								"Product": "Tyre",
								"Quantity": "160",
								"Price": "2600",
								"ShippedFrom": "Africa"
							}
						}
					}
				},
				{
					old: {
						OrderDemo: {
							"OrderID": "159",
							"Customer": "csc",
							"Employee": "ss",
							"Discount": "21",
							"Status": "CREATED",
							"Cost": "1",
							OrderDemoLines: [{
								"Product": "Rim",
								"Quantity": "160",
								"Price": "16000"
							}, {
								"Product": "Steering",
								"Quantity": "40",
								"Price": "90000"
							}
							]
						}
					}
				},
				{
					old: {
						OrderDemo: {
							"OrderID": "161",
							"Customer": "csc",
							"Employee": "ss",
							"Status": "CREATED",
							"OrderDate": "2012-07-10 12:15:17.257",
							"Discount": "21",
							"Cost": "2"
						}
					}
				}

			 ]
		});


		equal(objects.length, 3, "Added 3 objects to the model using putdata");
		// Insert a new Business Object using create with the fields attribute. See that the observables added from fields definition are not send
		orderDemoModel.addBusinessObject({ OrderID: 160, Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Status: "CREATED", Notes: "Create Order Demo", "OrderDate": "2012-07-10T10:29:16.140000000" });
		var orders = orderDemoModel.OrderDemo();
		equal(orders.length, 4, "Added BO, but not synchronized yet. 1 record in the model");

		ok(ko.isObservable(orders[3].Cost), "Observable added even if attribute is not present in response");
		strictEqual(typeof (orders[3].Cost()), "undefined", "Added observable has undefined value");

		ok(ko.isObservable(orders[3].Status), "Observable added even if attribute is not present in fields");
		strictEqual(orders[3].Status(), "CREATED", "Added observable has correct value");


		ok(ko.isObservable(orders[3].StatusMessage), "Observable added for computed field");
		strictEqual(orders[3].StatusMessage(), "160 CREATED", "Computed field has correct value");

		ok(ko.isObservable(orders[3].Birthday), "Observable added for field with path even if the path does not exist");
		strictEqual(orders[3].Birthday(), "2012-07-10T10:29:16.140000000", "Field with path has correct value");

		orders[3].Status("COMPLETED");

		response = orderDemoModel.create({
			method: "InsertFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><InsertFieldsTestRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>COMPLETED</Status><Notes>Create Order Demo</Notes><OrderDate>2012-07-10T10:29:16.140000000</OrderDate><BirthDate/><Cost/></OrderDemo></new></tuple></InsertFieldsTestRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML sent for create");
			}
		});

		orders[0].Status("DISCOVERED");
		orders[0].OrderDemoLines.Price(2000);
		orders[1].OrderDemoLines()[1].Price(2000);

		equal(orders[0].Status(), "DISCOVERED", "Checking the status after sync using synchronize method.");
		equal(orders[0].OrderDemoLines.Price(), 2000, "Updated Price");
		equal(orders[1].OrderDemoLines()[1].Price(), 2000, "Updated Price");

		// Changes in the observables added by fields attribute should not trigger updates
		
		orderDemoModel.synchronize({
			method: "SyncFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><SyncFieldsTestRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>158</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Status>CREATED</Status><Notes>test</Notes><OrderDemoLines><Product>Tyre</Product><Quantity>160</Quantity><Price>2600</Price><ShippedFrom>Africa</ShippedFrom></OrderDemoLines></OrderDemo></old><new><OrderDemo><OrderID>158</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Status>DISCOVERED</Status><Notes>test</Notes><OrderDemoLines><Product>Tyre</Product><Quantity>160</Quantity><Price>2000</Price><ShippedFrom>Africa</ShippedFrom></OrderDemoLines><BirthDate/><Cost/></OrderDemo></new></tuple><tuple><old><OrderDemo><OrderID>159</OrderID><Customer>csc</Customer><Employee>ss</Employee><Discount>21</Discount><Status>CREATED</Status><Cost>1</Cost><OrderDemoLines><Product>Rim</Product><Quantity>160</Quantity><Price>16000</Price></OrderDemoLines><OrderDemoLines><Product>Steering</Product><Quantity>40</Quantity><Price>90000</Price></OrderDemoLines></OrderDemo></old><new><OrderDemo><OrderID>159</OrderID><Customer>csc</Customer><Employee>ss</Employee><Discount>21</Discount><Status>CREATED</Status><Cost>1</Cost><OrderDemoLines><Product>Rim</Product><Quantity>160</Quantity><Price>16000</Price></OrderDemoLines><OrderDemoLines><Product>Steering</Product><Quantity>40</Quantity><Price>2000</Price></OrderDemoLines><BirthDate/></OrderDemo></new></tuple></SyncFieldsTestRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML sent for update");
			}
		}).done(function(responseObject){
			orders = orderDemoModel.OrderDemo();
			equal(orders.length, 4, "4 records found");
			equal(orders[0].Status(), "DISCOVERED", "Checking the status after sync using synchronize method.");
			equal(orders[0].OrderDemoLines.Price(), "2000", "Updated Price");
			equal(orders[1].OrderDemoLines()[1].Price(), "2000", "Updated Price");
		});

		orderDemoModel.synchronize({
			method: "SyncFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		orderDemoModel.removeBusinessObject(orders[0]);

		equal(orders[0].OrderID(), "158", "OrderID of first record");
		equal(orders[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orders[1].OrderID(), "159", "OrderID of second record");
		equal(orders[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		orderDemoModel['delete']({
			method: "DeleteFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteFieldsTestRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>158</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Status>DISCOVERED</Status><Notes>test</Notes><OrderDemoLines><Product>Tyre</Product><Quantity>160</Quantity><Price>2000</Price><ShippedFrom>Africa</ShippedFrom></OrderDemoLines></OrderDemo></old></tuple></DeleteFieldsTestRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML sent for update");
			}
		});

		equal(orders.length, 3, "1 record deleted. 3 left.");
				
		orderDemoModel['delete']({
			method: "DeleteFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
			console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		})

		start();
	});


})(window, jQuery)