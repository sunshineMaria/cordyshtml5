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

	$.cordys.ajax = function(options) {
		var opts = $.extend({}, $.cordys.ajax.defaults, options);
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
			if (!jqXHR.error().responseText && !jqXHR.error().responseXML) return;// skip this error, there is no description
			var $response = $(jqXHR.error().responseXML);
			var messCode = $response.find("MessageCode").text();
			if (messCode.search(/Cordys.*(AccessDenied|Artifact_Unbound)/)>=0 || jqXHR.statusText === "Forbidden") {
				loginIntoCordys();
			} else {
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
		return $.ajax(opts);
	}

	$.cordys.ajax.defaults = {
		url: "",
		async: true,
		isMock:false,
		type:"POST",
		contentType:"text/xml; charset=\"utf-8\"",
		dataType:"xml"
	}

	function getOrganizationDN(organization, options){
		if (! organization) return null;
		if (organization.indexOf("=") >= 0) return organization;

		// check if we have the list of organizations in $.cordys.ajax._organizations or in the local storage 
		$.cordys.ajax._organizations = $.cordys.ajax._organizations || ((typeof(Storage) !== "undefined") ? (localStorage._organizations && localStorage._organizations.split("#"))	 : null);

		var matchOrg = function(organization){
			var orgDN = null;
			var orgPattern = new RegExp("^o=" + organization + ",", "i");
			$.each($.cordys.ajax._organizations, function(i, value){
				if (orgPattern.test(value)){	
					orgDN = value;
					return false; // stop here
				}
			});
			return orgDN;
		};

		var orgDN;
		if (! ($.cordys.ajax._organizations) || !(orgDN = matchOrg(organization))){
			// let us fetch the organizations from the server if we do not yet have it or we cannot match from the list

			var GET_ORGS_REQ = "GetUserDetails", GET_ORGS_NS = "http://schemas.cordys.com/1.0/ldap";
			if (options.method === GET_ORGS_REQ && options.namespace ===  GET_ORGS_NS){
				return null; // stop recursing
			}
			// get the orgs
			var getOrgsRequest = $.cordys.ajax({
				method: GET_ORGS_REQ,
				organization : false,
				async : false,
				namespace: GET_ORGS_NS,
				dataType: 'json'
			
			}).done(function(data) {
				// store to $.cordys.ajax._organizations
				var organizationObjects = ($.type(data.tuple.old.user.organization) === "array") ? data.tuple.old.user.organization : [data.tuple.old.user.organization];
				$.cordys.ajax._organizations = $.map(organizationObjects, function(organizationObject, index){
					return organizationObject.dn;
				});
				
				// store to local storage if available
				if(typeof(Storage) !== "undefined"){
					localStorage._organizations = $.cordys.ajax._organizations.join("#");
				}
			}).fail(function(error){
				$.cordys.ajax._organizations = null;
			});
			orgDN = matchOrg(organization);
		}

		if (! orgDN){
			// the user will go to the default organization if the organization specified does not exist
			alert("Could not find Organization '" + organization + "'. Proceeding to default" );
		}

		return orgDN;
	}

	function configureGatewayUrl(url, options) {

		url = url 
				? url.replace(/^http:\//, window.location.protocol+"/").replace(/\/localhost\//, "/"+window.location.host+"/") 
				: window.location.protocol + "//" + window.location.host + "/cordys/com.eibus.web.soap.Gateway.wcp";
			
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
		if (options.isMock === true){
			// This is a mock request used for testing. We do not need to login or set the SAML token.
		}
		else
		{
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
		}
//*/
		var orgDN = getOrganizationDN(options.organization || getURLParameter(window.location, "organization"), options);
		if (orgDN) {
			url = addURLParameter(url, "organization", orgDN);
		}

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