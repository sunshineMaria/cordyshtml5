/**
 * Cordys Mobile Plugin - Copyright (c) 2012 Cordys
 * Author: Piet Kruysse
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

;(function (window, $, undefined) {

	if (!$.cordys) $.cordys = {};

	$.cordys.mobile = {
		origin: 'file://'
	};

	// Cookie methods
	$.cordys.cookie = {};
	$.cordys.cookie.getCookies = function(id) {
		parent.postMessage({
			message: 'getCookies',
			parameters: { 
				serverId: id 
			}
		}, $.cordys.mobile.origin);
	};

	// Camera methods
	$.cordys.mobile.camera = {};
	$.cordys.mobile.camera.getPicture = function(success, error, options) {
		this.__onSuccess = success;
		this.__onError = error;
		parent.postMessage({
			message: 'camera.getPicture',
			parameters: {
				options: options
			}
		}, $.cordys.mobile.origin);
	};

	// Notification methods
	$.cordys.mobile.notification = {};
	$.cordys.mobile.notification.alert = function(message, callback, title, buttonName) {
		this.__onCallback = callback;
		parent.postMessage({
			message: 'notification.alert',
			parameters: {
				message: message,
				title: title,
				buttonName: buttonName
			}
		}, $.cordys.mobile.origin);
	};

	window.addEventListener('message', function(evt) {
		if (evt.origin !== $.cordys.mobile.origin) {
			return;
		}
		if (!evt.data) {
			return;
		}
		switch (evt.data.message) {
			case 'cookies.setCookies':
				deleteAllCookies();
				$.each(evt.data.cookies, function(index, cookie) {
					window.document.cookie = cookie.name + '=' + cookie.value + '; path=/cordys;';
				});
			//	console.log(JSON.stringify(evt.data.cookies));
			//	console.log('cookies');
				window.location.reload();
				break;
			case 'camera.getPicture.onSuccess':
				if ($.cordys.mobile.camera.__onSuccess) $.cordys.mobile.camera.__onSuccess(evt.data.parameters);
				break;
			case 'camera.getPicture.onError':
				if ($.cordys.mobile.camera.__onError) $.cordys.mobile.camera.__onError(evt.data.parameters);
				break;
			case 'notification.alert.onCallback':
				if ($.cordys.mobile.notification.__onCallback) $.cordys.mobile.notification.__onCallback(evt.data.parameters);
				break;
		}
	}, false);

})(window, jQuery)
