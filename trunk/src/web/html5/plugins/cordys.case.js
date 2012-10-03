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

	$.cordys['case'] = new function() {
		var self = this,
			activityDefinitionModel,
			activityInstanceModel,
			businessEventsModel,
			caseAttachmentsModel,
			caseInstanceModel,
			caseIdentifiersModel,
			caseDataModel,
			caseVariablesModel,
			followupActivitiesModel;

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
			var activityId = (typeof(caseInstance) === "object") ? caseInstance.ActivityId : "";
			options = getOptionsForCaseMethod("GetActivityDefinition", options, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				activities: {
					activityid: activityId
				}
			});
			if (!self.activityDefinitionModel) {
				self.activityDefinitionModel = new $.cordys.model({
					objectName: "activity",
					context: options.context,
					read: options
				});
			}
			self.activityDefinitionModel.read(options);
			return self.activityDefinitionModel;
		};

		this.getActivityInstance = function(caseInstance, options) {
			var activityInstanceId = (typeof(caseInstance) === "object") ? caseInstance.ParentTaskId : "";
			options = getOptionsForCaseMethod("GetActivityInstance", options, {
				caseinstanceid: getCaseInstanceId(caseInstance),
				activityinstanceid: activityInstanceId
			});
			if (!self.activityInstanceModel) {
				self.activityInstanceModel = new $.cordys.model({
					objectName: "ACTIVITY_INSTANCE",
					context: options.context,
					read: options
				});
			}
			self.activityInstanceModel.read(options);
			return self.activityInstanceModel;
		};

		this.getBusinessEvents = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetBusinessEvents", options, {caseinstanceid: getCaseInstanceId(caseInstance)});
			if (!self.businessEventsModel) {
				self.businessEventsModel = new $.cordys.model({
					objectName: "events",
					context: options.context,
					read: options
				});
			}
			self.businessEventsModel.read(options);
			return self.businessEventsModel;
		};

		this.getCaseInstance = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetCaseInstance", options, {caseinstanceid: getCaseInstanceId(caseInstance)});
			if (!self.caseInstanceModel) {
				self.caseInstanceModel = new $.cordys.model({
					objectName: "CASE_INSTANCE",
					context: options.context,
					read: options
				});
			}
			self.caseInstanceModel.read(options);
			return self.caseInstanceModel;
		};

		this.getCaseData = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetCaseData", options, {caseinstanceid: getCaseInstanceId(caseInstance)});
			if (!self.caseDataModel) {
				self.caseDataModel = new $.cordys.model({
					objectName: "data",
					context: options.context,
					read: options
				});
			}
			self.caseDataModel.read(options);
			return self.caseDataModel;
		};

		this.getCaseVariables = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetCaseVariables", options, {caseinstanceid: getCaseInstanceId(caseInstance)});
			var callback = options.success;
			options.success = function(data) {
				// Get the case variables as an array of the variables, removing the case prefix.
				var vars = data[0]["case:casevariables"],
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
			};
			if (!self.caseVariablesModel) {
				self.caseVariablesModel = new $.cordys.model({
					objectName: "data",
					context: options.context,
					read: options
				});
			}
			self.caseVariablesModel.read(options);
			return self.caseVariablesModel;
		};

		this.getFollowupActivities = function(caseInstance, options) {
			options = getOptionsForCaseMethod("GetFollowupActivities", options, {caseinstanceid: getCaseInstanceId(caseInstance)});
			if (!self.followupActivitiesModel) {
				self.followupActivitiesModel = new $.cordys.model({
					objectName: "followups",
					context: options.context,
					read: options
				});
			}
			self.followupActivitiesModel.read(options);
			return self.followupActivitiesModel;
		};

		this.planActivities = function(caseInstance, options) {
			var activityId = activityInstanceId = "";
			if (typeof(caseInstance) === "object") {
				activityId = caseInstance.ActivityId;
				activityInstanceId = caseInstance.ParentTaskId;
			}
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
			if (!self.caseAttachmentsModel) {
				self.caseAttachmentsModel = new $.cordys.model({
					objectName: "instance",
					context: options.context,
					read: options
				});
			}
			self.caseAttachmentsModel.read(options);
			return self.caseAttachmentsModel;
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
