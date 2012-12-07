function EditInstanceViewModel(parentModel) {
	
	if (!(this instanceof EditInstanceViewModel)) {
		return new EditInstanceViewModel(parentModel);
	}
	
	this.selected = parentModel.selected;
	this.selected().mayTryLogIn(false);
	
	/**
	 * Only to preventDefault submit action
	 */
	this.onSubmitEditServer = function(model, submitEvent) {
		
		var selected = this.selected();

		if (! selected.validate()) {
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

		selected.mayTryLogIn(false);
		selected.cookies.ct.valid(false);
		selected.mayTryLogIn(true);
		window.__sharedViewModel__.instances.notifySubscribers(undefined, undefined);
		$.mobile.changePage('#servers');
	};
}