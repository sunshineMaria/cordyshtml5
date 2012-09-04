function EditInstanceViewModel(parentModel) {
	
	if (!(this instanceof EditInstanceViewModel)) {
		return new EditInstanceViewModel(parentModel);
	}
	
	this.selected = parentModel.selected();
	this.selected.mayTryLogIn(false);
	
	/**
	 * Only to preventDefault submit action
	 */
	this.onSubmitEditServer = function() {
		
		this.selected.mayTryLogIn(false);
		this.selected.cookies.ct.valid(false);
		this.selected.mayTryLogIn(true);
		window.__sharedViewModel__.instances.notifySubscribers(undefined, undefined);
		$.mobile.changePage('#servers');
	};
}