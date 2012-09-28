function ShareViewModel() {
	
	if (!(this instanceof ShareViewModel)) {
		return new ShareViewModel();
	}
	
	var self = this;
	
	this.selected = ko.observable();
	
	this.selected.subscribe(function(newValue) {
		if (newValue && Cordys) Cordys.currentOrigin = newValue.location().replace(/\/cordys$/, '');
	}, this);
	
	this.instances = (function() {
		var instances = ko.observableArray((function() {
			var servers = JSON.parse(localStorage.instances || '[]');
			
			return $.map(servers, function(server) {
				return Server(server);
			});
		}) ());
		
		instances.subscribe(function(newValue) {
			window.localStorage.instances = ko.toJSON(ko.utils.unwrapObservable(self.instances));
		});
		
		return instances;
	}) ();
	
	this.addInstance = function(server) {
		self.instances.push(server);
	};
	
	this.getIndexOfInstance = function(instance) {
		return this.instances.indexOf(instance);
	};
}