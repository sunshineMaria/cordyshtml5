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
	};
	
	this.click = function(server) {
		parentModel.selected(server);
	};
	
	this.longPress = function(server) {
		parentModel.selected(server);
		$.mobile.changePage('#edit-server');
	};
	
	this.any = ko.computed(function() {
		return this.instances.any();
	}, this);
}