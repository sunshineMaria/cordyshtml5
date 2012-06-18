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
		this.__onSuccess = successCallback;
		this.__onError = errorCallback;
		parent.postMessage({
			message: "camera.getPicture",
			parameters: {
				options: options
			}
		}, $.cordys.mobile.origin);
	};

	// Notification methods
	$.cordys.mobile.notification = {};
	$.cordys.mobile.notification.alert = function(message, alertCallback, title, buttonName) {
		this.__alertCallback = alertCallback;
		parent.postMessage({
			message: "notification.alert",
			parameters: {
				message: message,
				title: title,
				buttonName: buttonName
			}
		}, $.cordys.mobile.origin);
	};
	$.cordys.mobile.notification.confirm = function(message, confirmCallback, title, buttonLabels) {
		this.__confirmCallback = confirmCallback;
		parent.postMessage({
			message: "notification.confirm",
			parameters: {
				message: message,
				title: title,
				buttonLabels: buttonLabels
			}
		}, $.cordys.mobile.origin);
	}
	$.cordys.mobile.notification.beep = function(times) {
		parent.postMessage({
			message: "notification.beep",
			parameters: {
				times: times
			}
		}, $.cordys.mobile.origin);
	}
	$.cordys.mobile.notification.vibrate = function(milliseconds) {
		parent.postMessage({
			message: "notification.vibrate",
			parameters: {
				milliseconds: milliseconds
			}
		}, $.cordys.mobile.origin);
	}

	// File methods
	$.cordys.mobile.fileTransfer = {};
	$.cordys.mobile.fileTransfer.upload = function(filePath, server, successCallback, errorCallback, options) {
		this.__uploadSuccess = successCallback;
		this.__uploadError = errorCallback;
		parent.postMessage({
			message: "fileTransfer.upload",
			parameters: {
				filePath: filePath,
				server: server,
				options: options
			}
		}, $.cordys.mobile.origin);
	}
	$.cordys.mobile.fileTransfer.download = function() {
	}
	$.cordys.mobile.fileReader = {};
	$.cordys.mobile.fileReader.readAsDataURL = function(filePath, successCallback, errorCallback) {
		this.__readURLSuccess = successCallback;
		this.__readURLError = errorCallback;
		parent.postMessage({
			message: "fileReader.readAsDataURL",
			parameters: {
				filePath: filePath
			}
		}, $.cordys.mobile.origin);
	}
	$.cordys.mobile.fileReader.readAsText = function(filePath, successCallback, errorCallback) {
		this.__readTextSuccess = successCallback;
		this.__readTextError = errorCallback;
		parent.postMessage({
			message: "fileReader.readAsText",
			parameters: {
				filePath: filePath
			}
		}, $.cordys.mobile.origin);
	}
	$.cordys.mobile.loadScript = function(filePath, successCallback, errorCallback) {
		this.__loadScriptSuccess = successCallback;
		this.__loadScriptError = errorCallback;
		parent.postMessage({
			message: "loadScript",
			parameters: {
				filePath: filePath
			}
		}, $.cordys.mobile.origin);
	}

	window.addEventListener("message", function(evt) {
		if (evt.origin !== $.cordys.mobile.origin || !evt.data) {
			return;
		}
		switch (evt.data.message) {
			case "cookies.setCookies":
				deleteAllCookies();
				$.each(evt.data.parameters.cookies, function(index, cookie) {
					window.document.cookie = cookie.name + "=" + cookie.value + "; path=/cordys;";
				});
				window.location.reload();
				break;
			case "camera.getPicture.onSuccess":
				if ($.cordys.mobile.camera.__onSuccess) $.cordys.mobile.camera.__onSuccess(evt.data.parameters);
				break;
			case "camera.getPicture.onError":
				if ($.cordys.mobile.camera.__onError) $.cordys.mobile.camera.__onError(evt.data.parameters.error);
				break;
			case "notification.alert.onCallback":
				if ($.cordys.mobile.notification.__alertCallback) $.cordys.mobile.notification.__alertCallback(evt.data.parameters);
				break;
			case "notification.confirm.onCallback":
				if ($.cordys.mobile.notification.__confirmCallback) $.cordys.mobile.notification.__confirmCallback(evt.data.parameters);
				break;
			case "fileTransfer.upload.onSuccess":
				if ($.cordys.mobile.fileTransfer.__uploadSuccess) $.cordys.mobile.fileTransfer.__uploadSuccess(evt.data.parameters.result);
				break;
			case "fileTransfer.upload.onError":
				if ($.cordys.mobile.fileTransfer.__uploadError) $.cordys.mobile.fileTransfer.__uploadError(evt.data.parameters.error);
				break;
			case "fileReader.readAsDataURL.onSuccess":
				if ($.cordys.mobile.fileReader.__readURLSuccess) $.cordys.mobile.fileReader.__readURLSuccess(evt.data.parameters.result);
				break;
			case "fileReader.readAsDataURL.onError":
				if ($.cordys.mobile.fileReader.__readURLError) $.cordys.mobile.fileReader.__readURLError(evt.data.parameters.error);
				break;
			case "fileReader.readAsText.onSuccess":
				if ($.cordys.mobile.fileReader.__readTextSuccess) $.cordys.mobile.fileReader.__readTextSuccess(evt.data.parameters.result);
				break;
			case "fileReader.readAsText.onError":
				if ($.cordys.mobile.fileReader.__readTextError) $.cordys.mobile.fileReader.__readTextError(evt.data.parameters.error);
				break;
			case "loadScript.onSuccess":
				if ($.cordys.mobile.__loadScriptSuccess) $.cordys.mobile.__loadScriptSuccess(evt.data.parameters.result);
				break;
			case "loadScript.onError":
				if ($.cordys.mobile.__loadScriptError) $.cordys.mobile.__loadScriptError(evt.data.parameters.error);
				break;
		}
	}, false);

})(window, jQuery)
