/**
 * Copyright (c) 2012 Cordys
 * Author: Piet Kruysse
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

;(function (window, $, undefined) {

	if (!$.cordys) $.cordys = {};
	if (!$.cordys.ajax) loadScript("/cordys/html5/src/cordys.ajax.js");

	$.cordys.model = function(settings) {
		var self = this;
		this.objectName = settings.objectName;
		if (typeof(ko) !== "undefined") {
			this[this.objectName] = ko.observableArray();
			this.selectedItem = ko.observable();
		} else {
			this[this.objectName] = [];
		}

		this.readSettings = {
			success : function(data) {
				var objects = getObjects(data, self.objectName);
				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					self[self.objectName](objects);
					if (settings.read.success) {
						settings.read.success(self[self.objectName]());
					}
				} else {
					self[self.objectName] = objects;
					if (settings.read.success) {
						settings.read.success(self[self.objectName]);
					}
				}
			}
		}
		// Do the same for createSettings/updateSettings/deleteSettings

		this.create = function(createSettings) {
			$.cordys.ajax($.extend({}, settings.defaults, settings.create, self.createSettings, createSettings))
		};
		this.read = function(readSettings) { 
			$.cordys.ajax($.extend({}, settings.defaults, settings.read, self.readSettings, readSettings))
		};
		this.update = function(updateSettings) { 
			$.cordys.ajax($.extend({}, settings.defaults, settings.update, self.updateSettings, updateSettings))
		};
		this['delete'] = function(deleteSettings) {
			$.cordys.ajax($.extend({}, settings.defaults, settings['delete'], self.deleteSettings, deleteSettings))
		};
	};

	getObjects = function(obj, key, val) {
		var objects = [];
		for (var i in obj) {
			if (!obj.hasOwnProperty(i)) continue;
			if (typeof obj[i] == 'object') {
				if (i == key) {
					if ($.isArray(obj[i])) {
						for (var j=0; j<obj[i].length; j++) {
							objects.push(obj[i][j]);
						}
					} else {
						objects.push(obj[i]);
					}
				} else {
					objects = objects.concat(getObjects(obj[i], key, val));
				}
			} else if (i == key && obj[key] == val) {
				objects.push(obj);
			}
		}
		return objects;
	};
	cordysOptimisticLock = function(data, isInitiallyDirty) {
		var result = function() {}
		var _initialData = ko.observable(ko.toJSON(data));
		var _isInitiallyDirty = ko.observable(isInitiallyDirty);
		
		result.isDirty = ko.dependentObservable(function() {
			return _isInitiallyDirty() || _initialData() !== ko.toJSON(data);
		});

		result.reset = function() {
			_initialData(ko.toJSON(data));
			_isInitiallyDirty(false);
		};

		result.initialData = function() {
			var idata = $.parseJSON(ko.utils.unwrapObservable(_initialData));
			delete idata.__ko_mapping__;
			return idata;
		};

		return result;
	};

})(window, jQuery)