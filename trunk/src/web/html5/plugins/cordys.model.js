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
	if (!$.cordys.ajax) loadScript("/cordys/html5/plugins/cordys.ajax.js");


	$.cordys.model = function(settings) {
		var self = this;
		var opts = $.extend({}, $.cordys.model.defaults, settings);
		this.objectName = settings.objectName;

		// set read-only - take readonly if set in opts, otherwise we see if one of the change settings is specified and then default to the model.defaults
		this.isReadOnly = settings.hasOwnProperty("isReadOnly") ? (settings.isReadOnly === true) : 
			(typeof(settings.create || settings.update || settings['delete']) === "undefined") ? $.cordys.model.defaults.isReadOnly : false;
		if (this.isReadOnly !== true){
			// let us add ko if the model is not readOnly
			if (typeof(ko) === "undefined") loadScript("/cordys/html5/knockout/knockout-2.1.0.js");
			// let us add the ko mapping plugin
			if (typeof(ko) !== "undefined" && (! ko.mapping)) loadScript("/cordys/html5/knockout/knockout.mapping-2.3.2.js");
		}

		if (typeof(ko) !== "undefined") {
			// make the object collection observable
			this[this.objectName] = ko.observableArray();
			this.selectedItem = ko.observable();
			// let us bind automatically if the context is not set to null
			/*if (settings.context !== null || settings.context !== false){
				ko.applyBindings(self, typeof(settings.context) === "undefined" ? null : settings.context);
			}*/
		} else {
			this[this.objectName] = [];
			// Selects an Item
			this.selectedItem = function (selectedItem){
				if (typeof (selectedItem) !== "undefined"){
					this.__selectedItem = selectedItem;
				}
				return this.__selectedItem;
			}
		}
	
		// Handlers and settings for the read part
		this.readSettings = {
			success : function(data) {
				// clear the current cursor if there is one so that it doesn't get sent with all request
				if (self.readSettings.parameters && self.readSettings.parameters.cursor){
					delete self.readSettings.parameters.cursor;
				}

				var objects = getObjects(data, self.objectName);
				var cursor = getObjects(data, "cursor")[0];
				if (typeof(cursor) !== "undefined" && typeof(cursor['@id']) === "undefined" && typeof(self.cursor) !== "undefined" && typeof(self.cursor['@position']) !== "undefined"){
					if (objects.length === 0){
						cursor['@position'] = parseInt(self.cursor['@position']);
						self.cursor = cursor;
						self[self.objectName].valueWillMutate();
						self[self.objectName].valueHasMutated();
						return false;
					}
					else{
						// in case we do not have an id copy the cursor position from the earlier one and adjust so that we know how to go previous
						cursor['@position'] = parseInt(self.cursor['@position']) + parseInt(cursor['@numRows']);
					}
				}
				
				self.cursor = cursor ? cursor : null;
				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					if (self.isReadOnly !== true){
						// let us make every attribute Observable for identifying changes and add lock if the model is not readOnly
						for (var objectKey in objects){
							var object = objects[objectKey];
							var observableObject = ko.mapping.fromJS(object);
							addOptimisticLock(self, object, observableObject, false);
							objects[objectKey] = observableObject;
						}
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

		// Common handlers for all the update methods. Can be over-ridden
		this.defaultUpdateSettings = {
			async : false,
			beforeSend: function (xhr, settings){
				// cancel the request if there is nothing to update or call the custom beforeSend handler (he can cancels it too)
				return (self.objectsToBeUpdated.length > 0) && (self._beforeSend ? self._beforeSend(xhr, settings, self.objectsToBeUpdated) : true);
			},

			success: function (data, textStatus, jqXHR){
				// invoke the custom success handler
				if (self._success) self._success(data, textStatus, jqXHR);
				// merge the insert, update, delete
				mergeUpdate(data, self.objectsToBeUpdated);
				self.objectsToBeUpdated = null;
			},

			error : function (jqXHR, textStatus, errorThrown, messCode, errorMessage, opts){
				handleError(jqXHR.error(), self.objectsToBeUpdated);
				self.objectsToBeUpdated = null;

				var showError = true;
				if (self._error && typeof(self._error) === "function"){
					showError = self._error(jqXHR, textStatus, errorThrown, messCode, errorMessage, opts) !== false;
				}
				if (showError){
					showErrorDialog(jqXHR.error(), "Error on Update");
				}
				return false;
			}
		}

		// Handlers and settings for the update part
		this.updateSettings = {
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
								updateContent.push($.cordys.json.js2xmlstring(createTuple(oldObject,newObject)));
							}
						}
					}

				}
				return updateContent.join("");
			}
		}

		// Handlers and settings for the Sync part
		this.synchronizeSettings = {
			parameters : function (settings){
				var synchronizeContent = [];
				self.objectsToBeUpdated = [];

				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					var objects = self[self.objectName]();

					if (objects){
						for (var objectKey in objects){
							var object = objects[objectKey];
							// check for persistence
							if (object.lock){
								// deleted object
								if (object._destroy === true){
									self.objectsToBeUpdated.push(object);
									// let us get the old bo from the initial saved state
									var oldObject = object.lock.getInitialState();
									// get the corresponding XML for the deleted object and add it to the deleteContent
									synchronizeContent.push($.cordys.json.js2xmlstring(createTuple(oldObject,null)));
								}
								else if (object.lock.isDirty()){
									self.objectsToBeUpdated.push(object);
									// let us get the old bo from the saved state
									var oldObject = object.lock.getInitialState();
									// the objects here are Observavables, let us unmap to get the new bo
									var newObject = ko.mapping.toJS(object);
									// get the corresponding XML for the object and add it to the updateContent
									synchronizeContent.push($.cordys.json.js2xmlstring(createTuple(oldObject,newObject)));
								}	
							}
							// not persisted - new
							else if (object._destroy !== true){
								// just double check whether it was an object deleted before persisting directly using KO API's
								self.objectsToBeUpdated.push(object);
								// let us get the new bo by unwrapping the Observable
								var newObject = ko.mapping.toJS(object);
								// get the corresponding XML for the inserted object and add it to the insertContent
								synchronizeContent.push($.cordys.json.js2xmlstring(createTuple(null,newObject)));

							}
						}
					}

				}
				return synchronizeContent.join("");
			}
		}

		// Handlers and settings for the delete part
		this.deleteSettings = {
			parameters : function (settings){
				var deleteContent = [];
				self.objectsToBeUpdated = [];
				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					var objects = self[self.objectName]();
					if (objects){
						for (var objectKey in objects){
							var object = objects[objectKey];
							// find deleted objects which were already persisted
							if (object.lock && object._destroy === true){
								self.objectsToBeUpdated.push(object);
								// let us get the old bo from the initial saved state
								var oldObject = object.lock.getInitialState();
								// get the corresponding XML for the deleted object and add it to the deleteContent
								deleteContent.push($.cordys.json.js2xmlstring(createTuple(oldObject,null)));
							}
						}
					}
				}
				return deleteContent.join("");
			}
		}

			
		// Handlers and settings for the create part
		this.createSettings = {
			parameters : function (settings){
				var insertContent = [];
				self.objectsToBeUpdated = [];
				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					var objects = self[self.objectName]();
					if (objects){
						for (var objectKey in objects){
							var object = objects[objectKey];
							// find objects to be inserted
							if (! object.lock && object._destroy !== true){
								self.objectsToBeUpdated.push(object);
								// let us get the new bo by unwrapping the Observable
								var newObject = ko.mapping.toJS(object);
								// get the corresponding XML for the inserted object and add it to the insertContent
								insertContent.push($.cordys.json.js2xmlstring(createTuple(null,newObject)));
							}
						}
					}
				}
				return insertContent.join("");
			}
		}

		// Sends all inserted objects to the backend
		this.create = function(createSettings) {
			self._beforeSend = (createSettings && createSettings.beforeSend) ? createSettings.beforeSend : (settings.create ? settings.create.beforeSend : null);
			self._success = (createSettings && createSettings.success) ? createSettings.success : (settings.create ? settings.create.success : null);
			self._error = (createSettings && createSettings.error) ? createSettings.error : (settings.create ? settings.create.error : null);
			return $.cordys.ajax($.extend({}, settings.defaults, settings.create, createSettings, self.defaultUpdateSettings, self.createSettings));
		};

		// Sends the get/read request
		this.read = function(readSettings) {
			var options = $.extend(true, {}, settings.defaults, settings.read, readSettings, self.readSettings);
			self._readSuccess = (readSettings && readSettings.success) ? readSettings.success : (settings.read ? settings.read.success : null);
			return $.cordys.ajax(options);
		};

		// Sends all updated objects to the backend
		this.update = function(updateSettings) {
			self._beforeSend = (updateSettings && updateSettings.beforeSend) ? updateSettings.beforeSend : (settings.update ? settings.update.beforeSend :null);
			self._success = (updateSettings && updateSettings.success) ? updateSettings.success : (settings.update ? settings.update.success : null);
			self._error = (updateSettings && updateSettings.error) ? updateSettings.error : (settings.update ? settings.update.error : null);  
			return $.cordys.ajax($.extend({}, settings.defaults, settings.update, updateSettings, self.defaultUpdateSettings, self.updateSettings));
		};

		// Sends all deleted objects to the backend.
		this['delete'] = function(deleteSettings) {
			self._beforeSend = (deleteSettings && deleteSettings.beforeSend) ? deleteSettings.beforeSend : (settings['delete'] ? settings['delete'].beforeSend :null);
			self._success = (deleteSettings && deleteSettings.success) ? deleteSettings.success : (settings['delete'] ? settings['delete'].success : null); 
			self._error = (deleteSettings && deleteSettings.error) ? deleteSettings.error : (settings['delete'] ? settings['delete'].error : null); 
			return $.cordys.ajax($.extend({}, settings.defaults, settings['delete'], deleteSettings, self.defaultUpdateSettings, self.deleteSettings));
		};

		// Sends all local changes (inserted, updated, deleted objects) to the backend.
		this.synchronize = function(synchronizeSettings) {
			self._beforeSend = (synchronizeSettings && synchronizeSettings.beforeSend) ? synchronizeSettings.beforeSend : (settings.update ? settings.update.beforeSend : null);
			self._success = (synchronizeSettings && synchronizeSettings.success) ? synchronizeSettings.success : (settings.update ? settings.update.success : null);
			self._error = (synchronizeSettings && synchronizeSettings.error) ? synchronizeSettings.error : (settings.update ? settings.update.error : null);
			return $.cordys.ajax($.extend({}, settings.defaults, settings.update, synchronizeSettings, self.defaultUpdateSettings, self.synchronizeSettings));
		};

		// Returns the number of Business Objects
		this.getSize = function()
		{
			return (typeof(self[self.objectName]) === "function") ? self[self.objectName]().length : self[self.objectName].length;
		}

		// Gets the next set of records
		this.getNextPage = function(nextPageSettings){
			if (self.cursor){
				self.readSettings.parameters = {cursor:self.cursor};
			}
			return this.read(nextPageSettings);
		}

		// Gets the previous set of records
		this.getPreviousPage = function(previousPageSettings){
			if (self.cursor){
				var previousPosition = self.cursor['@position'] - (self.cursor['@numRows'] * 2);
				self.cursor['@position'] = previousPosition < 0 ? 0 : previousPosition;
				self.readSettings.parameters = {cursor:self.cursor};
			}
			return this.read(previousPageSettings);
		}

		// Returns true if there are more records to move forward in the cursor
		this.hasNext = function(){
			if (this.getSize() === 0) return false;
			if (typeof(self.cursor) === "undefined" || typeof(self.cursor['@position']) === "undefined") return false;
			if (typeof(self.cursor['@id']) === "undefined") return false;
			var currentPosition = typeof(self.cursor['@position']) === "undefined" ? 0 : parseInt(self.cursor['@position']);
			var currentMaxRows =  typeof(self.cursor['@maxRows']) === "undefined" ? 0 : parseInt(self.cursor['@maxRows']);
			return (currentPosition < currentMaxRows);
		}

		// Returns true if there are records to move backwards in the cursor
		this.hasPrevious = function(){
			if (this.getSize() === 0) return false;
			if (typeof(self.cursor) === "undefined") return false;
			var currentPosition = typeof(self.cursor['@position']) === "undefined" ? 0 : parseInt(self.cursor['@position']);
			if (currentPosition === 0) return false;

			var numRows =  typeof(self.cursor['@numRows']) === "undefined" ? 0 : parseInt(self.cursor['@numRows']);
			return (currentPosition > numRows);
		}

		// Adds the specified Business Object
		this.addBusinessObject = function(object){
			if (! object) return null;
			if (! ko.isObservable(object)){
				object =  ko.mapping.fromJS(object);
			}
			self[self.objectName].push(object);
			return object;
		}

		// Removes the specified Business Object
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

		// Reverts all local changes
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

		// Clears the model
		this.clear = function() {
			if (typeof(self[self.objectName]) === "function") { // in case of knockout
				self[self.objectName].removeAll();
			}
			else{
				self[self.objectName] = {};
			}
			self.cursor = null;
		}

		// handles error in insert, update, delete, sync response. Updates the lock and current state to the current state from the response if specified
		handleError = function(error, objectsToBeUpdated){
			if (opts.useTupleProtocol){
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
								// it is an insert failure. we do not have anything to do here
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

		// merges the response received after insert, update, delete, sync with the current data
		mergeUpdate = function (data, objectsToBeUpdated){
			// let us get the updated tuples if we are using tuple protocol
			if (opts.useTupleProtocol){
				var synchronizedObjects =  $.map($.isArray(data.tuple) ? data.tuple : [data.tuple], function(tuple){
						return getObjects(tuple['new'] ? tuple['new'] : tuple['old'], self.objectName)
				});
			}

			for (var count=0; count<objectsToBeUpdated.length; count++){
				var object = objectsToBeUpdated[count];
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
		
		// create a json structure to represent the tuple with the specified old and new Business Object (can alson pass null  values 
		// in case where the old or new is not required
		createTuple = function(oldBusObject, newBusObject) {
			var tuple = {};
			if (oldBusObject) {	
				tuple.old = {};
				tuple.old[self.objectName] = oldBusObject;
			}
			if (newBusObject) {	
				tuple['new'] = {};
				tuple['new'][self.objectName] = newBusObject;
			}
			return {tuple:tuple};
		}
	};

	// default settings for all instances
	$.cordys.model.defaults = {
		useTupleProtocol: true,
		isReadOnly : true
	}

	// Extracts the error and shows it with a caption
	showErrorDialog = function(e, caption) {
		var err = $(e.error().responseXML).find("faultstring,error elem").text()
						|| e.responseText 
						|| "General error, see response.";
					alert(caption + " : '" + err + "'");
		return false;
	};

	// gets all the objects with the specified key name and value. Value is optional
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

	// Adds lock. This stores the initial state, so that you can identify objects that are changes as well as know their old values
	addOptimisticLock = function(model, data, observableData, isInitiallyDirty) {
		var result = function() {}
		var _initialState = data;
		var _initialJSONString = ko.toJSON(observableData);
		var _isInitiallyDirty = ko.observable(isInitiallyDirty);
		
		// Gets initial state of the objects
		result.getInitialState = function() {
			return _initialState;
		}

		// Returns if the object is changed
		result.isDirty = ko.computed({
				read:function() {
					return observableData && (_isInitiallyDirty() || _initialJSONString !== ko.toJSON(observableData));
				},
				deferEvaluation : true
		});

		// Strictly to be used internally. Updates the lock(the initial state) to the current state of the object
		result._updateLock = function(data) {
			_initialState = data ? data : ko.mapping.toJS(observableData); 
			_initialJSONString = ko.toJSON(observableData);
			_isInitiallyDirty(false);
		};

		// Strictly to be used internally. Updates the current state and the lock after successful update/insert
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

		// Sets the object back to the initial state
		result.undo = function() {
			if (this.isDirty()){			
				this._update(_initialState);
			}
		};
		observableData.lock = result;
		return result;
	};

})(window, jQuery)