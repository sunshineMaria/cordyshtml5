(function(window, $) {

	module("Mobile Plugin Test");
	
	/*
	
	The following tests are covered under model plugin test
		1. Notification: Beep
		2. Notification: Vibrate
		3. fileReader: Read As Data URL (Prerequisite: A picture '1.jpg' in location /sdcard/DCIM/Camera in the device )
		4. fileReader: Read As Text (Prerequisite: A text file 'NativeAppTest.txt' in location /sdcard/download/ in the device )

	
	*/

//1. Notification: Beep
	test("Notification Beep", 0, function(){
		stop();
		$.cordys.mobile.notification.beep(1);
		start();
	});

//2. Notification: Vibrate
	test("Notification Vibrate", 0, function(){
		stop();
		$.cordys.mobile.notification.vibrate(2000);
		start();
	});
	
//3. fileReader: Read As Data URL
	test("fileReader Read As Data URL", 1, function(){
		stop();
		$.cordys.mobile.fileReader.readAsDataURL('file:///sdcard/DCIM/Camera/1.jpg', 
			function(){
				start();
				ok(true, "inside fileReader Read As Data URL success callback");
				//notEqual(data, undefined, "file read as Data URL: Successful");
			}, 	
			function(){
				start();
				ok(false,"inside fileReader Read As Data URL error callback");
				//equal(data, undefined, "file read as Data URL: Failed");
		});
	});
	
//4. fileReader: Read As Text
	test("fileReader Read As Text", 1, function(){
		stop();
		$.cordys.mobile.fileReader.readAsDataURL('file:///sdcard/download/NativeAppTest.txt', 
			function(){
				start();
				ok(true, "inside fileReader Read As Text success callback");
				//equal(data, "data:text/plain;base64,dGVzdA==", "file read as Text: Successful");
			}, 	
			function(){
				start();
				ok(false, "inside fileReader Read As text error callback");
				//ok(false, "file read as Text: Failed");
		});
	});
	
})(window, jQuery)
	
