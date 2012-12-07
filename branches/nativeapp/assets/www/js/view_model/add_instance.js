function AddInstancePageViewModel(parentModel) {
	
	if (!(this instanceof AddInstancePageViewModel)) {
		return new AddInstancePageViewModel(parentModel);
	}
	
	var self = this;
	
	this.selected = ko.observable(Server({
		mayTryLogIn: false
	}));
	
	this.onSubmitAddServer = function(model, submitEvent) {
		var instance = self.selected();
		
		if (! instance.validate()) {
			/**
			 * JQM closes a dialog when any of the button(data-role) is pressed. Prevent this
			 * by cancelling the event and stopping propagation
			 */
			submitEvent.preventDefault();
			submitEvent.cancelBubble = true;
			if (submitEvent.stopPropagation)
				submitEvent.stopPropagation();
			
			if (navigator.notification) {
				navigator.notification.alert(messageBundle.getMessage("Enter all the required details"));
			} else {
				window.alert(messageBundle.getMessage("Enter all the required details"));
			}
			
			return;
		}	
	
		instance.mayTryLogIn(true);

		parentModel.addInstance(instance);
		
		self.selected(Server({
			mayTryLogIn: false
		}));
		$.mobile.changePage('#');
	};
}