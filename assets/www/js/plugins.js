(function($) {
	
	$.event.special.ihold = {
		setup: function(data, namespaces, eventHandle) {
			
		},
		teardown: function(namespaces) {
			
		},
		add: function(handleObj) {
			$(this).hammer().on('hold', handleObj.handler);
		},
		remove: function(handleObj) {
			$(this).hammer().off('hold', handleObj.handler);
		},
		_default: function(event) {
			
		}
	};
	
}) (jQuery);