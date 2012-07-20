(function (window, $) {

    module("Process Plugin test");

	$.mockjax({
        url: '*/com.eibus.web.soap.Gateway.wcp',
        data: /GetBusinessIdentifier/,
        responseText: {
            tuple: {
                old: {
                    BusinessIdentifier: {
                        "Name": "BAM/Business Identifier",
                        "Description": "Business Identifier",
                        "Type": "1",
                        "Prec": "0",
                        "Value": "1",
                        "Sequence": "1"
                    }
                }
            }
        }
    });
	
    test("Get Business Identifier JSON", 2, function () {
        stop();
        $.cordys.process.getBusinessIdentifiers("001CC42E-BB14-11E1-F984-5F61BA2114A7", {
             beforeSend: function (xhr, settings) {
				var getBIrequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetBusinessIdentifierValues xmlns='http://schemas.cordys.com/pim/queryinstancedata/1.0'><processInstanceID>001CC42E-BB14-11E1-F984-5F61BA2114A7</processInstanceID></GetBusinessIdentifierValues></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(getBIrequest,settings.data), true, "Compare Request XML");
            },
			success: function (identifiers) {
                equal(identifiers[0].Name, "BAM/Business Identifier", "Business Identifier Name is BAM/Business Identifier");
                start();
            },
            error: function (jqXHR, errorStatus, errorThrown, errorCode, errorMessage) {
                ok(false, "error found: " + errorMessage);
                start();
                return false;
            }
        })
    });

    $.mockjax({
        url: '*/com.eibus.web.soap.Gateway.wcp',
        data: /ExecuteProcess/,
        responseText: {
            data: {
                "instance_id": "001CC42E-BB14-11E1-F993-C9E84F75F4A8"
            }
        },
		responseXML:
		'<response><data><instance_id>001CC42E-BB14-11E1-F993-C9E84F75F4A8</instance_id></data></response>'
    });

	var startProcessRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ExecuteProcess xmlns='http://schemas.cordys.com/bpm/execution/1.0'><receiver>BPM/getEmployees</receiver><type>definition</type><message></message></ExecuteProcess></SOAP:Body></SOAP:Envelope>";
	
	test("Start Process XML", 2, function () {
        stop();
        $.cordys.process.startProcess("BPM/getEmployees", "", {
             beforeSend: function (xhr, settings) {
				equal(compareXML(startProcessRequest,settings.data), true, "Compare Request XML");
            },
			success: function (response) {
                equal(response.data.instance_id, "001CC42E-BB14-11E1-F993-C9E84F75F4A8", "Process (001CC42E-BB14-11E1-F993-C9E84F75F4A8) started");
                start();
            },
            error: function (jqXHR, errorStatus, errorThrown, errorCode, errorMessage) {
                ok(false, "error found: " + errorMessage);
                start();
                return false;
            }
        });
    });
	
	test("Start Process JSON", 2, function () {
        stop();
        $.cordys.process.startProcess("BPM/getEmployees", "", {
			dataType: "xml",
             beforeSend: function (xhr, settings) {
				equal(compareXML(startProcessRequest,settings.data), true, "Compare Request XML");
            },
			success: function (response) {
                equal($(response).find("instance_id").text(), "001CC42E-BB14-11E1-F993-C9E84F75F4A8", "Process (001CC42E-BB14-11E1-F993-C9E84F75F4A8) started");
                start();
            },
            error: function (jqXHR, errorStatus, errorThrown, errorCode, errorMessage) {
                ok(false, "error found: " + errorMessage);
                start();
                return false;
            }
        });
    });

	var executeProcessRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><ExecuteProcess xmlns='http://schemas.cordys.com/bpm/execution/1.0'><receiver>001CC42E-BB14-11E1-F993-C9E84F75F4A8</receiver><type>instance</type><message></message></ExecuteProcess></SOAP:Body></SOAP:Envelope>";
	
    test("Execute Process JSON", 2, function () {
        stop();
        $.cordys.process.executeProcess("001CC42E-BB14-11E1-F993-C9E84F75F4A8", "", {
            beforeSend: function (xhr, settings) {
				equal(compareXML(executeProcessRequest,settings.data), true, "Compare Request XML");
            },
			success: function (response) {
                equal(response.data.instance_id, "001CC42E-BB14-11E1-F993-C9E84F75F4A8", "Process (001CC42E-BB14-11E1-F993-C9E84F75F4A8) executed");
                start();
            },
            error: function (jqXHR, errorStatus, errorThrown, errorCode, errorMessage) {
                ok(false, "error found: " + errorMessage);
                start();
                return false;
            }
        });
    });
	
	test("Execute Process XML", 2, function () {
        stop();
        $.cordys.process.executeProcess("001CC42E-BB14-11E1-F993-C9E84F75F4A8", "", {
			dataType: "xml",
			beforeSend: function (xhr, settings) {
				equal(compareXML(executeProcessRequest,settings.data), true, "Compare Request XML");
            },
            success: function (response) {
                equal($(response).find("instance_id").text(), "001CC42E-BB14-11E1-F993-C9E84F75F4A8", "Process (001CC42E-BB14-11E1-F993-C9E84F75F4A8) executed");
                start();
            },
            error: function (jqXHR, errorStatus, errorThrown, errorCode, errorMessage) {
                ok(false, "error found: " + errorMessage);
                start();
                return false;
            }
        });
    });
	
	test("Get Attachments", 3, function () {
		stop();
		
        $.cordys.process.getAttachments("001CC42E-BB14-11E1-F980-20A353CF14A7", {
            beforeSend: function (xhr, settings) {
				var getAttachRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><GetAttachments xmlns='http://schemas.cordys.com/bpm/attachments/1.0'><instanceid type=\"BPM\">001CC42E-BB14-11E1-F980-20A353CF14A7</instanceid></GetAttachments></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(getAttachRequest,settings.data), true, "Compare Request XML");
                equal($(settings.data).find("instanceID").text(), "001CC42E-BB14-11E1-F980-20A353CF14A7", "Attachment InstanceID is 001CC42E-BB14-11E1-F980-20A353CF14A7");
                equal($(settings.data).find("instanceID").attr("type"), "BPM", "Process type is BPM");
                start();
            },
            error: function (jqXHR, errorStatus, errorThrown, errorCode, errorMessage) {
                ok(false, "error found: " + errorMessage);
                start();
                return false;
            }
        })
    });
	
	test("Upload Attachment", 2, function () {
        stop();
        $.cordys.process.uploadAttachment("001CC42E-BB14-11E1-F993-CEB9864AF4A8", "attachmentName", "image", "fileDescription", "http://fileurl.jpg", {
            beforeSend: function (xhr, settings) {
				var uploadAttachRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><UploadAttachment xmlns='http://schemas.cordys.com/bpm/attachments/1.0'><instanceid type=\"BPM\">001CC42E-BB14-11E1-F993-CEB9864AF4A8</instanceid><attachmentname>attachmentName</attachmentname><filename>image</filename><description>fileDescription</description><content isURL=\"true\">http://fileurl.jpg</content></UploadAttachment></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(uploadAttachRequest,settings.data), true, "Compare Request XML");
                equal($(settings.data).find("filename").text(), "image", "Filename is image");
                start();
            },
            error: function (jqXHR, errorStatus, errorThrown, errorCode, errorMessage) {
                ok(false, "error found: " + errorMessage);
                start();
                return false;
            }
        })
    });
	
    test("Remove Attachment", 2, function () {
        stop();
        $.cordys.process.removeAttachment("001CC42E-BB14-11E1-F993-CEB9864AF4A8", "attachmentName", "image", {
            beforeSend: function (xhr, settings) {
				var removeAttachRequest = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><DeleteAttachment xmlns='http://schemas.cordys.com/bpm/attachments/1.0'><instanceid type=\"BPM\">001CC42E-BB14-11E1-F993-CEB9864AF4A8</instanceid><attachmentname>attachmentName</attachmentname><filename>image</filename></DeleteAttachment></SOAP:Body></SOAP:Envelope>";
				equal(compareXML(removeAttachRequest,settings.data), true, "Compare Request XML");
                equal($(settings.data).find("filename").text(), "image", "Filename is image");
                start();
            },
            error: function (jqXHR, errorStatus, errorThrown, errorCode, errorMessage) {
                ok(false, "error found: " + errorMessage);
                start();
                return false;
            }
        })
    });

})(window, jQuery)