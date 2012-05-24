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
		throw 'The Cordys HTML5 SDK is required, please ensure it is loaded properly'; 
	}

	$.cordys.case = new function() {
		var self = this,
			activityDefinitionModel,
			activityInstanceModel,
			businessEventsModel,
			caseInstanceModel,
			caseIdentifiersModel,
			caseDataModel,
			caseVariablesModel,
			followupActivitiesModel;

		this.createCase = function(caseModel, caseVariables, caseData, options) {
			options = getOptionsForCaseMethod("CreateCase", options, {
				model: caseModel,
				casedata: caseData
			});
			return $.cordys.ajax(options);
		};
		
		this.completeActivity = function(caseInstanceTask, options) {
			var caseInstanceId = activityId = activityInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
				activityId = caseInstanceTask.ActivityId;
				activityInstanceId = caseInstanceTask.ParentTaskId;
			}
			options = getOptionsForCaseMethod("CompleteActivity", options, {
				caseinstanceid: caseInstanceId,
				activityinstanceid: {
					'@activityid': activityId,
					text: activityInstanceId
				}
			});
			return $.cordys.ajax(options);
		};

		this.completeActivityWithFollowup = function(caseInstanceTask, options) {
			var caseInstanceId = activityId = activityInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
				activityId = caseInstanceTask.ActivityId;
				activityInstanceId = caseInstanceTask.ParentTaskId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("CompleteActivityWithFollowup", options, {
				caseinstanceid: caseInstanceId,
				activityinstanceid: {
					'@activityid': activityId,
					text: activityInstanceId
				}
			});
			return $.cordys.ajax(options);
		};

		this.getActivityDefinition = function(caseInstanceTask, options) {
			var caseInstanceId = activityId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
				activityId = caseInstanceTask.ActivityId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("GetActivityDefinition", options, {
				caseinstanceid: caseInstanceId,
				activities: {
					activityid: activityId
				}
			});
			if (!self.activityDefinitionModel) {
				self.activityDefinitionModel = new $.cordys.model({
					objectName: "activity",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.activityDefinitionModel, options.context);
				}
			}
			self.activityDefinitionModel.read(options);
			return self.activityDefinitionModel;
		};

		this.getActivityInstance = function(caseInstanceTask, options) {
			var caseInstanceId = activityInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
				activityInstanceId = caseInstanceTask.ParentTaskId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("GetActivityInstance", options, {
				caseinstanceid: caseInstanceId,
				activityinstanceid: activityInstanceId
			});
			if (!self.activityInstanceModel) {
				self.activityInstanceModel = new $.cordys.model({
					objectName: "ACTIVITY_INSTANCE",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.activityInstanceModel, options.context);
				}
			}
			self.activityInstanceModel.read(options);
			return self.activityInstanceModel;
		};

		this.getBusinessEvents = function(caseInstanceTask, options) {
			var caseInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("GetBusinessEvents", options, {caseinstanceid: caseInstanceId});
			if (!self.businessEventsModel) {
				self.businessEventsModel = new $.cordys.model({
					objectName: "events",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.businessEventsModel, options.context);
				}
			}
			self.businessEventsModel.read(options);
			return self.businessEventsModel;
		};

		this.getCaseInstance = function(caseInstanceTask, options) {
			var caseInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("GetCaseInstance", options, {caseinstanceid: caseInstanceId});
			if (!self.caseInstanceModel) {
				self.caseInstanceModel = new $.cordys.model({
					objectName: "CASE_INSTANCE",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.caseInstanceModel, options.context);
				}
			}
			self.caseInstanceModel.read(options);
			return self.caseInstanceModel;
		};

		this.getCaseData = function(caseInstanceTask, options) {
			var caseInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("GetCaseData", options, {caseinstanceid: caseInstanceId});
			if (!self.caseDataModel) {
				self.caseDataModel = new $.cordys.model({
					objectName: "data",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.caseDataModel, options.context);
				}
			}
			self.caseDataModel.read(options);
			return self.caseDataModel;
		};

		this.getCaseVariables = function(caseInstanceTask, options) {
			var caseInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("GetCaseVariables", options, {caseinstanceid: caseInstanceId});
			if (!self.caseVariablesModel) {
				self.caseVariablesModel = new $.cordys.model({
					objectName: "casevariables",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.caseVariablesModel, options.context);
				}
			}
			self.caseVariablesModel.read(options);
			return self.caseVariablesModel;
		};

		this.getFollowupActivities = function(caseInstanceTask, options) {
			var caseInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("GetFollowupActivities", options, {caseinstanceid: caseInstanceId});
			if (!self.followupActivitiesModel) {
				self.followupActivitiesModel = new $.cordys.model({
					objectName: "followups",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.followupActivitiesModel, options.context);
				}
			}
			self.followupActivitiesModel.read(options);
			return self.followupActivitiesModel;
		};

		this.planActivities = function(caseInstanceTask, options) {
			var caseInstanceId = activityId = activityInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
				activityId = caseInstanceTask.ActivityId;
				activityInstanceId = caseInstanceTask.ParentTaskId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("PlanActivities", options, {
				caseinstanceid: caseInstanceId
			});
			return $.cordys.ajax(options);
		};

		this.planIntermediateActivities = function(caseInstanceTask, options) {
			var caseInstanceId = activityId = activityInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
				activityId = caseInstanceTask.ActivityId;
				activityInstanceId = caseInstanceTask.ParentTaskId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("PlanIntermediateActivities", options, {
				caseinstanceid: caseInstanceId,
				activityinstanceid: {
					'@activityid': activityId,
					text: activityInstanceId
				}
			});
			return $.cordys.ajax(options);
		};

		this.sendEvent = function(caseInstanceTask, eventName, options) {
			var caseInstanceId = sourceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
				sourceId = caseInstanceTask.ActivityId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("sendEvent", options, {
				caseinstanceid: caseInstanceId,
				event: {
					text: eventName,
					'@source': sourceId
				}
			});
			return $.cordys.ajax(options);
		};

		this.updateCaseData = function(caseInstanceTask, caseData, options) {
			var caseInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("UpdateCaseData", options, {
				caseinstanceid: caseInstanceId,
				casedata: caseData
			});
			return $.cordys.ajax(options);
		};

		this.updateCaseVariables = function(caseInstanceTask, caseVariables, options) {
			var caseInstanceId = "";
			if (typeof(caseInstanceTask) === "object") {
				caseInstanceId = caseInstanceTask.ProcessInstanceId;
			} else {
				caseInstanceId = caseInstanceTask;
			}
			options = getOptionsForCaseMethod("UpdateCaseVariables", options, {
				caseinstanceid: caseInstanceId,
				casedata: {
					data: {
						"@xmlns:case": "http://schemas.cordys.com/casemanagement/1.0",
						"@name": "case:casevariables",
						"case:casevariables": caseVariables
					}
				}
			});
			return $.cordys.ajax(options);
		};

		return this;
	};

	function getOptionsForCaseMethod(methodName, options, defaultParameters) {
		options = options || {};
		options.parameters = $.extend(defaultParameters, options.parameters);
		options = $.extend({
			method: methodName,
			namespace: "http://schemas.cordys.com/casemanagement/execution/1.0",
			dataType: 'json'
		}, options);
		return options;
	}

})(window, jQuery)