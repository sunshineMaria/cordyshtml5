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
							// get xml content for changed objects. Make sure we do not take objects marked for deletion
							if (object._destroy !== true && object.lock && object.lock.isDirty()){
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
				mergeUpdate(data, self.objectsToBeUpdated);
				self.objectsToBeUpdated = null;
			},

			onError : function (error){
				showError(error, "Error on Update");
				handleError(error, self.objectsToBeUpdated);
				self.objectsToBeUpdated = null;
				return false;
			}
		}

		this.synchronizeSettings = {
			async : false,
			parameters : function (settings){
				var synchronizeContent = [];
				self.objectsToBeSynchronized = [];

				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					var objects = self[self.objectName]();

					if (objects){
						for (var objectKey in objects){
							var object = objects[objectKey];
							// check for persistence
							if (object.lock){
								// deleted object
								if (object._destroy === true){
									self.objectsToBeSynchronized.push(object);
									// let us get the old bo from the initial saved state
									var oldObject = object.lock.getInitialState();
									// get the corresponding XML for the deleted object and add it to the deleteContent
									synchronizeContent.push($.cordys.json.js2xmlstring({tuple:{old:{Employees:oldObject}}}));
								}
								else if (object.lock.isDirty()){
									self.objectsToBeSynchronized.push(object);
									// let us get the old bo from the saved state
									var oldObject = object.lock.getInitialState();
									// the objects here are Observavables, let us unmap to get the new bo
									var newObject = ko.mapping.toJS(object);
									// get the corresponding XML for the object and add it to the updateContent
									synchronizeContent.push($.cordys.json.js2xmlstring({tuple:{old:{Employees:oldObject}, 'new':{Employees:newObject}}}));
								}	
							}
							// not persisted - new
							else if (object._destroy !== true){
								// just double check whether it was an object deleted before persisting directly using KO API's
								self.objectsToBeSynchronized.push(object);
								// let us get the new bo by unwrapping the Observable
								var newObject = ko.mapping.toJS(object);
								// get the corresponding XML for the inserted object and add it to the insertContent
								synchronizeContent.push($.cordys.json.js2xmlstring({tuple:{'new':{Employees:newObject}}}));

							}
						}
					}

				}
				return synchronizeContent.join("");
			},
			beforeSend: function (xhr, settings){
				return self.objectsToBeSynchronized.length > 0;
			},
			success: function (data){
				mergeUpdate(data, self.objectsToBeSynchronized);
				self.objectsToBeSynchronized = null;
			},

			onError : function (error){
				showError(error, "Error on Update");
				handleError(error, self.objectsToBeSynchronized);
				self.objectsToBeSynchronized = null;
				return false;
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
							// find deleted objects which were already persisted
							if (object.lock && object._destroy === true){
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
				mergeUpdate(data, self.objectsToBeDeleted);
				self.objectsToBeDeleted = null;
			},

			onError : function (error){
				showError(error, "Error on Delete");
				handleError(error, self.objectsToBeDeleted);
				self.objectsToBeDeleted = null;
				return false;
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
							// find objects to be inserted
							if (! object.lock && object._destroy !== true){
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
				mergeUpdate(data, self.objectsToBeInserted);
				self.objectsToBeInserted = null;
			},

			onError : function (error){
				showError(error, "Error on Insert");
				handleError(error, self.objectsToBeInserted);
				self.objectsToBeInserted = null;
				return false;
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

		this.synchronize = function(synchronizeSettings) { 
			$.cordys.ajax($.extend({}, settings.defaults, settings.update, self.synchronizeSettings, synchronizeSettings));
		};


		this.addBusinessObject = function(object){
			if (! object) return null;
			if (! ko.isObservable(object)){
				object =  ko.mapping.fromJS(object);
			}
			self[self.objectName].push(object);
			return object;
		}

		this.removeBusinessObject = function(object){
			if (! object) return null;
			if (typeof(self[self.objectName]) !== "function") { // in case of no knockout
				return null;
			}
			if (! object.lock){
				// removing object not yet persisted. so let us just remove it
				self[self.objectName].remove(object);
			}
			else{
				// otherwise we just mark it with the KO destroy flag
				self[self.objectName].destroy(object);
			}
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
								 object.lock._undestroy();
							 }
						}
					}
				}
			}
		}

		this.clear = function() {
			self[self.objectName].removeAll();
		}

		handleError = function(error, objectsToBeUpdated){
			if (opts.useTupleProtocol){
				debugger;
				// let us find the tuples from the error detail
				var tuples = $(error.responseXML).find("detail tuple");
				for (var count=0; count<tuples.length; count++){
					var tuple = tuples[count];
					// check for tuples with an error
					if ($(tuple).find("error").length > 0){
						var faultNew = $(tuple).find("new")[0];
						var faultOld = $(tuple).find("old")[0];
						var objectBeforeUpdation = objectsToBeUpdated[count];

						if (faultNew){
							if (faultOld){
								// it is an update failure
								// get the latest persisted state into a json object
								var currentPersistedState = getObjects($.cordys.json.xml2js(faultOld), self.objectName)[0];
								// let us merge the tuples which has the error in it with the latest persisted state in it
								objectBeforeUpdation.lock._update(currentPersistedState);
							}
							else{
								// it is an insert failure

							}
						}
						else{
							// it is an delete failure
							// get the latest persisted state into a json object
							var currentPersistedState = getObjects($.cordys.json.xml2js(faultOld), self.objectName)[0];
							// let us merge the tuples which has the error in it with the latest persisted state in it
							objectBeforeUpdation.lock._update(currentPersistedState);
							objectBeforeUpdation.lock._undestroy();
						}
					}
				}
			}
		};

		mergeUpdate = function (data, objectsToBeSynchronized){
			// let us get the updated tuples if we are using tuple protocol
			if (opts.useTupleProtocol){
				var synchronizedObjects =  $.map($.isArray(data.tuple) ? data.tuple : [data.tuple], function(tuple){
						return getObjects(tuple['new'] ? tuple['new'] : tuple['old'], self.objectName)
				});
			}

			for (var count=0; count<objectsToBeSynchronized.length; count++){
				var object = objectsToBeSynchronized[count];
				// check for persistence
				if (object.lock){
					// deleted object
					if (object._destroy === true){
						self[self.objectName].remove(object);
					}
					else if (object.lock.isDirty()){
						if (opts.useTupleProtocol){
							var objectAfterUpdation = synchronizedObjects[count];
							// let us merge the updated object back in case of tuple protocol and update the lock to it
							object.lock._update(objectAfterUpdation);
						}
						else{
							// other we update the lock to the latest state of the object
							object.lock._updateLock();
						}
					}
				}
				// not persisted - new
				else if (object._destroy !== true){
					if (opts.useTupleProtocol){
						var objectAfterInsertion = synchronizedObjects[count];
						// let us set the lock with the inserted object we get from the backend
						addOptimisticLock(self, objectAfterInsertion, object, false);
						// let us also update the object with what we got from the backend
						object.lock._update(objectAfterInsertion);
					}
					else{
						// other we set the lock to the latest state of the object
						addOptimisticLock(self, ko.mapping.toJS(object), object, false);
					}
				}
			}
		}
	};

	$.cordys.model.defaults = {
		useTupleProtocol: true
	}

	showError = function(e, caption) {
		var err = $(e.error().responseXML).find("faultstring,error elem").text()
						|| e.responseText 
						|| "General error, see response.";
					alert(caption + " : '" + err + "'");
		return false;
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
			ko.mapping.fromJS(newData, observableData);
			this._updateLock(newData);
		}

		// Used internally for unmarking objects marked for deleteion
		result._undestroy = function() {
			// KO Observable array does not have a undestroy, so let us just remove the destroy flag after a change notification
			model[model.objectName].valueWillMutate();
			delete observableData._destroy;
			model[model.objectName].valueHasMutated();
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