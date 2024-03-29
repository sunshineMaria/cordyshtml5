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

	// Function that will stop copying content and url object structure
	function ajaxExtend(target, src) {
		var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
		for (key in src) {
			if (src[key] !== undefined) {
				(flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
			}
		}
		if (deep) {
			jQuery.extend(true, target, deep);
		}
		return target;
	}

	$.cordys.ajax = function(options) {
		var opts = $.extend({}, $.cordys.ajax.defaults);
		opts = ajaxExtend(opts, options);

		opts.url = configureGatewayUrl(opts.url, opts);
		if (!opts.url) return null;
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

			dataStrings.push("</" + opts.method + ">");
			dataStrings.push("</SOAP:Body></SOAP:Envelope>");
			opts.data = dataStrings.join("");
		}
		if (typeof(opts.error) === "function") {
			opts.__error = opts.error;
		}
		opts.error = function(jqXHR, textStatus, errorThrown) {
			console.log("Error Response received ", jqXHR, jqXHR.error());
			var messCode = "";
			if (jqXHR.error().responseXML){
				var $response = $(jqXHR.error().responseXML);
				messCode = $response.find("MessageCode").text();
			}
			
			if (messCode.search(/Cordys.*(AccessDenied|Artifact_Unbound)/)>=0 || jqXHR.statusText === "Forbidden") {
				window._$DefCookies = new $.Deferred();
				loginIntoCordys();
			} else {
				if (!jqXHR.error().responseText && !jqXHR.error().responseXML) return;// skip this error, there is no description
				var showError = true;
				var errorMessage = $(jqXHR.error().responseXML).find("faultstring,error elem").text()
						|| jqXHR.responseText 
						|| "General error, see response.";
				if (opts.__error && typeof(opts.__error) === "function") {
					showError = opts.__error(jqXHR, textStatus, errorThrown, messCode, errorMessage, opts) !== false;
				}
				if (showError) {
					alert("Error on read: '" + errorMessage + "'");
				}
			}
		}
		return getCookies(opts).then(function(){
			setCookiesToUrl(opts);
			return getOrganization(opts);
		}).then(function(){
			setOrganizationToUrl(opts);
			opts.url = addURLParameter(opts.url, "_timestamp", new Date().getTime()); // Always add timestamp to prevent caching in iOS
		}).then(function() {
			return $.ajax(opts);
		});
	}

	$.cordys.ajax.defaults = {
		url: "",
		async: true,
		isMock:false,
		type:"POST",
		contentType:"text/xml; charset=\"utf-8\"",
		dataType:"xml"
	}

	function getOrganization(options) {
		window._$DefOrg = window._$DefOrg || $.Deferred();
		getOrganizationDN(options.organization || getURLParameter(window.location, "organization"), options);
		return window._$DefOrg;
	}

	function setOrganizationToUrl(options) {
		if (options.orgDN) {
			options.url = addURLParameter(options.url, "organization", options.orgDN);
		}
	}

	function getOrganizationDN(organization, options){
		if (! organization) {
			window._$DefOrg.resolve(options.orgDN = "");
			return;
		}
		if (organization.indexOf("=") >= 0) {
			window._$DefOrg.resolve(options.orgDN = organization);
			return;
		}
		var matchOrg = function(organization){
			var orgDN = "";
			var orgPattern = new RegExp("^o=" + organization + ",", "i");
			$.each($.cordys.ajax._organizations, function(i, value){
				if (orgPattern.test(value)) {
					orgDN = value;
					return false; // stop here
				}
			});
			return orgDN;
		};

		// check if we have the list of organizations in $.cordys.ajax._organizations
		if ($.cordys.ajax._organizations){
			window._$DefOrg.resolve(options.orgDN = matchOrg(organization));
			return;
		}
		else
		{
			//TODO: check if using localStorage is correct. What happens when another user logged in?
			$.cordys.ajax._organizations = ((typeof(localStorage) !== "undefined") ? (localStorage._organizations && localStorage._organizations.split("#"))	 : null);
		}
		if ($.cordys.ajax._organizations && (options.orgDN = matchOrg(organization))){
			window._$DefOrg.resolve(options.orgDN);
		} else {
			// let us fetch the organizations from the server if we do not yet have it or we cannot match from the list
			var GET_ORGS_REQ = "GetUserDetails", GET_ORGS_NS = "http://schemas.cordys.com/1.0/ldap";
			if (options.method === GET_ORGS_REQ && options.namespace ===  GET_ORGS_NS){
				window._$DefOrg.resolve(options.orgDN = "");
				return null; // stop recursing
			}
			// get the orgs
			var getOrgsRequest = $.cordys.ajax({
				method: GET_ORGS_REQ,
				async : true,
				namespace: GET_ORGS_NS,
				dataType: 'json'
			}).done(function(data) {
				// store to $.cordys.ajax._organizations
				var organizationObjects = ($.type(data.tuple.old.user.organization) === "array") ? data.tuple.old.user.organization : [data.tuple.old.user.organization];
				$.cordys.ajax._organizations = $.map(organizationObjects, function(organizationObject, index){
					return organizationObject.dn;
				});
				
				// store to local storage if available
				if(typeof(localStorage) !== "undefined"){
					localStorage._organizations = $.cordys.ajax._organizations.join("#");
				}
				if ($.cordys.ajax._organizations && (options.orgDN = matchOrg(organization))){
					window._$DefOrg.resolve(options.orgDN);
				}else{
					// the user will go to the default organization if the organization specified does not exist
					alert("The Organization '" + organization + "' does not exist. The Default Organization will be used as the Organization.");
					window._$DefOrg.resolve(options.orgDN = "");
				}
				
			}).fail(function(error){
				$.cordys.ajax._organizations = null;
				// the user will go to the default organization if the organization specified does not exist
				alert("The Organization '" + organization + "' does not exist. The Default Organization will be used as the Organization.");
				window._$DefOrg.resolve(options.orgDN = "");
			});
		}
	}

	function configureGatewayUrl(url, options) {
		return url	? url.replace(/^http:\//, window.location.protocol+"/").replace(/\/localhost\//, "/"+window.location.host+"/") 
					: window.location.protocol + "//" + window.location.host + "/cordys/com.eibus.web.soap.Gateway.wcp";
	}

	function getCookies(options) {
		window._$DefCookies = window._$DefCookies || $.Deferred();
		if (options.isMock === true) {
			window._$DefCookies.resolve();
		} else {
			var ctCookie = getCookie("\\w*_ct"); // cookie name can be different, when property gateway.csrf.cookiename is set
			if (ctCookie) {
				window._$DefCookies.resolve();
			} else {
				var saCookie = getCookie("\\w*_SAMLart");
				if (!saCookie) {
					loginIntoCordys(options.loginUrl);
				} else {
					window._$DefCookies.resolve();
				}
			}
		}
		return window._$DefCookies;
	}

	function setCookiesToUrl(options) {
		if (options.isMock !== true) {
			var ctCookie = getCookie("\\w*_ct"); // cookie name can be different, when property gateway.csrf.cookiename is set
			if (ctCookie) {
				options.url = addURLParameter(options.url, RegExp.$1, ctCookie);
			}
		}
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
			if (typeof(settings.context) === "object"){
				pStrings.push(parameters.call(settings.context, settings));
			}else{
				pStrings.push(parameters(settings));
			}
		} else if (typeof(parameters) === "string") {
			pStrings.push(parameters);
		}
		return pStrings.join("");
	}

})(window, jQuery)