(function(window, $) {

	module("Model Plugin Pagination Test");
	

	orderDemoCursorModel = new $.cordys.model({
		objectName: "OrderDemo",
		isReadOnly: false,
		read: {
			namespace: "http://schemas.cordys.com/html5sdk/orderdemo/1.0",
			dataType: "json",
			async:false,
			method: "GetOrderDemoCursorModelObjectsPageWithTwoRows",
			parameters: {
				fromOrderID: "160",
				toOrderID: "165",
				cursor:{
					'@numRows':2
				}
			},
			error: function(){
				return false;
			}
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /PaginationTestWithTwoRows/,
		responseText: {
			"tuple": 
			[
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
							"Status":"UPDATED",
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
							"OrderDate":"2012-07-10T12:15:17.257000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"test"
						}
					}
				}
			],
			"cursor":
			{
				"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
				"@xmlns":"http://schemas.cordys.com/html5sdk/orderdemo/1.0",
				"@numRows":"2",
				"@id":"1.63",
				"@position":"2",
				"@maxRows":"99999997"
			}
		}
	});
	
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /PaginationTestGetNextPage/,
		responseText: {
			"tuple": 
			[
				{
					old : {
						OrderDemo : {
							"OrderID":"162",
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
				},
				{
					old : {
						OrderDemo : {
							"OrderID":"163",
							"Customer":"fj",
							"Employee":"ss",
							"OrderDate":"2012-07-10T12:15:17.257000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"test"
						}
					}
				}
			],
			"cursor":
			{
				"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
				"@xmlns":"http://schemas.cordys.com/html5sdk/orderdemo/1.0",
				"@numRows":"2",
				"@id":"1.63",
				"@position":"4",
				"@maxRows":"99999995"
			}
		}
	});
	
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /PaginationTestGetPreviousPage/,
		responseText: {
			"tuple": 
			[
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
							"Status":"UPDATED",
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
							"OrderDate":"2012-07-10T12:15:17.257000000",
							"Product":"aa",
							"Quantity":"4",
							"Discount":"21",
							"Cost":"123456",
							"Status":"CREATED",
							"Notes":"test"
						}
					}
				}
			],
			"cursor":
			{
				"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
				"@xmlns":"http://schemas.cordys.com/html5sdk/orderdemo/1.0",
				"@numRows":"2",
				"@id":"1.63",
				"@position":"2",
				"@maxRows":"99999993"
			}
		}
	});

	
	// Pagination Test 

	test("Pagination Test ", 24, function(){
		stop();
		paginationTestResponse = orderDemoCursorModel.read({
			parameters : {
				notes : "PaginationTestWithTwoRows"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoCursorModelObjectsPageWithTwoRows  xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>165</toOrderID><cursor numRows=\"2\"/><notes>PaginationTestWithTwoRows</notes></GetOrderDemoCursorModelObjectsPageWithTwoRows ></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
			}
		});
		orderDemoCursorModelObjects = orderDemoCursorModel.OrderDemo();

		equal(orderDemoCursorModelObjects.length, 2, "2 records found");
		equal(orderDemoCursorModelObjects[0].OrderID(), "160");
		equal(orderDemoCursorModelObjects[1].OrderID(), "161");
		paginationTestResponse.always(function(responseObject) {
			equal(responseObject.cursor['@position'], "2");
		})
		
		equal(orderDemoCursorModelObjects.length,orderDemoCursorModel.getSize(),"Model Object Size");
		equal(true,orderDemoCursorModel.hasNext(),"hasNext");
		
		paginationTestResponse = orderDemoCursorModel.getNextPage({
			parameters : {
				notes : "PaginationTestGetNextPage"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoCursorModelObjectsPageWithTwoRows xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>165</toOrderID><cursor numRows=\"2\" xmlns:SOAP=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns=\"http://schemas.cordys.com/html5sdk/orderdemo/1.0\" id=\"1.63\" position=\"2\" maxRows=\"99999997\"/><notes>PaginationTestGetNextPage</notes></GetOrderDemoCursorModelObjectsPageWithTwoRows></SOAP:Body></SOAP:Envelope>";
				equal($($.parseXML(settings.data)).find("cursor").attr("numRows"),"2");
				equal($($.parseXML(settings.data)).find("cursor").attr("id"),"1.63");
				equal($($.parseXML(settings.data)).find("cursor").attr("position"),"2");
				equal($($.parseXML(settings.data)).find("cursor").attr("maxRows"),"99999997");
				//equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
				//Commented temorarily as the assertion is failing in firefox. Error: xmlns attribute for cursor is removed in firefox
			}
		});
		orderDemoCursorModelObjects = orderDemoCursorModel.OrderDemo();
		equal(orderDemoCursorModelObjects.length, 2, "2 records found");
		equal(orderDemoCursorModelObjects[0].OrderID(), "162");
		equal(orderDemoCursorModelObjects[1].OrderID(), "163");
		paginationTestResponse.always(function(responseObject) {
			equal(responseObject.cursor['@position'], "4");
		})
		
		equal(true,orderDemoCursorModel.hasPrevious(),"hasPrevious");
		
		paginationTestResponse = orderDemoCursorModel.getPreviousPage({
			parameters : {
				notes : "PaginationTestGetPreviousPage"
			},
			beforeSend : function(jqXHR,settings) {
				var expectedRequestXML = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetOrderDemoCursorModelObjectsPageWithTwoRows xmlns='http://schemas.cordys.com/html5sdk/orderdemo/1.0'><fromOrderID>160</fromOrderID><toOrderID>165</toOrderID><cursor numRows=\"2\" xmlns:SOAP=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns=\"http://schemas.cordys.com/html5sdk/orderdemo/1.0\" id=\"1.63\" position=\"0\" maxRows=\"99999995\"/><notes>PaginationTestGetPreviousPage</notes></GetOrderDemoCursorModelObjectsPageWithTwoRows></SOAP:Body></SOAP:Envelope>";
				equal($($.parseXML(settings.data)).find("cursor").attr("numRows"),"2");
				equal($($.parseXML(settings.data)).find("cursor").attr("id"),"1.63");
				equal($($.parseXML(settings.data)).find("cursor").attr("position"),"0");
				equal($($.parseXML(settings.data)).find("cursor").attr("maxRows"),"99999995");
				//equal(compareXML(expectedRequestXML,settings.data), true, "Comparing Request XML");
				//Commented temorarily as the assertion is failing in firefox. Error: xmlns attribute for cursor is removed in firefox
			}
		}).done(function(responseObject) {
			orderDemoCursorModelObjects = orderDemoCursorModel.OrderDemo();
			equal(orderDemoCursorModelObjects.length, 2, "2 records found");
			equal(orderDemoCursorModelObjects[0].OrderID(), "160");
			equal(orderDemoCursorModelObjects[1].OrderID(), "161");
			equal(responseObject.cursor['@position'], "2");
			start();
		});
	});
	
	
})(window, jQuery)