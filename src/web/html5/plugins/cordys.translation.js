/**
 * Cordys Translation Plugin - Copyright (c) 2012 Cordys
 * Author: Piet Kruysse
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

;(function (window, $, undefined) {

	if (!$.cordys) $.cordys = {};
	
	var messageBundles = [];

	$.cordys.translation = {
		defaultLanguage : "en-US",
		xmlstoreRootPath : "/Cordys/WCP/Javascript/translation/",
		nativeRootPath : "translation/"
	};

	$.cordys.translation.getBundle = function(path, language)
	{
		return getRuntimeLanguage(language).then(function(language){
			path = path.replace(/^[\/\\]/, "");
			var key = path + "_" +language;
			var bundle = messageBundles[key];
			if (!bundle)
			{
				messageBundles[key] = bundle = new messageBundle(key, language);
			}
			return bundle;
		});
	}

	var getRuntimeLanguage = function(language) {
		var _$DefLanguage = $.Deferred();
		language = language || window.navigator.language;
		if (typeof(getURLParameter) != "undefined") {
			var parLanguage = getURLParameter(window.location, "language");
			if (parLanguage) language = parLanguage;
		}
		if (!language) {
			if ($.cordys.isMobile && $.cordys.mobile && $.cordys.mobile.globalization) {
				$.cordys.mobile.globalization.getLocaleName().done(function(result){
					_$DefLanguage.resolve(result);
				}).fail(function(error){
					// unable to get the language, take default language
					_$DefLanguage.resolve($.cordys.translation.defaultLanguage);
				});
			} else if (typeof($.cordys.ajax) != "undefined") {
				// call TranslationGateway to get user language
				$.cordys.ajax({
					url:"/cordys/com.cordys.translation.gateway.TranslationGateway.wcp",
					data: "",
					error: function(){
						return false; // skip error message
					}
				}).done(function(data){
					var jsData = $.cordys.json.xml2js(data);
					if (jsData && jsData.browserpreferences) _$DefLanguage.resolve(jsData.browserpreferences.language);
					else _$DefLanguage.resolve($.cordys.translation.defaultLanguage);
				}).fail(function(jqXHR, textStatus, errorThrown){
					// unable to get the language, take default language
					_$DefLanguage.resolve($.cordys.translation.defaultLanguage);
				});
			} else {
				// unable to get the language, take default language
				_$DefLanguage.resolve($.cordys.translation.defaultLanguage);
			}
		}
		if (language) _$DefLanguage.resolve(language);
		return _$DefLanguage.promise();
	}

	var messageBundle = function(key, language) {
		var self = this;
		this.key = key;
		this.dictionary = null;

		this.getMessage = function(/*any number of arguments supported, first argument should be message id*/) {
			var id = arguments[0], label = null, ttext = "";
			if (self.dictionary) {
				label = $.cordys.json.find(self.dictionary, "@textidentifier", id);
			}
			ttext = label ? (label[language] ? (label[language].text || label[language]) : id) : id;
			if (arguments.length > 1) {
				var args = Array.prototype.slice.call(arguments).slice(1); // Create new array without first argument
				ttext = ttext.replace(/\{(\d+)\}/g,function() {
					return typeof(args[arguments[1]]) !== "undefined" ? args[arguments[1]] : arguments[0];
				});
			}
			return ttext;
		}

		this.translate = function(selector, fp) {
			if (!selector) selector = "[data-translatable='true']";
			$(selector).each(function(){
				var $this = $(this);
				if (fp) {
					fp.call(this, self.getMessage($this.is(":input") ? $this.val() : $this.text()));
				} else {
					if ($this.is(":input")) {
						$this.val(self.getMessage($this.val()));
					} else {
						$this.text(self.getMessage($this.text()));
					}
				}
			});
		}
		
		if (typeof($.cordys.ajax) != "undefined") {
			return $.cordys.ajax({
				method: "GetXMLObject",
				namespace: "http://schemas.cordys.com/1.0/xmlstore",
				context: self,
				dataType:"json",
				parameters: {
					key: $.cordys.translation.xmlstoreRootPath + key + ".mlm"
				}
			}).then(function(response) {
				self.dictionary = $.cordys.json.find(response, "dictionary");
				return self;
			});
		} else {
			// called from native. Try to get the resource file from mobile filesystem
			return $.ajax({
				type: "GET",
				url: $.cordys.translation.nativeRootPath + key + ".xml",
				async: true,
				cache: true
			}).then(function(response) {
				self.dictionary = $.cordys.json.find($.cordys.json.xml2js(response), "dictionary");
				return self;
			});
		}

	}

})(window, jQuery)
