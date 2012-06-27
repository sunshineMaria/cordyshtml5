/**
 * Copyright (c) 2012 Cordys
 * Author: Piet Kruysse
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

;(function (window, $, undefined) {

	if (!$.cordys) {
		throw new Error("The Cordys HTML5 SDK is required, please ensure it is loaded properly");
	}

	$.cordys.process = new function() {
		var self = this,
			processAttachmentsModel,
			businessIdentifiersModel;

		this.getBusinessIdentifiers = function(processInstance, options) {
			var callback = options.success;
			options.success = function(data) {
				var identifiers = data.sort(function(a, b) {
					return parseInt(a.Sequence) > parseInt(b.Sequence);
				});
				if (callback) {
					callback(identifiers);
				}
			};
			options = $.extend({
				method: "GetBusinessIdentifierValues",
				namespace: "http://schemas.cordys.com/pim/queryinstancedata/1.0",
				dataType: 'json',
				parameters: {
					processInstanceID: getProcessInstanceId(processInstance)
				}
			}, options);
			if (!self.businessIdentifiersModel) {
				self.businessIdentifiersModel = new $.cordys.model({
					objectName: "BusinessIdentifier",
					read: options
				});
				if (options.context) {
				//	ko.applyBindingsToNode(options.context, null, self.businessIdentifiersModel);
					ko.applyBindings(self.businessIdentifiersModel, options.context);
				}
			}
			self.businessIdentifiersModel.read(options);
			return self.businessIdentifiersModel;
		};

		this.startProcess = function(processIdent, processMessage, options) {
			options = options || {};
			options.parameters = $.extend({type: "definition"}, options.parameters);
			return this.executeProcess(processIdent, processMessage, options);
		};

		this.executeProcess = function(processInstance, processMessage, options) {
			options = options || {};
			if ($.isArray(options.parameters)) {
				options.parameters = mergeArraysWithDistinctKey(options.parameters || [], [
					{name:"receiver",	value: getProcessInstanceId(processInstance)},
					{name:"type",		value: "instance"},
					{name:"message",	value: processMessage}
				], "name");
			} else {
				options.parameters = $.extend({
					receiver: getProcessInstanceId(processInstance),
					type: "instance",
					message: processMessage
				}, options.parameters);
			}
			options = $.extend({
				method: "ExecuteProcess",
				namespace: "http://schemas.cordys.com/bpm/execution/1.0",
				dataType: 'json'
			}, options);
			return $.cordys.ajax(options);
		};

		// Attachments
		this.getAttachments = function(processInstance, options) {
			options = getOptionsForProcessMethod("GetAttachments", options, {
				instanceid: {
					"@type": "BPM",
					text: getProcessInstanceId(processInstance)
				},
				activityid: processInstance.ActivityId
			}, "http://schemas.cordys.com/bpm/attachments/1.0");
			if (!self.processAttachmentsModel) {
				self.processAttachmentsModel = new $.cordys.model({
					objectName: "instance",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.processAttachmentsModel, options.context);
				}
			}
			self.processAttachmentsModel.read(options);
			return self.processAttachmentsModel;
		}

		this.addAttachment = function(processInstance, attachmentName, fileName, description, content, options) {
			var isURL = /^[a-zA-Z].*\:/.test(content);
			if (isURL) {
				// upload the file
				if ($.cordys.mobile) {
					$.cordys.mobile.fileReader.readAsDataURL(content, function(result) {
						// content retrieved as base64 encoded
						content = result.replace(/^.*base64,/, "");
						options = getOptionsForProcessMethod("UploadAttachment", options, {
							instanceid: {
								"@type": "BPM",
								text: getProcessInstanceId(processInstance)
							},
							activityid: processInstance.ActivityId,
							attachmentname: attachmentName,
							filename: fileName,
							description: description,
							content: {
								"@isURL": false,
								text: content
							}
						}, "http://schemas.cordys.com/bpm/attachments/1.0");
						$.cordys.ajax(options);
					}, function (error) {
						throw new Error("Unable to read file, error: " + JSON.stringify(error));
					});
				}
			} else {
				// content should be base64 encoded
				if(!(/^[a-z0-9\+\/\s]+\={0,2}$/i.test(content)) || content.length % 4 > 0){
					if (window.btoa) content = window.btoa(content);
					else throw new Error("Unable to convert data to base64");
				}
				options = getOptionsForProcessMethod("UploadAttachment", options, {
					instanceid: {
						"@type": "BPM",
						text: getProcessInstanceId(processInstance)
					},
					activityid: processInstance.ActivityId,
					attachmentname: attachmentName,
					filename: fileName,
					description: description,
					content: {
						"@isURL": false,
						text: content
					}
				}, "http://schemas.cordys.com/bpm/attachments/1.0");
				return $.cordys.ajax(options);
			}
		}

		this.uploadAttachment = function(processInstance, attachmentName, fileName, description, url, options) {
			options = getOptionsForProcessMethod("UploadAttachment", options, {
				instanceid: {
					"@type": "BPM",
					text: getProcessInstanceId(processInstance)
				},
				attachmentname: attachmentName,
				filename: fileName,
				description: description,
				content: {
					"@isURL": true,
					text: url
				}
			}, "http://schemas.cordys.com/bpm/attachments/1.0");
			return $.cordys.ajax(options);
		}

		this.removeAttachment = function(processInstance, attachmentName, fileName, options) {
			options = getOptionsForProcessMethod("DeleteAttachment", options, {
				instanceid: {
					"@type": "BPM",
					text: getProcessInstanceId(processInstance)
				},
				attachmentname: attachmentName,
				filename: fileName
			}, "http://schemas.cordys.com/bpm/attachments/1.0");
			return $.cordys.ajax(options);
		}

		return this;
	};

	function mergeArraysWithDistinctKey(arr1, arr2, key) {
		// Objects from arr2 will only be added when object with same key is not in arr1
		var result = arr1;
		$.each(arr2, function() {
			var value = this[key], found = false;
			$.each(arr1, function() {
				if (this[key] == value) found = true;
			});
			if (!found) result.push(this);
		});
		return result;
	}

	function getOptionsForProcessMethod(methodName, options, defaultParameters, namespace) {
		options = options || {};
		options.parameters = $.extend(defaultParameters, options.parameters);
		options = $.extend({
			method: methodName,
			namespace: namespace || "http://schemas.cordys.com/bpm/execution/1.0",
			dataType: 'json'
		}, options);
		return options;
	}

	function getProcessInstanceId(processInstance) {
		var id = (typeof(processInstance) === "object") ? processInstance.ProcessInstanceId : processInstance;
		// If it is an observable, call the method to get the value, otherwise just return the value
		return (typeof(id) === "function") ? id() : id;
	}

})(window, jQuery)