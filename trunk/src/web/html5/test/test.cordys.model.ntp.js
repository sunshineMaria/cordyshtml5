(function (window, $) {

	module("Model Plugin with Non-Tuple Protocol");

	var orderDemoModel = new $.cordys.model({
		objectName: "OrderDemo",
		isReadOnly: false,
		useTupleProtocol: false,
		defaults: {
			namespace: "http://schemas.cordys.com/html5sdk/orderdemo/1.0",
			async: false,
			dataType: "json"
		}
	});


	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetOrdersNTPRequest/,
		responseText: {
			OrderDemo: [{
						"OrderID": "160",
						"Customer": "fj",
						"Employee": "ss",
						"OrderDate": "2012-07-10T10:29:16.140000001",
						"Product": "aa",
						"Quantity": "4",
						"Discount": "21",
						"Status": "RECOVERED",
						"Notes": "Create Order Demo1"
					},
					{
						"OrderID": "161",
						"Customer": "uhg",
						"Employee": "uu",
						"OrderDate": "2012-07-10T10:29:16.140000001",
						"Product": "aa",
						"Quantity": "4",
						"Discount": "21",
						"Status": "RECOVERED",
						"Notes": "Create Order Demo1"
					},
					{
						"OrderID": "162",
						"Customer": "philips",
						"Employee": "vv",
						"OrderDate": "2012-07-10T10:29:16.140000001",
						"Product": "aa",
						"Quantity": "4",
						"Discount": "21",
						"Status": "RECOVERED",
						"Notes": "Create Order Demo1"
					},
					{
						"OrderID": "163",
						"Customer": "acme",
						"Employee": "ww",
						"OrderDate": "2012-07-10T10:29:16.140000001",
						"Product": "aa",
						"Quantity": "4",
						"Discount": "21",
						"Status": "RECOVERED",
						"Notes": "Create Order Demo1"
					}
			]
		}
	});

	//1 Read with Non-tuple protocol

	test("Read with Non-tuple protocol", 4, function () {
		stop();
		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "no records in the model");

		response = orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found.");
		equal(orderDemoObjects[0].OrderID(), "160");
		start();
	});


	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /CreateNTPOrderDemo/,
		responseText: {
			OrderDemo: {
				"OrderID": "160",
				"Customer": "fj",
				"Employee": "ss",
				"OrderDate": "2012-07-10T10:29:16.140000000",
				"Product": "aa",
				"Quantity": "4",
				"Discount": "21",
				"Cost": "123456",
				"Status": "CREATED",
				"Notes": "Create Order Demo"
			}
		}
	});

	//2 AddBO/Create/Sync(with no change) Insert a new Business Object in NTP using create

	test("Insert a new Business Object in NTP using create - AddBO/Create/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute Employee of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Object added returns the correct value");

		response = orderDemoModel.create({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></CreateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");


		response = orderDemoModel.synchronize({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be inserted");
		});
		start();
	});

	//3. AddBO/Create/Create(with no change) - Insert a new Businss Object using create

	test("Insert a new Business Object in NTP using create - AddBO/Create/Create(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute Employee of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Object added returns the correct value");

		response = orderDemoModel.create({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></CreateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");


		response = orderDemoModel.create({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be inserted");
		});
		start();
	});

	//4. AddBO/Sync/Create(with no change) - Insert a new Businss Object using sync

	test("Insert a new Business Object in NTP using sync - AddBO/Sync/Create(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute Employee of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Object added returns the correct value");

		response = orderDemoModel.synchronize({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></CreateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");


		response = orderDemoModel.create({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be inserted");
		});
		start();
	});

	//5. AddBO/Sync/Sync(with no change) - Insert a new Businss Object using sync

	test("Insert a new Business Object in NTP using sync - AddBO/Sync/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute Employee of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Object added returns the correct value");

		response = orderDemoModel.synchronize({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></CreateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");


		response = orderDemoModel.synchronize({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be inserted");
		});
		start();
	});

	//6. AddBO/Update/Sync 

	test("AddBO/Update/Sync", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute Employee of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Object added returns the correct value");

		response = orderDemoModel.update({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		
		response = orderDemoModel.synchronize({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></CreateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");
				
		start();
	});

	//7. AddBO/Delete/Sync 

	test("AddBO/Delete/Sync ", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute Employee of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Object added returns the correct value");

		response = orderDemoModel['delete']({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be deleted");
		});
		
		response = orderDemoModel.synchronize({
			method: "CreateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></CreateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");
				
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateNTPOrderDemo/,
		responseText: {
			OrderDemo: {
						"OrderID": "160",
						"Customer": "fj",
						"Employee": "ss",
						"OrderDate": "2012-07-10T10:29:16.140000001",
						"Product": "aa",
						"Quantity": "4",
						"Discount": "21",
						"Status": "UPDATED",
						"Notes": "Create Order Demo1"
						}
		}
	});

	//8. Read/ChangeBO/Update/Update(with no change) - Update an existing Business Object using update

	test("Update an existing Business Object using update - Read/ChangeBO/Update/Update(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "RECOVERED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel.update({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		response.done(function(responseObject){
		debugger;
			orderDemoObjects = orderDemoModel.OrderDemo();
			equal(orderDemoObjects.length, 4, "4 records found");
			equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
			equal(responseObject.OrderDemo.Status, "UPDATED", "Status in updated BO");
		});

		response = orderDemoModel.update({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		start();
	});

	//9. Read/ChangeBO/Update/Sync(with no change) - Update an existing Business Object using update

	test("Update an existing Business Object using update - Read/ChangeBO/Update/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "RECOVERED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel.update({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		response.done(function(responseObject){
			orderDemoObjects = orderDemoModel.OrderDemo();
			equal(orderDemoObjects.length, 4, "4 records found");
			equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
			equal(responseObject.OrderDemo.Status, "UPDATED", "Status in updated BO");
		});

		response = orderDemoModel.synchronize({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		start();
	});

	//10. Read/ChangeBO/Create/Update - Request should not be sent when using method Create to do an update

	test("Read/ChangeBO/Create/Update", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "RECOVERED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel.create({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		
		response = orderDemoModel.update({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		response.done(function(responseObject){
			orderDemoObjects = orderDemoModel.OrderDemo();
			equal(orderDemoObjects.length, 4, "4 records found");
			equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
			equal(responseObject.OrderDemo.Status, "UPDATED", "Status in updated BO");
		});
		
		start();
	});

	//11. Read/ChangeBO/Delete/Update - Request should not be sent when using method Delete to do an update

	test("Read/ChangeBO/Delete/Update", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "RECOVERED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel['delete']({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		
		response = orderDemoModel.update({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		response.done(function(responseObject){
			orderDemoObjects = orderDemoModel.OrderDemo();
			equal(orderDemoObjects.length, 4, "4 records found");
			equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
			equal(responseObject.OrderDemo.Status, "UPDATED", "Status in updated BO");
		});
		
		start();
	});

	//12. Read/ChangeBO/Sync/Sync(with no change) - Update an existing Business Object using sync

	test("Update an existing Business Object using update - Read/ChangeBO/Update/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "RECOVERED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel.synchronize({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		response.done(function(responseObject){
			orderDemoObjects = orderDemoModel.OrderDemo();
			equal(orderDemoObjects.length, 4, "4 records found");
			equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
			equal(responseObject.OrderDemo.Status, "UPDATED", "Status in updated BO");
		});

		response = orderDemoModel.synchronize({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		start();
	});

	//13. Read/ChangeBO/Sync/Update(with no change) - Update an existing Business Object using sync

	test("Update an existing Business Object using update - Read/ChangeBO/Update/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "RECOVERED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel.synchronize({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		response.done(function(responseObject){
			orderDemoObjects = orderDemoModel.OrderDemo();
			equal(orderDemoObjects.length, 4, "4 records found");
			equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
			equal(responseObject.OrderDemo.Status, "UPDATED", "Status in updated BO");
		});

		response = orderDemoModel.update({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteNTPOrderDemo/,
		responseText: {
			OrderDemo: {
					"OrderID": "160",
					"Customer": "fj",
					"Employee": "ss",
					"OrderDate": "2012-07-10T10:29:16.140000000",
					"Product": "aa",
					"Quantity": "4",
					"Discount": "21",
					"Cost": "123456",
					"Status": "DELETED",
					"Notes": "test"
				}
		}
	});

	//14. Read/removeBO/Delete/Delete(with no change) - Delete an existing Business Object using delete

	test("Delete an existing Business Object using delete - Read/removeBO/Delete/Delete(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 4, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel['delete']({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></DeleteNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3, "Record in queue for deletion is removed using delte method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "Record with ID 160 deleted. So OrderID of first record in model object now is 161");

		response = orderDemoModel['delete']({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be deleted");
		});

		start();
	});

	//15. Read/removeBO/Delete/Sync(with no change) - Delete an existing Business Object using delete

	test("Delete an existing Business Object using delete - Read/removeBO/Delete/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 4, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel['delete']({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></DeleteNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3, "Record in queue for deletion is removed using delte method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "Record with ID 160 deleted. So OrderID of first record in model object now is 161");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be deleted");
		});

		start();
	});

	//16. Read/removeBO/Sync/Sync(with no change) - Delete an existing Business Object using sync

	test("Delete an existing Business Object using sync - Read/removeBO/Sync/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 4, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel.synchronize({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></DeleteNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3, "Record in queue for deletion is removed using delte method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "Record with ID 160 deleted. So OrderID of first record in model object now is 161");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be deleted");
		});
		
		start();
	});

	//17. Read/removeBO/Sync/Delete(with no change) - Delete an existing Business Object using sync

	test("Delete an existing Business Object using sync - Read/removeBO/Sync/Delete(with no change)", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 4, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel.synchronize({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></DeleteNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3, "Record in queue for deletion is removed using delte method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "Record with ID 160 deleted. So OrderID of first record in model object now is 161");

		response = orderDemoModel['delete']({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be deleted");
		});

		start();
	});

	//18. Read/removeBO/Create/Sync - Request should not be sent when using method create to removeBO and sync

	test("Read/removeBO/Create/Sync", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 4, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel.create({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be deleted");
		});
		
		response = orderDemoModel.synchronize({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></DeleteNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3, "Record in queue for deletion is removed using delte method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "Record with ID 160 deleted. So OrderID of first record in model object now is 161");
		
		start();
	});

	//19. Read/removeBO/Update/Sync - Request should not be sent when using method update to removeBO and sync

	test("Read/removeBO/Create/Sync", function () {
		stop();

		orderDemoModel.clear();
		var orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 4, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel.update({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be deleted");
		});
		
		response = orderDemoModel.synchronize({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></DeleteNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3, "Record in queue for deletion is removed using delte method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "Record with ID 160 deleted. So OrderID of first record in model object now is 161");
		
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /ReadNTPOrderDemoObjectInvalidInputParameter/,
		responseText: "<SOAP:Envelope xmlns:SOAP=\"http://schemas.xmlsoap.org/soap/envelope/\">\
						<SOAP:Header xmlns:SOAP=\"http://schemas.xmlsoap.org/soap/envelope/\">\
							<header xmlns:SOAP=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns=\"http://schemas.cordys.com/General/1.0/\">\
								<msg-id>00215A60-3EB8-11E2-E5E1-79042180D6EA</msg-id>\
								<license>License has expired since 162 day(s)</license>\
							</header>\
						</SOAP:Header>\
						<SOAP:Body>\
							<SOAP:Fault>\
								<faultcode xmlns:ns0=\"http://schemas.xmlsoap.org/soap/envelope/\">ns0:Server</faultcode>\
								<faultstring xml:lang=\"en-US\">Database read failed.</faultstring>\
								<faultactor>http://schemas.cordys.com/html5sdk/orderdemo/1.0</faultactor>\
								<detail>\
									<cordys:FaultDetails xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">\
										<cordys:LocalizableMessage xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">\
											<cordys:MessageCode xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">Cordys.DBConnectors.Messages.databaseReadError</cordys:MessageCode>\
										</cordys:LocalizableMessage>\
									</cordys:FaultDetails>\
									<error xmlns:SOAP=\"http://schemas.xmlsoap.org/soap/envelope/\" TYPE=\"Enumeration\">\
										<elem>Failed to map parameter OrderID to the appropriate database data type</elem>\
										<elem>Error while setting the parameters to the request</elem><elem>Executing statement is not completed</elem>\
											<cordys:LocalizableMessage xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">\
												<cordys:MessageCode>Cordys.Database.Native.Messages.paramConversionError</cordys:MessageCode>\
												<cordys:Insertion>OrderID</cordys:Insertion>\
											</cordys:LocalizableMessage>\
									</error>\
								</detail>\
							</SOAP:Fault>\
						</SOAP:Body>\
					</SOAP:Envelope>"
	});

	//20. Read Business Object with Invalid Input Parameter

	test("Read Business Object with Invalid Input Parameter", 3, function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		response = orderDemoModel.read({
			method: "ReadNTPOrderDemoObjectInvalidInputParameter",
			parameters: {
				OrderID: "a"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ReadNTPOrderDemoObjectInvalidInputParameter xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderID>a</OrderID></ReadNTPOrderDemoObjectInvalidInputParameter></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				return false;
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "No record in the model");
		start();
	});

	//21. Read/Sync Synchronize without any change   

	test("Read Synchronize without any change", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		response = orderDemoModel.synchronize({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		})

		orderDemoObjectsAfterSync = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsAfterSync, "BOs same before and after sync");
		start();
	});

	//22. Read/Update(with no change)

	test("Read/Update(with no change) - Update fail as no change in data", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		response = orderDemoModel.update({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		})

		orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsAfterUpdate, "BOs same before and after update");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /CreateNTPBODuplicateOrderID/,
		responseText: "<SOAP:Fault xmlns:SOAP=\"http://schemas.xmlsoap.org/soap/envelope/\">\
				<faultcode xmlns:ns0=\"http://schemas.xmlsoap.org/soap/envelope/\"></faultcode>\
				<faultstring xml:lang=\"en-US\">Database update failed.</faultstring>\
				<faultactor>http://schemas.cordys.com/html5sdk/orderdemo/1.0</faultactor>\
				<detail>\
					<cordys:FaultDetails xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">\
						<cordys:LocalizableMessage xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">\
							<cordys:MessageCode xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">Cordys.DBConnectors.Messages.databaseUpdateError</cordys:MessageCode>\
						</cordys:LocalizableMessage>\
					</cordys:FaultDetails>\
					<UpdateOrderDemo>\
						<tuple>\
							<new>\
								<OrderDemo>\
									<OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>1</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create OrderDemo Object Duplicate OrderID</Notes>\
								</OrderDemo>\
							</new>\
							<error>\
								<elem>Failed to map parameter OrderDate to the appropriate database data type</elem>\
								<cordys:LocalizableMessage xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">\
									<cordys:MessageCode>Cordys.Database.Native.Messages.paramConversionError</cordys:MessageCode>\
									<cordys:Insertion>OrderDate</cordys:Insertion>\
								</cordys:LocalizableMessage>\
							</error>\
						</tuple>\
					</UpdateOrderDemo>\
				</detail>\
			</SOAP:Fault>"
	});

	//23. Insert a new Businss Object with duplicate pKey

	test("Create OrderDemo Object Duplicate OrderID", 6, function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records in the model");
		orderDemoModel.addBusinessObject({ OrderID: "160", Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "test" });

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 5);

		response = orderDemoModel.create({
			method: "CreateNTPBODuplicateOrderID",
			beforeSend: function (jqXHR, settings) {
			console.log(settings.data);
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateNTPBODuplicateOrderID xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></CreateNTPBODuplicateOrderID></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			error: function () {
				return false;
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[4]);
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4);

		start();
	});

	//24. Read/removeBO/sync- Delete a non existing record   

	test("Read/removeBO/sync-Delete a non existing record using sync", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records in model object");

		orderDemoModel.removeBusinessObject({ OrderID: "25", Customer: "fj", Employee: "ss", Product: "aa", OrderDate: "2012-07-10T10:29:16.140000000", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "test" });

		response = orderDemoModel.synchronize({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		})

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "no records deleted");
		start();
	});

	//25. Read/removeBO/delete- Delete a non existing record 

	test("Read/removeBO/delete- Delete a non existing record using delete", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "4 records in model object");

		orderDemoModel.removeBusinessObject({ OrderID: "25", Customer: "fj", Employee: "ss", Product: "aa", OrderDate: "2012-07-10T10:29:16.140000000", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "test" });

		response = orderDemoModel['delete']({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		})
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "no records deleted");
		start();
	});

	//26. addBO/revert/sync - Add a BO and revert inserion

	test("Add a BO and revert inserion - addBO/revert/sync", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "test" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 BO added");

		orderDemoModel.revert();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "no record found after insertion reverted");

		response = orderDemoModel.synchronize({
			method: "CreateBORevertInsertion",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		})
		start();
	});

	//27. addBO/revert/create - Add a BO and revert inserion

	test("Add a BO and revert inserion - addBO/revert/create", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "test" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 BO added");

		orderDemoModel.revert();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "no record found after insertion reverted");

		response = orderDemoModel.create({
			method: "CreateBORevertInsertion",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be inserted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		})
		start();
	});

	

})(window, jQuery)