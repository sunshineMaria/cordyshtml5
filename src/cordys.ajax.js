;(function (window, $, undefined) {

	if (!$.cordys) $.cordys = {};

	$.cordys.ajax = function(options) {
		var opts = $.extend({}, $.cordys.ajax.defaults, options);
		opts.url = configureGatewayUrl(opts.url, options);
		if (!opts.url) return null;
		if (!opts.data) {
			opts.data = "<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body>" +
				"<" + opts.method + " xmlns='" + opts.namespace + "'>";
			if (opts.parameters) {
				for (var i=0,len=opts.parameters.length; i<len; i++) {
					var opt = opts.parameters[i];
					opts.data += "<" + opt.name + ">" + (typeof(opt.value) == "function" ? opt.value() : opt.value) + "</" + opt.name + ">";
				}
			}
			if (opts.cursor) {
				opts.data += "<cursor id='" + (opts.cursor.id || "0") + 
							"' position='" + (opts.cursor.position || "0") + 
							"' numRows='" + (opts.cursor.numRows || "5") + 
							"' maxRows='" + (opts.cursor.maxRows || "99999") + "' />";
				// TODO: handle cursor from response to be used in subsequent calls
			}
			opts.data += "</" + opts.method + ">" + "</SOAP:Body></SOAP:Envelope>";
		}
		if (!opts.error) {
			opts.error=function (e) {
				console.log(e, e.error());
				var $response = $(e.error().responseXML);
				var messCode = $response.find("MessageCode").text();
				if (messCode.search(/Cordys.*AccessDenied/)>=0) {
					loginIntoCordys();
				} else {
					var err = $(e.error().responseXML).find("faultstring,error elem").text()
						|| e.responseText 
						|| "General error, see response.";
					alert("Error on read: '" + err + "'");
				}
			}
		}
		return $.ajax(opts);
	}

	$.cordys.ajax.defaults = {
		url: "",
		async: true,
		type:"POST",
		contentType:"text/xml; charset=\"utf-8\"",
		dataType:"xml"
	}

	function configureGatewayUrl(url, options) {
		url = url 
				? url.replace(/^http:\//, window.location.protocol+"/").replace(/\/localhost\//, "/"+window.location.host+"/") 
				: window.location.protocol + "//" + window.location.host + "/cordys/com.eibus.web.soap.Gateway.wcp";
		var org = options.organization || getURLParameter(window.location, "organization");
		if (org) {
			url = addURLParameter(url, "organization", org);
		}
		var samlArt = getCookie("\\w*_ct");
		if (samlArt) {
			url = addURLParameter(url, RegExp.$1, samlArt);
		}
		else {
			loginIntoCordys();
			return "";
		}
		return url;
	}

})(window, jQuery)