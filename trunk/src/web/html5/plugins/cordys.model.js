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
			// add knockoutJS and the mapping plugin if the model is not readOnly
			if (typeof(ko) === "undefined") loadScript("/cordys/html5/knockout/knockout-2.1.0.js");
			if (typeof(ko) !== "undefined" && (! ko.mapping)) loadScript("/cordys/html5/knockout/knockout.mapping-2.3.2.js");
		}

		if (typeof(ko) !== "undefined") {
			// make the object collection observable
			this[this.objectName] = ko.observableArray();
			this.selectedItem = ko.observable();
			// bind automatically if the context is set
			if (typeof(settings.context) !== "undefined"){
				ko.applyBindings(self, settings.context);
			}
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

		opts.mappingOptions = opts.mappingOptions || {};
		opts.mappingOptions.ignore = opts.mappingOptions.ignore || [];
		opts.mappingOptions.ignore.push("_destroy");
		if (opts.template){
			opts.mappingOptions.include = opts.mappingOptions.include || [];
			$.each(opts.template, function(i, f) {
				var persisted = typeof(f.persisted) !== "undefined" ? f.persisted : (typeof(f) === "string" || f.isArray || f.template);
				if (persisted){
					opts.mappingOptions.include.push(f);
				}
			});
		}
	
		// Sends the get/read request
		this.read = function(readSettings) {
			var readOptions = $.extend(true, {}, settings.defaults, settings.read, readSettings);
			readOptions._$Def = $.Deferred();
			readOptions.context = readOptions;

			$.cordys.ajax(readOptions).done(function(data) {
				var objects = getObjects(data, self.objectName);
				handleCursorAfterRead(data, objects.length);
				if (typeof(self[self.objectName]) === "function") { // in case of knockout
					if (self.isReadOnly !== true || opts.template){
						// make every attribute Observable for identifying changes and add lock if the model is not readOnly
						for (var objectKey in objects){
							var object = objects[objectKey], 
								observableObject = mapObject(object, null, opts.template, opts.mappingOptions, self.isReadOnly);
							if (!self.isReadOnly) {
								addOptimisticLock(self, readOptions, object, observableObject, false);
							}
							objects[objectKey] = observableObject;
						}
					}
					self[self.objectName](objects);
				} else {
					self[self.objectName] = objects;
				}
				this._$Def.resolve(objects, this);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				this._$Def.reject(jqXHR, textStatus, errorThrown, this);
			});
			return readOptions._$Def.promise();
		};

		// Sends all inserted objects to the backend
		this.create = function(createSettings) {
			var options = $.extend(true, {}, settings.defaults, settings.create, createSettings);
			options.parameters = getUpdateParameters(options, true, false, false);

			return ajaxUpdate(options);
		};

		// Sends all updated objects to the backend
		this.update = function(updateSettings) {
			var options = $.extend(true, {}, settings.defaults, settings.update, updateSettings);
			options.parameters = getUpdateParameters(options, false, true, false);

			return ajaxUpdate(options);
		};

		// Sends all deleted objects to the backend.
		this['delete'] = function(deleteSettings) {
			var _deleteOpts = $.extend(true, {}, settings.defaults, settings['delete'], deleteSettings);
			_deleteOpts.parameters = getUpdateParameters(_deleteOpts, false, false, true);

			return ajaxUpdate(_deleteOpts);
		};

		// Sends all local changes (inserted, updated, deleted objects) to the backend.
		this.synchronize = function(synchronizeSettings) {
			var options = $.extend(true, {}, settings.defaults, settings.update, synchronizeSettings);
			options.parameters = getUpdateParameters(options, true, true, true);

			return ajaxUpdate(options);
		};

		var getUpdateParameters = function (settings, sendInsert, sendUpdate, sendDelete){
			var synchronizeContent = [];
			var objectsToBeUpdated = [];

			if (typeof(self[self.objectName]) === "function") { // in case of knockout
				var objects = self[self.objectName]();

				if (objects){
					for (var objectKey in objects){
						var object = objects[objectKey];
						// check for persistence
						if (object.lock){
							// deleted object
							if (sendDelete && object._destroy === true){
								objectsToBeUpdated.push(object);
								// get the old bo from the initial saved state
								var oldObject = object.lock.getInitialState();
								// get the corresponding XML for the deleted object and add it to the deleteContent
								synchronizeContent.push($.cordys.json.js2xmlstring(opts.useTupleProtocol ? wrapInTuple(oldObject,null): wrapInObject(opts.objectName, oldObject)));
							}
							else if (sendUpdate && object.lock.isDirty()){
								objectsToBeUpdated.push(object);
								// get the old bo from the initial saved state
								var oldObject = object.lock.getInitialState();
								// get the new bo by unwrapping the Observable object
								var newObject = ko.mapping.toJS(object);
								// get the corresponding XML for the object and add it to the updateContent
								synchronizeContent.push($.cordys.json.js2xmlstring(opts.useTupleProtocol ? wrapInTuple(oldObject,newObject) : wrapInObject(opts.objectName, newObject)));
							}	
						}
						// not persisted - new
						else if (sendInsert && object._destroy !== true){
							// just double check whether it was an object deleted before persisting directly using KO API's
							objectsToBeUpdated.push(object);
							// get the new bo by unwrapping the Observable object
							var newObject = ko.mapping.toJS(object);
							// get the corresponding XML for the inserted object and add it to the insertContent
							synchronizeContent.push($.cordys.json.js2xmlstring(opts.useTupleProtocol ? wrapInTuple(null,newObject) : wrapInObject(opts.objectName, newObject)));

						}
					}
				}

			}
			settings.objectsToBeUpdated = objectsToBeUpdated;
			return synchronizeContent.join("");
		}

		var ajaxUpdate = function(settings) {
			settings._$Def = $.Deferred();
			settings.context = settings; // setting this pointer in all ajax handlers (beforeSend, success, error, done, fail...)
			if ( self.isReadOnly || (settings.objectsToBeUpdated.length == 0) ) {
				settings._$Def.reject(null, "canceled", null, settings); // to be compatible with previous version
			} else {
				$.cordys.ajax(settings).done(function(data, textStatus, jqXHR) {
					mergeUpdate(data, this.objectsToBeUpdated);
					this._$Def.resolve(data, textStatus, this);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					handleError(jqXHR.error(), this.objectsToBeUpdated);
					if (this.showError) {
						showErrorDialog(jqXHR.error(), "Error on Update");
					}
					this._$Def.reject(jqXHR, textStatus, errorThrown, this);
				});
			}
			return settings._$Def.promise();
		}

		// Returns the number of Business Objects
		this.getSize = function()
		{
			return (typeof(self[self.objectName]) === "function") ? self[self.objectName]().length : self[self.objectName].length;
		}

		// Gets the next set of records
		this.getNextPage = function(nextPageSettings){
			if (self.cursor){
				nextPageSettings = $.extend(true, {}, nextPageSettings, {parameters:{cursor:self.cursor}});
			}
			return this.read(nextPageSettings);
		}

		// Gets the previous set of records
		this.getPreviousPage = function(previousPageSettings){
			if (self.cursor){
				var previousPosition = self.cursor['@position'] - (self.cursor['@numRows'] * 2);
				self.cursor['@position'] = previousPosition < 0 ? 0 : previousPosition;
				previousPageSettings = $.extend(true, {}, previousPageSettings, {parameters:{cursor:self.cursor}});
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
				object = mapObject(object, null, opts.template, opts.mappingOptions, self.isReadOnly);
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
				self[self.objectName] = [];
			}
			self.cursor = null;
		}

		// handles error in insert, update, delete, sync response. Updates the lock and current state to the current state from the response if specified
		var handleError = function(error, objectsToBeUpdated){
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
		var mergeUpdate = function (data, objectsToBeUpdated){

			var synchronizedObjects;
			if (opts.useTupleProtocol) {
				// get the updated tuples
				synchronizedObjects =  $.map($.isArray(data.tuple) ? data.tuple : [data.tuple], function(tuple){
						return getObjects(tuple['new'] ? tuple['new'] : tuple['old'], self.objectName)
				});
			} else {
				synchronizedObjects = getObjects(data, self.objectName);
			}

			for (var count=0; count<objectsToBeUpdated.length; count++){
				var object = objectsToBeUpdated[count];
				// check for persistence
				if (object.lock){
					// deleted object
					if (object._destroy === true){
						self[self.objectName].remove(object);
					} else if (object.lock.isDirty()){
						if (opts.useTupleProtocol){
							var objectAfterUpdation = synchronizedObjects[count];
							// merge the updated object back in case of tuple protocol and update the lock to it
							object.lock._update(objectAfterUpdation);
						} else {
							// update the lock to the latest state of the object
							object.lock._updateLock();
						}
					}
				} else if (object._destroy !== true){
					// not persisted - new
					if (opts.useTupleProtocol){
						var objectAfterInsertion = synchronizedObjects[count];
						// set the lock with the inserted object we get from the backend
						addOptimisticLock(self, opts, objectAfterInsertion, object, false);
						// update the object with what we got from the backend
						object.lock._update(objectAfterInsertion);
					} else {
						// set the lock to the latest state of the object
						addOptimisticLock(self, opts, ko.mapping.toJS(object), object, false);
					}
				}
			}
		}
		
		// create a json structure to represent the tuple with the specified old and new Business Object (can alson pass null  values 
		// in case where the old or new is not required
		var wrapInTuple = function(oldBusObject, newBusObject) {
			var tuple = {};
			if (oldBusObject) {	
				tuple.old = wrapInObject(self.objectName, oldBusObject);
			}
			if (newBusObject) {	
				tuple['new'] = wrapInObject(self.objectName, newBusObject);
			}
			return {tuple:tuple};
		}

		var wrapInObject = function(name, object){
			var wrappedObject = {};
			wrappedObject[name] = object;
			return wrappedObject;
		}

		var handleCursorAfterRead = function(data, nrObjects) {
			var cursor = getObjects(data, "cursor")[0];
			if (typeof(cursor) !== "undefined" && typeof(cursor['@id']) === "undefined" && typeof(self.cursor) !== "undefined" && typeof(self.cursor['@position']) !== "undefined"){
				if (nrObjects === 0) {
					cursor['@position'] = parseInt(self.cursor['@position']);
					self.cursor = cursor;
					self[self.objectName].valueWillMutate();
					self[self.objectName].valueHasMutated();
					return false;
				} else {
					// in case we do not have an id copy the cursor position from the earlier one and adjust so that we know how to go previous
					cursor['@position'] = parseInt(self.cursor['@position']) + parseInt(cursor['@numRows']);
				}
			}
				
			self.cursor = cursor ? cursor : null;
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

	// Maps a JS object into an observable
	mapObject = function(dataObject, existingObservable, template, mappingOptions, isReadOnly){
		var mappedObject = isReadOnly ? dataObject : (existingObservable ? ko.mapping.fromJS(dataObject, mappingOptions, existingObservable) : ko.mapping.fromJS(dataObject, mappingOptions));
		if (template) {
			mappedObject = mapObjectByTemplate(dataObject, mappedObject, template, null, ! isReadOnly, existingObservable);
		}

		return mappedObject;
	}

	// Create observables from a data object against a template, supporting child objects, arrays, compute, paths and others.
	mapObjectByTemplate = function(dataObject, mappedObject, objectTemplate, rootObject, createObservables, existingObservable) {
		if (!rootObject) rootObject = dataObject;

		$.each(objectTemplate, function(i, f) {
		
			if (typeof(f) === "string") {
				if (! mappedObject[f]){
					mappedObject[f] = createObservables ? ko.observable() : undefined;	// add the field if it is not there, to avoid ko "Unable to parse binding" error
				}
				else if (! dataObject[f]){
					createObservables ? mappedObject[f](undefined) : (mappedObject[f] = undefined);
				}
			} else {
				if (!f.name) throw new Error("Mandatory property 'name' not specified");
				var value = ko.utils.unwrapObservable(mappedObject[f.name]);

				if (f.path) {	// get the value from the dataObject via the specified path
					var spath = f.path.split(".");
					value = dataObject;
					for (var i=0; i<spath.length; i++) {
						if (typeof(value) == "undefined") break;
						value = (spath[i] == "$root") ? rootObject : ko.utils.unwrapObservable(value[spath[i]]);
					}
				}
				if (f.computed) {	// create a knockout computed object to get the value
					if (! ko.isComputed(mappedObject[f.name])){
						mappedObject[f.name] = ko.computed(f.computed, mappedObject);
					}
					return mappedObject;
				}
				if (f.isArray) {
					if (value) {
						if (!$.isArray(value)) {	// wrap the value into an array
							value = [value];
						}
					} else {	// create an empty array
						value = [];
					}
					if ($.isArray(mappedObject[f.name])){
						mappedObject[f.name](value);
					}else{
						mappedObject[f.name] = createObservables ? ko.observableArray(value) : value;
					}
				} else {
					if (!mappedObject[f.name] || f.path){
						 if (mappedObject[f.name]){
							createObservables ? mappedObject[f.name](value) : (mappedObject[f.name] = value);
						 }else{
							mappedObject[f.name] = createObservables ? ko.observable(value) : value;
						}
					}
				}
				if (f.template) {	// recursively map child objects
					if ($.isArray(value)) {
						for (var i=0; i<value.length; i++) {
							mapObjectByTemplate(value[i], mappedObject[f.name]()[i], f.template, rootObject, createObservables);
						}
					} else {
						mapObjectByTemplate(value, mappedObject[f.name], f.template, rootObject, createObservables);
					}
				}
			}
		})

		return mappedObject;
	}

	// Adds lock. This stores the initial state, so that you can identify objects that are changes as well as know their old values
	addOptimisticLock = function(model, opts, data, observableData, isInitiallyDirty) {
		var result = function() {}
		var _initialState = data;
		var _initialJSONString = ko.mapping.toJSON(observableData);
		var _isInitiallyDirty = ko.observable(isInitiallyDirty);
		
		// Gets initial state of the objects
		result.getInitialState = function() {
			return _initialState;
		}

		// Returns if the object is changed
		result.isDirty = function() {
			return observableData && (_isInitiallyDirty() || _initialJSONString !== ko.mapping.toJSON(observableData));
		}

		// Strictly to be used internally. Updates the lock(the initial state) to the current state of the object
		result._updateLock = function(data) {
			_initialState = data ? data : ko.mapping.toJS(observableData); 
			_initialJSONString = ko.mapping.toJSON(observableData);
			_isInitiallyDirty(false);
		};

		// Strictly to be used internally. Updates the current state and the lock after successful update/insert
		result._update = function(newData) {
			mapObject(newData, observableData, opts.template, opts.mappingOptions, false);
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