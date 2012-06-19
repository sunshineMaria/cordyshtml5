/**
 * handle fail of ajax requests.
 */
function fail(e) {
	console.log(e);
	var message = $(e.error().responseXML)
		.find('faultstring, error elem')
		.text() || e.responseText || 'General error, for details see response.';
	alert('Error on login: "' + message + '"');
}


/**
 * @param jQuery
 *			location jQuery object, with the location of the dialog in the DOM
 *			tree.
 * @param object
 *			context An KnockoutJS object that represents the context of the
 *			data for the dialog.
 * @param object
 *			extend An literal object filled with methods, for the events: 
 *			- onBefore{method name} Would be fired before the super 
 *				Dialog call. 
 *			- onAfter{method name} Would be fired after the super 
 *				Dialog call.
 */
function Dialog(location, context, extend) {
	var self = this;
	
	this.extend = extend || {};
	this.zIndex = 0;
	this.location = location;
	this.context = context;
	
	
	this.show = function() {
		return Dialog.prototype.show.apply(self, arguments);
	};
	
	this.close = function() {
		return Dialog.prototype.close.apply(self, arguments);
	};
	
	this.runExtension = function(method) {
		return Dialog.prototype.runExtension.apply(self, arguments);
	};
	
	this.clean = function() {
		return Dialog.prototype.clean.apply(self, arguments);
	};
	
	this.getExtension = function() {
		return Dialog.prototype.getExtension.apply(self, arguments);
	};
	
	
}

Dialog.prototype = {
	close: function() {
		this.runExtension('onBeforeClose');
		
		this.context.dialogStack.remove(this);
		
		this.location.addClass('hidden');
		this.clean();
		
		this.runExtension('onAfterClose');
	},
	runExtension: function(method) {
		var extensionMethod = this.extend[method];
		if (extensionMethod) {
			extensionMethod(this, $.Event(method));
		}
	},
	clean: function() {
		this.runExtension('onBeforeClean');
		this.runExtension('onAfterClean');
	},
	getExtension: function() {
		return this.extend;
	},
	show: function() {
		this.runExtension('onBeforeShow');
		
		this.context.dialogStack.push(this);
		this.context.ui.mask.show();
		
		var $dialog = this.location.removeClass('hidden');
		
		setTimeout(function() {
			// Sets focus on the first input element
			var inputs = $dialog.find('input'), 
				inputsElementsWithAutofocusSet = inputs.filter('[autofocus]');
			
			if (inputsElementsWithAutofocusSet.length > 0) {
				inputsElementsWithAutofocusSet.first().focus();
			} else {
				inputs.first().focus();
			}
		}, 0);
		
		this.runExtension('onAfterShow');
	}
};


function Page(location, context, extend) {
	var self = this;
	
	this.extend = extend || {};
	this.location = location;
	this.context = context;
	
	
	this.close = function() {
		Page.prototype.close.apply(self, arguments);
	};
	
	this.runExtension = function(method) {
		Page.prototype.runExtension.apply(self, arguments);
	};
	
	this.clean = function() {
		Page.prototype.clean.apply(self, arguments);
	};
	
	this.getExtension = function() {
		return Page.prototype.getExtension.apply(self, arguments);
	};
	
	this.show = function() {
		Page.prototype.show.apply(self, arguments);
	};
	
	this.hide = function() {
		Page.prototype.hide.apply(self, arguments);
	};
}

Page.prototype = {
	close: function() {
		this.runExtension('onBeforeClose');
		
		this.context.pageStack.remove(this);
		
		this.location.addClass('hidden');
		this.clean();
		
		this.runExtension('onAfterClose');
	},
	hide: function() {
		this.runExtension('onHide');
		this.location.addClass('hidden');
	},
	runExtension: function(method) {
		var extensionMethod = this.extend[method];
		if (extensionMethod) {
			extensionMethod(this, $.Event(method));
		}
	},
	clean: function() {
		this.runExtension('onBeforeClean');
		this.runExtension('onAfterClean');
	},
	getExtension: function() {
		return this.extend;
	},
	show: function() {
		this.runExtension('onBeforeShow');
		
		this.context.pageStack.push(this);
		
		this.location.removeClass('hidden');
		
		this.runExtension('onAfterShow');
	}
};




function Server(location, organization, username, password, cookies) {
	this.location = ko.observable(location);
	this.organization = ko.observable(organization);
	this.username = ko.observable(username);
	this.password = ko.observable(password || '');
	
	var self = this;
	
	this.cookies = {
		ct: {
			name: ko.observable(cookies ? cookies.ct.name : ''),
			value: ko.observable(cookies ? cookies.ct.value : ''),
			time: ko.observable(cookies ? cookies.ct.time : '')
		},
		saml: {
			name: ko.observable(cookies ? cookies.saml.name : ''),
			value: ko.observable(cookies ? cookies.saml.value : ''),
			time: ko.observable(cookies ? cookies.saml.time : '')
		}
	};
	
	this.cookies.ct.value.subscribe(function (newCtValue) {
		if (newCtValue) {
			self.cookies.ct.time(new Date());
		}
	});
	
	this.cookies.saml.value.subscribe(function (newSamlValue) {
		if (newSamlValue) {
			self.cookies.saml.time(new Date());
			self.cookies.ct.value(hex_sha1(newSamlValue));
		}
	});
	
	this.exportCookies = function() {
		Server.prototype.exportCookies.apply(self, arguments);
	};
	
	this.clone = function(server) {
		return Server.prototype.clone.apply(self, arguments);
	};
	
	
	
	this.toString = function() {
		return Server.prototype.toString.apply(self, arguments);
	};
}


Server.prototype = {
	exportCookies: function() {
		var _cookies = this.cookies,
			_ct = _cookies.ct,
			_saml = _cookies.saml;
		
		return { 
			ct: {
				name: _ct.name(),
				value: _ct.value()
			}, 
			saml: {
				name: _saml.name(),
				value: _saml.value()
			}
		};
	},
	clone: function(server) {
		if (server) {
			return server
				.location(ko.utils.unwrapObservable(this.location))
				.organization(ko.utils.unwrapObservable(this.organization))
				.username(ko.utils.unwrapObservable(this.username))
				.password(ko.utils.unwrapObservable(this.password));
		}
		return new Server(
			ko.utils.unwrapObservable(this.location), 
			ko.utils.unwrapObservable(this.organization), 
			ko.utils.unwrapObservable(this.username), 
			ko.utils.unwrapObservable(this.password)
		);
	},
	toString: function() {
		return 'Location: ' + this.location() + ', User: ' + this.username() + ', Organization: ' + this.organization();
	}
};
