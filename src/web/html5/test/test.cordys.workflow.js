(function(window, $) {

	module("Workflow Plugin test");

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetAllTasksForUser/,
		responseText: {
			Task: 
				[
					{
						TaskId: "FF27CA09-C054-11E1-F8F4-026B300AB28E",
						SourceInstanceId: "FF27CA09-C054-11E1-F8F4-016DCA44B28E",
						State: "ASSIGNED",
						ProcessName: "Test Model",
						Activity: {
							"@id": "o_20",
							text: "Approve Task"
						},
						Priority: "3",
						Target:{
							"@type": "user",
							text: "cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
						},
						Sender:{
							"@displayName": "user1",
							"@phone1": "", 
							"@phone2": "", 
							"@email": "",
							text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
						},
						SourceType:"BPM",
						Assignee:{
							"@displayName": "user1",
							"@phone1": "", 
							"@phone2": "", 
							"@email": "",
							text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
						},
						CompletedByUser:null,
						DelegatedToUser:null,
						DeliveryDate:"2012-07-06T19:23:41.017",
						StartDate:"2012-07-06T19:23:41.017"
					},
					{
						TaskId:"903483C7-59BA-11E1-F75D-21B2E4E1D684",
						SourceInstanceId:"903483C7-59BA-11E1-F75D-21B2E4E17684",
						State:"ASSIGNED",
						ProcessName:"Test Case Model",
						Activity:{
							"@id":"903483C7-59BA-11E1-F75D-1B5C2B6A3684",
							text:"Activity"
						},
						Priority:"3",
						Target:{
							"@type":"user",
							text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
						},
						Sender:{
							"@displayName":"user1",
							"@phone1":"", 
							"@phone2":"", 
							"@email":"",
							text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
						},
						SourceType:"CASE",
						Assignee:{
							"@displayName":"user1",
							"@phone1":"", 
							"@phone2":"", 
							"@email":"",
							text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
						},
						CompletedByUser:null,
						DelegatedToUser:null,
						DeliveryDate:"2012-06-20T15:03:12.603",
						StartDate:"2012-06-20T15:03:12.603",
						ParentQueue:null,
						UITaskId:"DummyHumanTaskID"
					}
				]
			}
	});
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetTask\b.*<TaskId>FF27CA09\-C054\-11E1\-F8F4\-026B300AB28E<\/TaskId>/,
		responseText: {
			Task: 
				[{
					ProcessInstanceId:"FF27CA09-C054-11E1-F8F3-57C30CDDF28E",
					ProcessName:"Test Model",
					TaskId:"FF27CA09-C054-11E1-F8F4-026B300AB28E",
					ParentTaskId:"FF27CA09-C054-11E1-F8F3-5AECE7E1328E",
					State:"ASSIGNED",
					Activity:"Approve Task",
					Targets: [{
						Target:{
							"@type": "user",
							text: "cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
						}}
					],
					Sender:{
						"@displayName": "user1",
						"@phone1": "", 
						"@phone2": "", 
						"@email": "",
						text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
					},
					Assignee:{
						"@displayName": "user1",
						"@phone1": "", 
						"@phone2": "", 
						"@email": "",
						text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
					},
					BusinessAttributes:null,
					CompletedByUser:null,
					DelegatedToUser:null,
					TaskData:{
						ApplicationData:{
							ApproveTask: {
								"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
								"@xmlns":"http://schemas.cordys.com/approve",
								header: {
									"@xmlns":"http://schemas.cordys.com/approve",
									text:"Approve"
								},
								options: {
									"@xmlns:instance":"http://schemas.cordys.com/bpm/instance/1.0",
									"@xmlns:ns4":"http://schemas.cordys.com/approve",
									"@xmlns:ns3":"http://schemas.cordys.com/casemanagement/1.0",
									"@xmlns:ns2":"bpmNamespace",
									"@xmlns:bpm":"http://schemas.cordys.com/default",
									"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
									"@xmlns":"http://schemas.cordys.com/bpm/instance/1.0",
									option:[
										{
											"@label":"Approve",
											"@value":"approve"
										},
										{
											"@label":"Reject",
											"@value":"reject"
										}
									]
								}
							}
						},
						CustomData:null,
						Annotation:null
					},
					LoggerContext:"&lt;Logger xmlns:SOAP=&quot;http://schemas.xmlsoap.org/soap/envelope/&quot; xmlns=&quot;http://schemas.cordys.com/General/1.0/&quot;&gt;&lt;DC name=&quot;hopCount&quot;&gt;0&lt;/DC&gt;&lt;DC name=&quot;correlationID&quot;&gt;FF27CA09-C054-11E1-F8F3-57C30CDE128E&lt;/DC&gt;&lt;DC name=&quot;process&quot;&gt;Report Damage Model&lt;/DC&gt;&lt;DC name=&quot;instance&quot;&gt;FF27CA09-C054-11E1-F8F3-57C30CDDF28E&lt;/DC&gt;&lt;/Logger&gt;",
					DeliveryDate:"2012-07-06T18:46:06.167",
					StartDate:"2012-07-06T18:46:06.16",
					DueDate:{
						"@isExpired":"false"
					},
					StartedOn:null,
					CompletionDate:null,
					IsPriorityFixed:"0",
					Priority:"3",
					ParentQueue:null,
					UITaskId:{
						"@islegacy":"false",
						text:"C15A62F8-9859-11E1-F1A2-452BAECB7BF5"
					},
					ActivityId:"o_20",
					Component:"BPM",
					CallBackInfo:{
						ModelName:{
							"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
							"@xmlns":"http://schemas.cordys.com/notification/workflow/1.0",
							text:"Test Model"
						},
						InstanceId:{
							"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
							"@xmlns":"http://schemas.cordys.com/notification/workflow/1.0",
							text:"FF27CA09-C054-11E1-F8F3-57C30CDDF28E"
						},
						ActivityId:{
							"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
							"@xmlns":"http://schemas.cordys.com/notification/workflow/1.0",
							"@iterationCount":"1",
							text:"o_20"
						},
						ActivityName:{
							"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
							"@xmlns":"http://schemas.cordys.com/notification/workflow/1.0",
							text:"Approve Task"
						},
						ParentSourceInstanceId:{
							"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
							"@xmlns":"http://schemas.cordys.com/notification/workflow/1.0",
							"@type":"BPM",
							text:"0"
						},
						RootInstanceId:{
							"@xmlns:SOAP":"http://schemas.xmlsoap.org/soap/envelope/",
							"@xmlns":"http://schemas.cordys.com/notification/workflow/1.0",
							"@type":"PROCESS",
							text:"FF27CA09-C054-11E1-F8F3-57C30CDDF28E"
						}
					},
					url:"/cordys/html5/demo/approvetask.htm",
					PossibleActions:{
						START:null,
						SUSPEND:null,
						SKIP:null,
						COMPLETE:null,
						DELEGATE:null,
						FORWARD:null,
						TRANSFER:null,
						EXECUTE:null,
						VIEW:null
					}
				}]
			}
	});
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /GetTask\b.*<TaskId>903483C7\-59BA\-11E1\-F75D\-21B2E4E1D684<\/TaskId>/,
		responseText: {
			Task: 
				[{
					ProcessInstanceId:"903483C7-59BA-11E1-F75D-21B2E4E17684",
					ProcessName:"Empty Model",
					TaskId:"903483C7-59BA-11E1-F75D-21B2E4E1D684",
					ParentTaskId:"903483C7-59BA-11E1-F75D-21B2E4E1D684",
					State:"ASSIGNED",
					Activity:"Activity",
					Targets: [{
						Target:{
							"@type": "user",
							text: "cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
						}}
					],
					Sender:{
						"@displayName": "user1",
						"@phone1": "", 
						"@phone2": "", 
						"@email": "",
						text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
					},
					Assignee:{
						"@displayName": "user1",
						"@phone1": "", 
						"@phone2": "", 
						"@email": "",
						text:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com"
					},
					BusinessAttributes:null,
					CompletedByUser:null,
					DelegatedToUser:null,
					TaskData:{
						ApplicationData:null,
						CustomData:null,
						Links:null,
						Annotation:null
					},
					LoggerContext:"&lt;Logger xmlns:SOAP=&quot;http://schemas.xmlsoap.org/soap/envelope/&quot; xmlns=&quot;http://schemas.cordys.com/General/1.0/&quot;/&gt;",
					DeliveryDate:"2012-06-20T15:03:12.603",
					StartDate:"2012-06-20T15:03:12.603",
					DueDate:{
						"@isExpired":"false"
					},
					StartedOn:null,
					CompletionDate:null,
					IsPriorityFixed:"0",
					Priority:"3",
					ParentQueue:null,
					UITaskId:{
						"@islegacy":"false",
						text:"cordys_notif_dummytask"
					},
					ActivityId:"903483C7-59BA-11E1-F75D-1B5C2B6A3684",
					Component:"CASE",
					CallBackInfo:null,
					url:"/cordys/com/cordys/notification/workflow/defaultactivity.caf",
					PossibleActions:{
						START:null,
						SUSPEND:null,
						SKIP:null,
						COMPLETE:null,
						DELEGATE:null,
						FORWARD:null,
						TRANSFER:null,
						EXECUTE:null,
						VIEW:null
					}
				}]
			}
	});
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /(\bClaimTask\b|\bPerformTaskAction\b)/,
		responseText: {
			State:"INPROGRESS",
			LastModified:"2011-07-08T06:41:51.55",
			PossibleActions:{
				STOP:null,
				COMPLETE:null,
				PAUSE:null,
				SKIP:null,
				SUSPEND:null,
				DELEGATE:null,
				FORWARD:null,
				TRANSFER:null,
				REVOKECLAIM:null,
				EXECUTE:null,
				VIEW:null
			}
		}
	});
	
	var getTasksrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetAllTasksForUser xmlns='http://schemas.cordys.com/notification/workflow/1.0'><OrderBy>Task.StartDate DESC</OrderBy></GetAllTasksForUser></SOAP:Body></SOAP:Envelope>";
	
	test("Read Tasks for User", null, function(){
		stop();
		$.cordys.workflow.getTasks({
		beforeSend: function (xhr, settings) {
			equal(compareXML(getTasksrequest,settings.data), true, "Compare Request XML");
        },
		success:function(tasks) {
			equal(tasks.length, 2, "2 tasks found");
			ok(!$.cordys.workflow.isCaseActivity(tasks[0]), "First task is BPM");
			ok($.cordys.workflow.isCaseActivity(tasks[1]), "Second task is Case");
			start();
		}});
	});	
	
	test("Read Tasks Details", 10, function(){
		stop();
		$.cordys.workflow.getTasks({
		beforeSend: function (xhr, settings) {
			equal(compareXML(getTasksrequest,settings.data), true, "Compare Request XML");
        },
		success:function(tasks) {
			equal(tasks.length, 2, "2 tasks found");
			var firstTaskId = tasks[0].TaskId,
				secondTaskId = tasks[1].TaskId;
			$.cordys.workflow.getTaskDetails(tasks[0], {
			beforeSend: function (xhr, settings) {
				var getTaskDetailsrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetTask xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>FF27CA09-C054-11E1-F8F4-026B300AB28E</TaskId><ReturnTaskData>true</ReturnTaskData><RetrievePossibleActions>true</RetrievePossibleActions></GetTask></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(getTaskDetailsrequest,settings.data), true, "Compare Request XML");
			},
			success: function(tasks) {	// Read by task object
				equal(tasks.length, 1, "1 task details found");
				equal(tasks[0].TaskId, firstTaskId, "same TaskId");
				ok(!$.cordys.workflow.isCaseActivity(tasks[0]), "Task is BPM");
				$.cordys.workflow.getTaskDetails(secondTaskId, {
				beforeSend: function (xhr, settings) {
					var getTaskDetailsrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetTask xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><ReturnTaskData>true</ReturnTaskData><RetrievePossibleActions>true</RetrievePossibleActions></GetTask></SOAP:Body></SOAP:Envelope>";
					equal(compareXML(getTaskDetailsrequest,settings.data), true, "Compare Request XML");
				},
				success: function(tasks) {	// Read by taskId
					equal(tasks.length, 1, "1 task details found");
					equal(tasks[0].TaskId, secondTaskId, "same TaskId");
					ok($.cordys.workflow.isCaseActivity(tasks[0]), "Task is Case");
				}});
			}});
		}});
		setTimeout(function() {
			start();
		}, 2000);
	});

	test("Tasks Actions", 20, function(){
		stop();
		$.cordys.workflow.getTasks({
		beforeSend: function (xhr, settings) {
			equal(compareXML(getTasksrequest,settings.data), true, "Compare Request XML");
        },
		success:function(tasks) {
			equal(tasks.length, 2, "2 tasks found");
			$.cordys.workflow.claimTask(tasks[0], {
			beforeSend: function (xhr, settings) {
				var claimTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ClaimTask xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>FF27CA09-C054-11E1-F8F4-026B300AB28E</TaskId></ClaimTask></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(claimTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Claimed");
			}});
			$.cordys.workflow.pauseTask(tasks[1], {somedata:"paused"}, {
			beforeSend: function (xhr, settings) {
				var pauseTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><PerformTaskAction xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><Action>PAUSE</Action><Data><somedata>paused</somedata></Data></PerformTaskAction></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(pauseTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Paused");
			}});
			$.cordys.workflow.resumeTask(tasks[1], {somedata:"resumed"}, {
			beforeSend: function (xhr, settings) {
				var resumeTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><PerformTaskAction xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><Action>RESUME</Action><Data><somedata>resumed</somedata></Data></PerformTaskAction></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(resumeTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Resumed");
			}});
			$.cordys.workflow.revokeTask(tasks[1], {somedata:"revoked"}, {
			beforeSend: function (xhr, settings) {
				var revokeTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><PerformTaskAction xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><Action>REVOKECLAIM</Action><Data><somedata>revoked</somedata></Data></PerformTaskAction></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(revokeTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Revoked");
			}});
			$.cordys.workflow.skipTask(tasks[1], {somedata:"skipped"}, "skip this", {
			beforeSend: function (xhr, settings) {
				var skipTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><PerformTaskAction xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><Action>SKIP</Action><Data><somedata>skipped</somedata></Data><Memo>skip this</Memo></PerformTaskAction></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(skipTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Skipped");
			}});
			$.cordys.workflow.startTask(tasks[1], {somedata:"started"}, {
			beforeSend: function (xhr, settings) {
				var startTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><PerformTaskAction xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><Action>START</Action><Data><somedata>started</somedata></Data></PerformTaskAction></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(startTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Started");
			}});
			$.cordys.workflow.stopTask(tasks[1], {somedata:"stopped"}, {
			beforeSend: function (xhr, settings) {
				var stopTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><PerformTaskAction xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><Action>STOP</Action><Data><somedata>stopped</somedata></Data></PerformTaskAction></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(stopTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Stopped");
			}});
			$.cordys.workflow.suspendTask(tasks[1], {somedata:"suspended"}, {
			beforeSend: function (xhr, settings) {
				var suspendTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><PerformTaskAction xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><Action>SUSPEND</Action><Data><somedata>suspended</somedata></Data></PerformTaskAction></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(suspendTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Suspended");
			}});
			$.cordys.workflow.completeTask(tasks[1], {somedata:"completed"}, {
			beforeSend: function (xhr, settings) {
				var completeTaskrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><PerformTaskAction xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><Action>COMPLETE</Action><Data><somedata>completed</somedata></Data></PerformTaskAction></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(completeTaskrequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Task Completed");
			}});
		}});
		setTimeout(function() {
			start();
		}, 2000);
	});

})(window, jQuery)
