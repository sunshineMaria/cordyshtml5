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