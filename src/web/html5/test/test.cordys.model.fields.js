(function (window, $) {

	module("Model Plugin with Fields Attribute Test");
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetFieldsTestRequest/,
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

	var fieldsTestModel1 = new $.cordys.model({
		objectName: "OrderDemo",
		isReadOnly: true,
		defaults: {
			namespace: "http://schemas.cordys.com/html5sdk/orderdemo/1.0",
			async: false,
			dataType: "json",
			error: function () {
				return false;
			}
		},
		fields: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "Discount",
			type: "string"
		}]
	});

	var fieldTestModelData = {
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
		};

	/* Test	
	1) If Observables gets added if specified in the fields attribute or is part of the response
	2) Observables gets added if specified in the fields attribute in both the short and the detailed forms
	3) Observables gets added with the right value in both cases
	*/
	test("Fields Attribute Test Without Observables", 7, function () {
		stop();

		fieldsTestModel1.read({
			method: "GetFieldsTestRequest"
		});

		var orders = fieldsTestModel1.OrderDemo();

		ok(!ko.isObservable(orders[0].Cost), "Object added when model is read only");
		strictEqual(typeof (orders[0].Cost), "undefined", "Object added even if attribute is not present in response when model is read only");

		ok(!ko.isObservable(orders[1].Status), "Object added when model is read only");

		ok(!ko.isObservable(orders[0].Notes), "Object added when model is read only");
		strictEqual(orders[0].Notes, "test", "Added Object from response has correct value");

		ok(!ko.isObservable(orders[0].Discount), "Object added when model is read only");
		strictEqual(typeof (orders[0].Discount), "undefined", "Added Object has undefined value");

		start();
	});

	test("Fields Attribute Test Without Observables- using putData to add data to model object", 7, function () {
		stop();

		fieldsTestModel1.clear();
		
		var orders = fieldsTestModel1.putData(fieldTestModelData);

		ok(!ko.isObservable(orders[0].Cost), "Object added when model is read only");
		strictEqual(typeof (orders[0].Cost), "undefined", "Object added even if attribute is not present in response when model is read only");

		ok(!ko.isObservable(orders[1].Status), "Object added when model is read only");

		ok(!ko.isObservable(orders[0].Notes), "Object added when model is read only");
		strictEqual(orders[0].Notes, "test", "Added Object from response has correct value");

		ok(!ko.isObservable(orders[0].Discount), "Object added when model is read only");
		strictEqual(typeof (orders[0].Discount), "undefined", "Added Object has undefined value");

		start();
	});

	var fieldsTestModel1Obs = new $.cordys.model({
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
		fields: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "Discount",
			type: "string"
		}]
	});

	/* Test	
	1) If Observables gets added if specified in the fields attribute or is part of the response
	2) Observables gets added if specified in the fields in both the short and the detailed forms
	3) Observables gets added with the right value in both cases
	*/
	test("Fields Attribute Test With Observables", 7, function () {
		stop();
		var currentSubscription = fieldsTestModel1Obs.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[0].Cost), "Observable added even if attribute is not present in response");
			strictEqual(typeof (orders[0].Cost()), "undefined", "Added observable has undefined value");

			ok(ko.isObservable(orders[1].Status), "Observable added even if attribute is not present in response");

			ok(ko.isObservable(orders[0].Notes), "Observable added if attribute is present in respone even if it is not specified in the attribute");
			strictEqual(orders[0].Notes(), "test", "Added observable from response has correct value");

			ok(ko.isObservable(orders[0].Discount), "Observable added even if attribute is not present in response");
			strictEqual(typeof (orders[0].Discount()), "undefined", "Added observable has undefined value");

			currentSubscription.dispose(currentSubscription);
		});
		fieldsTestModel1Obs.read({
			method: "GetFieldsTestRequest"
		});

		// Fields definitions should make a change in the original object and set the dirty flag
		fieldsTestModel1Obs.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});

	test("Fields Attribute Test With Observables - using putData to add data to model object", 7, function () {
		stop();
		fieldsTestModel1Obs.clear();

		var currentSubscription = fieldsTestModel1Obs.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[0].Cost), "Observable added even if attribute is not present in response");
			strictEqual(typeof (orders[0].Cost()), "undefined", "Added observable has undefined value");

			ok(ko.isObservable(orders[1].Status), "Observable added even if attribute is not present in response");

			ok(ko.isObservable(orders[0].Notes), "Observable added if attribute is present in respone even if it is not specified in the attribute");
			strictEqual(orders[0].Notes(), "test", "Added observable from response has correct value");

			ok(ko.isObservable(orders[0].Discount), "Observable added even if attribute is not present in response");
			strictEqual(typeof (orders[0].Discount()), "undefined", "Added observable has undefined value");

			currentSubscription.dispose(currentSubscription);
		});

		fieldsTestModel1Obs.putData(fieldTestModelData);

		// Fields definitions should make a change in the original object and set the dirty flag
		fieldsTestModel1Obs.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});


	var fieldsTestModel2 = new $.cordys.model({
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
		fields: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
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

	/* Test	
	1) If computed observables are getting added
	2) If the values of the computed observables are correct
	3) If observables get correctly added with path specified, with the correct values
	*/
	test("Fields Attribute Computed Observables Test", 4, function () {
		stop();
		var currentSubscription = fieldsTestModel2.OrderDemo.subscribe(function (orders) {

			ok(ko.isObservable(orders[1].StatusMessage), "Observable added for computed field");
			strictEqual(orders[0].StatusMessage(), "160 CREATED", "Computed field has correct value");

			ok(ko.isObservable(orders[1].Birthday), "Observable added for field with path even if the path does not exist");
			strictEqual(orders[0].Birthday(), "2012-07-10 10:29:16.140000000", "Field with path has correct value");

			currentSubscription.dispose(currentSubscription);
		});
		fieldsTestModel2.read({
			method: "GetFieldsTestRequest"
		});

		// Field definitions should make a change in the original object and set the dirty flag
		fieldsTestModel2.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});

	test("Fields Attribute Computed Observables Test - using putData to add data to model object", 4, function () {
		stop();

		fieldsTestModel2.clear();

		var currentSubscription = fieldsTestModel2.OrderDemo.subscribe(function (orders) {

			ok(ko.isObservable(orders[1].StatusMessage), "Observable added for computed field");
			strictEqual(orders[0].StatusMessage(), "160 CREATED", "Computed field has correct value");

			ok(ko.isObservable(orders[1].Birthday), "Observable added for field with path even if the path does not exist");
			strictEqual(orders[0].Birthday(), "2012-07-10 10:29:16.140000000", "Field with path has correct value");

			currentSubscription.dispose(currentSubscription);
		});
		fieldsTestModel2.putData(fieldTestModelData);

		// Field definitions should make a change in the original object and set the dirty flag
		fieldsTestModel2.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});


	var fieldsTestModel3 = new $.cordys.model({
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
		fields: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
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
	test("Fields Array Test", 4, function () {
		stop();
		var currentSubscription = fieldsTestModel3.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[2].OrderDemoLines), "Observable added for array fields if it does not exist");
			strictEqual($.type(orders[2].OrderDemoLines()), "array", "Observable added for array fields is an array");

			strictEqual($.type(orders[0].OrderDemoLines()), "array", "Singleton made into an array for an array fields");

			strictEqual($.type(orders[1].OrderDemoLines()), "array", "Array remains an array for an array fields");

			currentSubscription.dispose(currentSubscription);
		});
		fieldsTestModel3.read({
			method: "GetFieldsTestRequest"
		});

		// Fields definitions should make a change in the original object and set the dirty flag
		fieldsTestModel3.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});

	test("Fields Array Test - using putData to add data to model object", 4, function () {
		stop();
		fieldsTestModel3.clear();

		var currentSubscription = fieldsTestModel3.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[2].OrderDemoLines), "Observable added for array fields if it does not exist");
			strictEqual($.type(orders[2].OrderDemoLines()), "array", "Observable added for array fields is an array");

			strictEqual($.type(orders[0].OrderDemoLines()), "array", "Singleton made into an array for an array fields");

			strictEqual($.type(orders[1].OrderDemoLines()), "array", "Array remains an array for an array fields");

			currentSubscription.dispose(currentSubscription);
		});
		fieldsTestModel3.putData(fieldTestModelData);

		// Fields definitions should make a change in the original object and set the dirty flag
		fieldsTestModel3.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});


	var fieldsTestModel4 = new $.cordys.model({
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
		fields: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "OrderDemoLines",
			fields: ["Product", "Quantity", "Dummy", "Price", {
				name: "Cost",
				computed: function () {
					return new Number(this.Quantity()) * new Number(this.Price());
				}
			}, {
				name: "ItemName",
				type: "string",
				path: "Product"
			}]
		}]
	});

	/* Test	
	1) Whether recursive fields attribute is working
	a) Observables gettting added from nested fields, response with the correct values
	b) Computer Observables gettting added from nested fields with the correct values
	*/
	test("Nested Fields Test", 10, function () {
		stop();
		var currentSubscription = fieldsTestModel4.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[0].OrderDemoLines.Dummy), "Observable for nested fields added even if attribute is not present in response");
			strictEqual($.type(orders[2].OrderDemoLines.Dummy()), "undefined", "Observable added has value undefined");

			ok(ko.isObservable(orders[0].OrderDemoLines.ShippedFrom), "Observable for nested fields added even if attribute is not present in fields");
			strictEqual(orders[0].OrderDemoLines.ShippedFrom(), "Africa", "Observable added has value as in the response");

			ok(ko.isObservable(orders[0].OrderDemoLines.Cost), "Computed observable for nested fields created");
			strictEqual(orders[0].OrderDemoLines.Cost(), 416000, "Computer observable value for nested fields correct");

			strictEqual($.type(orders[2].OrderDemoLines), "function", "Observable added for non-existing nested fields");
			strictEqual($.type(orders[2].OrderDemoLines()), "undefined", "Observable added for non-existing nested fields returns undefined");

			ok(ko.isObservable(orders[0].OrderDemoLines.ItemName), "Observable added for field with path even if the path does not exist");
			strictEqual(orders[0].OrderDemoLines.ItemName(), "Tyre", "Field with path has correct value");

			currentSubscription.dispose(currentSubscription);
		});
		fieldsTestModel4.read({
			method: "GetFieldsTestRequest"
		});

		// Fields definitions should make a change in the original object and set the dirty flag
		fieldsTestModel4.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});

	test("Nested Fields Test - using putData to add data to model object", 10, function () {
		stop();

		fieldsTestModel4.clear();
		var currentSubscription = fieldsTestModel4.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[0].OrderDemoLines.Dummy), "Observable for nested fields added even if attribute is not present in response");
			strictEqual($.type(orders[2].OrderDemoLines.Dummy()), "undefined", "Observable added has value undefined");

			ok(ko.isObservable(orders[0].OrderDemoLines.ShippedFrom), "Observable for nested fields added even if attribute is not present in fields");
			strictEqual(orders[0].OrderDemoLines.ShippedFrom(), "Africa", "Observable added has value as in the response");

			ok(ko.isObservable(orders[0].OrderDemoLines.Cost), "Computed observable for nested fields created");
			strictEqual(orders[0].OrderDemoLines.Cost(), 416000, "Computer observable value for nested fields correct");

			strictEqual($.type(orders[2].OrderDemoLines), "function", "Observable added for non-existing nested fields");
			strictEqual($.type(orders[2].OrderDemoLines()), "undefined", "Observable added for non-existing nested fields returns undefined");

			ok(ko.isObservable(orders[0].OrderDemoLines.ItemName), "Observable added for field with path even if the path does not exist");
			strictEqual(orders[0].OrderDemoLines.ItemName(), "Tyre", "Field with path has correct value");

			currentSubscription.dispose(currentSubscription);

		});
		fieldsTestModel4.putData(fieldTestModelData);

		// Fields definitions should make a change in the original object and set the dirty flag
		fieldsTestModel4.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});

	var fieldsTestModel5 = new $.cordys.model({
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
		fields: ["OrderID", "Customer", "Employee", "BirthDate", "Cost", "Status", {
			name: "OrderDemoLines",
			isArray: true,
			fields: ["Product", "Quantity", "Dummy", "Price", {
				name: "Cost",
				computed: function () {
					return new Number(this.Quantity()) * new Number(this.Price());
				}
			}, {
				name: "ItemName",
				type: "string",
				path: "Product"
			}]
		}]
	});

	/* Test	
	1) Whether recursive Fields attribute is working for ones marked arrays
	a) Observables gettting added from inner fields, response with the correct values
	b) Computer Observables gettting added from inner fields with the correct values
	c) Arrays getting added for fields in case of none, singleton and multiple value in the return
	*/
	test("Nested Fields Array Test", 12, function () {
		stop();
		var currentSubscription = fieldsTestModel5.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[1].OrderDemoLines()[0].Dummy), "Observable for nested fields added even if attribute is not present in response");
			strictEqual($.type(orders[1].OrderDemoLines()[0].Dummy()), "undefined", "Observable added has value undefined");

			strictEqual($.type(orders[0].OrderDemoLines), "function", "Observable added for array fields for singleton");
			strictEqual($.type(orders[0].OrderDemoLines()), "array", "Observable added for array fields returns array even in case of singleton");

			ok(ko.isObservable(orders[0].OrderDemoLines()[0].ShippedFrom), "Observable for nested fields added even if attribute is not present in fields");
			strictEqual(orders[0].OrderDemoLines()[0].ShippedFrom(), "Africa", "Observable added has value as in the response");

			ok(ko.isObservable(orders[0].OrderDemoLines()[0].Cost), "Computed observable for nested fields created");
			strictEqual(orders[0].OrderDemoLines()[0].Cost(), 416000, "Computer observable value for nested fields correct");

			strictEqual($.type(orders[2].OrderDemoLines), "function", "Observable added for array fields");
			strictEqual($.type(orders[2].OrderDemoLines()), "array", "Observable added for array fields returns array even if it is not there in the response");

			ok(ko.isObservable(orders[0].OrderDemoLines()[0].ItemName), "Observable added for field with path even if the path does not exist");
			strictEqual(orders[0].OrderDemoLines()[0].ItemName(), "Tyre", "Field with path has correct value");

			currentSubscription.dispose(currentSubscription);
		});
		fieldsTestModel5.read({
			method: "GetFieldsTestRequest"
		});

		// Fields definitions should make a change in the original object and set the dirty flag
		fieldsTestModel5.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});

	test("Nested Fields Array Test- using putData to add data to model object", 12, function () {
		stop();
		fieldsTestModel5.clear();

		var currentSubscription = fieldsTestModel5.OrderDemo.subscribe(function (orders) {
			ok(ko.isObservable(orders[1].OrderDemoLines()[0].Dummy), "Observable for nested fields added even if attribute is not present in response");
			strictEqual($.type(orders[1].OrderDemoLines()[0].Dummy()), "undefined", "Observable added has value undefined");

			strictEqual($.type(orders[0].OrderDemoLines), "function", "Observable added for array fields for singleton");
			strictEqual($.type(orders[0].OrderDemoLines()), "array", "Observable added for array fields returns array even in case of singleton");

			ok(ko.isObservable(orders[0].OrderDemoLines()[0].ShippedFrom), "Observable for nested fields added even if attribute is not present in fields");
			strictEqual(orders[0].OrderDemoLines()[0].ShippedFrom(), "Africa", "Observable added has value as in the response");

			ok(ko.isObservable(orders[0].OrderDemoLines()[0].Cost), "Computed observable for nested fields created");
			strictEqual(orders[0].OrderDemoLines()[0].Cost(), 416000, "Computer observable value for nested fields correct");

			strictEqual($.type(orders[2].OrderDemoLines), "function", "Observable added for array fields");
			strictEqual($.type(orders[2].OrderDemoLines()), "array", "Observable added for array fields returns array even if it is not there in the response");

			ok(ko.isObservable(orders[0].OrderDemoLines()[0].ItemName), "Observable added for field with path even if the path does not exist");
			strictEqual(orders[0].OrderDemoLines()[0].ItemName(), "Tyre", "Field with path has correct value");

			currentSubscription.dispose(currentSubscription);
		});
		fieldsTestModel5.putData(fieldTestModelData);

		// Fields definitions should make a change in the original object and set the dirty flag
		fieldsTestModel5.synchronize({
			method: "UpdateFieldsTestRequest",
			beforeSend: function (jqXHR, settings) {
				ok(false, "Error : Fields Definition set a dirty flag causing the request to be sent here");
			}
		});

		start();
	});

})(window, jQuery)