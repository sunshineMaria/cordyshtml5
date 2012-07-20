(function(window, $) {

	module("Case Plugin test");

	// Use mockjax from test.cordys.workflow.js for reading tasks
	test("Read Tasks with details", function(){
		stop();
		$.cordys.workflow.getTasks({
			beforeSend:function(xhr, settings){
				var getTasksRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetAllTasksForUser xmlns='http://schemas.cordys.com/notification/workflow/1.0'><OrderBy>Task.StartDate DESC</OrderBy></GetAllTasksForUser></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(getTasksRequest,settings.data), true, "Compare Request XML");
			},
			success:function(tasks) {
				equal(tasks.length, 2, "2 task found");
			ok($.cordys.workflow.isCaseActivity(tasks[1]), "Task is Case");
			$.cordys.workflow.getTaskDetails(tasks[1], {
			beforeSend:function(xhr, settings){
				var getTaskDetailsRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetTask xmlns='http://schemas.cordys.com/notification/workflow/1.0'><TaskId>903483C7-59BA-11E1-F75D-21B2E4E1D684</TaskId><ReturnTaskData>true</ReturnTaskData><RetrievePossibleActions>true</RetrievePossibleActions></GetTask></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(getTaskDetailsRequest,settings.data), true, "Compare Request XML");
			},
			success: function(tasks) {
				equal(tasks.length, 1, "1 task details found");
			}});
		}});
		setTimeout(function() {
			start();
		}, 2000);
	});
	
	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /(\bCreateCase\b|\bUpdateCaseData\b|\bUpdateCaseVariables\b)/,
		responseText: {
			caseinstanceid: "someCaseInstanceID"
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /\bGetCaseData\b/,
		responseText: {
			caseinstanceid: "someCaseInstanceID",
			casedata: {
				data: {
					"@xmlns:ns": "http://schemas.cordys.com/default",
					"@name": "ns:TestCase",
					"ns:TestCase": {
						"ns:Number": "1234567890"
					}
				}
			}
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /\bSendEvent\b/,
		responseText: {
			result: {
				"@success":"false",
				info:"The Event 'test' could not be consumed by any of the currently active states."
			},
			activestates: {
				state: [
					{
						state: {
							"@name": "Default State",
							"@id":"RootCaseModelState",
							text:"903483C7-59BA-11E1-F75D-21B2E4E1B684"
						}
					}
				]
			}
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /\bGetCaseInstance\b/,
		responseText: {
			CASE_INSTANCE:{
				BPM_MODEL_REVISION:{
					OVERVIEW_FORM:null,
					REVISION_ID:"903483C7-59BA-11E1-F75D-20CDDFF8B684"
				},
				BPM_MODEL:{
					MODEL_NAME:"Empty Model",
					MODEL_ID:"903483C7-59BA-11E1-F75D-20CDDFF8D684"
				},
				CASE_INSTANCE_IDENTIFIERS:{
					CURRENTSTATE:"Default State",
					INSTANCE_ID:"someCaseInstanceID"
				},
				CASE_INSTANCE_ID:"someCaseInstanceID",
				CASE_MODEL:"903483C7-59BA-11E1-F75D-20CDDFF8D684",
				MODEL_REVISION:"903483C7-59BA-11E1-F75D-20CDDFF8B684",
				STATUS:"INPROGRESS",
				STARTED_ON:"1340204592598",
				STARTED_BY:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com",
				LASTMODIFIED_ON:"1342077379435",
				LASTMODIFIED_BY:"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com",
				DUE_ON:null,
				ROOT_ID:"someCaseInstanceID"
			}
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /\bGetCaseVariables\b/,
		responseText: {
			caseinstanceid: "someCaseInstanceID",
			casedata: {
				data: {
					"@xmlns:case": "http://schemas.cordys.com/casemanagement/1.0",
					"@name": "case:casevariables",
					"case:casevariables": {
						"@xmlns:sm":"http://www.w3.org/2005/07/scxml",
						"@xmlns:case":"http://schemas.cordys.com/casemanagement/1.0",
						"@xmlns":"",
						User: {
							"@type": "user",
							text: "user1"
						},
						ExpectedDuration: {
							"@type": "duration",
							text: "P0Y0M10DT0H0M0S"
						},
						Worklist: {
							"@type": "worklist",
							text: "Organization/My Work List"
						}
					}
				}
			}
		}
	});

	test("Create and Test Case", 15, function(){
		stop();
		$.cordys['case'].createCase("Test Case", getCaseVariables(), getCaseData(), {
			beforeSend:function(xhr, settings){
				var createCaseRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><CreateCase xmlns='http://schemas.cordys.com/casemanagement/execution/1.0'><model>Test Case</model><casedata><data xmlns:ns=\"http://schemas.cordys.com/default\" name=\"ns:TestCase\"><ns:TestCase><ns:Number>1234567890</ns:Number></ns:TestCase></data><data xmlns:case=\"http://schemas.cordys.com/casemanagement/1.0\" name=\"case:casevariables\"><case:casevariables><case:User type=\"user\">user1</case:User><case:ExpectedDuration type=\"duration\">P0Y0M10DT0H0M0S</case:ExpectedDuration><case:Worklist type=\"worklist\">Organization/My Work List</case:Worklist></case:casevariables></data></casedata></CreateCase></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(createCaseRequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.caseinstanceid, "someCaseInstanceID", "Case created");
				$.cordys['case'].updateCaseData(data.caseinstanceid, getCaseData(), {
				beforeSend:function(xhr, settings){
					var updateCaseDataRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateCaseData xmlns='http://schemas.cordys.com/casemanagement/execution/1.0'><caseinstanceid>someCaseInstanceID</caseinstanceid><casedata><data xmlns:ns=\"http://schemas.cordys.com/default\" name=\"ns:TestCase\"><ns:TestCase><ns:Number>1234567890</ns:Number></ns:TestCase></data></casedata></UpdateCaseData></SOAP:Body></SOAP:Envelope>";
					equal(compareXML(updateCaseDataRequest,settings.data), true, "Compare Request XML");
				},
				success: function(data) {
					equal(data.error, undefined, "Case Data updated");
				}});
				$.cordys['case'].updateCaseVariables(data.caseinstanceid, getCaseVariables(), {
				beforeSend:function(xhr, settings){
					var updateCaseVariablesRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UpdateCaseVariables xmlns='http://schemas.cordys.com/casemanagement/execution/1.0'><caseinstanceid>someCaseInstanceID</caseinstanceid><casedata><data xmlns:case=\"http://schemas.cordys.com/casemanagement/1.0\" name=\"case:casevariables\"><case:casevariables><case:User type=\"user\">user1</case:User><case:ExpectedDuration type=\"duration\">P0Y0M10DT0H0M0S</case:ExpectedDuration><case:Worklist type=\"worklist\">Organization/My Work List</case:Worklist></case:casevariables></data></casedata></UpdateCaseVariables></SOAP:Body></SOAP:Envelope>";
					equal(compareXML(updateCaseVariablesRequest,settings.data), true, "Compare Request XML");
				},
				success: function(data) {
					equal(data.error, undefined, "Case Variables updated");
				}});
				$.cordys['case'].getCaseData(data.caseinstanceid, {
				beforeSend:function(xhr, settings){
					var getCaseDataRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetCaseData xmlns='http://schemas.cordys.com/casemanagement/execution/1.0'><caseinstanceid>someCaseInstanceID</caseinstanceid></GetCaseData></SOAP:Body></SOAP:Envelope>";
					equal(compareXML(getCaseDataRequest,settings.data), true, "Compare Request XML");
				},
				success: function(data) {
					equal(data[0]["ns:TestCase"]["ns:Number"], "1234567890", "Getting Case Data");
				}});
				$.cordys['case'].getCaseInstance(data.caseinstanceid, {
				beforeSend:function(xhr, settings){
					var getCaseInstanceRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetCaseInstance xmlns='http://schemas.cordys.com/casemanagement/execution/1.0'><caseinstanceid>someCaseInstanceID</caseinstanceid></GetCaseInstance></SOAP:Body></SOAP:Envelope>";
					equal(compareXML(getCaseInstanceRequest,settings.data), true, "Compare Request XML");
				},
				success: function(data) {
					equal(data[0].CASE_INSTANCE_IDENTIFIERS.INSTANCE_ID, "someCaseInstanceID", "Getting Case Instance");
				}});
				$.cordys['case'].getCaseVariables(data.caseinstanceid, {
				beforeSend:function(xhr, settings){
					var getCaseVariablesRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetCaseVariables xmlns='http://schemas.cordys.com/casemanagement/execution/1.0'><caseinstanceid>someCaseInstanceID</caseinstanceid></GetCaseVariables></SOAP:Body></SOAP:Envelope>";
					equal(compareXML(getCaseVariablesRequest,settings.data), true, "Compare Request XML");
				},
				success: function(vars) {
					equal(vars.length, 3, "3 case variables found");
					equal(vars[0].User.text, "user1", "First variable contains User");
				}});
				$.cordys['case'].sendEvent(data.caseinstanceid, "test", {
				beforeSend:function(xhr, settings){
					var sendEventRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><SendEvent xmlns='http://schemas.cordys.com/casemanagement/execution/1.0'><caseinstanceid>someCaseInstanceID</caseinstanceid><event source=\"\">test</event></SendEvent></SOAP:Body></SOAP:Envelope>";
					equal(compareXML(sendEventRequest,settings.data), true, "Compare Request XML");
				},
				success: function(data) {
					equal(data.result["@success"], "false", "Event Send");
				}});
			}
		});
		setTimeout(function() {
			start();
		}, 4000);
	});
	
	function getCaseVariables() {
		return {
			User: {
				"@type": "user",
				text: "user1"
			},
			ExpectedDuration: {
				"@type": "duration",
				text: "P0Y0M10DT0H0M0S"
			},
			Worklist: {
				"@type": "worklist",
				text: "Organization/My Work List"
			}
		}
	}

	function getCaseData() {
		return {
			data: {
				"@xmlns:ns": "http://schemas.cordys.com/default",
				"@name": "ns:TestCase",
				"ns:TestCase": {
					"ns:Number": "1234567890"
				}
			}
		};
	}

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /\bGetAttachments\b/,
		responseText: {
			attachment: {
				"@name": "Photo",
				"@mime": "bpm,jpg,jpeg",
				"@multiplicity":"*",
				"@acl":"delete",
				instance:[
					{
						"@name": "image1.jpg",
						"@modifiedby":"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com",
						"@modifiedon":"1340204669026",
						"@description":"some Image",
						text:"/documentstore/casemanagement/Empty Model/someCaseInstanceID/Photo/image1.jpg"
					},
					{
						"@name": "image2.jpg",
						"@modifiedby":"cn=user1,cn=organizational users,o=system,cn=cordys,cn=build,o=vanenburg.com",
						"@modifiedon":"1340204669026",
						"@description":"other Image",
						text:"/documentstore/casemanagement/Empty Model/someCaseInstanceID/Photo/image2.jpg"
					}
				]
			}
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /\bUploadAttachment\b/,
		responseText: {
			attachment: {
				"@name": "image3.jpg",
				"@modifiedby": "user1",
				"@modifiedat": "12-07-2012 10:20",
				"@size": "300",
				text: "/documentstore/casemanagement/Empty Model/someCaseInstanceID/Photo/image3.jpg"
			}
		}
	});

	$.mockjax({
		url: '*/com.eibus.web.soap.Gateway.wcp',
		data: /\bDeleteAttachment\b/,
		responseText: {
			caseinstanceid: "someCaseInstanceID"
		}
	});
	
	test("Case Attachments", 7, function(){
		stop();
		$.cordys['case'].getAttachments("someCaseInstanceID", {
			beforeSend:function(xhr, settings){
				var getAttachmentsRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetAttachments xmlns='http://schemas.cordys.com/bpm/attachments/1.0'><instanceid type=\"CASE\">someCaseInstanceID</instanceid></GetAttachments></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(getAttachmentsRequest,settings.data), true, "Compare Request XML");
			},
			success: function(attachments) {
				equal(attachments.length, 2, "2 attachments found");
				equal(attachments[0]["@name"], "image1.jpg", "First attachment image1");
		}});
		$.cordys['case'].addAttachment("someCaseInstanceID", "Photo", "image3.jpg", "some image", window.btoa("some content"), {
			beforeSend:function(xhr, settings){
				var addAttachmentRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UploadAttachment xmlns='http://schemas.cordys.com/bpm/attachments/1.0'><instanceid type=\"CASE\">someCaseInstanceID</instanceid><attachmentname>Photo</attachmentname><filename>image3.jpg</filename><description>some image</description><content isURL=\"false\">c29tZSBjb250ZW50</content></UploadAttachment></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(addAttachmentRequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.attachment["@name"], "image3.jpg", "Attachment added");
		}});
		$.cordys['case'].removeAttachment("someCaseInstanceID", "Photo", "image3.jpg", {
			beforeSend:function(xhr, settings){
				var removeAttachmentRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteAttachment xmlns='http://schemas.cordys.com/bpm/attachments/1.0'><instanceid type=\"CASE\">someCaseInstanceID</instanceid><attachmentname>Photo</attachmentname><filename>image3.jpg</filename></DeleteAttachment></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(removeAttachmentRequest,settings.data), true, "Compare Request XML");
			},
			success: function(data) {
				equal(data.error, undefined, "Attachment removed");
		}});
		setTimeout(function() {
			start();
		}, 3000);
	});

})(window, jQuery)
