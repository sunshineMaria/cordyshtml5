function Timer(timeout, autostart) {
	
	if (!(this instanceof Timer)) {
		return new Timer(timeout, autostart);
	}
	
	this.timeout = timeout;
	
	if (true === autostart) {
		return this.start();
	}
}



Timer.prototype = {
	start: function() {
		this._deferred = $.Deferred();
		
		var self = this;
		
		this.id = window.setTimeout(function() {
			self._deferred.resolve();
		}, this.timeout);
		
		return this._deferred.promise();
	},
	stop: function() {
		window.clearTimeout(this.id);
		this._deferred.reject();
		return this;
	},
	restart: function() {
		return this.stop().start();
	}
};




/*
 * Test code:*\/


(function() {
	var t = Timer(10000);
	t.start().done(function() {
		console.log(t);
	});
}) ();

*/