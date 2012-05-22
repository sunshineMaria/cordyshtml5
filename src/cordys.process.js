﻿/**
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
		throw 'The Cordys HTML5 SDK is required, please ensure it is loaded properly'; 
	}

	$.cordys.process = new function() {
		var self = this,
			businessIdentifiersModel;

		this.getBusinessIdentifiers = function(processInstance, options) {
			var processInstanceId = "";
			if (typeof(processInstance) === "object") {
				processInstanceId = processInstance.ProcessInstanceId;
			} else {
				processInstanceId = processInstance;
			}
			if (typeof(processInstanceId) === "function") processInstanceId = processInstanceId();
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
					processInstanceID: processInstanceId
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

		this.startProcess = function(processId, processMessage, options) {
			options = options || {};
			options.parameters = $.extend({type: "definition"}, options.parameters);
			return this.executeProcess(processId, processMessage, options);
		};

		this.executeProcess = function(processInstance, processMessage, options) {
			var processInstanceId = "";
			if (typeof(processInstance) === "object") {
				processInstanceId = processInstance.ProcessInstanceId;
			} else {
				processInstanceId = processInstance;
			}
			if (typeof(processInstanceId) === "function") processInstanceId = processInstanceId();
			options = options || {};
			if ($.isArray(options.parameters)) {
				options.parameters = mergeArraysWithDistinctKey(options.parameters || [], [
					{name:"receiver",	value: processInstanceId},
					{name:"type",		value: "instance"},
					{name:"message",	value: processMessage}
				], "name");
			} else {
				options.parameters = $.extend({
					receiver: processInstanceId,
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

})(window, jQuery)