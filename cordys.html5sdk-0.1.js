if (typeof(jQuery) == "undefined") {
	throw 'jQuery is required, please ensure it is loaded before this library'; 
//	document.write('<script src="/cordys/html5/jquery/jquery-1.7.1.min.js"><\/script>');
};
if (!$.cordys) $.cordys = {};

function getURLParameter(url, name) {
	return (url.search.search( new RegExp("[\?\&]"+name+"=([^\&]*)") ) >= 0) ? RegExp.$1 : "";
}
function addURLParameter(url, name, value) {
	var parSeparator = url.indexOf("?") < 0 ? "?" : "&";
	url = url + parSeparator + name + "=" + encodeURIComponent(value);
	return url;
}
function getCookie(cookieName)
{
	return (window.document.cookie.search( new RegExp("\\b("+cookieName+")=([^;]*)") ) >= 0) ? RegExp.$2 : "";
}
function deleteAllCookies()
{
	var cookies = document.cookie.split(";");
	for(var i=0; i < cookies.length; ++i)
	{
		document.cookie = $.trim(cookies[i].split("=")[0]) + 
				"=;expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/cordys";
	}
}

function loginIntoCordys(loginUrl) {
	if ($.mobile) {
		loginUrl = loginUrl || "/cordys/html5/mobilelogin.htm";
		$.mobile.changePage( loginUrl, { transition: "pop", changeHash: false } );
	}
	else {
		loginUrl = loginUrl || "/cordys/html5/login.htm";
		window.showModalDialog(loginUrl);
		window.location.reload();
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

loadScript("/cordys/html5/src/cordys.ajax.js");
loadScript("/cordys/html5/src/cordys.model.js");
loadScript("/cordys/html5/src/cordys.workflow.js");
loadScript("/cordys/html5/src/cordys.process.js");
loadScript("/cordys/html5/src/cordys.case.js");
