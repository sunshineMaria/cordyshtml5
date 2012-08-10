(function(document, parentModel) {
	
	/*
	 * All viewmodel and jQuery Mobile page bindings
	 */
	ko.bindingHandlers.jqmRefreshList = { 
		     update: function(element, valueAccessor) { 
		       ko.utils.unwrapObservable(valueAccessor()); //just to create a dependency
		       $(element).listview(); 
		     } 
		   };
	$("#servers")
		.bind("pageinit",function(event, ui) {
			ko.applyBindings(HomeViewModel(parentModel), document.getElementById("servers"));
		})
		.bind("pageshow",function(event, ui) {
    	   $("#serverList").listview();
		});
	$("#add-server")
		.bind("pageinit",function(event, ui) {
			ko.applyBindings(AddInstancePageViewModel(parentModel), document.getElementById("add-server"));
		});
	$("#edit-server")
		.bind("pageinit",function(event, ui) {
			ko.applyBindings(EditInstanceViewModel(parentModel), document.getElementById("edit-server"));
		});
	$("#delete-server")
		.bind("pageinit",function(event, ui) {
			ko.applyBindings(DeleteInstanceViewModel(parentModel), document.getElementById("delete-server"));
		});
	$("#app")
		.bind("pageinit",function(event, ui) {
			ko.applyBindings(AppViewModel(parentModel), document.getElementById("app"));
		});

	/**
	 * Set app-iframe postMessage handler
	 */
	$(window).on('message', Cordys.api.postMessageHandle);
	
}) (document, window.__sharedViewModel__ = ShareViewModel());