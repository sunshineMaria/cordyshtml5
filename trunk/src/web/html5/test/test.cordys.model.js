(function(window, $) {

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
		15. Delete a BO and delete updation
		16. Add a BO, revert inserion and insert BO
		17. Update a BO and insert BO
		18. Update a BO, revert updation and insert BO
		19. Delete a BO and insert BO
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
			async:false,
			dataType: "json",
			error: function(){
				return false;
			}
		}
	});

	// read Objects

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetOrderDemoObjects/,
		responseText: {
			tuple :
			[
				{
					old : {
						OrderDemo : {
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10 10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"test"
						 }
					}
				},
				{
					old : {
						OrderDemo : {
							"OrderID":"161",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10 12:15:17.257",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"test"
						 }
					}
				}
			 ]
		},
		responseXML: "<Response>\
			<tuple><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple>\
			<tuple><new><OrderDemo><OrderID>161</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 12:15:17.257</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple>\
			</Response>"
	});

	//1. Read Business Objects 	

	test("Read OrderDemo Objects", 3, function(){
		stop();
		
		response = orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple.length, 2, "2 records found");
		equal($.parseJSON(response.responseText).tuple[0].old.OrderDemo.Employee, "ss");
		start();
	});

	
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /CreateOrderDemo/,
		responseText: {
			tuple :
				{
					'new' : {
						OrderDemo : {
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"Create Order Demo"
						}
					}
				}
		}
	});

	//2. Insert a new Businss Object using create
	
	test("Create OrderDemo Object using create", 2, function(){
		stop();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"Create Order Demo"});
		response = orderDemoModel.create({
			method: "CreateOrderDemo",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Notes,"Create Order Demo");
		start();
	});

	//3. Insert a new Businss Object using sync 

	test("Create OrderDemo Object using synchronize", 2, function(){
		stop();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"Create Order Demo"});
		response = orderDemoModel.synchronize({
			method: "CreateOrderDemo",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Notes,"Create Order Demo");
		start();
	});
	

   $.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateOrderDemo/,
		responseText: {
			tuple :
				{
					old : {
						OrderDemo : { 
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"test"
						}
					} ,
					'new' : {
						OrderDemo : {
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"UPDATED",
							"Notes":"test"
						}
					}
				}
		}
	});

	//4. Update an existing Business Object using update  

	test("Update OrderDemo Object using update", 4, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Status = "UPDATED";
		response = orderDemoModel.update({
			method: "UpdateOrderDemo",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "CREATED", "Status in old Tuple");
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Status, "UPDATED", "Status in new Tuple");
		start();
	});

	//5. Update an existing Business Object using sync 

	test("Update OrderDemo Object using synchronize", 4, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Status = "UPDATED";
		response = orderDemoModel.synchronize({
			method: "UpdateOrderDemo",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>UPDATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "CREATED", "Status in old Tuple");
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Status, "UPDATED", "Status in new Tuple");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteOrderDemo/,
		responseText: {
			tuple :
				{
					old : {
						OrderDemo : {
							"OrderID":"140",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"DELETED",
							"Notes":"test"
						}
					}
				}
		}
	});

	//6. Delete an existing Business Object using delete 
	
	test("Delete OrderDemo Object using delete", 4, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		response = orderDemoModel['delete']({
			method: "DeleteOrderDemo",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.OrderID, "140");
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.Status, "DELETED", "The Order Status is deleted");
		start();
	});

	//7. Delete an existing Business Object using sync  
	
	test("Delete OrderDemo Object using synchronize", 4, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple.old.OrderDemo.OrderID, "140");
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

	test("Read OrderDemo Object Invalid Input Parameter", 3, function(){
		stop();
		response = orderDemoModel.read({
			method: "ReadOrderDemoObjectInvalidInputParameter",
			parameters: {
					OrderID: "a"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ReadOrderDemoObjectInvalidInputParameter xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderID>a</OrderID></ReadOrderDemoObjectInvalidInputParameter></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($($.parseXML(response.responseText)).find("faultstring").text(), "Database update failed.");
		equal($($.parseXML(response.responseText)).find("new OrderDemo Notes").text(), "Read OrderDemo Object Invalid Input Parameter");
		start();
	});

	//9. Synchronize without any change   

	test("Synchronize without any change", 2, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		response = orderDemoModel.synchronize({
			method: "UpdateOrderDemo"
		});
		equal(response,false);
		start();
	});

	//10. Update with no change in data  

	test("Update OrderDemo - Update fail as no change in data", 2, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		response = orderDemoModel.synchronize({
			method: "UpdateOrderDemo"
		});
		equal(response,false);
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

	test("Create OrderDemo Object Duplicate OrderID", 3, function(){
		stop();
		orderDemoModel.addBusinessObject({OrderID:"160",Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"test"});
		response = orderDemoModel.create({
			method: "CreateBODuplicateOrderID",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateBODuplicateOrderID xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></new></tuple></CreateBODuplicateOrderID></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			},
			error : function(){
				return false;
			}
		});
		equal($($.parseXML(response.responseText)).find("faultstring").text(), "Database update failed.");
		equal($($.parseXML(response.responseText)).find("new OrderDemo Notes").text(), "Create OrderDemo Object Duplicate OrderID");
		start();
	});

	//12. Delete a non existing record   

	test("Delete a non existing record", 2, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoModel.removeBusinessObject({OrderID:"25",Customer:"fj",Employee:"ss",Product:"aa",OrderDate:"2012-07-10T10:29:16.140000000",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"test"});
		response = orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
		});
		equal(response,false);
		start();
	});

	//13. Add a BO and revert inserion  

	test("Create OrderDemo Object Revert Insertion", 2, function(){
		stop();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"test"});
		response = orderDemoModel.create({
			method: "CreateOrderDemo",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></new></tuple></CreateOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoModel.revert();
		response = orderDemoModel.synchronize({
			method: "CreateBORevertInsertion"
		});
		equal(response,false);
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

	test("Update OrderDemo Object Revert Updation", 5, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Status = "UPDATED";
		orderDemoModel.revert();
		response = orderDemoModel.synchronize({
			method: "UpdateBORevertUpdation",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBORevertUpdation xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old><new><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></new></tuple></UpdateBORevertUpdation></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			},
			error : function(){
				return false;
			}
		});
		equal($($.parseXML(response.responseText)).find("faultstring").text(), "Database update failed.");
		equal($($.parseXML(response.responseText)).find("old OrderDemo Notes").text(), "Update OrderDemo Object Revert Updation in old tuple");
		equal($($.parseXML(response.responseText)).find("new OrderDemo Notes").text(), "Update OrderDemo Object Revert Updation in new tuple");
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

	//15. Delete a BO and delete updation

	test("Delete OrderDemo Object Revert Deletion", 5, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		response = orderDemoModel.synchronize({
			method: "DeleteBORevertDeletion",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteBORevertDeletion xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteBORevertDeletion></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			},
			error : function(){
				return false;
			}
		});
		equal($($.parseXML(response.responseText)).find("faultstring").text(), "Database update failed.");
		equal($($.parseXML(response.responseText)).find("old OrderDemo Notes").text(), "Delete OrderDemo Object Revert Deletion");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /InsertBORevertInsertNew/,
		responseText: {
			tuple :
				{
					'new' : {
						OrderDemo : {
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"Insert BO Revert Insertion and Inser a new BO"
						}
					}
				}
		}
	});

	//16. Add a BO, revert inserion and insert BO 

	test("Insert BO Revert Insertion and Insert a new BO", 2, function(){
		stop();
		orderDemoModel.clear();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"BO for revertion"});
		orderDemoModel.revert();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"Insert BO Revert Insertion and Inser a new BO"});
		response = orderDemoModel.synchronize({
			method: "InsertBORevertInsertNew",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><InsertBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Insert BO Revert Insertion and Inser a new BO</Notes></OrderDemo></new></tuple></InsertBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Notes, "Insert BO Revert Insertion and Inser a new BO");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateBOInsertNew/,
		responseText: {
				"tuple" : [
					{
						'new' : {
							OrderDemo : {
								"OrderID":"160",
								"Customer":"fj",
								"Employee":"ss",
								"OrderDate":"2012-07-10T10:29:16.140000000",
								"Product":"aa",
								"Quantity":"4",
								"Discount":"21",
								"Cost":"123456",
								"Status":"CREATED",
								"Notes":"Updated"
							}
						}
					},
					{
						'new' : {
							OrderDemo : {
								"OrderID":"160",
								"Customer":"fj",
								"Employee":"ss",
								"OrderDate":"2012-07-10T10:29:16.140000000",
								"Product":"aa",
								"Quantity":"4",
								"Discount":"21",
								"Cost":"123456",
								"Status":"CREATED",
								"Notes":"Update BO and Insert a new BO"
							}
						}
					}
			]
		}
	});

	//17. Update a BO and insert BO 

	test("Update BO and Insert a new BO", 4, function(){
		stop();
		orderDemoModel.clear();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"BO for updation"});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Notes = "Updated";
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"Update BO and Insert a new BO"});
		response = orderDemoModel.synchronize({
			method: "UpdateBOInsertNew",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBOInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Updated</Notes></OrderDemo></new></tuple><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO and Insert a new BO</Notes></OrderDemo></new></tuple></UpdateBOInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple.length, 2);
		equal($.parseJSON(response.responseText).tuple[0]['new'].OrderDemo.Notes, "Updated");
		equal($.parseJSON(response.responseText).tuple[1]['new'].OrderDemo.Notes, "Update BO and Insert a new BO");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /UpdateBORevertInsertNew/,
		responseText: {
			tuple :
				{
					'new' : {
						OrderDemo : {
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"Update BO Revert Insertion and Inser a new BO"
						}
					}
				}
		}
	});

	//18. Update a BO, revert updation and insert BO  

	test("Update BO Revert Update and Insert a new BO", 2, function(){
		stop();
		orderDemoModel.clear();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"BO for revertion"});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoObjects[0].Notes = "Updated";
		orderDemoModel.revert();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"Update BO Revert Insertion and Inser a new BO"});
		response = orderDemoModel.synchronize({
			method: "UpdateBORevertInsertNew",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Update BO Revert Insertion and Inser a new BO</Notes></OrderDemo></new></tuple></UpdateBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Notes, "Update BO Revert Insertion and Inser a new BO");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteBOInsertNew/,
		responseText: {
			tuple :
				{
					'new' : {
						OrderDemo : {
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"Delete BO and Insert a new BO"
						}
					}
				}
		}
	});

	//19. Delete a BO and insert BO  

	test("Delete BO and Insert a new BO", 2, function(){
		stop();
		orderDemoModel.clear();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"BO for revertion"});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"Delete BO and Insert a new BO"});
		response = orderDemoModel.synchronize({
			method: "DeleteBOInsertNew",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteBOInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Delete BO and Insert a new BO</Notes></OrderDemo></new></tuple></DeleteBOInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Notes, "Delete BO and Insert a new BO");
		start();
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /DeleteBORevertInsertNew/,
		responseText: {
			tuple :
				{
					'new' : {
						OrderDemo : {
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"Insert BO Revert Insertion and Inser a new BO"
						}
					}
				}
		}
	});

	//20. Delete a BO, revert deletion and insert BO

	test("Delete BO Revert Deletion and Insert a new BO", 2, function(){
		stop();
		orderDemoModel.clear();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"BO for revertion"});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoModel.revert();
		orderDemoModel.addBusinessObject({Customer:"fj",Employee:"ss",Product:"aa",Quantity:"4",Discount:"21",Cost:"123456",Status:"CREATED",Notes:"Insert BO Revert Insertion and Inser a new BO"});
		response = orderDemoModel.synchronize({
			method: "DeleteBORevertInsertNew",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteBORevertInsertNew xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><new><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Insert BO Revert Insertion and Inser a new BO</Notes></OrderDemo></new></tuple></DeleteBORevertInsertNew></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($.parseJSON(response.responseText).tuple['new'].OrderDemo.Notes, "Insert BO Revert Insertion and Inser a new BO");
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

	test("Update BO on BO that is deleted", 5, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "160"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>160</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoObjects[0].Notes = "Updation on Deleted BO";
		response = orderDemoModel.synchronize({
			method: "UpdateBOOnDeletedBO",
			error : function(){
				return false;
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateBOOnDeletedBO xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></UpdateBOOnDeletedBO></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($($.parseXML(response.responseText)).find("faultstring").text(), "Database update failed.");
		equal($($.parseXML(response.responseText)).find("old OrderDemo Notes").text(), "Update BO on BO that is deleted");
		equal($($.parseXML(response.responseText)).find("error elem").text(), "Tuple is changed by other user : OrderDate");
		start();
	});

//	$.mockjax({
//		url: '*/com.eibus.web.soap.Gateway.wcp',
/*		data: /GetDemoOrder/,
		responseText: {
			tuple :
				{
					old : {
						OrderDemo : {
							"OrderID":"160",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10 10:29:16.140000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"Read BO on BO that is deleted"
						 }
					}
				}
		}
	});*/

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

	test("Read BO on BO that is deleted", 6, function(){
		stop();
		orderDemoModel.clear();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "140",
					toOrderID: "141"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>140</fromOrderID><toOrderID>141</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		orderDemoModel.removeBusinessObject(orderDemoObjects[0]);
		orderDemoModel.synchronize({
			method: "DeleteOrderDemo",
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteOrderDemo xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><tuple><old><OrderDemo><OrderID>160</OrderID><Customer>fj</Customer><Employee>ss</Employee><OrderDate>2012-07-10 10:29:16.140000000</OrderDate><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>test</Notes></OrderDemo></old></tuple></DeleteOrderDemo></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		response = orderDemoModel.read({
			method: "ReadBOOnDeletedBO",
			parameters: {
					OrderID: "140"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ReadBOOnDeletedBO xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderID>140</OrderID></ReadBOOnDeletedBO></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		equal($($.parseXML(response.responseText)).find("faultstring").text(), "Database update failed.");
		equal($($.parseXML(response.responseText)).find("old OrderDemo Notes").text(), "Read BO on BO that is deleted");
		equal($($.parseXML(response.responseText)).find("error elem").text(), "Tuple is changed by other user : OrderDate");
		start();
	});

	//23. Use selectedItem with and without a selcted BO

	test("Use selectedItem with and without a selcted BO", 3, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		selectedItem = orderDemoModel.selectedItem();
		equal(typeof(selectedItem),"undefined");
		selectedItem = orderDemoModel.selectedItem(orderDemoObjects[0]);
		equal(selectedItem.orderID,orderDemoObjects[0].orderID);
		start();
	});

	//24. Clear the model of all data 

	test("Clear the model of all data", 3, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
			debugger;
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length,2);
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length,0);
		start();
	});

	//25. Get the number of Business Objects 

	test("Get the number of Business Objects ", 2, function(){
		stop();
		orderDemoModel.read({
			method: "GetOrderDemoObjects",
			parameters: {
					fromOrderID: "160",
					toOrderID: "161"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoObjects xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrderDemoObjects></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length,orderDemoModel.getSize());
		start();
	});
	
})(window, jQuery)