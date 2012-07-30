function ShareViewModel(parentModel) {
	
	if (!(this instanceof ShareViewModel)) {
		return new ShareViewModel(parentModel);
	}
	
	var self = this;
	
	this.selected = ko.observable();
	
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