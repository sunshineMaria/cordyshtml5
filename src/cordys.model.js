;(function (window, $, undefined) {

	if (!$.cordys) $.cordys = {};
	if (!$.cordys.ajax) loadScript("/cordys/html5/src/cordys.ajax.js");

	$.cordys.model = function(settings) {
		var self = this;
		this.objectName = settings.objectName;
		if (typeof(ko) !== "undefined") {
			this[this.objectName] = ko.observableArray();
			this.selectedItem = ko.observable();
		}
		else {
			this[this.objectName] = [];
		}

		this.readSettings = {
		//	_success : settings.read.success,
			success : function(data) {
				self[self.objectName] = (typeof(ko) !== "undefined") ? ko.observableArray() : [];
			debugger;
				var objects = getObjects(data, self.objectName);
				for (var i=0; i<objects.length; i++) {
					self[self.objectName].push(objects[i]);
				}
				if (typeof(self[self.objectName]) == "function") {
					if (settings.read.success) settings.read.success(self[self.objectName]());
				}
				else {
					if (settings.read.success) settings.read.success(self[self.objectName]);
				}

			return;
				if (data.tuple) data = data.tuple;
				//var dataObjects = $(data).find(self.objectName);
				if (typeof(ko) !== "undefined") {
					if ($.isArray(data)) {
						for (var i=0; i<data.length; i++) {
							self[self.objectName].push(data[i][self.objectName] || data[i].old[self.objectName]);
						}
					}
					else {
						if (data) self[self.objectName].push(data[self.objectName] || data.old[self.objectName]);
					}
					if (settings.read.success) settings.read.success(self[self.objectName]());
				}
				else {
					if ($.isArray(data)) {
						self[self.objectName] = $.map(data, function(tuple, index) {
							return tuple.old[self.objectName];
						});
					}
					else {
						if (data) self[self.objectName] = [data.old[self.objectName]];
					}
					if (settings.read.success) settings.read.success(self[self.objectName]);
				}
			}
		}
	//	settings.read.success = this.settings.success;


		this.create = function(createSettings) {
			$.cordys.ajax($.extend({}, settings.defaults, settings.create, this.createSettings, createSettings))
		};
		this.read = function(readSettings) { 
			$.cordys.ajax($.extend({}, settings.defaults, settings.read, this.readSettings, readSettings))
		};
		this.update = function(updateSettings) { 
			$.cordys.ajax($.extend({}, settings.defaults, settings.update, this.updateSettings, updateSettings))
		};
		this['delete'] = function(deleteSettings) {
			$.cordys.ajax($.extend({}, settings.defaults, settings['delete'], this.deleteSettings, deleteSettings))
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

/*
Example usage:
	var empModel = new $.cordys.model({
		objectName: 'Employees',
		defaults: {
			namespace: "http://schemas.cordys.com/NW",
			dataType: 'json'
		},
		create: {},
		read: {
			method: "GetEmployeesObjects",
			namespace: "http://schemas.cordys.com/NW",
			parameters: [
				{name: "fromEmployeeID", value: "0"},
				{name: "toEmployeeID", value: "99"}
			],
			dataType: 'json',	// the xml result will be converted into js objects
			success: function(data) {
				var html = $("#employeeTemplate").render(data);
				$('#employeeList')
					.html(html)
					.listview("refresh");
			}
		},
		update: {},
		'delete': {}
	});

*/
})(window, jQuery)