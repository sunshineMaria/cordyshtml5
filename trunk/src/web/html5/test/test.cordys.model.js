(function (window, $) {

	module("Model Plugin Test");

	/*
	
	The following tests are covered under model plugin test

	1. Read
	2. AddBO/Create/Sync(with no change)
	3. AddBO/Create/Create(with no change)
	4. AddBO/Sync/Create(with no change)
	5. AddBO/Sync/Sync(with no change)
	6. addBO/Update/Create
	7. addBO/Delete/Create
	8. Read/ChangeBO/Update/Update(with no change)
	9. Read/ChangeBO/Update/Sync(with no change)
	10. Read/ChangeBO/Create/Update
	11. Read/ChangeBO/Delete/Update
	12. Read/ChangeBO/Sync/Sync(with no change)
	13. Read/ChangeBO/Sync/Update(with no change)
	14. Read/removeBO/Delete/Delete(with no change)
	15. Read/removeBO/Delete/Sync(with no change)
	16. Read/removeBO/Sync/Sync(with no change)
	17. Read/removeBO/Sync/Delete(with no change)
	18.	Read/removeBO/Create/Sync
	19.	Read/removeBO/Update/Sync
	20. Read Business Object with Invalid Input Parameter
	21. Read/Sync
	22. Read/Update(with no change)
	23. Insert a new Businss Object with duplicate pKey
	24. Read/removeBO/sync
	25. Read/removeBO/delete
	26. addBO/revert/sync
	27. addBO/revert/create
	28. read /updateBO/revert/update
	29. read /updateBO/revert/sync
	30. read/removeBO/revert/delete
	31. read/removeBO/revert/sync
	32. addBO/revert/addBO/sync
	33. read/updateBO/addBO/sync
	34. Read/updateBO/revert/addBO/sync
	35. Read/updateBO/revert/addBO/create
	36. Read/updateBO/revert/addBO/update
	37. addBO/removeBO/Sync
	38. addBO/removeBO/Create
	39. addBO/removeBO/Delete
	40. addBO/removeBO/Update
	41. Read/removeBO/revert/addBO/update/sync
	42. Read/removeBO/revert/addBO/create
	43. Read/removeBO/upateBO/Sync
	44. Read/removeBO/upateBO/Delete
	45. Read/removeBO/Sync/Read
	
	46. Use selectedItem with and without a selcted BO
	47. Clear the model of all data 
	48. Get the number of Business Objects 
	
	*/




	orderDemoModel = new $.cordys.model({
		objectName: "OrderDemo",
		isReadOnly: false,
		defaults: {
			namespace: "http://schemas.cordys.com/html5sdk/orderdemo/1.0",
			async: false,
			dataType: "json",
			error: function () {
				return false;
			}
		}
	});

	// read Objects

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetOrderDemoObjects/,
		responseText: {
			tuple:
			[
				{
					old: {
						OrderDemo: {
							"OrderID": "160",
							"Customer": "fj",
							"Employee": "ss",
							"OrderDate": "2012-07-10 10:29:16.140000000",
							"Product": "aa",
							"Quantity": "4",
							"Discount": "21",
							"Cost": "123456",
							"Status": "CREATED",
							"Notes": "test"
						}
					}
				},
				{
					old: {
						OrderDemo: {
							"OrderID": "161",
							"Customer": "fj",
							"Employee": "ss",
							"OrderDate": "2012-07-10 12:15:17.257",
							"Product": "aa",
							"Quantity": "4",
							"Discount": "21",
							"Cost": "123456",
							"Status": "CREATED",
							"Notes": "test"
						}
					}
				}
			 ]
		}
	});

	//1. Read Business Objects 	

	test("Read two OrderDemo Objects", 4, function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "no records in the model");

		response = orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found. Read two BO.");
		equal(orderDemoObjects[0].OrderID(), "160");
		start();
	});


	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /CreateOrderDemo/,
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
							"Notes": "Create Order Demo"
						}
					}
				}
		}
	});

	//2. AddBO/Create/Sync(with no change) - Insert a new Businss Object using create

	test("Insert a new Businss Object using create - AddBO/Create/Sync(with no change)", 7, function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");
		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute Employee of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Object added returns the correct value");

		response = orderDemoModel.create({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");


		response = orderDemoModel.synchronize({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		});
		start();
	});

	//3. AddBO/Create/Create(with no change) - Insert a new Businss Object using create

	test("Insert a new Businss Object using create - AddBO/Create/Create(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");

		equal(ko.isObservable(orderDemoModel.OrderDemo()[0].Employee), true, "Observable created for the attribute Employee of the Business Obejct added");
		equal(orderDemoModel.OrderDemo()[0].Employee(), "ss", "Observable for the attribute of the Business Object added returns the correct value");

		response = orderDemoModel.create({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects.length, 1, "Inserted a new BO using create. Synchronized. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");

		response = orderDemoModel.create({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be inserted");

		start();
	});

	//4. AddBO/Sync/Create(with no change) - Insert a new Businss Object using sync

	test("Insert a new Businss Object using sync - AddBO/Sync/Create(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");

		response = orderDemoModel.synchronize({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using sync. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");

		response = orderDemoModel.synchronize({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be inserted");
		start();
	});

	//5. AddBO/Sync/Sync(with no change) - Insert a new Businss Object using sync

	test("Insert a new Businss Object using sync - AddBO/Sync/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");

		response = orderDemoModel.synchronize({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using sync. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");

		response = orderDemoModel.create({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Request send after inserted object has been merged");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be inserted");
		start();
	});

	//6. AddBO/Update/Sync 

	test("AddBO/Update/Sync", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");

		response = orderDemoModel.update({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log("6");
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Update getting called for insert/sync opertaion");
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		response = orderDemoModel.synchronize({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using sync. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");
		start();
	});

	//7. AddBO/Delete/Sync 

	test("AddBO/Delete/Sync", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");

		response = orderDemoModel['delete']({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log("7");
				console.log(settings.data);
				ok(false, "Request sent unexepectedly. Update getting called for insert/sync opertaion");
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		response = orderDemoModel.synchronize({
			method: "CreateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Inserted a new BO using sync. 1 record found");
		equal(orderDemoObjects[0].Notes(), "Create Order Demo");
		start();
	});


	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateOrderDemo/,
		responseText: {
			tuple:
				{
					old: {
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
							"Notes": "test"
						}
					},
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
							"Status": "UPDATED",
							"Notes": "test"
						}
					}
				}
		}
	});


	//8. Read/ChangeBO/Update/Update(with no change) - Update an existing Business Object using update

	test("Update an existing Business Object using update - Read/ChangeBO/Update/Update(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "CREATED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel.update({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "CREATED", "Status in old Tuple");
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Status, "UPDATED", "Status in new Tuple");

		response = orderDemoModel.update({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		start();
	});

	//9. Read/ChangeBO/Update/Sync(with no change) - Update an existing Business Object using update

	test("Update an existing Business Object using update - Read/ChangeBO/Update/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "CREATED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		orderDemoObjects = orderDemoModel.OrderDemo();


		response = orderDemoModel.update({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "CREATED", "Status in old Tuple");
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Status, "UPDATED", "Status in new Tuple");

		response = orderDemoModel.synchronize({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		start();
	});

	//10. Read/ChangeBO/Create/Update - Request should not be sent when using method Create to do an update

	test("Read/ChangeBO/Create/Update", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "CREATED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel.create({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request should not be sent when using method Create to do an update");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be inserted");


		response = orderDemoModel.update({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "CREATED", "Status in old Tuple");
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Status, "UPDATED", "Status in new Tuple");

		start();
	});

	//11. Read/ChangeBO/Delete/Update - Request should not be sent when using method Delete to do an update

	test("Read/ChangeBO/Delete/Update", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "CREATED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel['delete']({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request should not be sent when using method Delete to do an update");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be deleted");


		response = orderDemoModel.update({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using update method.");
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "CREATED", "Status in old Tuple");
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Status, "UPDATED", "Status in new Tuple");

		start();
	});

	//12. Read/ChangeBO/Sync/Sync(with no change) - Update an existing Business Object using sync

	test("Update an existing Business Object using sync - Read/ChangeBO/Sync/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "CREATED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		orderDemoObjects = orderDemoModel.OrderDemo();

		response = orderDemoModel.synchronize({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found in the model");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using synchronize.");
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "CREATED", "Status in old Tuple");
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Status, "UPDATED", "Status in new Tuple");

		response = orderDemoModel.synchronize({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		start();
	});

	//13. Read/ChangeBO/Sync/Update(with no change) - Update an existing Business Object using sync

	test("Update an existing Business Object using sync - Read/ChangeBO/Sync/Update(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found after read");
		equal(orderDemoObjects[0].OrderID(), "160");

		equal(orderDemoObjects[0].Status(), "CREATED", "Status before updating");
		orderDemoObjects[0].Status("TEST UPDATE");
		equal(orderDemoObjects[0].Status(), "TEST UPDATE", "Status after first update");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after second update");

		response = orderDemoModel.synchronize({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found in the model");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Checking the status after sync using synchronize.");
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "CREATED", "Status in old Tuple");
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Status, "UPDATED", "Status in new Tuple");

		response = orderDemoModel.update({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be updated, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteOrderDemo/,
		responseText: {
			tuple:
				{
					old: {
						OrderDemo: {
							"OrderID": "161",
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
				}
		}
	});

	//14. Read/removeBO/Delete/Delete(with no change) - Delete an existing Business Object using delete

	test("Delete an existing Business Object using delete - Read/removeBO/Delete/Delete(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 2, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel['delete']({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Record in queue for deletion is removed using delte method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "OrderID of record deleted");

		response = orderDemoModel['delete']({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be deleted");

		start();
	});

	//15. Read/removeBO/Delete/Sync(with no change) - Delete an existing Business Object using delete

	test("Delete an existing Business Object using delete - Read/removeBO/Delete/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 2, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel['delete']({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Record in queue for deletion is removed using delte method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "OrderID of record deleted");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be deleted");

		start();
	});

	//16. Read/removeBO/Sync/Sync(with no change) - Delete an existing Business Object using sync

	test("Delete an existing Business Object using sync - Read/removeBO/Sync/Sync(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 2, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Record in queue for deletion is removed using syncchronize method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "OrderID of record deleted");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be deleted");

		start();
	});

	//17. Read/removeBO/Sync/Delete(with no change) - Delete an existing Business Object using sync

	test("Delete an existing Business Object using sync - Read/removeBO/Sync/Delete(with no change)", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 2, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Record in queue for deletion is removed using syncchronize method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "OrderID of record deleted");

		response = orderDemoModel['delete']({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be deleted, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be deleted");

		start();
	});

	//18. Read/removeBO/Create/Sync - Request should not be sent when using method create to removeBO and sync

	test("Read/removeBO/Create/Sync", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 2, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel.create({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request should not be sent when using method create to removeBO and sync");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be deleted");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Record in queue for deletion is removed using syncchronize method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "OrderID of record deleted");
		start();
	});

	//19. Read/removeBO/Update/Sync - Request should not be sent when using method update to removeBO and sync

	test("Read/removeBO/Update/Sync", function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found before removing BO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();

		equal(orderDemoObjects[0].OrderID(), "160", "OrderID of first record");
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		equal(orderDemoObjects[1].OrderID(), "161", "OrderID of second record");
		equal(orderDemoObjects[1]._destroy, undefined, "No Destroy flag found for the record with OrderID 161");

		equal(orderDemoObjects.length, 2, "first record in queue for deletion. Record still in model object");

		response = orderDemoModel.update({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "Request should not be sent when using method update to removeBO and sync");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be deleted");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Record in queue for deletion is removed using syncchronize method. 1 record in model object after sync");

		equal(orderDemoObjects[0].OrderID(), "161", "OrderID of record deleted");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /ReadOrderDemoObjectInvalidInputParameter/,
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
									<OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>1</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Read OrderDemo Object Invalid Input Parameter</Notes>\
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

	//20. Read Business Object with Invalid Input Parameter

	test("Read Business Object with Invalid Input Parameter", 3, function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		response = orderDemoModel.read({
			method: "ReadOrderDemoObjectInvalidInputParameter",
			parameters: {
				OrderID: "a"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ReadOrderDemoObjectInvalidInputParameter xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderID>a</OrderID></ReadOrderDemoObjectInvalidInputParameter></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		response = orderDemoModel.synchronize({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});

		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		response = orderDemoModel.update({
			method: "UpdateOrderDemo",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsAfterUpdate, "BOs same before and after update");
		start();
	});


	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /CreateBODuplicateOrderID/,
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "Clearing model object. no records in the model");
		orderDemoModel.addBusinessObject({ OrderID: "160", Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "test" });

		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3);

		response = orderDemoModel.create({
			method: "CreateBODuplicateOrderID",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateBODuplicateOrderID xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></new></tuple></CreateBODuplicateOrderID></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			error: function () {
				return false;
			}
		});

		orderDemoObjects = orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[2]);
		orderDemoObjects = orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2);

		start();
	});

	//24. Read/removeBO/sync- Delete a non existing record   

	test("Read/removeBO/sync-Delete a non existing record using sync", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model object");

		orderDemoModel.removeBusinessObject({ OrderID: "25", Customer: "fj", Employee: "ss", Product: "aa", OrderDate: "2012-07-10T10:29:16.140000000", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "test" });

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "no records deleted");
		start();
	});

	//25. Read/removeBO/delete- Delete a non existing record 

	test("Read/removeBO/delete- Delete a non existing record using delete", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model object");

		orderDemoModel.removeBusinessObject({ OrderID: "25", Customer: "fj", Employee: "ss", Product: "aa", OrderDate: "2012-07-10T10:29:16.140000000", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "test" });

		response = orderDemoModel['delete']({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "no records deleted");
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
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
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
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateBORevertUpdation/,
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
							<old>\
								<OrderDemo>\
									<OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>PARAMETER</OrderDate><Product>aa</Product><Quantity>1</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update OrderDemo Object Revert Updation in old tuple</Notes>\
								</OrderDemo>\
							</old>\
							<new>\
								<OrderDemo>\
									<OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>PARAMETER</OrderDate><Product>aa</Product><Quantity>1</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update OrderDemo Object Revert Updation in new tuple</Notes>\
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

	//28. read/updateBO/revert/update - Update a BO and revert updation 

	test("Update OrderDemo Object Revert Updation - read/updateBO/revert/update", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

		statusBeforeUpdate = orderDemoObjects[0].Status();
		orderDemoObjects[0].Status("UPDATED");
		orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
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
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
		start();
	});

	//29. read /updateBO/revert/sync - Update OrderDemo Object Revert Updation

	test("Update OrderDemo Object Revert Updation - read /updateBO/revert/sync", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

		statusBeforeUpdate = orderDemoObjects[0].Status();
		orderDemoObjects[0].Status("UPDATED");
		orderDemoObjectsAfterUpdate = orderDemoModel.OrderDemo();
		notEqual(statusBeforeUpdate, orderDemoObjectsAfterUpdate[0].Status(), "Record updated in the model object");

		orderDemoModel.revert();
		orderDemoObjectsRevertUpdate = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertUpdate, "update reverted in the record");

		response = orderDemoModel.synchronize({
			method: "UpdateBORevertUpdation",
			beforeSend: function (jqXHR, settings) {
				console.log(settings.data);
				ok(false, "No data to be synchronized, But yet request firing");
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteBORevertDeletion/,
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
							<old>\
								<OrderDemo>\
									<OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>PARAMETER</OrderDate><Product>aa</Product><Quantity>1</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Delete OrderDemo Object Revert Deletion</Notes>\
								</OrderDemo>\
							</old>\
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

	//30. read/removeBO/revert/delete - Delete a BO and revert deletion

	test("Delete OrderDemo Object Revert Deletion - read/removeBO/revert/delete", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
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
			},
			error: function () {
				return false;
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		start();
	});

	//31. read/removeBO/revert/sync - Delete OrderDemo Object Revert Deletion

	test("Delete OrderDemo Object Revert Deletion - read/removeBO/revert/sync", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
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
				ok(false, "No data to be synchronized, But yet request firing");
			},
			error: function () {
				return false;
			}
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");

		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /InsertBORevertInsertNew/,
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
							"Notes": "Insert BO Revert Insertion and Inser a new BO"
						}
					}
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
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><InsertBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Insert BO Revert Insertion and Inser a new BO</Notes></OrderDemo></new></tuple></InsertBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateBOInsertNew/,
		responseText: {
			"tuple": [
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
								"Status": "UPDATED",
								"Notes": "Updated"
							}
						},
						old: {
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
								"Notes": "Updated"
							}
						}
					},
					{
						'new': {
							OrderDemo: {
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
						}
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found after read");
		orderDemoObjects[0].Status("UPDATED");
		equal(orderDemoObjects[0].Status(), "UPDATED", "Status after update");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO and Insert a new BO" });
		response = orderDemoModel.synchronize({
			method: "UpdateBOInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBOInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO and Insert a new BO</Notes></OrderDemo></new></tuple></UpdateBOInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 3, "3 records found after sync");
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

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
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></new></tuple></UpdateBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

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
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></new></tuple></UpdateBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

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
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteAfterInsertBO/,
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
							"Notes": "Delete BO and Insert a new BO"
						}
					}
				}
		}
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
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
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
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
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
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
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
		});
		equal(response.statusText, "canceled", "Request cancelled as no data to be updated");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteBORevertInsertNew/,
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
							"Notes": "Insert BO Revert Insertion and Inser a new BO"
						}
					}
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");
		orderDemoModel.revert();

		orderDemoObjectsRevertDelete = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertDelete, "delete reverted in the record");
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "Deletion of BO reverted");
		equal(orderDemoObjects[0]._destroy, undefined, "Deletion Reverted");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO Revert Insertion and Inser a new BO" });
		response = orderDemoModel.update({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Request send after reverting a deleted object");
			}
		});

		response = orderDemoModel.synchronize({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></new></tuple></DeleteBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML. Should only have the inserted object");
			}
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");
		orderDemoModel.revert();

		orderDemoObjectsRevertDelete = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsRevertDelete, "delete reverted in the record");
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "Deletion of BO reverted");
		equal(orderDemoObjects[0]._destroy, undefined, "Deletion Reverted");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Update BO Revert Insertion and Inser a new BO" });
		response = orderDemoModel.create({
			method: "DeleteBORevertInsertNew",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></new></tuple></UpdateBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				//equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateBOOnDeletedBO/,
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
							<old>\
								<OrderDemo>\
									<OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>1</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO on BO that is deleted</Notes>\
								</OrderDemo>\
							</old>\
							<error>\
								<elem>Tuple is changed by other user : OrderDate</elem>\
								<cordys:LocalizableMessage xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">\
									<cordys:MessageCode>Cordys.Database.Native.Messages.tupleChangedError</cordys:MessageCode>\
									<cordys:Insertion>OrderDate</cordys:Insertion>\
								</cordys:LocalizableMessage>\
							</error>\
						</tuple>\
					</UpdateOrderDemo>\
				</detail>\
			</SOAP:Fault>"
	});

	//43. Read/removeBO/upateBO/Sync - Update BO on BO that is deleted

	test("Update BO on BO that is deleted - Read/removeBO/upateBO/Sync", 5, function () {
		stop();
		orderDemoModel.clear();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "160"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>160</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");

		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Notes("Updation on Deleted BO");
		var updatedNotes = orderDemoObjects[0].Notes();

		response = orderDemoModel.synchronize({
			method: "UpdateBOOnDeletedBO",
			error: function () {
				return false;
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBOOnDeletedBO xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></UpdateBOOnDeletedBO></SOAP:Body></SOAP:Envelope>";
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
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "160"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>160</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records in model after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record");

		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Notes("Updation on Deleted BO");
		var updatedNotes = orderDemoObjects[0].Notes();

		response = orderDemoModel['delete']({
			method: "UpdateBOOnDeletedBO",
			error: function () {
				return false;
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBOOnDeletedBO xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></UpdateBOOnDeletedBO></SOAP:Body></SOAP:Envelope>";
				notEqual($($.parseXML(settings.data)).find("Notes").text(), updatedNotes);
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetDemoOrder/,
		responseText: {
			tuple:
			{
				old: {
					OrderDemo: {
						"OrderID": "160",
						"Customer": "fj",
						"Employee": "ss",
						"OrderDate": "2012-07-10 10:29:16.140000000",
						"Product": "aa",
						"Quantity": "4",
						"Discount": "21",
						"Cost": "123456",
						"Status": "CREATED",
						"Notes": "Read BO on BO that is deleted"
					}
				}
			}
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /ReadBOOnDeletedBO/,
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
							<old>\
								<OrderDemo>\
									<OrderID>140</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10T10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>1</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Read BO on BO that is deleted</Notes>\
								</OrderDemo>\
							</old>\
							<error>\
								<elem>Tuple is changed by other user : OrderDate</elem>\
								<cordys:LocalizableMessage xmlns:cordys=\"http://schemas.cordys.com/General/1.0/\">\
									<cordys:MessageCode>Cordys.Database.Native.Messages.tupleChangedError</cordys:MessageCode>\
									<cordys:Insertion>OrderDate</cordys:Insertion>\
								</cordys:LocalizableMessage>\
							</error>\
						</tuple>\
					</UpdateOrderDemo>\
				</detail>\
			</SOAP:Fault>"
	});

	//45. Read/removeBO/Sync/Read - Read BO on BO that is deleted

	test("Read BO on BO that is deleted - Read/removeBO/Sync/Read", function () {
		stop();
		orderDemoModel.clear();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "2 records found after read");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		equal(orderDemoObjects[0]._destroy, true, "Destroy flag is set for the record with OrderID 160");

		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 record found. 1 record deleted");
		orderDemoModel.clear();
		response = orderDemoModel.read({
			method: "ReadBOOnDeletedBO",
			parameters: {
				OrderID: "160"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ReadBOOnDeletedBO xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderID>160</OrderID></ReadBOOnDeletedBO></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "no record found");

		start();
	});

	//46. Use selectedItem with and without a selcted BO

	test("Use selectedItem with and without a selcted BO", 3, function () {
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		selectedItem = orderDemoModel.selectedItem();
		equal(typeof (selectedItem), "undefined");
		selectedItem = orderDemoModel.selectedItem(orderDemoObjects[0]);
		equal(selectedItem.orderID, orderDemoObjects[0].orderID);
		start();
	});

	//47. Clear the model of all data 

	test("Clear the model of all data", 4, function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2);
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0);
		start();
	});

	//48. Get the number of Business Objects 

	test("Get the number of Business Objects ", 3, function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, orderDemoModel.getSize());
		start();
	});

})(window, jQuery)