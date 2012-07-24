/**
 * --required: 
 * app.api.js
 * entities.js
 * jquery-1.7.2.js
 * knockout-2.1.0.js
 * 
 */

function ViewModel() {
	
	var self = this;
	
	this.init = function(search) {
		self.servers.init();
		self.ui.createDemoServerDialog.getExtension().init(search);
		self.deleteCookies.init();
	};
	
	this.pageStack = ko.observableArray([]);
	this.pageStack.subscribe(function(newPageStack) {
		$.each(newPageStack, function(_index, page) {
			///page !== self.ui.serverListPage
			page.hide();
		});
		
		var lastPage = newPageStack[newPageStack.length - 1];
		if (lastPage) {
			lastPage.location.removeClass('hidden');
		}
	});
	
	
	this.dialogStack = ko.observableArray([]);
	this.dialogStack.subscribe(function(newDialogStack) {
		
		var i = 2;
		
		// Two loops to avoid recalcuate
		// - calc
		var dialogsNeedRepaint = $.grep(newDialogStack, function(dialog) {
			if (i++ === dialog.zIndex === parseInt(dialog.location.css('zIndex'), 10)) {
				// no need for recalcute/repaint
				return false;
			}
			dialog.zIndex = i;
			return true;
		});
		// - paint
		$.each(dialogsNeedRepaint, function(_unused, dialog) {
			dialog.location.css('zIndex', dialog.zIndex);
		});
		
		if (!newDialogStack.length) {
			// dialog window stack is empty
			self.ui.mask.hide();
		} else {
			// dialog window stack is not empty
			self.ui.mask.location.css('zIndex', i++);
			self.ui.mask.show();
		}
		
		var lastDialog = dialogsNeedRepaint[dialogsNeedRepaint.length - 1];
		if (lastDialog) {
			lastDialog.location.css('zIndex', i);
		}
	});
	
	var selectedServers = ko.observableArray([]);
	selectedServers.update = function() {
		
	};
	
	this.servers = {
		data: (function() {
			var servers = JSON.parse(localStorage.servers || '[]');
			
			var mappedServers = $.map(servers, function(server) {
				var data = server;
				return ko.observable(new Server(data.location, data.organization, data.username, data.password, data.cookies));
			});
			
			return ko.observableArray(mappedServers);
		} ()),
		indexOf: function(server) {
			var id = -1;
			$.each(self.servers.data(), function(index, s) {
				var serverObject = ko.utils.unwrapObservable(s);
				
				if (serverObject === server) {
					id = index;
				}
			});
			return id;
		},
		selected: selectedServers,
		setupCtCode: function(server) {
			var prelogin = Cordys.ajax.createPrelogin(server.location() + '/com.eibus.web.soap.Gateway.wcp');
			
			$.ajax(prelogin).done(function(data) {
				if (true === DEBUG) {
					alert('Prelogin succeed.');
				}
				
				var $data = $(data),
					cookies = server.cookies;
				
				cookies.saml.name($data.find('SamlArtifactCookieName').text());
				cookies.ct.name($data.find('CheckName').text());
				
				// save change to localStorage
				self.servers.data.notifySubscribers(undefined, undefined);
			}).fail(function() {
				// Error
			});
		},
		init: function() {
			// on update do push to localstorage.
			self.servers.data.subscribe(function(newValue) {
				localStorage.servers = ko.toJSON(ko.utils.unwrapObservable(self.servers.data()));
			});
		},
		update: function(newValue) {
			ko.mapping.fromJS(newValue, self.servers.data);
		},
		start: function(server) {
			// search for server in server list
			var matchingServers = self.servers.getServersBy({ 
				location: server.location,
				organization: server.organization,
				username: server.username
			});
			
			if (matchingServers.length > 0 && matchingServers[0]) {
				// start first server of list
				var serverToStart = matchingServers[0];
				return self.ui.serverList.startServer(serverToStart);
			}
			
			//  Show add-dialog.
			self.ui.addServerDialog.show();
			self.ui.addServerDialog.getExtension().data
				.location(server.location)
				.organization(server.organization)
				.username(server.username);
			
			self.ui.addServerDialog.getExtension().onAfterAdd(function(e, server) {
				self.ui.serverList.startServer(server);
			});
		},
		getServersBy: function(serverObject) {
			var properties = ['location', 'organization', 'username', 'password'],
				servers = $.map(self.servers.data(), ko.utils.unwrapObservable);
			
			return $.grep(servers, function(server) {
				var hasMatch = 0,
					countObjectHasProperties = 0;
				
				$.each(properties, function(index, property) {
					if (!serverObject[property]) {
						return;
					}
					
					countObjectHasProperties += 1;
					
				
					if (serverObject[property] === server[property]()) {
						hasMatch += 1;
					}
				});
				
				return countObjectHasProperties === hasMatch;
			});
		}
	};
	
	this.deleteCookies = {
		location: undefined,
		init: function() {
			//self.deleteCookies.location = $('<iframe>');//$('iframe.deletecookies');
		},
		refresh: function() {
			self.deleteCookies.location.contents()[0].location.reload();
		},
		prepare: function() {
			self.deleteCookies.location = $('<iframe>');
		},
		doRemove: function(serverUrl) {
			// https://testbop.cordys.com/cordys/html5/touchbop.deletecookies.htm
			self.deleteCookies.location.prop('src', serverUrl + '/html5/touchbop.deletecookies.htm');
			
			$(document.body).append(self.deleteCookies.location);
			
			self.deleteCookies.addOnLoadEventListener(function() {
				self.deleteCookies.removeOnLoadEventListener();
				self.deleteCookies.location.trigger('afterremove');
				//document.body.removeChild(self.deleteCookies.location[0]);
				
				self.deleteCookies.location.remove();
			});
			
			return self.deleteCookies.location;
		},
		addOnLoadEventListener: function(fn) {
			return self.deleteCookies.location.load(fn);
			//return self.deleteCookies.location.on('load', fn);
		},
		addAfterRemoveEventListener: function(fn) {
			return self.deleteCookies.location.on('afterremove', fn);
		},
		removeOnLoadEventListener: function() {
			return self.deleteCookies.location.off('load');
		}
	};
	
	this.ui = {
		actionBar: {
			up: function() {
				var page = self.pageStack.pop();
				if (page && page !== self.ui.serverListPage) {
					page.close();
				}
			}
		},
		serverListPage: new Page($('.page.server-list'), self, { }),
		appShowPage: new Page($('.page.app-show'), self, {
			appIframeLocation: $('.page.app-show').find('iframe'),
			startApp: function(server, relativeAppUrl) {
				// start the app
				if (typeof relativeAppUrl !== 'string') {
					relativeAppUrl = '/html5/touchbopindex.htm';
				}
				
				var indexOfServer = self.servers.indexOf(server);
				
				if (Cordys) {
					Cordys.currentOrigin = server.location().replace(/\/cordys$/, '');
				}
				
				var iframe = self.ui.appShowPage.getExtension().appIframeLocation;
				iframe.prop('src', server.location() + relativeAppUrl + '?startfrom=native&org=' + server.organization() + '&serverId=' + indexOfServer);
			}
		}),
		mask: {
			location: $('.mask'),
			show: function() {
				return self.ui.mask.location.removeClass('hidden');
			},
			hide: function() {
				return self.ui.mask.location.addClass('hidden');
			}
		},
		startServerDialog: new Dialog($('.dialog.start-server'), self, {
			server: new Server(),
			onSubmit: function() {
				var password = self.ui.startServerDialog.getExtension().server.password().trim();
				if ('' === password) {
					alert('Please fill a password, otherwise you can\'t start a server.');
					return;
				}
				self.ui.startServerDialog.location.trigger('start-server.submit');
				self.ui.startServerDialog.location.off('start-server.submit');
				return ;
			},
			addOnSubmit: function(fn) {
				self.ui.startServerDialog.location.on('start-server.submit', fn);
				return self.ui.startServerDialog.getExtension().onSubmit();
			}
		}),
		createDemoServerDialog: new Dialog($('.dialog.create-demo'), self, {
			createDemoServer: function() {
				// on submit form
				self.ui.addServerDialog.getExtension().data
					.location('https://testbop.cordys.com')
					.organization('CordysNL')
					.username('demo')
					.password('demo');
				
				self.ui.addServerDialog.isDemo = true;
				
				self.ui.createDemoServerDialog.close();
				self.ui.addServerDialog.show();
			}, 
			init: function(server) {
				if (server.location || self.servers.data().length > 0) {
					// isn't empty or has an querystring, don't show the create demo server dialog.
					return;
				}
				
				// is emtpy, show create demo server dialog.
				self.ui.createDemoServerDialog.show();
			}
		}),
		addServerDialog: new Dialog($('.dialog.add-server'), self, {
			data: new Server(),
			onBeforeShow: function(dialog) {
				// Clean Dialog
				if (true !== dialog.isDemo) {
					dialog.getExtension().data.location('').organization('').username('').password('');
				}
				dialog.isDemo = false;
			},
			onAfterAdd: function(fn) {
				self.ui.addServerDialog.location.one('add-server.onafteradd', fn);
			},
			add: function() {
				var emptyFields = [], 
					data = self.ui.addServerDialog.getExtension().data,
					server = {
						location: data.location,
						organization: data.organization,
						username: data.username
					};
				
				// check if the is any empty form field
				$.each(server, function(key, value) {
					if (value().trim() === '') {
						emptyFields.push(key);
					}
				});
				
				var countFields = emptyFields.length;
				
				if (countFields > 0) {
					var message;
					if (countFields === 1) {
						// singular
						message = ' ' + emptyFields[0] + ' is';
					} else {
						// plural
						message = 's ' + emptyFields.join(', ') + ' are';
					}
					alert('The field' + message + ' empty. Password isn\'t required.');
					return;
				}
				
				var newServer = data.clone();
				
				if (!/\/cordys$/.test(newServer.location())) {
					// add /cordys to the url
					newServer.location(newServer.location() + '/cordys');
				}
				
				// Add server to list.
				self.servers.data.push(newServer);
				
				self.deleteCookies.prepare();
				self.deleteCookies.addAfterRemoveEventListener(function(e) {
					// Fetch ct code and saml name and persist.
					self.servers.setupCtCode(newServer);
					
					// Close dialog.
					self.ui.addServerDialog.close();
					
					// trigger event.
					self.ui.addServerDialog.location.trigger('add-server.onafteradd', [ newServer ]);
				});
				self.deleteCookies.doRemove(newServer.location());
			}
		}),
		editServerDialog: new Dialog($('.dialog.edit-server'), self, {
			onAfterClose: function() {
				// save change to localStorage
				self.servers.data.notifySubscribers(undefined, undefined);
			}
		}),
		serverList: {
			location: $('.content').find('.list'),
			selected: ko.observable(),
			longPress: function(server) {
				// get server
				self.ui.serverList.selected(server);
				
				// show edit a server dialog
				self.ui.editServerDialog.show();
			},
			startServer: function(server, relativeAppUrl) {
				
				var password = server.password();
				
				// no password given.
				self.ui.startServerDialog.show();
				self.ui.startServerDialog.getExtension().server = server.clone(self.ui.startServerDialog.getExtension().server);
				self.ui.startServerDialog.getExtension().addOnSubmit(function() {
					password = self.ui.startServerDialog.getExtension().server.password();
					
					self.ui.startServerDialog.close();
					self.ui.serverListPage.hide();
					
					// check if saml/saml token is expired.
					// if, get a new one.
					// else, go!
					self.deleteCookies.prepare();
					self.deleteCookies.addAfterRemoveEventListener(function(e) {
						
						var login = Cordys.ajax.createLogin(
							server.location() + '/com.eibus.web.soap.Gateway.wcp', 
							server.username(), 
							password
						);
						
						$.ajax(login).done(function (data) {
							var artifact = $(data).find('AssertionArtifact, samlp\\:AssertionArtifact').text();
							if (!artifact) {
								if (true === DEBUG) { 
									alert('Invalid username and/or password!');
								}
								return;
							}
							
							if (true === DEBUG) {
								alert('Login succeed.');
							}
							
							server.cookies.saml.value(artifact);
							
							// save change to localStorage
							self.servers.data.notifySubscribers(undefined, undefined);
							
							var appDialog = self.ui.appShowPage;
							appDialog.getExtension().startApp(server, relativeAppUrl);
							appDialog.getExtension().appIframeLocation.load(function() {
								appDialog.show();
							});
						}).fail(fail);
					});
					self.deleteCookies.doRemove(server.location());
				});
			}
		},
		confirmDelete: new Dialog($('.dialog.confirm-delete'), self, {
			remove: function() {
				// Want to delete
				self.servers.data.remove(self.ui.serverList.selected());
				self.ui.confirmDelete.close();
				self.ui.editServerDialog.close();
			}
		})
	};
}


function _beforeReady($, window) {
	var viewModel = new ViewModel(),
		search = URI(location.href).search(true),
		url = search.location;
	
	$(document).ready(function() {
		ko.applyBindings(viewModel);
		viewModel.init(search);
		
		viewModel.ui.serverListPage.show();
		
		if (true === Cordys.api.isApp()) {
			window._viewModel = viewModel;
		}
		
		$(window).on('message', Cordys.api.postMessageHandle);
		
		if (url) {
			viewModel.servers.start(search);
		}
		
		document.addEventListener('deviceready', function() {
	        document.addEventListener('backbutton', function() {
				if (false === viewModel.pageStack()[0].location.hasClass('hidden')) {
					// serverList
					navigator.app.exitApp();
				} else {
					// other page
					navigator.app.backHistory();
				}
			}, false);
	    }, false);
	});
	
} _beforeReady(jQuery, window);