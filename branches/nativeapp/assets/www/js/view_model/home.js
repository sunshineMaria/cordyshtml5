function HomeViewModel(parentModel) {
	
	if (!(this instanceof HomeViewModel)) {
		return new HomeViewModel(parentModel);
	}
	
	this.instances = parentModel.instances;
	
	this.onCreateDemoInstance = function() {
		parentModel.addInstance(Server({
			location: 'https://testbop.cordys.com/cordys', 
			organization: 'CordysNL', 
			username: 'demo', 
			password: 'demo'
		}));
		$.mobile.changePage('#');
	};
	
	this.click = function(server, event) {
		parentModel.selected(server);
		//redirect to touchbopindex page only if the user credentials are valid.
		if (!server.cookies.saml.valid()) {
			event.preventDefault();
			event.cancelBubble = true;
			if (event.stopPropagation)
				event.stopPropagation();
		
			if (!server.cookies.ct.valid()) {
				// do first prelogin
				server.prelogin().done(function() {
					server.login().done(function() {
						$.mobile.changePage('#app');
					});
				}).fail(function (e, statusText, errorThrown) {
					var errorText = (e.responseXML && $(e.responseXML).find("MessageCode").text()) || e.responseText || errorThrown || statusText;
					var errorMessage = errorText;
					
					//When Cordys is down on server
					if (errorText == "Cordys.WebGateway.Messages.WG_SOAPTransaction_SOAPNodeLookupFailure" || errorText == "Cordys.WebGateway.Messages.WG_SOAPTransaction_ReceiverDetailsInvalid" || errorText == "Cordys.WebGateway.Messages.CommunicationError") {
						errorMessage = "SSO_UNAVAILABLE_ERROR: The message cannot be sent to the Single Sign-On service group. Verify if the corresponding service container is up and running.";
					}

					//When there is no connectivity.
					else if (errorText == "error") {
						errorMessage = "A connection with the server cannot be established";
					}

					if (navigator.notification) {
						navigator.notification.alert(errorMessage, null, "Login Failed");
					} else {
						window.alert(errorMessage);
					}
				});
			} else {
				server.login().done(function() {
					$.mobile.changePage('#app');
				});
			}
		}
	};
	
	this.longPress = function(server) {
		parentModel.selected(server);
		$.mobile.changePage('#edit-server');
	};
	
	this.any = ko.computed(function() {
		return this.instances.any();
	}, this);
}