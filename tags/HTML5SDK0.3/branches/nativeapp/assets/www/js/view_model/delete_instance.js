function DeleteInstanceViewModel(parentModel) {
	
	if (!(this instanceof DeleteInstanceViewModel)) {
		return new DeleteInstanceViewModel(parentModel);
	}
	
	this.selected = parentModel.selected;
	
	this.onSubmitDeleteServer = function(server) {
		parentModel.instances.remove(server);
		$.mobile.changePage('#');
	};
	
	this.onCloseDeleteServerDialog = function() {
		history.back();
	};
}