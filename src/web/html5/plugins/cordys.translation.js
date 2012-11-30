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
		keyRootPath :"/Cordys/WCP/Javascript/translation/"
	};

	$.cordys.translation.getBundle = function(path, language)
	{
		if (!language) language = getRuntimeLanguage();
		if (path.indexOf('/') == 0 || path.indexOf("\\") == 0)	{
			path = path.substring(1,path.length);
		}
		var key = path + "_" +language;
		var bundle = messageBundles[key];
		if(!bundle)
		{
			messageBundles[key] = bundle = new messageBundle(key, language);
		}
		return bundle;
	}
		
	var getRuntimeLanguage = function() {
		var language = getURLParameter(window.location, "language");
		if (!language) {
			// TODO: call TranslationGateway to get user language
			language = "en-US";
		}
		return language;
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

		// TODO: what if called from native? can we get the resource file from mobile filesystem?
		return $.cordys.ajax({
			method: "GetXMLObject",
			namespace: "http://schemas.cordys.com/1.0/xmlstore",
			context: self,
			dataType:"json",
			parameters: {
				key:$.cordys.translation.keyRootPath + key + ".mlm"
			}
		}).then(function(response) {
			self.dictionary = $.cordys.json.find(response, "dictionary");
			return self;
		});

	}

})(window, jQuery)
