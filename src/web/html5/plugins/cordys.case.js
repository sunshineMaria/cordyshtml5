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
		throw new Error("The Cordys HTML5 SDK is required, please ensure it is loaded properly");
	}

	$.cordys['case'] = new function() {
		var self = this;

		this.createCase = function(caseModel, caseVariables, caseData, options) {
			if (caseVariables) {
				caseData = caseData || {data:{}};
				if (caseData.data.constructor !== Array) { caseData.data = [caseData.data]; }
				caseData.data.push( getCaseVariablesData(caseVariables) );
			}
			options = getOptionsForCaseMethod("CreateCase", options, {
				model: caseModel,
				casedata: caseData
			});
			return $.cordys.ajax(options);
		};
		
		this.completeActivity = function(caseInstance, options) {
			var activityId = activityInstanceId = "";
			if (typeof(caseInstance) === "object") {
				activityId = caseInstance.ActivityId;
				activityInstanceId = caseInstance.ParentTaskId;
			}
			options = getOptionsForCaseMethod("CompleteActivity", options, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				activityinstanceid: {
					'@activityid': activityId,
					text: activityInstanceId
				}
			});
			return $.cordys.ajax(options);
		};

		this.completeActivityWithFollowup = function(caseInstance, options) {
			var activityId = activityInstanceId = "";
			if (typeof(caseInstance) === "object") {
				activityId = caseInstance.ActivityId;
				activityInstanceId = caseInstance.ParentTaskId;
			}
			options = getOptionsForCaseMethod("CompleteActivityWithFollowup", options, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				activityinstanceid: {
					'@activityid': activityId,
					text: activityInstanceId
				}
			});
			return $.cordys.ajax(options);
		};

		this.getActivityDefinition = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetActivityDefinition", options);
			options.parameters = options.parameters || {};

			var activityId = (typeof(caseInstance) === "object") ? caseInstance.ActivityId : "";
			$.extend(options.parameters, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				activities: {
					activityid: activityId
				}
			});
			return $.cordys.ajax(options).then(function(response) {
				return $.cordys.json.find(response, "activity");
			});
		};

		this.getActivityInstance = function(caseInstance, options) {
			var activityInstanceId = (typeof(caseInstance) === "object") ? caseInstance.ParentTaskId : "";

			options = getOptionsForCaseMethod("GetActivityInstance", options);
			options.parameters = options.parameters || {};
			$.extend(options.parameters, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				activityinstanceid: activityInstanceId
			});

			return $.cordys.ajax(options).then(function(response) {
				return $.cordys.json.find(response, "ACTIVITY_INSTANCE");
			});
		};

		this.getBusinessEvents = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetBusinessEvents", options);
			options.parameters = options.parameters || {};
			options.parameters.caseinstanceid = getCaseInstanceId(caseInstance);

			return $.cordys.ajax(options).then(function(response) {
				return $.cordys.json.findObjects(response, "events");
			});
		};

		this.getCaseInstance = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetCaseInstance", options);
			options.parameters = options.parameters || {};
			options.parameters.caseinstanceid = getCaseInstanceId(caseInstance);

			return $.cordys.ajax(options).then(function(response) {
				return $.cordys.json.find(response, "CASE_INSTANCE");
			});
		};

		this.getCaseData = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetCaseData", options);
			options.parameters = options.parameters || {};
			options.parameters.caseinstanceid = getCaseInstanceId(caseInstance);

			return $.cordys.ajax(options).then(function(response) {
				return $.cordys.json.find(response, "data");
			});
		};

		this.getCaseVariables = function(caseInstance, options) {
			var callback = options.success;
			delete options.success; // clear any success handler so that we get to handle it first
			options = getOptionsForCaseMethod("GetCaseVariables", options);
			options.parameters = options.parameters || {};
			options.parameters.caseinstanceid = getCaseInstanceId(caseInstance);

			return $.cordys.ajax(options).then(function(response) {
				var data = $.cordys.json.find(response, "data");
				// Get the case variables as an array of the variables, removing the case prefix.
				var vars = data["case:casevariables"],
					variables = [];
				for (var v in vars) {
					if (typeof(vars[v]) === "object") {
						var newVar = {};
						newVar[v.replace(/^[^:]*:/,"")] = vars[v];
						variables.push(newVar);
					}
				}
				if (callback) {
					callback(variables);
				}
				return variables;
			});
		};

		this.getFollowupActivities = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetFollowupActivities", options);
			options.parameters = options.parameters || {};
			options.parameters.caseinstanceid = getCaseInstanceId(caseInstance);

			return $.cordys.ajax(options).then(function(response) {
				return $.cordys.json.findObjects(response, "followups");
			});
		};

		this.planActivities = function(caseInstance, options) {
			options = getOptionsForCaseMethod("PlanActivities", options, {
				caseinstanceid: getCaseInstanceId(caseInstance)
			});
			return $.cordys.ajax(options);
		};

		this.planIntermediateActivities = function(caseInstance, options) {
			var activityId = activityInstanceId = "";
			if (typeof(caseInstance) === "object") {
				activityId = caseInstance.ActivityId;
				activityInstanceId = caseInstance.ParentTaskId;
			}
			options = getOptionsForCaseMethod("PlanIntermediateActivities", options, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				activityinstanceid: {
					'@activityid': activityId,
					text: activityInstanceId
				}
			});
			return $.cordys.ajax(options);
		};

		this.sendEvent = function(caseInstance, eventName, options) {
			var sourceId = (typeof(caseInstance) === "object") ? caseInstance.ActivityId : "";
			options = getOptionsForCaseMethod("SendEvent", options, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				event: {
					text: eventName,
					'@source': sourceId
				}
			});
			return $.cordys.ajax(options);
		};

		this.updateCaseData = function(caseInstance, caseData, options) {
			options = getOptionsForCaseMethod("UpdateCaseData", options, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				casedata: caseData
			});
			return $.cordys.ajax(options);
		};

		this.updateCaseVariables = function(caseInstance, caseVariables, options) {
			options = getOptionsForCaseMethod("UpdateCaseVariables", options, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				casedata: {
					data: getCaseVariablesData(caseVariables)
				}
			});
			return $.cordys.ajax(options);
		};


		// Attachments
		this.getAttachments = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetAttachments", options, {
				instanceid: {
					"@type": "CASE",
					text: getCaseInstanceId(caseInstance)
				}
			}, "http://schemas.cordys.com/bpm/attachments/1.0");

			options.parameters = options.parameters || {};
			$.extend(options.parameters, {
					instanceid: {
						"@type": "CASE",
						text: getCaseInstanceId(caseInstance)
					}
			});

			return $.cordys.ajax(options).then(function(response) {
				return $.cordys.json.findObjects(response, "instance");
			});
		}

		this.addAttachment = function(caseInstance, attachmentName, fileName, description, content, options) {
			var isURL = /^[a-zA-Z].*\:/.test(content);
			if (isURL) {
				// upload the file
				if ($.cordys.mobile) {
					$.cordys.mobile.fileReader.readAsDataURL(content, function(result) {
						// content retrieved as base64 encoded
						content = result.replace(/^.*base64,/, "");
						options = getOptionsForCaseMethod("UploadAttachment", options, {
							instanceid: {
								"@type": "CASE",
								text: getCaseInstanceId(caseInstance)
							},
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
				} else {
					throw new Error("Unable to add attachment by url");
				}
			} else {
				// content should be base64 encoded
				if(!(/^[a-z0-9\+\/\s]+\={0,2}$/i.test(content)) || content.length % 4 > 0){
					if (window.btoa) content = window.btoa(content);
					else throw new Error("Unable to convert data to base64");
				}
				options = getOptionsForCaseMethod("UploadAttachment", options, {
					instanceid: {
						"@type": "CASE",
						text: getCaseInstanceId(caseInstance)
					},
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

		this.uploadAttachment = function(caseInstance, attachmentName, fileName, description, url, options) {
			options = getOptionsForCaseMethod("UploadAttachment", options, {
				instanceid: {
					"@type": "CASE",
					text: getCaseInstanceId(caseInstance)
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

		this.removeAttachment = function(caseInstance, attachmentName, fileName, options) {
			options = getOptionsForCaseMethod("DeleteAttachment", options, {
				instanceid: {
					"@type": "CASE",
					text: getCaseInstanceId(caseInstance)
				},
				attachmentname: attachmentName,
				filename: fileName
			}, "http://schemas.cordys.com/bpm/attachments/1.0");
			return $.cordys.ajax(options);
		}

		return this;
	};

	function getOptionsForCaseMethod(methodName, options, defaultParameters, namespace) {
		options = options || {};
		options.parameters = $.extend(defaultParameters, options.parameters);
		options = $.extend({
			method: methodName,
			namespace: namespace || "http://schemas.cordys.com/casemanagement/execution/1.0",
			dataType: 'json'
		}, options);
		return options;
	}

	function getCaseInstanceId(caseInstance) {
		var id = (typeof(caseInstance) === "object") 
				? (caseInstance.ProcessInstanceId || caseInstance.CaseInstanceId || caseInstance.caseinstanceid) 
				: caseInstance;
		// If it is an observable, call the method to get the value, otherwise just return the value
		return (typeof(id) === "function") ? id() : id;
	}

	function getCaseVariablesData(caseVars) {
		var returnData = {
			"@xmlns:case": "http://schemas.cordys.com/casemanagement/1.0",
			"@name": "case:casevariables",
			"case:casevariables": {}
		};
		for (var vName in caseVars) {
			var newName = (vName.indexOf("case:") !== 0) ? "case:" + vName : vName;
			returnData["case:casevariables"][newName] = caseVars[vName];
		}
		return returnData;
	}

})(window, jQuery)
