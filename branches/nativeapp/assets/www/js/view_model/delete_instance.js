function DeleteInstanceViewModel(parentModel) {
	
	if (!(this instanceof DeleteInstanceViewModel)) {
		return new DeleteInstanceViewModel(parentModel);
	}
	
	this.selected = parentModel.selected;
	
	this.onSubmitDeleteServer = function(server) {
		parentModel.instances.remove(server);
		// delete the cookies so that we do not have a problem if we add it back
		server.deleteCookies();
		// move back to the server list
		$.mobile.changePage('#');
	};
	
	this.onCloseDeleteServerDialog = function() {
		history.back();
	};
}