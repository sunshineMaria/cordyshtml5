(function (window, $) {

	module("Model Plugin with Templating and Crude Operations Test");

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
					},
			]
		}
	});


	test("Read with Non-tuple protocol", 4, function () {
		stop();
		orderDemoModel.clear();
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 0, "no records in the model");

		response = orderDemoModel.read({
			method: "GetOrdersNTPRequest",
			parameters: {
				fromOrderID: "160",
				toOrderID: "161"
			},
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrdersNTPRequest xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>161</toOrderID></GetOrdersNTPRequest></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML, settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoObjects = orderDemoModel.OrderDemo();
		equal(orderDemoObjects.length, 4, "2 records found. Read two BO.");
		equal(orderDemoObjects[0].OrderID(), "160");
		start();
	});


	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /CreateOrderDemoNTP/,
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

	test("Insert a new Business Object in NTP using create - AddBO/Create/Sync(with no change)", 7, function () {
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
			method: "CreateOrderDemoNTP",
			beforeSend: function (jqXHR, settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateOrderDemoNTP xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><OrderDemo><Customer>fj</Customer><Employee>ss</Employee><Product>aa</Product><Quantity>4</Quantity><Discount>21</Discount><Cost>123456</Cost><Status>CREATED</Status><Notes>Create Order Demo</Notes></OrderDemo></CreateOrderDemoNTP></SOAP:Body></SOAP:Envelope>";
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
		});
		start();
	});


})(window, jQuery)