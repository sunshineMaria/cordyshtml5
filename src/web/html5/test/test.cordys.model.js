(function (window, $) {

	module("Model Plugin Test");

	/*
	
	The following tests are covered under model plugin test
	1. Read Business Objects
	2. Insert a new Businss Object using create
	3. Insert a new Businss Object using sync
	4. Update an existing Business Object using sync
	5. Update an existing Business Object using update
	6. Delete an existing Business Object using sync
	7. Delete an existing Business Object using delete
	8. Read Business Object with Invalid Input Parameter
	9. Synchronize without any change
	10. Update with no change in data
	11. Insert a new Businss Object with duplicate pKey
	12. Delete a non existing record
	13. Add a BO and revert inserion
	14. Update a BO and revert updation
	15. Delete a BO and revert deletion
	16. Add a BO, revert inserion and insert BO
	17. Update a BO and insert BO
	18. Update a BO, revert updation and insert BO
	19. Insert a BO, delete the inserted BO and sync
	20. Delete a BO, revert deletion and insert BO
	21. Delete a BO and read the deleted BO
	22. Delete a BO and update the deleted BO
	23. Use selectedItem with and without a selcted BO
	24. Clear the model of all data
	25. Get the number of Business Objects    
	
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

	//2. Insert a new Businss Object using create

	test("Create OrderDemo Object using create", 5, function () {
		stop();

		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "Create Order Demo" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "Added BO, but not synchronized yet. 1 record in the model");

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
		start();
	});

	//3. Insert a new Businss Object using sync 

	test("Create OrderDemo Object using synchronize", 5, function () {
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

	//4. Update an existing Business Object using update  

	test("Update OrderDemo Object using update", 12, function () {
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

		start();
	});

	//5. Update an existing Business Object using sync 

	test("Update OrderDemo Object using synchronize", 12, function () {
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

	//6. Delete an existing Business Object using delete 

	test("Delete OrderDemo Object using delete", 13, function () {
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
		notEqual(orderDemoObjects[0].OrderID(), "160", "Checking that the orderID is not 160, that is the OrederID of record deleted");

		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "DELETED", "The Order Status is deleted");
		start();
	});

	//7. Delete an existing Business Object using sync  

	test("Delete OrderDemo Object using synchronize", 13, function () {
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
		notEqual(orderDemoObjects[0].OrderID(), "160", "Checking that the orderID is not 160, that is the OrederID of record deleted");

		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "DELETED", "The Order Status is deleted");
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

	//8. Read Business Object with Invalid Input Parameter

	test("Read OrderDemo Object Invalid Input Parameter", 3, function () {
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

	//9. Synchronize without any change   

	test("Synchronize without any change", function () {
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
			beforeSend: function () {
				fail("The request is cancelled as there is nothing to update");
			}
		});
		orderDemoObjectsAfterSync = orderDemoModel.OrderDemo();
		equal(orderDemoObjects, orderDemoObjectsAfterSync, "BOs same before and after sync");
		start();
	});

	//10. Update with no change in data  

	test("Update OrderDemo - Update fail as no change in data", function () {
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
			beforeSend: function () {
				fail("The request is cancelled as there is nothing to update");
			}
		});
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

	//11. Insert a new Businss Object with duplicate pKey

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

	//12. Delete a non existing record   

	test("Delete a non existing record", function () {
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
			beforeSend: function () {
				fail("The request is cancelled as there is nothing to update");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 2, "no records deleted");
		start();
	});

	//13. Add a BO and revert inserion  

	test("Create OrderDemo Object Revert Insertion", function () {
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
			beforeSend: function () {
				fail("The request is cancelled as there is nothing to update");
			}
		});
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

	//14. Update a BO and revert updation  

	test("Update OrderDemo Object Revert Updation", function () {
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
			beforeSend: function () {
				fail("The request is cancelled as there is nothing to update");
			}
		});
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

	//15. Delete a BO and revert deletion

	test("Delete OrderDemo Object Revert Deletion", function () {
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
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteBORevertDeletion xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteBORevertDeletion></SOAP:Body></SOAP:Envelope>";
				//equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			},
			error: function () {
				return false;
			}
		});
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

	//16. Add a BO, revert inserion and insert BO 

	test("Insert BO Revert Insertion and Insert a new BO", 5, function () {
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

	//17. Update a BO and insert BO 

	test("Update BO and Insert a new BO", 7, function () {
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

	//18. Update a BO, revert updation and insert BO  

	test("Update BO Revert Update and Insert a new BO", 6, function () {
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

	//19. Insert a BO, delete the inserted BO and sync

	test("Insert a BO, delete the inserted BO and sync", function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "Clearing model object. no records in the model");

		orderDemoModel.addBusinessObject({ Customer: "fj", Employee: "ss", Product: "aa", Quantity: "4", Discount: "21", Cost: "123456", Status: "CREATED", Notes: "BO for revertion" });
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 1, "1 record in model after addBO");

		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "added BO is deleted");

		response = orderDemoModel.synchronize({
			method: "DeleteAfterInsertBO",
			beforeSend: function () {
				fail("The request is cancelled as there is nothing to update");
			}
		});
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

	//20. Delete a BO, revert deletion and insert BO

	test("Delete BO Revert Deletion and Insert a new BO", function () {
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
		response = orderDemoModel.synchronize({
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

	//22. Update BO on BO that is deleted

	test("Update BO on BO that is deleted", 5, function () {
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

	//21. Read BO on BO that is deleted

	test("Read BO on BO that is deleted", function () {
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

	//23. Use selectedItem with and without a selcted BO

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

	//24. Clear the model of all data 

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

	//25. Get the number of Business Objects 

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