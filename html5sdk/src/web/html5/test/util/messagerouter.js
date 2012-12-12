// Some utlity to pass all the messages received from the test suite to the parent 


;(function (window, $, undefined) {

	$.messagerouter = function(childWindow) {
		// let us not go any further if we do not have any parent to escalate the messages to
		if (window === window.parent) return;

		window.addEventListener("message", function(evt) {
			if (evt.origin ===  'file://'){
				childWindow.postMessage(evt.data, evt.origin);
			}
			else
			{
				window.parent.postMessage(evt.data, evt.origin);
			}
		});
	}
}

)(window, jQuery)