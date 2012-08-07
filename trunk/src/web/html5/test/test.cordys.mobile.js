(function(window, $) {

	module("Mobile Plugin Test");

	test("Notification Beep", 0, function(){
		stop();
		$.cordys.mobile.notification.beep(1);
		start();
	});
	
	test("Notification Vibrate", 0, function(){
		stop();
		$.cordys.mobile.notification.vibrate(2000);
		start();
	});
	
/*	test("Notification Alert", 0, function(){
		stop();
		$.cordys.mobile.notification.alert("Alert Notification Test","Alert Notification Test","OK");
		start();
	}); */
	
	test("fileReader Read As Data URL", 1, function(){
		stop();
		$.cordys.mobile.fileReader.readAsDataURL('file:///sdcard/DCIM/Camera/1.jpg', 
			function(data){
				start();
				notEqual(data,undefined);
				//alert("inside fileReader Read As Data URL success callback");
			}, 	
			function(data){
				start();
				equal(data,undefined);
				//alert("inside fileReader Read As Data URL error callback");
		});
	});
	
	test("fileReader Read As Text", 1, function(){
		stop();
		$.cordys.mobile.fileReader.readAsDataURL('file:///sdcard/download/NativeAppTest.txt', 
			function(data){
				start();
				equal(data,"data:text/plain;base64,dGVzdA==");
				//alert("inside fileReader Read As Text success callback");
			}, 	
			function(data){
				start();
				equal(data,undefined);
				//alert("inside fileReader Read As text error callback");
		});
	});
	
	


})(window, jQuery)
	
