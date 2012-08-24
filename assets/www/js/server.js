/**
 * @param options
 * @returns Server
 */
function Server(options) {
	
	// for instantiation without the use of the `new` keyword
	if (!(this instanceof Server)) {
		return new Server(options);
	}
	
	var self = this;
	
	if ('object' !== typeof options) {
		options = {};
	}
	
	/**
	 * Properties
	 */
	this.location = ko.observable(options.location);
	this.organization = ko.observable(options.organization);
	this.username = ko.observable(options.username);
	this.password = ko.observable(options.password || '');
	
	this.deleteCookiesUrl = ko.computed(function() {
		return this.location() + '/html5/touchbop.deletecookies.htm';
	}, this);
	
	this.loginUrl = ko.computed(function() {
		return this.location() + '/com.eibus.web.soap.Gateway.wcp';
	}, this);
	
	this.mayTryLogIn = ko.observable(undefined === options.mayTryLogIn ? true : !!options.mayTryLogIn);
	this.mayTryLogIn.subscribe(function(newValue) {
		if (newValue === true) {
			if (!self.cookies.ct.valid()) {
				// do first prelogin
				self.prelogin().done(function() {
					// do a login
					self.login();
				});
			} else {
				// do a login
				self.login();
			}
		}
	}, this);
	
	
	/**
	 * Cookies, ct + saml
	 */
	var isCtValid = undefined === options.cookies 
		? false 
		: undefined === options.cookies.ct
			? false
			: undefined === options.cookies.ct.valid
				? false
				: options.cookies.ct.valid,
				
	isSamlValid = undefined === options.cookies
		? false
		: undefined === options.cookies.saml
			? false 
			: undefined === options.cookies.saml.valid
				? false
				: options.cookies.saml.valid;
	
	
	
	this.cookies = {
		ct: {
			name: ko.observable(options.cookies ? options.cookies.ct.name : ''),
			value: ko.observable(options.cookies ? options.cookies.ct.value : ''),
			valid: ko.observable(isCtValid)
		}, 
		saml: {
			name: ko.observable(options.cookies ? options.cookies.saml.name : ''),
			value: ko.observable(options.cookies ? options.cookies.saml.value : ''),
			time: ko.observable(options.cookies ? new Date(options.cookies.saml.time) : new Date()),
			valid: ko.observable(isSamlValid)
		}
	};
	
	(function() {
		
		if (false === this.mayTryLogIn()) {
			return false;
		}
		
		function updateLogin() {
			
			/**
			 * Time diff between timestamp and now
			 */
			var now = $.now(), 
				timestamp = self.cookies.saml.time().getTime(), 
				/* diff: how long ago the timestamp is made */
				diff = now - timestamp;
			
			// 82800000 milliseconds = 1000(milliseconds in a second) * 60(seconds in a minute) * 60(minutes in an hour) * 23(hours, one hour before expire)
			if (diff > 82800000 || diff < 0 || false === self.cookies.saml.valid()) { // if timestamp is more than 23 hours ago, or made in the future
				// cookie is expired
				diff = 0;
			} else {
				diff = 82800000 - diff;
			}
			
			Timer(diff, true).done(function() {
				self.login().done(function() {
					/**
					 * Set new timeout, 'recursive' call of the method `update()`
					 * Give some room for the updates of the timestamps of the cookie ct
					 * 
					 * 1.2e+5 milliseconds == 2 minutes
					 */
					Timer(1.2e+5, true).done(function() {
						updateLogin();
					});
				});
			});
		}
		
		
		// check if prelogin is already done, or not;
		if (!self.cookies.ct.valid()) {
			// do first prelogin
			self.prelogin().done(function() {
				// do a login update
				updateLogin();
			});
		} else {
			// do a login update
			updateLogin();
		}
		
	}).apply(this);
	
	
	/**
	 * Subscriptions
	 */
	this.cookies.saml.value.subscribe(function (newSamlValue) {
		if (newSamlValue) {
			self.cookies.saml.time(new Date());
			self.cookies.ct.value(hex_sha1(newSamlValue));
		}
	});
	
	
	/**
	 * Methods
	 */
	this.exportCookies = function() {
		Server.prototype.exportCookies.apply(self, arguments);
	};
	
	this.clone = function(server) {
		return Server.prototype.clone.apply(self, arguments);
	};
	
	this.toString = function() {
		return Server.prototype.toString.apply(self, arguments);
	};
	
	this.getTouchBopIndexUrl = function() {
		return Server.prototype.getTouchBopIndexUrl.apply(self, arguments);
	};
	
	this.login = function() {
		return Server.prototype.login.apply(self, arguments);
	};
	
	this.prelogin = function() {
		return Server.prototype.prelogin.apply(self, arguments);
	};
	
	this.deleteCookies = function() {
		return Server.prototype.deleteCookies.apply(self, arguments);
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
	},
	getTouchBopIndexUrl: function(id) {
		var url = this.location();
		
		if (!/\/cordys$/.test(url)) {
			// add /cordys to the url
			url += '/cordys';
		}
		
		return url + '/html5/touchbopindex.htm?startfrom=native&org=' + this.organization() + '&serverId=' + id;
	},
	prelogin: function() {
		var self = this, 
			deferred = $.Deferred();
		
		deferred.done(function() {
			self.cookies.ct.valid(true);
		});
		
		deferred.fail(function(e) {
			console.log('Error in prelogin: ' + 
					$(e.error().responseXML).find('faultstring,error elem').text() || e.responseText);
			self.cookies.ct.valid(false);
		});
		
		this.deleteCookies()
		.done(function() {
			
			var prelogin = Cordys.ajax.createPrelogin(self.loginUrl());
			$.ajax(prelogin).done(function(data) {
				var $data = $(data);
				
				self.cookies.saml.name($data.find('SamlArtifactCookieName').text());
				self.cookies.ct.name($data.find('CheckName').text());
				
				// save change to localStorage
				window.__sharedViewModel__.instances.notifySubscribers(undefined, undefined);
				
				deferred.resolve();
			}).fail(function(e) {
				deferred.reject(e);
			});
		});
		
		return deferred.promise();
	},
	login: function() {
		var login = Cordys.ajax.createLogin(
				this.loginUrl(), 
				this.username(), 
				this.password()
			),
				self = this,
				deferred = $.Deferred();
		
		deferred.fail(function(e) {
			console.log('Error in login: ' + 
					$(e.error().responseXML).find('faultstring,error elem').text() || e.responseText);
			self.cookies.saml.valid(false);
		});
		
		deferred.done(function() {
			self.cookies.saml.valid(true);
		});
		
		if (!self.cookies.ct.valid()) {
			deferred.reject();
			return deferred.promise();
		}
		
		this.deleteCookies()
		.done(function() {
			$.ajax(login).done(function (data) {
				var artifact = $(data).find('AssertionArtifact, samlp\\:AssertionArtifact').text();
				if (!artifact) {
					deferred.reject();
					return deferred.promise();
				}
				
				self.cookies.saml.value(artifact);
				
				// save change to localStorage
				window.__sharedViewModel__.instances.notifySubscribers(undefined, undefined);
				
				deferred.resolve();
			}).fail(function(e) {
				deferred.reject(e);
			});
		});
		
		return deferred.promise();
	},
	deleteCookies: function() {
		var iframe = $('<iframe>', {
			src: this.deleteCookiesUrl(),
			'class': 'hidden'
		}),
		deferred = $.Deferred();
		
		iframe.one('load', function() {
			deferred.resolve();
			// Remove iframe from dom
			iframe.remove();
		});
		
		// Insert in dom
		$(document.body).append(iframe);
		
		Timer(30000, true).done(function() {
			if ('resolved' !== deferred.state()) {
				deferred.reject('timeout');
			}
		});
		
		return deferred.promise();
	}
};