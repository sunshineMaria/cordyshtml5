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

	$.cordys.workflow = new function() {
		var self = this,
			taskModel, personalTaskModel, worklistModel, taskDetailModel;

		this.getTasks = function(options) {
			if (!self.taskModel) {
				self.taskModel = new $.cordys.model({
					objectName: "Task",
					context: options.context,
					defaults: getOptionsForWorkflowMethod("GetAllTasksForUser", null, {
						OrderBy: "Task.StartDate DESC"
					})
				});
			}
			self.taskModel.read(options);
			return self.taskModel;
		};
		this.getPersonalTasks = function(options) {
			if (!self.personalTaskModel) {
				self.personalTaskModel = new $.cordys.model({
					objectName: "Task",
					context: options.context,
					defaults: getOptionsForWorkflowMethod("GetTasks", null, {
						OrderBy: "Task.StartDate DESC"
					})
				});
			}
			self.personalTaskModel.read(options);
			return self.personalTaskModel;
		};
		this.openTask = function(task, detailsPageId) {
			if (typeof(task) === "object" && self.taskModel && self.taskModel.selectedItem) self.taskModel.selectedItem(task);
			self.getTaskDetails(task, {success: function(tasks) {
				var url = tasks[0].url;
				if (url.search(/\.html?$/) > 0) {
					url = addURLParameter(url, "taskId", tasks[0].TaskId);
					//$.mobile.changePage( url, { transition: "pop", changeHash: false } );
					document.location = url;
				}
				else {
					$.mobile.changePage( "#" + (detailsPageId && typeof(detailsPageId)==="string" ? detailsPageId : "detailsPage"), { transition: "pop", changeHash: false } );
				}
			}})
		};
		this.getTaskDetails = function(task, options) {
			if (!self.taskDetailModel) {
				self.taskDetailModel = new $.cordys.model({
					objectName: "Task",
					context: options.context,
					defaults: getOptionsForWorkflowMethod("GetTask", null, {
						ReturnTaskData:"true",
						RetrievePossibleActions:"true"
					})
				});
			}
			
			options = options || {};
			options.parameters = options.parameters || {};
			options.parameters.TaskId = getTaskId(task);
			self.taskDetailModel.read(options);
			return self.taskDetailModel;
		};
		this.getWorkLists = function(options) {
			if (!self.worklistModel) {
				self.worklistModel = new $.cordys.model({
					objectName: "Target",
					context: options.context,
					defaults: getOptionsForWorkflowMethod("GetAllTargets", null, {
							TaskCountRequired: "true"
					})
				});
			}
			self.worklistModel.read(options);
			return self.worklistModel;
		};

		this.claimTask = function(task, options) {
			options = getOptionsForWorkflowMethod("ClaimTask", options, {
					TaskId: getTaskId(task)
			});
			return $.cordys.ajax(options);
		};
		this.performTaskAction = function(task, taskData, action, options) {
			options = getOptionsForWorkflowMethod("PerformTaskAction", options, {
					TaskId: getTaskId(task),
					Action: action,
					Data: taskData || {}
			});
			return $.cordys.ajax(options);
		};

		this.completeTask = function(task, taskData, options) {
			return this.performTaskAction(task, taskData, "COMPLETE", options);
		};
		this.pauseTask = function(task, taskData, options) {
			return this.performTaskAction(task, taskData, "PAUSE", options);
		};
		this.resumeTask = function(task, taskData, options) {
			return this.performTaskAction(task, taskData, "RESUME", options);
		};
		this.revokeTask = function(task, taskData, options) {
			return this.performTaskAction(task, taskData, "REVOKECLAIM", options);
		};
		this.skipTask = function(task, taskData, reason, options) {
			options = options || {};
			options.parameters = $.extend({Memo:reason}, options.parameters);
			return this.performTaskAction(task, taskData, "SKIP", options);
		};
		this.startTask = function(task, taskData, options) {
			return this.performTaskAction(task, taskData, "START", options);
		};
		this.stopTask = function(task, taskData, options) {
			return this.performTaskAction(task, taskData, "STOP", options);
		};
		this.suspendTask = function(task, taskData, options) {
			return this.performTaskAction(task, taskData, "SUSPEND", options);
		};

		this.isCaseActivity = function(task) {
			if (typeof(task) !== "object") return -1;
			var taskType = task.SourceType || task.Component;
			return (taskType === "CASE");
		};

		return this;
	};

	function getOptionsForWorkflowMethod(methodName, options, defaultParameters) {
		options = options || {};
		options.parameters = $.extend(defaultParameters, options.parameters);
		options = $.extend({
			method: methodName,
			namespace: "http://schemas.cordys.com/notification/workflow/1.0",
			dataType: 'json'
		}, options);
		return options;
	}

	function getTaskId(task) {
		var id = (typeof(task) === "object") ? task.TaskId : task;
		// If it is an observable, call the method to get the value, otherwise just return the value
		return (typeof(id) === "function") ? id() : id;
	}

})(window, jQuery)