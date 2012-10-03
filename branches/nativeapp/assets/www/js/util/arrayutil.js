/**
 * 
 * @param object
 * @returns
 */
Array.prototype.remove = function(object) {
	var index = this.indexOf(object);
	
	return this.splice(index, 1);
};

/**
 * 
 * @returns {Boolean}
 */
Array.prototype.any = function() {
	return this.length > 0;
};

/**
 * 
 * @returns {Boolean}
 */
Array.prototype.none = function() {
	return this.length < 1;
};

/**
 * 
 * @param object
 * @returns
 */
Array.prototype.contains = function(object) {
	return !!~this.indexOf(object);
};



/**
 * observableArray additions
 */

/**
 * ko.observableArray.any()
 * @return Boolean, true if there are one or more elements in the array, false if the array is empty.
 */
ko.observableArray.fn.any = function() {
	return this().any();
};

/**
 * ko.observableArray.none()
 * @return Boolean true, if the array is empty. Otherwise false.
 */
ko.observableArray.fn.none = function() {
	return this().none();
};