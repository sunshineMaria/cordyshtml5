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

	var TESTSWARM_URI = 'http://10.1.29.109:8080';

	$.cordys.mobile = {
		origin: 'file://'
	};

	// Cookie methods
	$.cordys.cookie = {};
	$.cordys.cookie.getCookies = function(id) {
		window._$DefCookies = window._$DefCookies || $.Deferred();
		postMessageToParent({
			message: "getCookies",
			parameters: { 
				serverId: id 
			}
		}, $.cordys.mobile.origin);
	};

	// Camera defines and methods
	$.cordys.mobile.camera = {
		DestinationType: {
			DATA_URL: 0,			// Return image as base64 encoded string
			FILE_URI: 1				// Return image file URI
		},
		PictureSourceType: {
			PHOTOLIBRARY: 0,
			CAMERA: 1,
			SAVEDPHOTOALBUM: 2
		},
		EncodingType: {
			JPEG: 0,				// Return JPEG encoded image
			PNG: 1					// Return PNG encoded image
		},
		MediaType: { 
			PICTURE: 0,				// allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
			VIDEO: 1,				// allow selection of video only, WILL ALWAYS RETURN FILE_URI
			ALLMEDIA: 2				// allow selection from all media types
		}
	};

	$.cordys.mobile.camera.getPicture = function(successCallback, errorCallback, options) {
		this.deferred = $.Deferred();
		if (typeof(successCallback) !== "function") {
			options = successCallback;
		} else {
			this.deferred.done(successCallback);
			this.deferred.fail(errorCallback);
		}

		postMessageToParent({
			message: "camera.getPicture",
			parameters: {
				options: options
			}
		}, $.cordys.mobile.origin);
		return this.deferred.promise();
	};

	// Notification methods
	$.cordys.mobile.notification = {};
	$.cordys.mobile.notification.alert = function(message, alertCallback, title, buttonName) {
		this.alertDeferred = $.Deferred();
		if (typeof(alertCallback) !== "function") {
			buttonName = title;
			title = alertCallback;
		} else {
			this.alertDeferred.done(alertCallback);
		}
		postMessageToParent({
			message: "notification.alert",
			parameters: {
				message: message,
				title: title,
				buttonName: buttonName
			}
		}, $.cordys.mobile.origin);
		return this.alertDeferred.promise();
	};
	$.cordys.mobile.notification.confirm = function(message, confirmCallback, title, buttonLabels) {
		this.confirmDeferred = $.Deferred();
		if (typeof(confirmCallback) !== "function") {
			buttonLabels = title;
			title = confirmCallback;
		} else {
			this.confirmDeferred.done(confirmCallback);
		}
		postMessageToParent({
			message: "notification.confirm",
			parameters: {
				message: message,
				title: title,
				buttonLabels: buttonLabels
			}
		}, $.cordys.mobile.origin);
		return this.confirmDeferred.promise();
	}
	$.cordys.mobile.notification.beep = function(times) {
		postMessageToParent({
			message: "notification.beep",
			parameters: {
				times: times
			}
		}, $.cordys.mobile.origin);
	}
	$.cordys.mobile.notification.vibrate = function(milliseconds) {
		postMessageToParent({
			message: "notification.vibrate",
			parameters: {
				milliseconds: milliseconds
			}
		}, $.cordys.mobile.origin);
	}

	// File methods
	$.cordys.mobile.fileTransfer = {};
	$.cordys.mobile.fileTransfer.upload = function(filePath, server, successCallback, errorCallback, options) {
		this.uploadDeferred = $.Deferred();
		if (typeof(successCallback) !== "function") {
			options = successCallback;
		} else {
			this.uploadDeferred.done(successCallback);
			this.uploadDeferred.fail(errorCallback);
		}

		postMessageToParent({
			message: "fileTransfer.upload",
			parameters: {
				filePath: filePath,
				server: server,
				options: options
			}
		}, $.cordys.mobile.origin);
		return this.uploadDeferred.promise();
	}
	$.cordys.mobile.fileTransfer.download = function() {
	}
	$.cordys.mobile.fileReader = {};
	$.cordys.mobile.fileReader.readAsDataURL = function(filePath, successCallback, errorCallback) {
		this.readURLDeferred = $.Deferred();
		this.readURLDeferred.done(successCallback);
		this.readURLDeferred.fail(errorCallback);

		postMessageToParent({
			message: "fileReader.readAsDataURL",
			parameters: {
				filePath: filePath
			}
		}, $.cordys.mobile.origin);
		return this.readURLDeferred.promise();
	}
	$.cordys.mobile.fileReader.readAsText = function(filePath, encoding, successCallback, errorCallback) {
		this.readTextDeferred = $.Deferred();
		this.readTextDeferred.done(successCallback);
		this.readTextDeferred.fail(errorCallback);

		postMessageToParent({
			message: "fileReader.readAsText",
			parameters: {
				filePath: filePath,
				encoding: encoding
			}
		}, $.cordys.mobile.origin);
		return this.readTextDeferred.promise();
	}
	$.cordys.mobile.loadScript = function(filePath, successCallback, errorCallback) {
		this.loadScriptDeferred = $.Deferred();
		this.loadScriptDeferred.done(successCallback);
		this.loadScriptDeferred.fail(errorCallback);

		postMessageToParent({
			message: "loadScript",
			parameters: {
				filePath: filePath
			}
		}, $.cordys.mobile.origin);
		return this.loadScriptDeferred.promise();
	}

	// Globalization methods
	$.cordys.mobile.globalization = {};
	$.cordys.mobile.globalization.getLocaleName = function(successCallback, errorCallback) {
		this.getLocaleNameDeferred = $.Deferred();
		if (successCallback) this.getLocaleNameDeferred.done(successCallback);
		if (errorCallback) this.getLocaleNameDeferred.fail(errorCallback);

		postMessageToParent({
			message: "globalization.getLocaleName"
		}, $.cordys.mobile.origin);
		return this.getLocaleNameDeferred.promise();
	};

	postMessageToParent = function(data, origin){
		// TODO: Fix this
		// Temporary hack to communicate through the TestSwarm Runner
		origin = (document.referrer.indexOf(TESTSWARM_URI) == 0) ? TESTSWARM_URI : origin;
		parent.postMessage(data, origin);
	}

	window.addEventListener("message", function(evt) {
		// TODO: Fix this
		// Temporary hack to communicate with the testswarm runner
		if ((evt.origin !== $.cordys.mobile.origin && evt.origin != TESTSWARM_URI) || !evt.data) {
			return;
		}
		switch (evt.data.message) {
			case "cookies.setCookies":
				var cookiePath = evt.data.parameters.cookies.path;
				if (cookiePath) {
					$.cordys.cookiePath = cookiePath;
				}
				deleteAllCookies();
				$.each(evt.data.parameters.cookies, function(index, cookie) {
					if (cookie.name) window.document.cookie = cookie.name + "=" + cookie.value + "; path=" + $.cordys.cookiePath;
				});
				if (window._$DefCookies) {
					window._$DefCookies.resolve();
				} else {
					window.location.reload();
				}
				break;
			case "camera.getPicture.onSuccess":
				$.cordys.mobile.camera.deferred.resolve(evt.data.parameters);
				break;
			case "camera.getPicture.onError":
				$.cordys.mobile.camera.deferred.reject(evt.data.parameters.error);
				break;
			case "notification.alert.onCallback":
				$.cordys.mobile.notification.alertDeferred.resolve(evt.data.parameters);
				break;
			case "notification.confirm.onCallback":
				$.cordys.mobile.notification.confirmDeferred.resolve(evt.data.parameters);
				break;
			case "fileTransfer.upload.onSuccess":
				$.cordys.mobile.fileTransfer.uploadDeferred.resolve(evt.data.parameters.result);
				break;
			case "fileTransfer.upload.onError":
				$.cordys.mobile.fileTransfer.uploadDeferred.reject(evt.data.parameters.error);
				break;
			case "fileReader.readAsDataURL.onSuccess":
				$.cordys.mobile.fileReader.readURLDeferred.resolve(evt.data.parameters.result);
				break;
			case "fileReader.readAsDataURL.onError":
				$.cordys.mobile.fileReader.readURLDeferred.reject(evt.data.parameters.error);
				break;
			case "fileReader.readAsText.onSuccess":
				$.cordys.mobile.fileReader.readTextDeferred.resolve(evt.data.parameters.result);
				break;
			case "fileReader.readAsText.onError":
				$.cordys.mobile.fileReader.readTextDeferred.reject(evt.data.parameters.error);
				break;
			case "loadScript.onSuccess":
				$.cordys.mobile.loadScriptDeferred.resolve(evt.data.parameters.result);
				break;
			case "loadScript.onError":
				$.cordys.mobile.loadScriptDeferred.reject(evt.data.parameters.error);
				break;
			case "globalization.getLocaleName.onSuccess":
				$.cordys.mobile.globalization.getLocaleNameDeferred.resolve(evt.data.parameters.result);
				break;
			case "globalization.getLocaleName.onError":
				$.cordys.mobile.globalization.getLocaleNameDeferred.reject(evt.data.parameters.error);
				break;
		}
	}, false);

})(window, jQuery)
