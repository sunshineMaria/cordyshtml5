var Cordys = {
	soap: {
		prelogin: function() {
			return '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body><GetPreLoginInfo xmlns="http://schemas.cordys.com/SSO/Runtime/1.0" /></SOAP:Body></SOAP:Envelope>';
		},
		login: function(username, password) {
			// IssueInstant and RequestID should be different for every request
			return '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">' + 
						'<SOAP:Header>' + 
						'<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">' + 
							'<wsse:UsernameToken xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">' + 
								'<wsse:Username>' + username + '</wsse:Username>' + 
								'<wsse:Password>' + password + '</wsse:Password>' + 
							'</wsse:UsernameToken>' + 
						'</wsse:Security>' + 
					'</SOAP:Header>' + 
					'<SOAP:Body>' + 
						'<samlp:Request xmlns:samlp="urn:oasis:names:tc:SAML:1.0:protocol" MajorVersion="1" MinorVersion="1" IssueInstant="2012-02-28T18:53:10Z" RequestID="a2bcd8ab5a-342b-d320-aa89-c3de380cd13">' + 
							'<samlp:AuthenticationQuery>' + 
								'<saml:Subject xmlns:saml="urn:oasis:names:tc:SAML:1.0:assertion">' + 
									'<saml:NameIdentifier Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">' + username + '</saml:NameIdentifier>' + 
								'</saml:Subject>' + 
							'</samlp:AuthenticationQuery>' + 
						'</samlp:Request>' + 
					'</SOAP:Body>' + 
				'</SOAP:Envelope>';
		}
	},
	
	ajax: {
		createPrelogin: function() {
			return {
				data: Cordys.soap.prelogin(),
				contentType: 'text/xml; charset="utf-8"',
				type: 'post',
				dataType: 'xml'
			};
		},
		createLogin: function(username, password) {
			return {
				data: Cordys.soap.login(username, password),
				contentType: 'text/xml; charset="utf-8"',
				type: 'post',
				dataType: 'xml'
			};
		}
	}
};

/**
 * @param jQuery
 *            location jQuery object, with the location of the dialog in the DOM
 *            tree.
 * @param object
 *            context An KnockoutJS object that represents the context of the
 *            data for the dialog.
 * @param object
 *            extend An literal object filled with methods, for the events: 
 *            - onBefore{method name} Would be fired before the super 
 *            	Dialog call. 
 *            - onAfter{method name} Would be fired after the super 
 *            	Dialog call.
 */
function Dialog(location, context, extend) {
	var self = this;
	extend = extend || {};
	
	this.zIndex = 0;
	this.location = location;
	this.context = context;
	this.clean = function() {
		runExtension('onBeforeClean');
		runExtension('onAfterClean');
	};
	this.show = function() {
		runExtension('onBeforeShow');
		
		context.dialogStack.push(self);
		context.ui.mask.show();
		
		var $dialog = self.location.removeClass('hidden');
		
		setTimeout(function() {
			// Sets focus on the first input element
			var inputs = $dialog.find('input'),
				actions = inputs.parents('.actions');
			
			if (actions.length > 0) {
				actions.find('input.no').first().focus();
			} else {
				inputs.first().focus();
			}
		}, 0);
		
		runExtension('onAfterShow');
	};
	this.close = function() {
		runExtension('onBeforeClose');
		
		context.dialogStack.remove(self);
		
		self.location.addClass('hidden');
		self.clean();
		
		runExtension('onAfterClose');
	};
	this.getExtension = function() {
		return extend;
	};
	
	/** @param string An extension method. */
	function runExtension(method) {
		var extensionMethod = extend[method];
		if (extensionMethod) {
			extensionMethod(self, $.Event(method));
		}
	}
}




function ViewModel() {
	
	var self = this;
	
	self.init = function() {
		self.servers.init();
		self.ui.serverList.init();
	};
	
	self.dialogStack = ko.observableArray([]);
	
	self.dialogStack.subscribe(function(newDialogStack) {
		
		var i = 2;
		
		
		// Two loops to avoid recalcuate
		
		var dialogsNeedRepaint = $.grep(newDialogStack, function(dialog) {
			if (i++ === dialog.zIndex === parseInt(dialog.location.css('zIndex'), 10)) {
				// no need for recalc/repaint
				return false;
			}
			dialog.zIndex = i;
			return true;
		});
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
	
	self.servers = {
		data: ko.mapping.fromJS([]),
		init: function() {
			var servers = self.servers.data,
				key = 'servers',
				storeServers = JSON.parse(localStorage[key] || '[]') || [];
			
			self.servers.update(storeServers);
			
			servers.subscribe(function(newValue) {
				localStorage.setItem(key, ko.toJSON(ko.utils.unwrapObservable(newValue)));
			});
		},
		update: function(newValue) {
			ko.mapping.fromJS(newValue, self.servers.data);
		}
	};
	
	self.ui = {
		mask: {
			location: $('.mask'),
			show: function() {
				self.ui.mask.location.removeClass('hidden');
			},
			hide: function() {
				self.ui.mask.location.addClass('hidden');
			}
		}
	};
	
	
	self.ui = $.extend(self.ui, {
		addServerDialog: new Dialog($('.dialog.add-server'), self, {
			data: {
				location: ko.observable(),
				username: ko.observable(),
				password: ko.observable(),
				organization: ko.observable(),
				cookie: ko.observable()
			},
			onBeforeShow: function(dialog) {
				// Clean the Dialog
				dialog.getExtension().data.location('a').organization('a').username('a').password('a');
			},
			add: function() {
				var data = self.ui.addServerDialog.getExtension().data,
					serverObject = {
						location: data.location,
						organization: data.organization,
						username: data.username,
						password: data.password
					},
					emptyFields = [];
				
				$.each(serverObject, function(key, value) {
					if (value().trim() === '') {
						emptyFields.push(key);
					}
				});
				
				var countFields = emptyFields.length;
				
				if (countFields > 0) {
					var message;
					if (countFields === 1) {
						message = 'The field ' + emptyFields[0] + ' is empty.';
					} else {
						message = 'The fields ' + emptyFields.join(', ') + ' are empty.';
					}
					alert(message);
					return;
				}
				
				serverObject.cookie = data.cookie;
				
				// url : "https://" + serverObject.location() +
				// "/cordys/com.eibus.web.soap.Gateway.wcp",
				//
				
				
				var prelogin = Cordys.ajax.createPrelogin();
				// serverObject.location(),
				prelogin.url = 'https://ec2-50-17-207-217.compute-1.amazonaws.com/cordys/cordys/com.eibus.web.soap.Gateway.wcp';
				
				deleteAllCookies();
				
				$.ajax(prelogin).done(function(data) {
					var $data = $(data),
						cookie = { 
							name: $data.find('SamlArtifactCookieName').text()
						};
					
					alert('Prelogin succeed.');
					
					var login = Cordys.ajax.createLogin('demo', 'demo');
					login.url = 'https://ec2-50-17-207-217.compute-1.amazonaws.com/cordys/cordys/com.eibus.web.soap.Gateway.wcp';
					//login.dataType = 'plain/text';
					
					log('cookie:' + document.cookie);
					deleteAllCookies();
					
					
					$.ajax(login).done(function (data) {
						var artifact = $(data).find("AssertionArtifact, samlp\\:AssertionArtifact").text();
						if (!artifact) {
							alert('Invalid username and/or password!');
							return;
						}
						
						alert('Login succeed.');
						
						cookie.value = artifact;
						cookie.time = new Date();
						serverObject.cookie = ko.observable(cookie);
						
						self.servers.data.push(serverObject);
						self.ui.addServerDialog.close();
						
						
						var tasksDialog = self.ui.tasksDialog;
						tasksDialog
							.getExtension()
							.iframeLocation
							.attr({
								src: 'https://ec2-50-17-207-217.compute-1.amazonaws.com/cordys/html5/demo/tasklist.htm?' + cookie.name + '=' + cookie.value
							}).load(function() {
								$('iframe')[0].contentWindow.run(cookie.name, cookie.value);
							});
						tasksDialog.show();
						
					}).fail(function (e) {
						log(e.error().responseText);
						var err = $(e.error().responseXML).find('faultstring,error elem').text() || e.responseText  || 'General error, see response.';
						alert('Error on login: "' + err + '"');
					});
				}).fail(function(e) {
					log(e);
					var err = $(e.error().responseXML).find('faultstring, error elem').text() || e.responseText || 'General error, see response.';
					alert('Error on login: "' + err + '"');
				});
			}
		}),
		tasksDialog: new Dialog($('.dialog.tasks'), self, {
			iframeLocation: $('iframe')
		}),
		editServerDialog: new Dialog($('.dialog.edit-server'), self),
		serverList: {
			location: $('.content').find('.list'),
			selected: ko.observable(),
			longPress: function(e) {				
				// history: open contextmenu - choose( edit - delete ).
				// self.ui.serverList.contextMenu.show();
				// actual: open edit menu, delete would be a swipe on a list
				// item, from left to the right side of the screen.
				self.ui.editServerDialog.show();
				
				// get data
				// var server = ko.dataFor(e.target);
				self.ui.serverList.selected(ko.dataFor(e.target));
			},
			startServer: function(e) {
				// start the server connection
				alert('I want to start this server..');
				
				self.ui.serverList.selected(ko.dataFor(e.target));
				
				// check if cookie/saml token is already expired.
				// if, get a new one.
				// else, go 
				
				
				/*
				 * method: 'yourmethodname', 
				 * namespace: 'yourmethodnamespace',
				 * loginUrl: '/cordys/com/myorg/mylogin.html';
				 */
				
				/*
				 * var aj = $.cordys.ajax({ url:
				 * 'http://tinyurl.com/cordysamazon/cordys/com.eibus.web.soap.Gateway.wcp',
				 * method: 'GetTasks', namespace:
				 * 'http://schemas.cordys.com/notification/workflow/1.0',
				 * dataType: 'json', parameters: [{ name: 'OrderBy', value:
				 * 'Task.StartDate DESC' }] });
				 */
			},
			init: function() {
				self.ui.serverList.location.on('taphold', 'li', self.ui.serverList.longPress);
			}
		},
		confirmDelete: new Dialog($('.dialog.confirm-delete'), self, {
			'delete': function() {
				// Want to delete
				self.servers.data.remove(self.ui.serverList.selected);
				self.ui.confirmDelete.close();
				self.ui.editServerDialog.close();
			}
		})
	});
}


(function($) {
	var viewModel = new ViewModel();
	
	$(document).ready(function() {
	
		ko.applyBindings(viewModel);
		viewModel.init();
		
		if (DEBUG === true) {
			window.viewModel = viewModel;
		}
		
		$.support.cors = true;
        $.mobile.allowCrossDomainPages = true;
        
        
        $('.mask').on('click focus', function(e) {
        	alert('mask focus');
        	e.preventDefault();
        });
        
        
	});
})(jQuery);