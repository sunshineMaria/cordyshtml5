function AddInstancePageViewModel(parentModel) {
	
	if (!(this instanceof AddInstancePageViewModel)) {
		return new AddInstancePageViewModel(parentModel);
	}
	
	var self = this;
	
	this.selected = ko.observable(Server({
		mayTryLogIn: false
	}));
	
	this.onSubmitAddServer = function() {
		var instance = self.selected();
		instance.mayTryLogIn(true);
		
		parentModel.addInstance(instance);
		
		self.selected(Server({
			mayTryLogIn: false
		}));
	};
}