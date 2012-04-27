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

	$.ajaxSetup({
		converters: {
			"xml json": function( data ) {
				if (!$.xml2json) loadScript("/cordys/html5/jquery/jquery.xml2json.js");
				return $.xml2json($(data).find("Body").children()[0]);
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
				for (var i=0,len=opts.parameters.length; i<len; i++) {
					var opt = opts.parameters[i];
					dataStrings.push("<" + opt.name + ">");
					dataStrings.push((typeof(opt.value) == "function" ? opt.value() : opt.value));
					dataStrings.push("</" + opt.name + ">");
				}
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
			loginIntoCordys(options.loginUrl);
			return "";
		}
		return url;
	}

})(window, jQuery)