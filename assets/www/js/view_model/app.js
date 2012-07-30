function AppViewModel(parentModel) {
	
	if (!(this instanceof AppViewModel)) {
		return new AppViewModel(parentModel);
	}
	
	this.instance = parentModel.selected;
	
	this.bopTouchIndexUrl = ko.computed(function() {
		var server = this.instance(),
			id = parentModel.instances.indexOf(server);
		
		return server.getTouchBopIndexUrl(id);
	}, this);
	
	this.indexOfInstance = parentModel.instances.indexOf(this.instance);
}