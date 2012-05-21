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
	// let us add the ko mapping plugin
	if (typeof(ko) !== "undefined" && (! ko.mapping)) loadScript("/cordys/html5/knockout/knockout.mapping-latest.js");


	$.cordys.model = function(settings) {
		var self = this;

		var opts = $.extend({}, $.cordys.model.defaults, settings);
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
					// let us add observable for identifying changes
					for (var objectKey in objects)
					{
						var object = objects[objectKey];
						var observableObject = ko.mapping.fromJS(object);
						addOptimisticLock(self, object, observableObject, false);
						objects[objectKey] = observableObject;
					} 
					self[self.objectName](objects);
					if (self._readSuccess) {
						self._readSuccess(self[self.objectName]());
					}
				} else {
					self[self.objectName] = objects;
					if (self._readSuccess) {
						self._readSuccess(self[self.objectName]);
					}
				}
			}
		}
		
		this.updateSettings = {
			async : false,
			parameters : function (settings){
				var updateContent = [];
				self.objectsToBeUpdated = [];

				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					var objects = self[self.objectName]();

					if (objects){
						for (var objectKey in objects){
							var object = objects[objectKey];
							// get xml content for changed objects
							if (object.lock && object.lock.isDirty()){
								self.objectsToBeUpdated.push(object);
								// let us get the old bo from the saved state
								var oldObject = object.lock.getInitialState();
								// the objects here are Observavables, let us unmap to get the new bo
								var newObject = ko.mapping.toJS(object);
								// get the corresponding XML for the object and add it to the updateContent
								updateContent.push($.cordys.json.js2xmlstring({tuple:{old:{Employees:oldObject}, 'new':{Employees:newObject}}}));
							}
						}
					}

				}
				return updateContent.join("");
			},

			beforeSend: function (xhr, settings){
				return self.objectsToBeUpdated.length > 0;
			},

			success: function (data){
				// let us get the updated tuples if we are using tuple protocol	
				if (opts.useTupleProtocol){
					var updatedObjects =  $.map($.isArray(data.tuple) ? data.tuple : [data.tuple], function(tuple){
							return getObjects(tuple['new'], self.objectName)
						});
				}
				for (var count=0; count<self.objectsToBeUpdated.length; count++){
					var objectBeforeUpdation = self.objectsToBeUpdated[count];
					
					if (opts.useTupleProtocol){
						var objectAfterUpdation = updatedObjects[count];
						// let us merge the updated object back in case of tuple protocol and update the lock to it
						objectBeforeUpdation.lock._update(objectAfterUpdation);
					}
					else{
						// other we update the lock to the latest state of the object
						objectBeforeUpdation.lock._updateLock();
					}
				}

			}
		}

		this.deleteSettings = {
			async : false,
            parameters : function (settings){
				var deleteContent = [];
				self.objectsToBeDeleted = [];
				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					var objects = self[self.objectName]();
					if (objects){
						for (var objectKey in objects){
							var object = objects[objectKey];
							// find deleted objects
							if (object._destroy === true){
								self.objectsToBeDeleted.push(object);
								// let us get the old bo from the initial saved state
								var oldObject = object.lock.getInitialState();
								// get the corresponding XML for the deleted object and add it to the deleteContent
								deleteContent.push($.cordys.json.js2xmlstring({tuple:{old:{Employees:oldObject}}}));
							}
						}
					}
				}
				return deleteContent.join("");
			},
			beforeSend: function (xhr, settings){
				return self.objectsToBeDeleted.length > 0;
			},

			success: function (data){
				// no special treatment for tuple protocol here. We just delete the objects
				for (var count=0; count<self.objectsToBeDeleted.length; count++){
					self[self.objectName].remove(self.objectsToBeDeleted[count]);
				}
			}
		}

			

		this.createSettings = {
			async : false,
			parameters : function (settings){
				var insertContent = [];
				self.objectsToBeInserted = [];
				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					var objects = self[self.objectName]();
					if (objects){
						for (var objectKey in objects){
							var object = objects[objectKey];
							// find deleted objects
							if (! object.lock){
								self.objectsToBeInserted.push(object);
								// let us get the new bo by unwrapping the Observable
								var newObject = ko.mapping.toJS(object);
								// get the corresponding XML for the inserted object and add it to the insertContent
								insertContent.push($.cordys.json.js2xmlstring({tuple:{'new':{Employees:newObject}}}));
							}
						}
					}
				}
				return insertContent.join("");
			},

			beforeSend: function (settings){
				return self.objectsToBeInserted.length > 0;
			},

			success: function (data){
				// let us get the inserted tuples if we are using tuple protocol				
				if (opts.useTupleProtocol){
					var insertedObjects = getObjects(data, self.objectName);
				}

				for (var count=0; count<self.objectsToBeInserted.length; count++){
					var objectBeforeInsertion = self.objectsToBeInserted[count];

					if (opts.useTupleProtocol){
						var objectAfterInsertion = insertedObjects[count];
						// let us set the lock with the inserted object we get from the backend
						addOptimisticLock(self, objectAfterInsertion, objectBeforeInsertion, false);
						// let us also update the object with what we got from the backend
						//?
						objectBeforeInsertion.lock._update(objectAfterInsertion);
					}
					else{
						// other we set the lock to the latest state of the object
						addOptimisticLock(self, ko.mapping.toJS(objectBeforeInsertion), objectBeforeInsertion, false);
					}
				}
			}
		}


		this.create = function(createSettings) {
			$.cordys.ajax($.extend({}, settings.defaults, settings.create, self.createSettings, createSettings));
		};

		this.read = function(readSettings) { 
			self._readSuccess = (readSettings && readSettings.success) ? readSettings.success : settings.read.success;
			$.cordys.ajax($.extend({}, settings.defaults, settings.read, readSettings, self.readSettings));
		};

		this.update = function(updateSettings) { 
			$.cordys.ajax($.extend({}, settings.defaults, settings.update, self.updateSettings, updateSettings));
		};

		this['delete'] = function(deleteSettings) {
			$.cordys.ajax($.extend({}, settings.defaults, settings['delete'], self.deleteSettings, deleteSettings));
		};


		this.addBusinessObject = function(object){
			if (! object) return;
			if (! ko.isObservable(object)){
				object =  ko.mapping.fromJS(object);
			}
			self[self.objectName].push(object);
			return object;
		}

		this.revert = function() {
			if (typeof(self[self.objectName]) === "function") { // in case of knockout
				var objects = self[self.objectName]();

				if (objects){
					for (var objectKey in objects){
						var object = objects[objectKey];
						if (! object.lock){
							// remove newly inserted objects
							self[self.objectName].remove(object);
						}
						else {
							 // revert the changed objects
							 if (object.lock.isDirty()){
								object.lock.undo();
							 }
							 // also unmark ones for deletion. Remember that changed ones could have also been marked for deletion
							 if (object._destroy === true){
								 // KO Observable array does not have a undestroy, so let us just remove the destroy flag 
								 object.valueWillMutate();
								 object._destroy = false;
								 object.valueHasMutated();
							 }
						}
					}
				}
			}
		}

		this.clear = function() {
			self[self.objectName].removeAll();
		}
	};

	$.cordys.model.defaults = {
		useTupleProtocol: true
	}

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

	addOptimisticLock = function(model, data, observableData, isInitiallyDirty) {
		var result = function() {}
		var _initialState = data;
		var _initialJSONString = ko.toJSON(observableData);
		var _isInitiallyDirty = ko.observable(isInitiallyDirty);
		
		result.getInitialState = function() {
			return _initialState;
		}

		result.isDirty = ko.computed({
				read:function() {
					return observableData && (_isInitiallyDirty() || _initialJSONString !== ko.toJSON(observableData));
				},
				deferEvaluation : true
		});

		// Strictly to be used internally. Updates the lock to the current state of the object
		result._updateLock = function(data) {
			_initialState = data ? data : ko.mapping.toJS(observableData); 
			_initialJSONString = ko.toJSON(observableData);
			_isInitiallyDirty(false);
		};

		// Strictly to be used internally for updating the state and the lock after successful update/insert
		result._update = function(newData) {
			_initialState = newData;
			ko.mapping.fromJS(newData, {}, observableData);
			this._updateLock(newData);
		}

		result.undo = function() {
			if (this.isDirty()){			
				this._update(_initialState);
			}
		};
		observableData.lock = result;
		return result;
	};

})(window, jQuery)