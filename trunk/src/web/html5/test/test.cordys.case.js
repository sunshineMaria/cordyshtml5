(function(window, $) {

	module("Case Plugin test");

	// Use mockjax from test.cordys.workflow.js for reading tasks

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

	test("Read Tasks with details", function(){
		stop();
		$.cordys.workflow.getTasks({success:function(tasks) {
			equal(tasks.length, 2, "2 task found");
			ok($.cordys.workflow.isCaseActivity(tasks[1]), "Task is Case");
			$.cordys.workflow.getTaskDetails(tasks[1], {success: function(tasks) {
				equal(tasks.length, 1, "1 task details found");
			}});
		}});
		setTimeout(function() {
			start();
		}, 2000);
	});

	test("Create and Test Case", 8, function(){
		stop();
		$.cordys['case'].createCase("Test Case", getCaseVariables(), getCaseData(), {
			success: function(data) {
				equal(data.caseinstanceid, "someCaseInstanceID", "Case created");
				$.cordys['case'].updateCaseData(data.caseinstanceid, getCaseData(), {success: function(data) {
					equal(data.error, null, "Case Data updated");
				}});
				$.cordys['case'].updateCaseVariables(data.caseinstanceid, getCaseVariables(), {success: function(data) {
					equal(data.error, null, "Case Variables updated");
				}});
				$.cordys['case'].getCaseData(data.caseinstanceid, {success: function(data) {
					equal(data[0]["ns:TestCase"]["ns:Number"], "1234567890", "Getting Case Data");
				}});
				$.cordys['case'].getCaseInstance(data.caseinstanceid, {success: function(data) {
					equal(data[0].CASE_INSTANCE_IDENTIFIERS.INSTANCE_ID, "someCaseInstanceID", "Getting Case Instance");
				}});
				$.cordys['case'].getCaseVariables(data.caseinstanceid, {success: function(vars) {
					equal(vars.length, 3, "3 case variables found");
					equal(vars[0].User.text, "user1", "First variable contains User");
				}});
				$.cordys['case'].sendEvent(data.caseinstanceid, "test", {success: function(data) {
					equal(data.result["@success"], "false", "Event Send");
				}});
			}
		});
		setTimeout(function() {
			start();
		}, 2000);
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

	test("Case Attachments", 4, function(){
		stop();
		$.cordys['case'].getAttachments("someCaseInstanceID", {success: function(attachments) {
			equal(attachments.length, 2, "2 attachments found");
			equal(attachments[0]["@name"], "image1.jpg", "First attachment image1");
		}});
		$.cordys['case'].addAttachment("someCaseInstanceID", "Photo", "image3.jpg", "some image", window.btoa("some content"), {success: function(data) {
			equal(data.attachment["@name"], "image3.jpg", "Attachment added");
		}});
		$.cordys['case'].removeAttachment("someCaseInstanceID", "Photo", "image3.jpg", {success: function(data) {
			equal(data.error, null, "Attachment removed");
		}});
		setTimeout(function() {
			start();
		}, 2000);
	});

})(window, jQuery)
