/**
 * Cordys app api setup
 */
(function(window, Cordys) {
	
	
	var isAppCache,
		appWindow;
	
	$(window.document).on('ready', function() {
		appWindow = window._viewModel.ui.appShowPage.getExtension().appIframeLocation[0].contentWindow;
	});
	
	
	/**
	 * @api
	 * @public
	 * @author Theodoor van Donge
	 */
	Cordys.api = {
		isApp: function() {
			if (!isAppCache) {
				var origin = window.location.origin || window.location.protocol + '//';
				isAppCache = window.cordova && 'file://' === origin;
			}
			return isAppCache;
		},
		getCookiesByServerId: function(serverId) {
			var server = window._viewModel.servers.data()[serverId];
			server = ko.utils.unwrapObservable(server);
			if (server && server.cookies) {
				return ko.mapping.toJS(server.cookies);
			}
		},
		postMessageHandler: {
			getCookies: function(e) {
				appWindow.postMessage({
					message: 'cookies.setCookies',
					parameters: {
						cookies: Cordys.api.getCookiesByServerId(e.data.parameters.serverId)
					}
				}, Cordys.currentOrigin);/*
				return {
					message: 'cookies.setCookies',
					cookies: Cordys.api.getCookiesByServerId(e.data.parameters.serverId)
				};*/
			},
			'camera.getPicture': function(e) {//?startfrom=native&org=CordysNL&ser?startfrom=native&org=CordysNL&serverId=0"verId=0"
				if (!navigator.camera) {
					return;
				}
				navigator.camera.getPicture(function(imageData) {
					appWindow.postMessage({
						message: 'camera.getPicture.onSuccess',
						parameters: {
							imageData: imageData
						}
					}, Cordys.currentOrigin);
				}, function(message) {
					appWindow.postMessage({
						message: 'camera.getPicture.onError',
						parameters: {
							errorMessage: message
						}
					}, Cordys.currentOrigin);
				}, e.data.parameters.options);
			},
			'notification.alert': function(e) {
				if (!navigator.notification) {
					return;
				}
				navigator.notification.alert(e.data.parameters.message, function() {
					appWindow.postMessage({
						message: 'notification.alert.onCallback'
					}, Cordys.currentOrigin);
				}, e.data.parameters.title, e.data.parameters.buttonName);
			},
			'notification.beep': function(e) {
				if (!navigator.notification) {
					return;
				}
				navigator.notification.beep(e.data.parameters.times);
			},
			'notification.vibrate': function(e) {
				if (!navigator.notification) {
					return;
				}
				navigator.notification.vibrate(e.data.parameters.milliseconds);
			}
		}
	};
	
	Cordys.currentOrigin = 'https://testbop.cordys.com';
	
	Cordys.api.postMessageHandler.handle = function(e) {
		//var appWindow = _viewModel.ui.appShowPage.getExtension().appIframeLocation.contents()[0];
		//var url = 'https://testbop.cordys.com';
		if (e.originalEvent.origin !== Cordys.currentOrigin) {
			console.log('not able to handle message from ' + e.originalEvent.origin);
			return;
		}
		var eventName = e.originalEvent.data;
		if (!eventName) {
			return;
		}
		return Cordys.api.postMessageHandler[eventName.message](e.originalEvent);
	};
	
	/**
	 * @protected
	 * Store all Cordys ajax soap requests
	 */
	Cordys.soap = {
		prelogin: function() {
			return '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body><GetPreLoginInfo xmlns="http://schemas.cordys.com/SSO/Runtime/1.0" /></SOAP:Body></SOAP:Envelope>';
		},
		login: function(username, password) {
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
	};
	
	
	/**
	 * @protected
	 */
	Cordys.ajax = {
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
	};
	
	
	
	window['Cordys'] = Cordys;
	
	
}) (window, window.Cordys || {});


