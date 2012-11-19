if (typeof(jQuery) == "undefined") {
	throw new Error("jQuery is required, please ensure it is loaded before this library");
//	document.write('<script src="/cordys/html5/jquery/jquery-1.8.2.min.js"><\/script>');
};
if (!$.cordys) $.cordys = {
	cookiePath: "/cordys",
	baseUrlPath: ""
};

//For IE
if ($.browser.msie != undefined){
	if ($.browser.version == 7) {
		loadScript(("/cordys/html5/util/json2.js"));
	}
	if ($.browser.version == 8 || $.browser.version == 7) {
		console = {
			log: function() {
			}
		}
	}
	if ($.browser.version >= 7 || $.browser.version <= 9) {
		loadScript(("/cordys/html5/util/base64.js"));
	}
}

function getURLParameter(url, name) {
	return (url.search.search( new RegExp("[\?\&]"+name+"=([^\&]*)") ) >= 0) ? RegExp.$1 : "";
}
function addURLParameter(url, name, value) {
	var parSeparator = url.indexOf("?") < 0 ? "?" : "&";
	return url + parSeparator + name + "=" + encodeURIComponent(value);
}

function addOrganizationContextToURL(url) {
	var orgDN = getURLParameter(window.location, "organization");
	if (orgDN) {
		url = addURLParameter(url, "organization", orgDN);
	}
	return url;
}

function getCookie(cookieName)
{
	return (window.document.cookie.search( new RegExp("\\b("+cookieName+")=([^;]*)") ) >= 0) ? RegExp.$2 : "";
}
function deleteAllCookies()
{
	var cookies = document.cookie.split(";");
	for (var i=0; i < cookies.length; ++i) {
		document.cookie = $.trim(cookies[i].split("=")[0]) + 
				"=;expires=Thu, 01-Jan-1970 00:00:01 GMT; path=" + $.cordys.cookiePath;
	}
}

function loginIntoCordys(loginUrl) {
	var isNative = getURLParameter(window.location, "startfrom");
	if (isNative && $.cordys.cookie) {
		$.cordys.cookie.getCookies(getURLParameter(window.location, "serverId"));
		return;
	}
	var baseUrl = "/cordys/html5/";
	if ($.mobile) {
		$.mobile.changePage( loginUrl || baseUrl + "mobilelogin.htm", { 
			transition: "pop", 
			changeHash: true
		});
	} else {
		window.showModalDialog(loginUrl || baseUrl + "login.htm");
		//window.location.reload();
	}
}

function loadScript(url, callback, async, cache) {
	return $.ajax({
		type: "GET",
		url: url,
		success: callback,
		dataType: "script",
		async: async || false,
		cache: cache || true
	});
};

loadScript("/cordys/html5/plugins/cordys.ajax.js");
loadScript("/cordys/html5/plugins/cordys.model.js");
loadScript("/cordys/html5/plugins/cordys.workflow.js");
loadScript("/cordys/html5/plugins/cordys.process.js");
loadScript("/cordys/html5/plugins/cordys.case.js");
