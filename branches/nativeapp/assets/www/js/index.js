function ViewModel() {
	
	var self = this;
	
	self.init = function() {
		self.servers.init();
		self.ui.serverList.init();
		self.ui.createDemoServerDialog.getExtension().init();
		self.deleteCookies.init();
	};
	
	self.pageStack = ko.observableArray([]);
	self.pageStack.subscribe(function(newPageStack) {
		$.each(newPageStack, function(_index, page) {
			///page !== self.ui.serverListPage
			page.hide();
		});
		
		var lastPage = newPageStack[newPageStack.length - 1];
		if (lastPage) {
			lastPage.location.removeClass('hidden');
		}
	});
	
	
	self.dialogStack = ko.observableArray([]);
	self.dialogStack.subscribe(function(newDialogStack) {
		
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
	
	self.servers = {
		data: (function() {
			var servers = JSON.parse(localStorage.servers || '[]');
			
			var mappedServers = $.map(servers, function(server) {
				var data = server;
				return ko.observable(new Server(data.location, data.organization, data.username, data.password, data.cookies));
			});
			
			return ko.observableArray(mappedServers);
		}) (),
		selected: selectedServers,
		setupCtCode: function(server) {
			var prelogin = Cordys.ajax.createPrelogin();
			prelogin.url = server.location() + '/cordys/com.eibus.web.soap.Gateway.wcp';
			
			$.ajax(prelogin).done(function(data) {
				if (true === DEBUG) {
					alert('Prelogin succeed.');
				}
				
				var login,
					$data = $(data),
					cookies = server.cookies;
				
				cookies.saml.name($data.find('SamlArtifactCookieName').text());//SamlArtifactsamlName
				cookies.ct.name($data.find('CheckName').text());
				
				// load change to localStorage
				self.servers.data.notifySubscribers(undefined, undefined);
			}).fail(function() {
				// Error
			});
		},
		init: function() {
			// on update do push to localstorage.
			self.servers.data.subscribe(function(newValue) {
				
				//ko.toJSON(self.servers.data())
				//localStorage.servers = ko.toJSON(ko.utils.unwrapObservable(newValue));
				
				localStorage.servers = ko.toJSON(ko.utils.unwrapObservable(self.servers.data()));
			});
		},
		update: function(newValue) {
			ko.mapping.fromJS(newValue, self.servers.data);
		},
		start: function(serverLocation) {
			// search for server in localStorage - list
			var serversWithSameLocation = self.servers.getServersByLocation(serverLocation);
			
			// if (already exists):
			if (serversWithSameLocation.length > 0) {
				
				self.servers.selected(serversWithSameLocation);
				
				// Show the choose-a-server-or-create-new-one dialog, with 
				// a list of servers that match the serverLocation variable.
				self.ui.chooseServerOrAddNewDialog.show();
				
				return;
			}
			
			
			//  Fill fields of the add-dialog I now, because the exists in 
			//	the url I got.
			var data = self.ui.addServerDialog.getExtension().data;
			data.location(serverLocation);
			//log();
			
			//  Show add-dialog.
			//self.ui.addServerDialog.show();
			
			//  After [Ok] or [cancel] button I want to retrieve an event,
			//  And proceed with the code below.
			
			
			// first delete all cookies
			self.deleteCookies.doRemove(serverLocation);
			
			// secondly login - retrieve saml (code doesn't exists yet)
			
			
			// start app in iframe
			//self.ui.appDialog.getExtension().startApp(serverLocation);
		},
		login: function(server) {
			
		},
		getServersByLocation: function(serverUrl) {
			return $.grep(self.servers.data(), function(server) {
				return server.location() === serverUrl;
			});
		}
	};
	
	self.deleteCookies = {
		location: undefined,
		init: function() {
			self.deleteCookies.location = $('iframe.deletecookies');
		},
		refresh: function() {
			self.deleteCookies.location.contents()[0].location.reload();
		}, 
		doRemove: function(serverUrl) {
			// https://testbop.cordys.com/cordys/html5/touchbop.deletecookies.htm
			self.deleteCookies.location.prop('src', serverUrl + '/html5/touchbop.deletecookies.htm');
			return self.deleteCookies.location;
		}
	};
	
	self.ui = {
		actionBar: {
			up: function() {
				var page = self.pageStack.pop();
				if (page && page !== self.ui.serverListPage) {
					page.close();
				}
			}
		},
		serverListPage: new Page($('.page.server-list'), self, {
			
		}),
		appShowPage: new Page($('.page.app-show'), self, {
			appIframeLocation: $('.page.app-show').find('iframe'),
			startApp: function(server, relativeAppUrl) {
				// start the app
				if (typeof relativeAppUrl !== 'string') {
					relativeAppUrl = '/html5/touchbopindex.htm';
				}
				
				var indexOfServer = (function() {
					var id = -1;
					$.each(self.servers.data(), function(index, s) {
						var serverObject = ko.utils.unwrapObservable(s);
						
						if (serverObject === server) {
							id = index;
						}
					});
					return id;
				})();
				
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
				self.ui.mask.location.removeClass('hidden');
			},
			hide: function() {
				self.ui.mask.location.addClass('hidden');
			}
		},
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
			init: function() {
				if (self.servers.data().length > 0) {
					// isn't empty
					return;
				}
				
				// is emtpy, show create demo server dialog.
				self.ui.createDemoServerDialog.show();
			}
		}),
		chooseServerOrAddNewDialog: new Dialog($('.dialog.choose-server-or-add-new'), self, {
			selected: ko.observable(),
			onAddClick: function(e) {
				console.log('add click:', e);
				
				// If [+], add a new server, start that procedure.
			},
			onSubmit: function(e) {
				console.log('sumbit:', e);
				
				var selectedServer = self.ui.chooseServerOrAddNewDialog.getExtension().selected();
				
				// If [Ok], start that server.
				self.ui.serverList.startServer(selectedServer);
			},
			toString: function(server) {
				return 'Location: ' + server.location() + ', User: ' + server.username() + ', Organization: ' + server.organization();
			}
		}),
		addServerDialog: new Dialog($('.dialog.add-server'), self, {
			data: new Server(),
			onBeforeShow: function(dialog) {
				// Clean the Dialog
				if (true !== dialog.isDemo) {
					dialog.getExtension().data.location('').organization('').username('').password('');
				}
				dialog.isDemo = false;
			},
			add: function() {
				var data = self.ui.addServerDialog.getExtension().data,
					server = {
						location: data.location,
						organization: data.organization,
						username: data.username,
						password: data.password
					},
					emptyFields = [];
				
				// check if the is any empty form field
				$.each(server, function(key, value) {
					if (value().trim() === '') {
						emptyFields.push(key);
						//return true;
					}
				});
				
				var countFields = emptyFields.length;
				
				if (countFields > 0) {
					var message;
					if (countFields === 1) {
						// singular
						message = 'field ' + emptyFields[0] + ' is';
					} else {
						// plural
						message = 'fields ' + emptyFields.join(', ') + ' are';
					}
					alert('The ' + message + ' empty.');
					return;
				}
				
				var newServer = new Server(data.location(), data.organization(), data.username(), data.password());
				
				// Add server to list.
				self.servers.data.push(newServer);
				
				if (!/\/cordys$/.test(newServer.location())) {
					// add /cordys to the url
					newServer.location(newServer.location() + '/cordys');
				}
				
				self.deleteCookies.location.load(function(e) {
					// Fetch ct code and saml name and persist.
					self.servers.setupCtCode(newServer);
					
					// Close dialog.
					self.ui.addServerDialog.close();
				});
				self.deleteCookies.doRemove(newServer.location());
			}
		}),
		editServerDialog: new Dialog($('.dialog.edit-server'), self, {}),
		serverList: {
			location: $('.content').find('.list'),
			selected: ko.observable(),
			longPress: function(server) {
				// get data
				self.ui.serverList.selected(server);
				
				// show edit a server dialog
				self.ui.editServerDialog.show();
			},
			startServer: function(server, relativeAppUrl) {
				
				self.ui.serverListPage.hide();
				
				// check if saml/saml token is expired.
				// if, get a new one.
				// else, go!
				
				// load change to localStorage
				self.servers.data.notifySubscribers(undefined, undefined);
				
				self.deleteCookies.location.load(function(e) {
					self.deleteCookies.location.off('load');
					
					var login = Cordys.ajax.createLogin(server.username(), server.password());
					login.url = server.location() + '/cordys/com.eibus.web.soap.Gateway.wcp';
					
					$.ajax(login).done(function (data) {
						var artifact = $(data).find('AssertionArtifact, samlp\\:AssertionArtifact').text();
						if (!artifact) {
							alert('Invalid username and/or password!');
							return;
						}
						
						if (true === DEBUG) {
							alert('Login succeed.');
						}
						
						server.cookies.saml.value(artifact);
						
						// load change to localStorage
						self.servers.data.notifySubscribers(undefined, undefined);
						
						var appDialog = self.ui.appShowPage;
						appDialog.getExtension().startApp(server, relativeAppUrl);
						appDialog.getExtension().appIframeLocation.load(function() {
							appDialog.show();
						});
					}).fail(fail);
				});
				self.deleteCookies.doRemove(server.location());
			},
			init: function() {
				
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
		qs = location.search.slice(1),
		urlAppUrlIdentifier = 'app-url';
	
	
	page('*', function (ctx, next) {
		console.log(ctx);
		if (localStorage.appUrl && '' !== localStorage.appUrl) {
			var appLocation = localStorage.appUrl;
			localStorage.appUrl = '';
			var url = location.href.split('?')[0] + '/' + urlAppUrlIdentifier + '/' + appLocation;
			console.log('using url:' + url);
			setTimeout(function() {
				page(url);
			});
		} else {
			next();
			console.log('else');
		}
	});
	page(location.href.split('?')[0] + '/' + urlAppUrlIdentifier + '/:appUrl(*)', function(ctx, next) {
		console.log('Jajajaa, url handler app starter');
		console.log(ctx);
		
		viewModel.servers.start(ctx.params.appUrl);
	});
	
	
	if (urlAppUrlIdentifier === qs.substring(0, urlAppUrlIdentifier.length)) {
		localStorage.appUrl = qs.substring(urlAppUrlIdentifier.length + 1); // +1 because of the = sign
		// trigger change
		page();
	}
	
	
	$(document).ready(function() {
		ko.applyBindings(viewModel);
		viewModel.init();
		
		viewModel.ui.serverListPage.show();
		
		if (true === Cordys.api.isApp()) {
			window._viewModel = viewModel;
		}
		
		$(window).on('message', Cordys.api.postMessageHandle);
	});
	
} _beforeReady(jQuery, window);