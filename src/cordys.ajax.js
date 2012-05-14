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

	if (!$.cordys) $.cordys = {};
	if (!$.cordys.json) {
		loadScript("/cordys/html5/jquery/jxon.js");
	}

	$.ajaxSetup({
		converters: {
			"xml json": function( data ) {
				return $.cordys.json.xml2js($(data).find("Body, SOAP\\:Body").children()[0]);
			}
		}
	});

	$.cordys.ajax = function(options) {
		var opts = $.extend({}, $.cordys.ajax.defaults, options);
		opts.url = configureGatewayUrl(opts.url, opts);
		if (!opts.url) return null;
		if (typeof(opts.dataFilter) === "undefined") opts.dataFilter = function(data) {
			// Remove the null and nil attributes on empty nodes, otherwise xml2json converts it into an object
			$(data).find("[null]").each(function() {
				var attributes = $.map(this.attributes, function(item) {
					return item.name;
				});
				var $this = $(this);
				$.each(attributes, function(i, item) {
					$this.removeAttr(item);
				});
			});
			return data;
		};
		if (typeof(opts.data) === "undefined" && opts.method && opts.namespace) {
			var dataStrings = [];
			dataStrings.push("<SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'><SOAP:Body><");
			dataStrings.push(opts.method);
			dataStrings.push(" xmlns='");
			dataStrings.push(opts.namespace);
			dataStrings.push("'>");
			if (opts.parameters) {
				dataStrings.push(getParameterString(opts.parameters, opts));
			}
			if (opts.iteratorSize) {
				dataStrings.push("<cursor id='0' ");
				dataStrings.push("position='0' ");
				dataStrings.push("numRows='" + opts.iteratorSize +  "' ");
				dataStrings.push("maxRows='" + opts.iteratorSize + "' />");
				// TODO: handle cursor from response to be used in subsequent calls
			}
			dataStrings.push("</" + opts.method + ">");
			dataStrings.push("</SOAP:Body></SOAP:Envelope>");
			opts.data = dataStrings.join("");
		}
		if (typeof(opts.error) === "undefined") {
			opts.error=function (e) {
				console.log(e, e.error());
				var $response = $(e.error().responseXML);
				var messCode = $response.find("MessageCode").text();
				if (messCode.search(/Cordys.*(AccessDenied|Artifact_Unbound)/)>=0) {
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
/*
		var saName = localStorage.getItem("cordysSAMLArtCookieName");
		if (saName) {
			var saValue = localStorage.getItem(saName);
			if (saValue) {
				url = addURLParameter(url, "SAMLart", saValue);
			} else {
				loginIntoCordys(options.loginUrl);
			}
		}
/*/
		var ctCookie = getCookie("\\w*_ct"); // cookie name can be different, when property gateway.csrf.cookiename is set
		if (ctCookie) {
			url = addURLParameter(url, RegExp.$1, ctCookie);
		} else {
			var saCookie = getCookie("\\w*_SAMLart");
			if (!saCookie) {
				loginIntoCordys(options.loginUrl);
				return "";
			}
		}
//*/
		return url;
	}

	function getParameterString(parameters, settings) {
		var pStrings = [];
		if ($.isArray(parameters)) {
			for (var i=0,len=parameters.length; i<len; i++) {
				var par = parameters[i];
				pStrings.push("<" + par.name + ">");
				pStrings.push((typeof(par.value) === "function" ? par.value() : par.value));
				pStrings.push("</" + par.name + ">");
			}
		} else if (typeof(parameters) === "object") {
			if ($.cordys.json) pStrings.push($.cordys.json.js2xmlstring(parameters));
			else {
				for (var par in parameters) {
					pStrings.push("<" + par + ">");
					pStrings.push((typeof(parameters[par]) === "function" ? parameters[par]() : parameters[par]));
					pStrings.push("</" + par + ">");
				}
			}
		} else if (typeof(parameters) === "function") {
			pStrings.push(parameters(settings));
		} else if (typeof(parameters) === "string") {
			pStrings.push(parameters);
		}
		return pStrings.join("");
	}

})(window, jQuery)