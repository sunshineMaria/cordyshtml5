function EditInstanceViewModel(parentModel) {
	
	if (!(this instanceof EditInstanceViewModel)) {
		return new EditInstanceViewModel(parentModel);
	}
	
	this.selected = parentModel.selected;
	
	/**
	 * Only to preventDefault submit action
	 */
	this.onSubmitEditServer = function() {
		//TODO: do save and re-prelogin and relogin
		window.__sharedViewModel__.instances.notifySubscribers(undefined, undefined);
		$.mobile.changePage('#servers');
	};
}