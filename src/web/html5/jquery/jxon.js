;(function (window, $, undefined) {

	var	sValueProp = "text", sAttributesProp = "keyAttributes", sAttrPref = "@", /* you can customize these values */ 
		aCache = [], rIsNull = /^\s*$/, rIsBool = /^(?:true|false)$/i;

	if (!$.cordys) $.cordys = {};
	$.cordys.json = {};
	$.cordys.json.xml2js = function (oXMLParent, nVerbosity /* optional */, bFreeze /* optional */, bNesteAttributes /* optional */) {
		var _nVerb = arguments.length > 1 && typeof nVerbosity === "number" ? nVerbosity & 3 : /* put here the default verbosity level: */ 1;
		return createObjTree(oXMLParent, _nVerb, bFreeze || false, arguments.length > 3 ? bNesteAttributes : _nVerb === 3);
	};
	
	//For IE
	if(($.browser.msie != undefined) && ($.browser.version == 7 || $.browser.version == 8)){
		XMLSerializer = function(){
		}
		XMLSerializer.prototype.serializeToString = function(inputXML){
			return inputXML.xml;
		}
		document.XMLSerializer = XMLSerializer;
		
		String.prototype.trim = function(){
			return this.replace(/^[/s]+/, "").replace(/[/s]+$/, "");
		}	
	}
	
	$.cordys.json.xml2jsstring = function (oXMLParent, nVerbosity /* optional */, bFreeze /* optional */, bNesteAttributes /* optional */) {
        if (! oXMLParent) return null;
        return JSON.stringify($.cordys.json.xml2js(oXMLParent, nVerbosity, bNesteAttributes));
	};

	$.cordys.json.js2xml = function (oObjTree) {
		var oNewDoc = null;
		if (($.browser.msie != undefined) && ($.browser.version == 7 || $.browser.version == 8)) { 
			oNewDoc = new ActiveXObject( "Microsoft.XMLDOM" ); // For IE
		} else {
			oNewDoc = document.implementation.createDocument("", "", null);
		}
		loadObjTree(oNewDoc, oNewDoc, oObjTree);
		return oNewDoc;
	};

	$.cordys.json.js2xmlstring = function (oObjTree) {
		var oWrappedTree = {o:oObjTree};	// wrap oObjTree into an object to prevent error with multiple roots
		var wrappedXML = $.cordys.json.js2xml(oWrappedTree);
		var sXML = (new XMLSerializer()).serializeToString(wrappedXML.documentElement); //For IE
		return sXML.slice(3, sXML.length-4); // remove the temporary object
	};

	$.cordys.json.find = function(obj, name, val) {
		// Finding all the objects with a certain name.
		// It returns:
		// - null if nothing found
		// - a single object if 1 result found
		// - an array if multiple results found
		var obj = getObj(obj, name, val);
		return obj.length===0 ? null : (obj.length===1 ? obj[0] : obj);
	}
	$.cordys.json.findObjects = function(obj, name, val) {
		// Finding all the objects with a certain name and always returns an array
		return getObj(obj, name, val);
	}

	function getObj(obj, key, val) {
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
					objects = objects.concat(getObj(obj[i], key, val));
				}
			} else if (i == key && obj[key] == val) {
				objects.push(obj);
			}
		}
		return objects;
	};

	function parseText (sValue) {
		if (rIsNull.test(sValue)) { return null; }
	//	if (rIsBool.test(sValue)) { return sValue.toLowerCase() === "true"; }
	//	if (isFinite(sValue)) { return parseFloat(sValue); }
	//	if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
		return sValue;
	}

	function objectify (vValue) {
		return vValue === null ? {} : (vValue instanceof Object ? vValue : new vValue.constructor(vValue));
	}

	function createObjTree (oParentNode, nVerb, bFreeze, bNesteAttr) {
		var	nLevelStart = aCache.length, bChildren = oParentNode.hasChildNodes(),
			bHighVerb = Boolean(nVerb & 2);
		var bAttributes = oParentNode.hasAttributes ? oParentNode.hasAttributes() : (oParentNode.attributes ? true : false); //For IE
		
		var	sProp, vContent, nLength = 0, sCollectedTxt = "",
			vResult = bHighVerb ? {} : /* put here the default value for empty nodes: */ "";

		if (bAttributes && oParentNode.getAttribute("xsi:nil") === "true") {
			bAttributes = false;	// skip the attributes
			vResult = null;			// value will be 'null'
		}

		if (bChildren) {
			for (var oNode, nChildId = 0; nChildId < oParentNode.childNodes.length; nChildId++) {
			oNode = oParentNode.childNodes.item(nChildId);
			if (oNode.nodeType === 4) { sCollectedTxt += oNode.nodeValue; } /* nodeType is "CDATASection" (4) */
			else if (oNode.nodeType === 3) { sCollectedTxt += oNode.nodeValue.trim(); } /* nodeType is "Text" (3) */
			else if (oNode.nodeType === 1) { aCache.push(oNode); } /* nodeType is "Element" (1) */
			}
		}

		var nLevelEnd = aCache.length, vBuiltVal = parseText(sCollectedTxt);

		if (!bHighVerb && (bChildren || bAttributes)) { vResult = nVerb === 0 ? objectify(vBuiltVal) : {}; }

		for (var nElId = nLevelStart; nElId < nLevelEnd; nElId++) {
			sProp = aCache[nElId].nodeName;//.toLowerCase();
			vContent = createObjTree(aCache[nElId], nVerb, bFreeze, bNesteAttr);
			if (vResult.hasOwnProperty(sProp)) {
				if (vResult[sProp].constructor !== Array) { vResult[sProp] = [vResult[sProp]]; }
				vResult[sProp].push(vContent);
			} else {
				vResult[sProp] = vContent;
				nLength++;
			}
		}

		if (bAttributes) {
			var	nAttrLen = oParentNode.attributes.length,
				sAPrefix = bNesteAttr ? "" : sAttrPref, oAttrParent = bNesteAttr ? {} : vResult;

			for (var oAttrib, nAttrib = 0; nAttrib < nAttrLen; nLength++, nAttrib++) {
				oAttrib = oParentNode.attributes.item(nAttrib);
				oAttrParent[sAPrefix + oAttrib.nodeName] = parseText(oAttrib.nodeValue.trim());
			}

			if (bNesteAttr) {
				if (bFreeze) { Object.freeze(oAttrParent); }
				vResult[sAttributesProp] = oAttrParent;
				nLength -= nAttrLen - 1;
			}
		}

		if (nVerb === 3 || (nVerb === 2 || nVerb === 1 && nLength > 0) && sCollectedTxt) {
			vResult[sValueProp] = vBuiltVal;
		} else if (!bHighVerb && nLength === 0 && sCollectedTxt) {
			vResult = vBuiltVal;
		}

		if (bFreeze && (bHighVerb || nLength > 0)) { Object.freeze(vResult); }

		aCache.length = nLevelStart;

		return vResult;
	}

	function loadObjTree (oXMLDoc, oParentEl, oParentObj) {
		var vValue, oChild;

		if (oParentObj instanceof String || oParentObj instanceof Number || oParentObj instanceof Boolean) {
			oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 */
		} else if (oParentObj.constructor === Date) {
			oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toGMTString()));
		}

		for (var sName in oParentObj) {
			if (isFinite(sName)) { continue; } /* verbosity level is 0 */
			vValue = oParentObj[sName];
			if (typeof(vValue) === "function") vValue = vValue(); // in case of KO, value can be an observable.
			if (sName === sValueProp) {
				if (vValue !== null && vValue !== true) { 
					oParentEl.appendChild(oXMLDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue)));
				}
			} else if (sName === sAttributesProp) { /* verbosity level is 3 */
				for (var sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
			} else if (sName.charAt(0) === sAttrPref) {
				oParentEl.setAttribute(sName.slice(1), new String(vValue)); //For IE 
			} else if (vValue !== null && vValue.constructor === Array) {
				for (var nItem = 0; nItem < vValue.length; nItem++) {
					oChild = oXMLDoc.createElement(sName);
					loadObjTree(oXMLDoc, oChild, vValue[nItem]);
					oParentEl.appendChild(oChild);
				}
			} else {
				oChild = oXMLDoc.createElement(sName); 
				if (vValue instanceof Object) {
					loadObjTree(oXMLDoc, oChild, vValue);
				} else if (vValue !== null && vValue !== true) {
					oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
				} else if (vValue === null) {
					oChild.setAttribute("null", "true");
					oChild.setAttribute("xsi:nil", "true");
					oChild.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
				}
				oParentEl.appendChild(oChild);
			}
		}
	}

})(window, jQuery);