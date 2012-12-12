// OAuth Configuration
var loginUrl    = 'https://login.salesforce.com/';
var clientId    = '3MVG9y6x0357HlecayK6Y1dAY70zXqe1Ka_uybO0uDE_unhEpbex.7sL1Hu04fr_WId8aGLiEU.eJmW49EeOA';
var redirectUri = 'https://localhost/cordys/html5/test/jsapp/oauthcallback.html';
var proxyUrl    = 'https://localhost/cordys/html5/test/jsapp/proxy.php?mode=native';
/*
var clientId    = '3MVG9y6x0357HlecayK6Y1dAY79vgbu47.6augamrAgX0UWrgi7cjc8JyzD_8_tmMBLcR86X2rr4pddJopu5F';
var redirectUri = 'https://testbop.cordys.com/cordys/html5/demo/ordermanagement/oauthcallback.htm';
var proxyUrl    = 'https://testbop.cordys.com/cordys/html5/demo/ordermanagement/proxy.php?mode=native';
*/
// We'll get an instance of the REST API client in a callback after we do 
// OAuth
var client = new forcetk.Client(clientId, loginUrl, proxyUrl);;

function getAuthorizeUrl(loginUrl, clientId, redirectUri){
	return loginUrl+'services/oauth2/authorize?display=touch'
		+'&response_type=token&client_id='+escape(clientId)
		+'&redirect_uri='+escape(redirectUri);
}

function sessionCallback(oauthResponse) {
	if (typeof oauthResponse === 'undefined'
		|| typeof oauthResponse['access_token'] === 'undefined') {
		errorCallback({
			status: 0, 
			statusText: 'Unauthorized', 
			responseText: 'No OAuth response'
		});
	} else {
		client.setSessionToken(oauthResponse.access_token, null,
		oauthResponse.instance_url);

		$.mobile.changePage('#mainaccountspage',"slide",false,true);
		$("#accSearchInput").on( "change", function(event, ui) {
			getAccounts($(this).val(), function(){
			});
		});
	}
}

function errorCallback(jqXHR){
	alert(jqXHR.statusText + ": " + jqXHR.responseText);
}

// Populate the account list and set up click handling
function getAccounts(strSearch, callback) {
	$('#accountlist').empty();
	client.query("SELECT Id, Name FROM Account WHERE Name Like '%"+strSearch+"%' ORDER BY Name LIMIT 20"
	,
	function(response) {
		$.each(response.records,
		function() {
			var id = this.Id;
			$('<li></li>')
			.hide()
			.append('<a href="#"><h2>' + this.Name + '</h2></a>')
			.click(function(e) {
				e.preventDefault();
				if (e.offsetX + 25 < $(e.target).width()) {
					$("#fldCustomer").val($(e.target).text());
					window.history.back();
				} else {
					// We could do this more efficiently by adding Industry and
					// TickerSymbol to the fields in the SELECT, but we want to
					// show dynamic use of the retrieve function...
					client.retrieve("Account", id, null
					,
					function(response) {
						$('#Name').html(response.Name);
						$('#Industry').html(response.Industry);
						$('#Address').html(response.ShippingStreet);
						$('#Id').val(response.Id);
						$('#map_canvas').html('');
						$.mobile.changePage('#detailaccountpage', "slide", false, true);
					}, errorCallback);
				}
			})
			.appendTo('#accountlist')
			.show();
		});

		$('#accountlist').listview('refresh');

		if (typeof callback != 'undefined' && callback != null) {
			callback();
		}
	}, errorCallback);
}

function initializeMap() {
	var address = $('#Address').text();
	// I create a new google maps object to handle the request and we pass the address to it
	var geoCoder = new google.maps.Geocoder(address)
	// a new object for the request I called "request" , you can put there other parameters to specify a better search (check google api doc for details) ,
	// on this example im going to add just the address
	var request = {address:address};
 
	// I make the request
	geoCoder.geocode(request, function(result, status){
	// as a result i get two parameters , result and status.
	// results is an  array tha contenis objects with the results founds for the search made it.
	// to simplify the example i take only the first result "result[0]" but you can use more that one if you want
 
	// So , using the first result I need to create a  latlng object to be pass later to the map
	var latlng = new google.maps.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());  
 
	// some initial values to the map
	var myOptions = {
		zoom: 15,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
 
	// the map is created with all the information
	var map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
 
	// an extra step is needed to add the mark pointing to the place selected.
	var marker = new google.maps.Marker({position:latlng,map:map,title:'title'});
 
  })
}
