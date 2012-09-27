(function (window, $) {

	module("Model Plugin Template Test");
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetTemplateTestRequest/,
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
							"OrderID": "161",
							"Customer": "csc",
							"Employee": "ss",
							"OrderDate": "2012-07-10 12:15:17.257",
							"Discount": "21",
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
							"OrderDate": "2012-07-10 12:15:17.257",
							"Discount": "21",
							"Cost": "2"
						}
					}
				}

			 ]
		}
	});

	templateTestModel1 = new $.cordys.model({
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
		template: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "Discount",
			type: "string"
		}]
	});

	/* Test	
	1) If Observables gets added if specified in the template or is part of the response
	2) Observables gets added if specified in the template in both the short and the detailed forms
	3) Observables gets added with the right value in both cases
	*/
	test("Template Attribute Test", 7, function () {
		stop();
		var currentSubscription = templateTestModel1.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[0].Cost), "Observable added even if attribute is not present in response");
			strictEqual(typeof (orders[0].Cost()), "undefined", "Added observable has undefined value");

			ok(ko.isObservable(orders[1].Status), "Observable added even if attribute is not present in response");

			ok(ko.isObservable(orders[0].Notes), "Observable added if attribute is present in respone even if it is not specified in the template");
			strictEqual(orders[0].Notes(), "test", "Added observable from response has correct value");

			ok(ko.isObservable(orders[0].Discount), "Observable added even if attribute is not present in response");
			strictEqual(typeof (orders[0].Discount()), "undefined", "Added observable has undefined value");

			currentSubscription.dispose(currentSubscription);
		});
		templateTestModel1.read({
			method: "GetTemplateTestRequest"
		});
		start();
	});


	templateTestModel2 = new $.cordys.model({
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
		template: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "StatusMessage",
			type: "string",
			computed: function () {
				return this.OrderID() + " " + this.Status()
			}
		}]
	});

	/* Test	
	1) If computed observables are getting added
	2) If the values of the computed observables are correct
	*/
	test("Template Computed Observables Test", 2, function () {
		stop();
		var currentSubscription = templateTestModel2.OrderDemo.subscribe(function (orders) {

			ok(ko.isObservable(orders[1].StatusMessage), "Observable added for computed field");
			strictEqual(orders[0].StatusMessage(), "160 CREATED", "Computed field has correct value");
			currentSubscription.dispose(currentSubscription);
		});
		templateTestModel2.read({
			method: "GetTemplateTestRequest"
		});
		start();
	});


	templateTestModel3 = new $.cordys.model({
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
		template: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "OrderDemoLines",
			isArray: true
		}]
	});

	/* Test	
	1) If array observables are getting added as arrays in
	a) In case the response has arrays
	a) In case the response has only a singleton
	a) In case the response does not have it
	*/
	test("Template Array Test", 4, function () {
		stop();
		var currentSubscription = templateTestModel3.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[2].OrderDemoLines), "Observable added for array field if it does not exist");
			strictEqual($.type(orders[2].OrderDemoLines()), "array", "Observable added for array field is an array");

			strictEqual($.type(orders[0].OrderDemoLines()), "array", "Singleton made into an array for an array field");

			strictEqual($.type(orders[1].OrderDemoLines()), "array", "Array remains an array for an array field");
		});
		templateTestModel3.read({
			method: "GetTemplateTestRequest"
		});
		start();
	});


	templateTestModel4 = new $.cordys.model({
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
		template: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "OrderDemoLines",
			template: ["Product", "Quantity", "Dummy", "Price", {
				name: "Cost",
				computed: function () {
					return new Number(this.Quantity()) * new Number(this.Price());
				}
			}]
		}]
	});

	/* Test	
	1) Whether recursive templates are working
	a) Observables gettting added from inner templates, response with the correct values
	b) Computer Observables gettting added from inner templates with the correct values
	*/
	test("Inner Template Test", 8, function () {
		stop();
		var currentSubscription = templateTestModel4.OrderDemo.subscribe(function (orders) {

			ok(ko.isObservable(orders[0].OrderDemoLines.Dummy), "Observable for inner template added even if attribute is not present in response");
			strictEqual($.type(orders[2].OrderDemoLines.Dummy()), "undefined", "Observable added has value undefined");

			ok(ko.isObservable(orders[0].OrderDemoLines.ShippedFrom), "Observable for inner template added even if attribute is not present in template");
			strictEqual(orders[0].OrderDemoLines.ShippedFrom(), "Africa", "Observable added has value as in the response");

			ok(ko.isObservable(orders[0].OrderDemoLines.Cost), "Computed observable for inner template created");
			strictEqual(orders[0].OrderDemoLines.Cost(), 416000, "Computer observable value for inner template correct");

			strictEqual($.type(orders[2].OrderDemoLines), "function", "Observable added for non-existing inner template");
			strictEqual($.type(orders[2].OrderDemoLines()), "undefined", "Observable added for non-existing inner template returns undefined");
		});
		templateTestModel4.read({
			method: "GetTemplateTestRequest"
		});
		start();
	});

	templateTestModel5 = new $.cordys.model({
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
		template: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "OrderDemoLines",
			isArray: true,
			template: ["Product", "Quantity", "Dummy", "Price", {
				name: "Cost",
				computed: function () {
					return new Number(this.Quantity()) * new Number(this.Price());
				}
			}]
		}]
	});

	/* Test	
	1) Whether recursive templates are working for ones marked arrays
	a) Observables gettting added from inner templates, response with the correct values
	b) Computer Observables gettting added from inner templates with the correct values
	c) Arrays getting added for templates in case of none, singleton and multiple value in the return
	*/
	test("Inner Template Array Test", 9, function () {
		stop();
		var currentSubscription = templateTestModel5.OrderDemo.subscribe(function (orders) {

			ok(ko.isObservable(orders[1].OrderDemoLines()[0].Dummy), "Observable for inner template added even if attribute is not present in response");
			strictEqual($.type(orders[1].OrderDemoLines()[0].Dummy()), "undefined", "Observable added has value undefined");

			strictEqual($.type(orders[0].OrderDemoLines), "function", "Observable added for array template for singleton");
			strictEqual($.type(orders[0].OrderDemoLines()), "array", "Observable added for array template returns array even in case of singleton");

			ok(ko.isObservable(orders[0].OrderDemoLines()[0].ShippedFrom), "Observable for inner template added even if attribute is not present in template");
			strictEqual(orders[0].OrderDemoLines()[0].ShippedFrom(), "Africa", "Observable added has value as in the response");

			ok(ko.isObservable(orders[0].OrderDemoLines()[0].Cost), "Computed observable for inner template created");
			strictEqual(orders[0].OrderDemoLines()[0].Cost(), 416000, "Computer observable value for inner template correct");

			strictEqual($.type(orders[2].OrderDemoLines), "function", "Observable added for array template");
			//strictEqual($.type(orders[2].OrderDemoLines()), "array", "Observable added for array template returns array even if it is not there in the response");
		});
		templateTestModel5.read({
			method: "GetTemplateTestRequest"
		});
		start();
	});

})(window, jQuery)