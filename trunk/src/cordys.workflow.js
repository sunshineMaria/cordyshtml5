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

	$.cordys.workflow = new function() {
		var self = this,
			taskModel, worklistModel, taskDetailModel;

		this.getTasks = function(options) {
			options = $.extend({
				method: "GetTasks",
				namespace: "http://schemas.cordys.com/notification/workflow/1.0",
				dataType: "json",
				parameters: {
					OrderBy: "Task.StartDate DESC"
				}
			}, options);
			if (!self.taskModel) {
				self.taskModel = new $.cordys.model({
					objectName: "Task",
					read: options
				});
			}
			if (options.context) {
				ko.applyBindings(self.taskModel, options.context);
			}
			self.taskModel.read(options);
			return self.taskModel;
		};
		this.selectTask = function(data) {
			if (self.taskModel.selectedItem) self.taskModel.selectedItem(data);
		};
		this.openTask = function(data, detailsPageId) {
			if (data && self.taskModel.selectedItem) self.taskModel.selectedItem(data);
			self.getTaskDetails(data, {success: function(tasks) {
				var url = tasks[0].url();
				if (url.search(/\.htm$/) > 0) {
					url = addURLParameter(url, "taskId", tasks[0].TaskId());
					$.mobile.changePage( url, { transition: "pop", changeHash: false } );
				}
				else {
					$.mobile.changePage( "#" + (detailsPageId && typeof(detailsPageId)==="string" ? detailsPageId : "detailsPage"), { transition: "pop", changeHash: false } );
				}
			}})
		};
		this.getTaskDetails = function(task, options) {
			var taskId;
			if (typeof(task) === "object") {
				taskId = task.TaskId;
			} else {
				taskId = task;
			}
			if (typeof(taskId) === "function") taskId = taskId();
			options = $.extend({
				method: "GetTask",
				namespace: "http://schemas.cordys.com/notification/workflow/1.0",
				dataType: 'json',
				parameters: {
					TaskId:taskId,
					ReturnTaskData:"true",
					RetrievePossibleActions:"true"
				}
			}, options);
			if (!self.taskDetailModel) {
				self.taskDetailModel = new $.cordys.model({
					objectName: "Task",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.taskDetailModel, options.context);
				}
			}
			self.taskDetailModel.read(options);
			return self.taskDetailModel;
		};
		this.getWorkLists = function(options) {
			options = $.extend({
				method: "GetAllTargets",
				namespace: "http://schemas.cordys.com/notification/workflow/1.0",
				dataType: "json",
				parameters: {
					TaskCountRequired: "true"
				}
			}, options);
			if (!self.worklistModel) {
				self.worklistModel = new $.cordys.model({
					objectName: "Target",
					read: options
				});
				if (options.context) {
					ko.applyBindings(self.worklistModel, options.context);
				}
			}
			self.worklistModel.read(options);
			return self.worklistModel;
		};

		this.claimTask = function(task, options) {
			var taskId;
			if (typeof(task) === "object") {
				taskId = task.TaskId;
			} else {
				taskId = task;
			}
			if (typeof(taskId) === "function") taskId = taskId();
			options = $.extend({
				method: "ClaimTask",
				namespace: "http://schemas.cordys.com/notification/workflow/1.0",
				dataType: 'json',
				parameters: {
					TaskId:taskId
				}
			}, options);
			return $.cordys.ajax(options);
		};
		this.performTaskAction = function(task, taskData, action, options) {
			var taskId;
			if (typeof(task) === "object") {
				taskId = task.TaskId;
			} else {
				taskId = task;
			}
			if (typeof(taskId) === "function") taskId = taskId();
			options = $.extend({
				method: "PerformTaskAction",
				namespace: "http://schemas.cordys.com/notification/workflow/1.0",
				dataType: 'json',
				parameters: {
					TaskId: taskId,
					Action: action,
					Data: taskData
				}
			}, options);
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
		this.skipTask = function(task, taskData, options) {
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
		// delegateTask
		// forwardTask

		return this;
	};

})(window, jQuery)