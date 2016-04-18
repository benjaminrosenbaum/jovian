
//an interface looks like this: var Position = new Interface('Position', ['getPos']); 
//declaration: implements(Motile.prototype, Position);
//test: motile.checkInterfaces(); //you can do this in the constructor of the object, or in a unit test

function Interface(name, members) { 
	this.name = name; 
	this.members = members; 
}

function implementsInterface(clss, iface) {
	var checkExisting = (clss.checkInterfaces || function() {}).bind(clss);
	var ifc = iface;
	clss.checkInterfaces = function() {
		checkExisting();
		for (var i = 0; i < ifc.members.length; i++) {
			var member = ifc.members[i];
            var found = false;
            for(var t = this; !!t; t = t.__proto__) {
			  if (t[member]) found = true;
            } 
            if (!found) throw "Class " + this.ctor + " does not implement member " + member;
		};
	};
	return clss; //fluent
}

//TODO subclass, with ctor, base, interfaces


function CONSTANCY(c) { var constant = c; return function() { return constant;} }
var TRUTH = CONSTANCY(true);
var FALSITY = CONSTANCY(false);


//general function to unwrap arrays and strings when parsing JSON objects, then enliven them using a reader function
function fromJSON(json, reader) {
	if (typeof(json) == 'string') {
		return fromJSON(JSON.parse(json), reader);
	} else if (Array.isArray(json)) {
		return json.map(function(j) { return fromJSON(j, reader); });	
	} else {     
		return reader(json);
	}	
}

//get this from jQuery or prototype or whatever
Array.prototype.contains = function(elem) { this.indexOf(elem) > -1; }  

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (that) {
    // if the other array is a falsy value, return
    if (!that)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != that.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if the elements to compare support equals (e.g. nested arrays)
        if (this[i].equals && that[i].equals) {
            // recurse into the nested arrays
            if (!this[i].equals(that[i]))
                return false;                
        } else if (this[i] != that[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

//polyfill for ECMA6
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

//TODO use jQuery or whatever
if (!Array.prototype.contains) {
    Array.prototype.contains = function(element) {
        return this.indexOf(element) != -1;
    }
}

function contains(array, element) { return array && element && array.indexOf && array.indexOf(element) != -1;}
