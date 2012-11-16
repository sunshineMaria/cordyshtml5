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
			method: "DeleteNTPOrderDemo",
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
			method: "DeleteNTPOrderDemo",
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
			method: "DeleteNTPOrderDemo",
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
			method: "DeleteNTPOrderDemo",
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
			method: "DeleteNTPOrderDemo",
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
		});

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
		});

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
		});

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
		});
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
			method: "CreateNTPBORevertInsertion",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
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
			method: "CreateNTPBORevertInsertion",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be inserted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		start();
	});

	//28. read/updateBO/revert/update - Update a BO and revert updation 

	test("Update OrderDemo Object Revert Updation - read/updateBO/revert/update", function () {
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		var statusBeforeUpdate = orderDemoObjects[0].Status();
		orderDemoObjects[0].Status("UPDATED");
		var orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
		notEqual(statusBeforeUpdate, orderDemoObjectsAfterUpdate[0].Status(), "Record updated in the model object");

		orderDemoModel.revert();
		orderDemoObjectsRevertUpdate = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertUpdate, "update reverted in the record");

		response = orderDemoModel.update({
			method: "UpdateBORevertUpdation",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be updaetd, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		start();
	});
	
	//29. read /updateBO/revert/sync - Update OrderDemo Object Revert Updation

	test("Update OrderDemo Object Revert Updation - read /updateBO/revert/sync", function () {
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		var statusBeforeUpdate = orderDemoObjects[0].Status();
		orderDemoObjects[0].Status("UPDATED");
		var orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
		notEqual(statusBeforeUpdate, orderDemoObjectsAfterUpdate[0].Status(), "Record updated in the model object");

		orderDemoModel.revert();
		orderDemoObjectsRevertUpdate = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertUpdate, "update reverted in the record");

		response = orderDemoModel.synchronize({
			method: "UpdateBORevertUpdation",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be updaetd, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		start();
	});

	//30. read/removeBO/revert/delete - Delete a BO and revert deletion

	test("Delete OrderDemo Object Revert Deletion - read/removeBO/revert/delete", function () {
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
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");

		orderDemoModel.revert();

		orderDemoObjectsRevertDelete = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertDelete, "delete reverted in the record");
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects[0]._destroy, undefined, "Destroy flag is removed for the record");

		response = orderDemoModel['delete']({
			method: "DeleteBORevertDeletion",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		start();
	});

	//31. read/removeBO/revert/sync - Delete OrderDemo Object Revert Deletion

	test("Delete OrderDemo Object Revert Deletion - read/removeBO/revert/sync", function () {
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
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");

		orderDemoModel.revert();

		orderDemoObjectsRevertDelete = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertDelete, "delete reverted in the record");
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects[0]._destroy, undefined, "Destroy flag is removed for the record");

		response = orderDemoModel.synchronize({
			method: "DeleteBORevertDeletion",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /InsertBORevertInsertNew/,
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
					"Notes": "Insert BO Revert Insertion and Inser a new BO"
				}
		}
	});

	//32. addBO/revert/addBO/sync - Add a BO, revert inserion and insert BO 

	test("Insert BO Revert Insertion and Insert a new BO - addBO/revert/addBO/sync", 5, function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "BO for revertion" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 record added to the model object");

		orderDemoModel.revert();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "added BO is reverted");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Insert BO Revert Insertion and Inser a new BO" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 record added to the model object");

		response = orderDemoModel.synchronize({
			method: "InsertBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><InsertBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Insert BO Revert Insertion and Inser a new BO</Notes></OrderDemo></InsertBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateBOInsertNew/,
		responseText: {
			OrderDemo: [{
						"OrderID": "160",
						"Customer": "fj",
						"Employee": "ss",
						"OrderDate": "2012-07-10T10:29:16.140000000",
						"Product": "aa",
						"Quantity": "4",
						"Discount": "21",
						"Cost": "123456",
						"Status": "UPDATED",
						"Notes": "Updated"
					},
					{
						"OrderID": "170",
						"Customer": "fj",
						"Employee": "ss",
						"OrderDate": "2012-07-10T10:29:16.140000000",
						"Product": "aa",
						"Quantity": "4",
						"Discount": "21",
						"Cost": "123456",
						"Status": "CREATED",
						"Notes": "Update BO and Insert a new BO"
					}
			]
		}		
	});

	//33. read/updateBO/addBO/sync - Update a BO and insert BO

	test("Update BO and Insert a new BO - read/updateBO/addBO/sync", 7, function () {
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
		equal(orderDemoObjects.length, 4, "4 records found after read");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after update");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO and Insert a new BO" });
		response = orderDemoModel.synchronize({
			method: "UpdateBOInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBOInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO and Insert a new BO</Notes></OrderDemo></UpdateBOInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 5, "5 records found after sync");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Comparing the Updated Record");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateBORevertInsertNew/,
		responseText: {
			tuple:
				{
					'new': {
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
							"Notes": "Update BO Revert Insertion and Inser a new BO"
						}
					}
				}
		}
	});

	//34. Read/updateBO/revert/addBO/sync - Update a BO, revert updation and insert BO  

	test("Update BO Revert Update and Insert a new BO - Read/updateBO/revert/addBO/sync", 6, function () {
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		statusBeforeUpdate = orderDemoObjects[0].Status();
		orderDemoObjects[0].Status("UPDATED");
		orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
		notEqual(statusBeforeUpdate, orderDemoObjectsAfterUpdate[0].Status(), "Record updated in the model object");

		orderDemoModel.revert();
		orderDemoObjectsRevertUpdate = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertUpdate, "update reverted in the record");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO Revert Insertion and Inser a new BO" });
		response = orderDemoModel.synchronize({
			method: "UpdateBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></UpdateBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		start();
	});

	//35. Read/updateBO/revert/addBO/create - Update BO Revert Update and Insert a new BO

	test("Update BO Revert Update and Insert a new BO - Read/updateBO/revert/addBO/create", 6, function () {
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		statusBeforeUpdate = orderDemoObjects[0].Status();
		orderDemoObjects[0].Status("UPDATED");
		orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
		notEqual(statusBeforeUpdate, orderDemoObjectsAfterUpdate[0].Status(), "Record updated in the model object");

		orderDemoModel.revert();
		orderDemoObjectsRevertUpdate = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertUpdate, "update reverted in the record");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO Revert Insertion and Inser a new BO" });
		response = orderDemoModel.create({
			method: "UpdateBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></UpdateBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		start();
	});

	//36. Read/updateBO/revert/addBO/update - Update BO Revert Update and Insert a new BO

	test("Update BO Revert Update and Insert a new BO - Read/updateBO/revert/addBO/update", 6, function () {
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		statusBeforeUpdate = orderDemoObjects[0].Status();
		orderDemoObjects[0].Status("UPDATED");
		orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
		notEqual(statusBeforeUpdate, orderDemoObjectsAfterUpdate[0].Status(), "Record updated in the model object");

		orderDemoModel.revert();
		orderDemoObjectsRevertUpdate = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertUpdate, "update reverted in the record");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO Revert Insertion and Inser a new BO" });
		response = orderDemoModel.update({
			method: "UpdateBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be updated, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		start();
	});

	//37. addBO/removeBO/Sync - Insert a BO, delete the inserted BO and sync

	test("Insert a BO, delete the inserted BO and sync - addBO/removeBO/Sync", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "BO for revertion" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 record in model after addBO");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Obejct added returns the correct value");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "added BO is deleted");

		response = orderDemoModel.synchronize({
			method: "DeleteAfterInsertBO",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		start();
	});

	//38. addBO/removeBO/Create 

	test("addBO/removeBO/Create", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "BO for revertion" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 record in model after addBO");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Obejct added returns the correct value");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "added BO is deleted");

		response = orderDemoModel.create({
			method: "DeleteAfterInsertBO",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		start();
	});

	//39. addBO/removeBO/Delete

	test("addBO/removeBO/Delete", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "BO for revertion" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 record in model after addBO");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Obejct added returns the correct value");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "added BO is deleted");

		response = orderDemoModel['delete']({
			method: "DeleteAfterInsertBO",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
		start();
	});

	//40. addBO/removeBO/Update

	test("addBO/removeBO/Update", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "BO for revertion" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 record in model after addBO");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Obejct added returns the correct value");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "added BO is deleted");

		response = orderDemoModel.update({
			method: "DeleteAfterInsertBO",
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
		data: /DeleteBORevertInsertNew/,
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
					"Notes": "Insert BO Revert Insertion and Inser a new BO"
				}
		}
	});

	//41. Read/removeBO/revert/addBO/update/sync - Delete a BO, revert deletion and insert BO

	test("Delete BO Revert Deletion and Insert a new BO - Read/removeBO/revert/addBO/update/sync", function () {
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");
		orderDemoModel.revert();

		orderDemoObjectsRevertDelete = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertDelete, "delete reverted in the record");
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "Deletion of BO reverted");
		equal(orderDemoObjects[0]._destroy, undefined, "Deletion Reverted");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO Revert Insertion and Inser a new BO" });
		response = orderDemoModel.update({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request send after reverting a deleted object");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		response = orderDemoModel.synchronize({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></DeleteBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML. Should only have the inserted object");
			}
		});

		response = orderDemoModel.update({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Request send after reverting a deleted object");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		start();
	});

	//42. Read/removeBO/revert/addBO/create - Delete BO Revert Deletion and Insert a new BO

	test("Delete BO Revert Deletion and Insert a new BO - Read/removeBO/revert/addBO/create", function () {
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");
		orderDemoModel.revert();

		orderDemoObjectsRevertDelete = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertDelete, "delete reverted in the record");
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "Deletion of BO reverted");
		equal(orderDemoObjects[0]._destroy, undefined, "Deletion Reverted");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO Revert Insertion and Inser a new BO" });
		response = orderDemoModel['delete']({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request send after reverting a deleted object");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		response = orderDemoModel.create({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></DeleteBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML. Should only have the inserted object");
			}
		});

		response = orderDemoModel.update({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Request send after reverting a deleted object");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});

		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateNTPBOOnDeletedBO/,
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
						</detail>\
					</SOAP:Fault>"
	});

	//43. Read/removeBO/upateBO/Sync - Update BO on BO that is deleted

	test("Update BO on BO that is deleted - Read/removeBO/upateBO/Sync", 5, function () {
		stop();
		orderDemoModel.clear();
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");

		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Notes("Updation on Deleted BO");
		var updatedNotes = orderDemoObjects[0].Notes();

		response = orderDemoModel.synchronize({
			method: "UpdateNTPBOOnDeletedBO",
			error: function () {
				return false;
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPBOOnDeletedBO xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPBOOnDeletedBO></SOAP:Body></SOAP:Envelope>";
				notEqual($($.parseXML(settings.data)).find("Notes").text(), updatedNotes);
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		start();
	});
		
	//44. Read/removeBO/upateBO/Delete - Update BO on BO that is deleted

	test("Update BO on BO that is deleted - Read/removeBO/upateBO/Delete", 5, function () {
		stop();
		orderDemoModel.clear();
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
		equal(orderDemoObjects.length, 4, "4 records in model after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");

		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Notes("Updation on Deleted BO");
		var updatedNotes = orderDemoObjects[0].Notes();

		response = orderDemoModel['delete']({
			method: "UpdateNTPBOOnDeletedBO",
			error: function () {
				return false;
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPBOOnDeletedBO xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPBOOnDeletedBO></SOAP:Body></SOAP:Envelope>";
				notEqual($($.parseXML(settings.data)).find("Notes").text(), updatedNotes);
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /ReadNTPBOOnDeletedBO/,
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
						</detail>\
					</SOAP:Fault>"
	});

	//45. Read/removeBO/Sync/Read - Read BO on BO that is deleted

	test("Read BO on BO that is deleted - Read/removeBO/Sync/Read", function () {
		stop();
		orderDemoModel.clear();
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

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		response = orderDemoModel.synchronize({
			method: "DeleteNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>RECOVERED</Status><Notes>Create Order Demo1</Notes></OrderDemo></DeleteNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3, "3 records found. 1 record deleted");
		orderDemoModel.clear();
		response = orderDemoModel.read({
			method: "ReadNTPBOOnDeletedBO",
			parameters: {
				OrderID: "160"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ReadNTPBOOnDeletedBO xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderID>160</OrderID></ReadNTPBOOnDeletedBO></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			error: function () {
				return false;
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "no record found");

		start();
	});

	// Tests with async read

	var orderDemoAsyncModel = new $.cordys.model({
		objectName: "OrderDemo",
		isReadOnly: false,
		useTupleProtocol: false,
		defaults: {
			namespace: "http://schemas.cordys.com/html5sdk/orderdemo/1.0",
			async: true,
			dataType: "json",
			error: function () {
				return false;
			}
		}
	});

	//46. Async Read 

	test("AsyncRead two OrderDemo Objects", function () {
		stop();
		orderDemoAsyncModel.clear();
		orderDemoObjects = orderDemoAsyncModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "no records in the model");

		orderDemoAsyncModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			success: function (data, textStatus, jqXHR) {
				orderDemoObjects = orderDemoAsyncModel.OrderDemo();
				equal(orderDemoObjects.length, 4, "4 records found. Read two BO.");
				equal(orderDemoObjects[0].OrderID(), "160");
				start();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				ok(false, "Failed in read. Error Thrown : " + errorThrown);
			}
		});
		
		orderDemoObjects = orderDemoAsyncModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Async Read. Success handler not executed yet.");
		
	});

	//47. AsyncRead/ChangeBO/Update/Update(with no change) - Update an existing Business Object using update

	test("Update an existing Business Object using update - AsyncRead/ChangeBO/Update/Update(with no change)", function () {
		stop();

		orderDemoAsyncModel.clear();
		orderDemoObjects = orderDemoAsyncModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoAsyncModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			success: function (data, textStatus, jqXHR) {
				orderDemoObjects = orderDemoAsyncModel.OrderDemo();
				equal(orderDemoObjects.length, 4, "4 records found after read");
				equal(orderDemoObjects[0].OrderID(), "160");
				equal(orderDemoObjects[0].Status(), "RECOVERED", "Status before updating");
				orderDemoObjects[0].Status("TEST UPDATE");
				equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
				orderDemoObjects[0].Status("UPDATED");
				equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

				orderDemoAsyncModel.update({
					method: "UpdateNTPOrderDemo",
					beforeSend: function (jqXHR, settings) {
						var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
						equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
					},
					success: function (data, textStatus, jqXHR) {
						orderDemoObjects = orderDemoAsyncModel.OrderDemo();
						equal(orderDemoObjects.length, 4, "4 records found");
						equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
						equal($.parseJSON(jqXHR.responseText).OrderDemo.Status, "UPDATED", "Status");
					},
					error: function (jqXHR, textStatus, errorThrown) {
						ok(false, "Failed in read in Read/ChangeBO/Update. Error Thrown : " + errorThrown);
					}
				});
				response = orderDemoAsyncModel.update({
					method: "UpdateNTPOrderDemo",
					beforeSend: function (jqXHR, settings) {
						console.log(settings.data);
						ok(false, "No data to be synchronized, But yet request firing");
					}
				}).always(function(responseObject, statusText) {
					equal(statusText, "canceled", "Request cancelled as no data to be updated");
				});
				start();
				
			},
			error: function (jqXHR, textStatus, errorThrown) {
				ok(false, "Failed in read in Read. Error Thrown : " + errorThrown);
				start();
			}
		});

		orderDemoObjects = orderDemoAsyncModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Async Read. Success handler not executed yet.");

	});
	
	//48. AsyncRead/Update/ChangeBO/Update/Update(with no change) - Update an existing Business Object using update

	test("Update an existing Business Object using update - AsyncRead/ChangeBO/Update/Update(with no change)", function () {
		stop();

		orderDemoAsyncModel.clear();
		orderDemoObjects = orderDemoAsyncModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoAsyncModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			success: function (data, textStatus, jqXHR) {
				orderDemoObjects = orderDemoAsyncModel.OrderDemo();
				equal(orderDemoObjects.length, 4, "4 records found after read");
				equal(orderDemoObjects[0].OrderID(), "160");
				equal(orderDemoObjects[0].Status(), "RECOVERED", "Status before updating");
				orderDemoObjects[0].Status("TEST UPDATE");
				equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
				orderDemoObjects[0].Status("UPDATED");
				equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

				orderDemoAsyncModel.update({
					method: "UpdateNTPOrderDemo",
					beforeSend: function (jqXHR, settings) {
						var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateNTPOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000001</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Status>UPDATED</Status><Notes>Create Order Demo1</Notes></OrderDemo></UpdateNTPOrderDemo></SOAP:Body></SOAP:Envelope>";
						equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
					},
					success: function (data, textStatus, jqXHR) {
						orderDemoObjects = orderDemoAsyncModel.OrderDemo();
						equal(orderDemoObjects.length, 4, "4 records found");
						equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
						equal($.parseJSON(jqXHR.responseText).OrderDemo.Status, "UPDATED", "Status");
					},
					error: function (jqXHR, textStatus, errorThrown) {
						ok(false, "Failed in read in Read/ChangeBO/Update. Error Thrown : " + errorThrown);
					}
				});
				response = orderDemoAsyncModel.update({
					method: "UpdateNTPOrderDemo",
					beforeSend: function (jqXHR, settings) {
						console.log(settings.data);
						ok(false, "No data to be synchronized, But yet request firing");
					}
				}).always(function(responseObject, statusText) {
					equal(statusText, "canceled", "Request cancelled as no data to be updated");
				});
				start();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				ok(false, "Failed in read in Read. Error Thrown : " + errorThrown);
				start();
			}
		});

		response = orderDemoAsyncModel.update({
			method: "UpdateNTPOrderDemo",
			beforeSend: function (jqXHR, settings) {
				ok(false, "No data to be synchronized, But yet request firing");
			}
		}).always(function(responseObject, statusText) {
			equal(statusText, "canceled", "Request cancelled as no data to be updated");
		});
	});

	//49. AsyncRead/Sync Synchronize without any change   

	test("AsyncRead Synchronize without any change", function () {
		stop();
		orderDemoAsyncModel.clear();
		orderDemoObjects = orderDemoAsyncModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoAsyncModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			success: function (data, textStatus, jqXHR) {
				orderDemoObjects = orderDemoAsyncModel.OrderDemo();
				response = orderDemoAsyncModel.synchronize({
					method: "UpdateNTPOrderDemo",
					beforeSend: function (jqXHR, settings) {
						console.log(settings.data);
						ok(false, "No data to be synchronized, But yet request firing");
					}
				}).always(function(responseObject, statusText) {
					equal(statusText, "canceled", "Request cancelled as no data to be updated");
				});

				orderDemoObjectsAfterSync = orderDemoAsyncModel.OrderDemo();
				equal(orderDemoObjects, orderDemoObjectsAfterSync, "BOs same before and after sync");
				start();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				ok(false, "Failed in read in Read. Error Thrown : " + errorThrown);
				start();
			}
		});
		
	});

	//50. AsyncRead/Update(with no change)

	test("AsyncRead/Update(with no change) - Update fail as no change in data", function () {
		stop();
		orderDemoAsyncModel.clear();
		orderDemoObjects = orderDemoAsyncModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoAsyncModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "163"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>163</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			success: function (data, textStatus, jqXHR) {
				orderDemoObjects = orderDemoAsyncModel.OrderDemo();
				response = orderDemoAsyncModel.update({
					method: "UpdateNTPOrderDemo",
					beforeSend: function (jqXHR, settings) {
						console.log(settings.data);
						ok(false, "No data to be synchronized, But yet request firing");
					}
				}).always(function(responseObject, statusText) {
					equal(statusText, "canceled", "Request cancelled as no data to be updated");
				});

				orderDemoObjectsAfterUpdate = orderDemoAsyncModel.OrderDemo();
				equal(orderDemoObjects, orderDemoObjectsAfterUpdate, "BOs same before and after update");
				start();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				ok(false, "Failed in read in Read. Error Thrown : " + errorThrown);
				start();
			}
		});
		
	});
		
})(window, jQuery)