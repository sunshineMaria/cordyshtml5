(function(window, $) {

	module("Interactive Mobile Plugin Test");

	/*
	
	The following tests are covered under interactive model plugin test-involves user interaction in 3,4 and 7
		1. Notification: Alert
		2. Notification: Confirm
		3. camera: getPicture
	
	*/


//1. Notification: Alert	
	test("Notification Alert", 1, function(){
		$.cordys.mobile.notification.alert("Alert Notification Test", function(){
			ok(true);
			start();
		},
		"Alert Notification Test", "OK");
		stop();
	});

//2. Notification: Confirm
	test("Notification Confirm", 1, function(){
		stop();
		$.cordys.mobile.notification.confirm('Confirm Notification Test', function(){
			ok(true);
			start();
		},'Cofirm Notification Test','Yes,No');
		
	});
	
//3. camera: getPicture
	test("camera getPicture", 1, function(){
		stop();
		$.cordys.mobile.camera.getPicture(function(parameters) {
			start();
			notEqual(parameters.imageData, undefined);
		}, function() {
			start();
			ok(false, "getPicture not successful")
		}, {
			quality: 50, 
			destinationType: $.cordys.mobile.camera.DestinationType.DATA_URL
		});
	});

})(window, jQuery)
	
