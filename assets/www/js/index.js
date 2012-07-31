(function(document, parentModel) {
	
	/*
	 * All viewmodel and jQuery Mobile page bindings
	 */
	var ViewModelRegistry = [{
		selector: '#servers',
		viewModel: HomeViewModel
	}, {
		selector: '#add-server',
		viewModel: AddInstancePageViewModel
	}, {
		selector: '#edit-server',
		viewModel: EditInstanceViewModel
	}, {
		selector: '#delete-server',
		viewModel: DeleteInstanceViewModel
	}, {
		selector: '#app',
		viewModel: AppViewModel
	}];
	
	$(document).on('pageinit', function() {
		
		/*
		 * Apply bindings for all pages on `pagebeforeshow` jQuery Mobile event
		 */
		$.each(ViewModelRegistry, function(index, domViewModelCoupling) {
			
			var eventName = 'string' === typeof domViewModelCoupling.applyEvent
				? domViewModelCoupling.applyEvent
				: 'pagebeforeshow';
			
			/*
			 * Use event bubbling. Because jQuery Mobile changes the dom when 
			 * you navigate through the pages. So you can't bind the 
			 * events hard.
			 */
			$(document).on(eventName, domViewModelCoupling.selector, function(e) {
				ko.applyBindings(domViewModelCoupling.viewModel(parentModel), e.target);
			});
		});
	});
	
	/**
	 * Set app-iframe postMessage handler
	 */
	$(window).on('message', Cordys.api.postMessageHandle);
	
}) (document, window.__sharedViewModel__ = ShareViewModel());