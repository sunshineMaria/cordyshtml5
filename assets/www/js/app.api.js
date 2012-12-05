/**
 * Cordys app api setup
 */
(function(window, Cordys) {
	
	var isAppCache = null,
		appWindow = null,
		TESTSWARM_URI = '10.1.29.109:8080';
	
	$(window.document).on('ready', function() {
		appWindow = $('#app').find('div iframe')[0].contentWindow;
	});
	
	postMessageToAppWindow = function(data, origin) {
		// TODO - Fix this
		// Temporary hack to allow communication with testswarm runner
		origin =( appWindow.location.host === TESTSWARM_URI )?  "http://" + TESTSWARM_URI : origin;
		appWindow.postMessage(data, origin);
	}
	
	/**
	 * @api
	 * @public
	 * @author Theodoor van Donge
	 */
	Cordys.api = {
		isApp: function() {
			if (!isAppCache) {
				isAppCache = window.cordova && 'file:' === window.location.protocol;
			}
			return isAppCache;
		},
		getCookiesByServerId: function(serverId) {
			var server = window.__sharedViewModel__.instances()[serverId];
			server = ko.utils.unwrapObservable(server);
			if (server && server.cookies) {
				return ko.mapping.toJS(server.cookies);
			}
		},
		postMessageHandler: {
			getCookies: function(e) {
				postMessageToAppWindow({
					message: 'cookies.setCookies',
					parameters: {
						cookies: Cordys.api.getCookiesByServerId(e.data.parameters.serverId)
					}
				}, Cordys.currentOrigin);
			},
			'camera.getPicture': function(e) {
				if (!navigator.camera) {
					return;
				}
				navigator.camera.getPicture(function(imageData) {
					postMessageToAppWindow({
						message: 'camera.getPicture.onSuccess',
						parameters: {
							imageData: imageData
						}
					}, Cordys.currentOrigin);
				}, function(message) {
					postMessageToAppWindow({
						message: 'camera.getPicture.onError',
						parameters: {
							error: message
						}
					}, Cordys.currentOrigin);
				}, e.data.parameters.options);
			},
			'globalization.getLocaleName': function(e) {
				postMessageToAppWindow({
					message: 'globalization.getLocaleName.onSuccess',
					parameters: {
						result: navigator.language
					}
				}, Cordys.currentOrigin);
			},
			'notification.alert': function(e) {
				if (!navigator.notification) {
					return;
				}
				navigator.notification.alert(e.data.parameters.message, function() {
					postMessageToAppWindow({
						message: 'notification.alert.onCallback'
					}, Cordys.currentOrigin);
				}, e.data.parameters.title, e.data.parameters.buttonName);
			},
			'notification.confirm': function(e) {
				if (!navigator.notification) {
					return;
				}
				navigator.notification.confirm(e.data.parameters.message, function(buttonIndex) {
					postMessageToAppWindow({
						message: 'notification.confirm.onCallback',
						parameters: {
							buttonIndex: buttonIndex
						}
					}, Cordys.currentOrigin);
				}, e.data.parameters.title, e.data.parameters.buttonLabels);
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
			},
			'fileReader.readAsDataURL': function(e) {
				if (!FileReader) {
					return;
				}
				window.resolveLocalFileSystemURI(e.data.parameters.filePath, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onload = function(evt) {
							postMessageToAppWindow({
								message: 'fileReader.readAsDataURL.onSuccess',
								parameters: {
									result: evt.target.result
								}
							}, Cordys.currentOrigin);						
						};
						reader.onerror = function(evt) {
							postMessageToAppWindow({
								message: 'fileReader.readAsDataURL.onError',
								parameters: {
									error: evt.target.error
								}
							}, Cordys.currentOrigin);						
						};
						reader.readAsDataURL(file);
					});
				}, function(error) {
					postMessageToAppWindow({
						message: 'fileReader.readAsDataURL.onError',
						parameters: {
							error: error
						}
					}, Cordys.currentOrigin);						
				});
			},
			'fileReader.readAsText': function(e) {
				if (!FileReader) {
					return;
				}
				window.resolveLocalFileSystemURI(e.data.parameters.filePath, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onload = function(evt) {
							postMessageToAppWindow({
								message: 'fileReader.readAsText.onSuccess',
								parameters: {
									result: evt.target.result
								}
							}, Cordys.currentOrigin);						
						};
						reader.onerror = function(evt) {
							postMessageToAppWindow({
								message: 'fileReader.readAsText.onError',
								parameters: {
									error: evt.target.error
								}
							}, Cordys.currentOrigin);						
						};
						reader.readAsText(file, e.data.parameters.encoding);
					});
				}, function(error) {
					postMessageToAppWindow({
						message: 'fileReader.readAsText.onError',
						parameters: {
							error: error
						}
					}, Cordys.currentOrigin);						
				});
			},
			'fileTransfer.upload': function(e) {
				if (!FileTransfer) {
					return;
				}
				var ft = new FileTransfer();
				ft.upload(e.data.parameters.filePath, e.data.parameters.server, function(result) {
					postMessageToAppWindow({
						message: 'fileTransfer.upload.onSuccess',
						parameters: {
							result: result
						}
					}, Cordys.currentOrigin);
				}, function(error) {
					postMessageToAppWindow({
						message: 'fileTransfer.upload.onError',
						parameters: {
							error: error
						}
					}, Cordys.currentOrigin);
				}, e.data.parameters.options, true);
			},
			'loadScript': function(e) {
				$.ajax({
					type: 'GET',
					url: 'file:///android_asset/www/' + e.data.parameters.filePath,
					success: function(result) {
						postMessageToAppWindow({
							message: 'loadScript.onSuccess',
							parameters: {
								result: result
							}
						}, Cordys.currentOrigin);
					},
					dataType: 'text',
					async: true,
					cache: true
				});
			}
		}
	};
	
	Cordys.currentOrigin = 'https://testbop.cordys.com';
	
	Cordys.api.postMessageHandle = function(e) {
		// TODO: Fix this
		// Temporary hack to communicate with the testswarm runner
		if (e.originalEvent.origin !== Cordys.currentOrigin && e.originalEvent.origin != "http://" + TESTSWARM_URI) {
			console.log('not able to handle message from ' + e.originalEvent.origin);
			return;
		}
		var eventName = e.originalEvent.data;
		if (!eventName) {
			return;
		}
		
		if (! Cordys.api.postMessageHandler[eventName.message]){
			console.log("Ignoring message: '" + eventName.message + "' .Do not know how to handle it");
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
		createPrelogin: function(url) {
			return {
				data: Cordys.soap.prelogin(),
				contentType: 'text/xml; charset="utf-8"',
				type: 'post',
				dataType: 'xml',
				url: url
			};
		},
		createLogin: function(url, username, password) {
			return {
				data: Cordys.soap.login(username, password),
				contentType: 'text/xml; charset="utf-8"',
				type: 'post',
				dataType: 'xml',
				url: url
			};
		}
	};
	
	
	
	window['Cordys'] = Cordys;
	
	
}) (window, window.Cordys || {});