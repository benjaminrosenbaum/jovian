'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */

var ScalaJS = {};

// Get the environment info
ScalaJS.env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
ScalaJS.g =
  (typeof ScalaJS.env["global"] === "object" && ScalaJS.env["global"])
    ? ScalaJS.env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
ScalaJS.env["global"] = ScalaJS.g;

// Where to send exports
ScalaJS.e =
  (typeof ScalaJS.env["exportsNamespace"] === "object" && ScalaJS.env["exportsNamespace"])
    ? ScalaJS.env["exportsNamespace"] : ScalaJS.g;
ScalaJS.env["exportsNamespace"] = ScalaJS.e;

// Freeze the environment info
ScalaJS.g["Object"]["freeze"](ScalaJS.env);

// Other fields
ScalaJS.d = {};         // Data for types
ScalaJS.c = {};         // Scala.js constructors
ScalaJS.h = {};         // Inheritable constructors (without initialization code)
ScalaJS.s = {};         // Static methods
ScalaJS.n = {};         // Module instances
ScalaJS.m = {};         // Module accessors
ScalaJS.is = {};        // isInstanceOf methods
ScalaJS.isArrayOf = {}; // isInstanceOfArrayOf methods

ScalaJS.as = {};        // asInstanceOf methods
ScalaJS.asArrayOf = {}; // asInstanceOfArrayOf methods

ScalaJS.lastIDHash = 0; // last value attributed to an id hash code

// Core mechanism

ScalaJS.makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


ScalaJS.makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      ScalaJS.throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
ScalaJS.propertyName = function(obj) {
  var result;
  for (var prop in obj)
    result = prop;
  return result;
};

// Runtime functions

ScalaJS.isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


ScalaJS.throwClassCastException = function(instance, classFullName) {




  throw new ScalaJS.c.sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new ScalaJS.c.jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

ScalaJS.throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  ScalaJS.throwClassCastException(instance, classArrayEncodedName);
};


ScalaJS.noIsInstance = function(instance) {
  throw new ScalaJS.g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

ScalaJS.makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

ScalaJS.newArrayObject = function(arrayClassData, lengths) {
  return ScalaJS.newArrayObjectInternal(arrayClassData, lengths, 0);
};

ScalaJS.newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = ScalaJS.newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

ScalaJS.checkNonNull = function(obj) {
  return obj !== null ? obj : ScalaJS.throwNullPointerException();
};

ScalaJS.throwNullPointerException = function() {
  throw new ScalaJS.c.jl_NullPointerException().init___();
};

ScalaJS.objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

ScalaJS.objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return ScalaJS.d.T.getClassOf();
    case "number":
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if (ScalaJS.isByte(v))
          return ScalaJS.d.jl_Byte.getClassOf();
        else if (ScalaJS.isShort(v))
          return ScalaJS.d.jl_Short.getClassOf();
        else
          return ScalaJS.d.jl_Integer.getClassOf();
      } else {
        if (ScalaJS.isFloat(instance))
          return ScalaJS.d.jl_Float.getClassOf();
        else
          return ScalaJS.d.jl_Double.getClassOf();
      }
    case "boolean":
      return ScalaJS.d.jl_Boolean.getClassOf();
    case "undefined":
      return ScalaJS.d.sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        ScalaJS.throwNullPointerException();
      else if (ScalaJS.is.sjsr_RuntimeLong(instance))
        return ScalaJS.d.jl_Long.getClassOf();
      else if (ScalaJS.isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

ScalaJS.objectClone = function(instance) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new ScalaJS.c.jl_CloneNotSupportedException().init___();
};

ScalaJS.objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

ScalaJS.objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

ScalaJS.objectFinalize = function(instance) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

ScalaJS.objectEquals = function(instance, rhs) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && ScalaJS.numberEquals(instance, rhs);
  else
    return instance === rhs;
};

ScalaJS.numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

ScalaJS.objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return ScalaJS.m.sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if (ScalaJS.isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();
      else
        return 42; // TODO?
  }
};

ScalaJS.comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      ScalaJS.as.T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      ScalaJS.as.jl_Number(rhs);

      return ScalaJS.m.jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      ScalaJS.asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

ScalaJS.charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return ScalaJS.uI(instance["length"]);



  else
    return instance.length__I();
};

ScalaJS.charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return ScalaJS.uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

ScalaJS.charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return ScalaJS.as.T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

ScalaJS.booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

ScalaJS.numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
ScalaJS.numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
ScalaJS.numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
ScalaJS.numberLongValue = function(instance) {
  if (typeof instance === "number")
    return ScalaJS.m.sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
ScalaJS.numberFloatValue = function(instance) {
  if (typeof instance === "number") return ScalaJS.fround(instance);
  else                              return instance.floatValue__F();
};
ScalaJS.numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

ScalaJS.isNaN = function(instance) {
  return instance !== instance;
};

ScalaJS.isInfinite = function(instance) {
  return !ScalaJS.g["isFinite"](instance) && !ScalaJS.isNaN(instance);
};

ScalaJS.propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

ScalaJS.systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;
  if (srcu !== destu || destPos < srcPos || srcPos + length < destPos) {
    for (var i = 0; i < length; i++)
      destu[destPos+i] = srcu[srcPos+i];
  } else {
    for (var i = length-1; i >= 0; i--)
      destu[destPos+i] = srcu[srcPos+i];
  }
};

ScalaJS.systemIdentityHashCode = function(obj) {
  if (ScalaJS.isScalaJSObject(obj)) {
    var hash = obj["$idHashCode$0"];
    if (hash !== void 0) {
      return hash;
    } else {
      hash = (ScalaJS.lastIDHash + 1) | 0;
      ScalaJS.lastIDHash = hash;
      obj["$idHashCode$0"] = hash;
      return hash;
    }
  } else if (obj === null) {
    return 0;
  } else {
    return ScalaJS.objectHashCode(obj);
  }
};

// is/as for hijacked boxed classes (the non-trivial ones)

ScalaJS.isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

ScalaJS.isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

ScalaJS.isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

ScalaJS.isFloat = function(v) {
  return v !== v || ScalaJS.fround(v) === v;
};


ScalaJS.asUnit = function(v) {
  if (v === void 0)
    return v;
  else
    ScalaJS.throwClassCastException(v, "scala.runtime.BoxedUnit");
};

ScalaJS.asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Boolean");
};

ScalaJS.asByte = function(v) {
  if (ScalaJS.isByte(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Byte");
};

ScalaJS.asShort = function(v) {
  if (ScalaJS.isShort(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Short");
};

ScalaJS.asInt = function(v) {
  if (ScalaJS.isInt(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Integer");
};

ScalaJS.asFloat = function(v) {
  if (ScalaJS.isFloat(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Float");
};

ScalaJS.asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Double");
};


// Unboxes


ScalaJS.uZ = function(value) {
  return !!ScalaJS.asBoolean(value);
};
ScalaJS.uB = function(value) {
  return ScalaJS.asByte(value) | 0;
};
ScalaJS.uS = function(value) {
  return ScalaJS.asShort(value) | 0;
};
ScalaJS.uI = function(value) {
  return ScalaJS.asInt(value) | 0;
};
ScalaJS.uJ = function(value) {
  return null === value ? ScalaJS.m.sjsr_RuntimeLong$().Zero$1
                        : ScalaJS.as.sjsr_RuntimeLong(value);
};
ScalaJS.uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float. 
   */
  return +ScalaJS.asFloat(value);
};
ScalaJS.uD = function(value) {
  return +ScalaJS.asDouble(value);
};






// TypeArray conversions

ScalaJS.byteArray2TypedArray = function(value) { return new Int8Array(value.u); };
ScalaJS.shortArray2TypedArray = function(value) { return new Int16Array(value.u); };
ScalaJS.charArray2TypedArray = function(value) { return new Uint16Array(value.u); };
ScalaJS.intArray2TypedArray = function(value) { return new Int32Array(value.u); };
ScalaJS.floatArray2TypedArray = function(value) { return new Float32Array(value.u); };
ScalaJS.doubleArray2TypedArray = function(value) { return new Float64Array(value.u); };

ScalaJS.typedArray2ByteArray = function(value) {
  var arrayClassData = ScalaJS.d.B.getArrayOf();
  return new arrayClassData.constr(new Int8Array(value));
};
ScalaJS.typedArray2ShortArray = function(value) {
  var arrayClassData = ScalaJS.d.S.getArrayOf();
  return new arrayClassData.constr(new Int16Array(value));
};
ScalaJS.typedArray2CharArray = function(value) {
  var arrayClassData = ScalaJS.d.C.getArrayOf();
  return new arrayClassData.constr(new Uint16Array(value));
};
ScalaJS.typedArray2IntArray = function(value) {
  var arrayClassData = ScalaJS.d.I.getArrayOf();
  return new arrayClassData.constr(new Int32Array(value));
};
ScalaJS.typedArray2FloatArray = function(value) {
  var arrayClassData = ScalaJS.d.F.getArrayOf();
  return new arrayClassData.constr(new Float32Array(value));
};
ScalaJS.typedArray2DoubleArray = function(value) {
  var arrayClassData = ScalaJS.d.D.getArrayOf();
  return new arrayClassData.constr(new Float64Array(value));
};

/* We have to force a non-elidable *read* of ScalaJS.e, otherwise Closure will
 * eliminate it altogether, along with all the exports, which is ... er ...
 * plain wrong.
 */
this["__ScalaJSExportsNamespace"] = ScalaJS.e;

// Type data constructors

/** @constructor */
ScalaJS.PrimitiveTypeData = function(zero, arrayEncodedName, displayName) {
  // Runtime support
  this.constr = undefined;
  this.parentData = undefined;
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isInstance"] = function(obj) { return false; };
};

/** @constructor */
ScalaJS.ClassTypeData = function(internalNameObj, isInterface, fullName,
                                 ancestors, parentData, isInstance, isArrayOf) {
  var internalName = ScalaJS.propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.constr = undefined;
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.componentData = null;
  this.zero = null;
  this.arrayEncodedName = "L"+fullName+";";
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isPrimitive"] = false;
  this["isInterface"] = isInterface;
  this["isArrayClass"] = false;
  this["isInstance"] = isInstance;
};

/** @constructor */
ScalaJS.ArrayTypeData = function(componentData) {
  // The constructor

  var componentZero = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  if (componentZero == "longZero")
    componentZero = ScalaJS.m.sjsr_RuntimeLong$().Zero$1;

  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new ScalaJS.h.O;
  ArrayClass.prototype.constructor = ArrayClass;
  ArrayClass.prototype.$classData = this;

  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(this.u.constructor(this.u));
  };

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var componentDepth = componentData.arrayDepth || 0;
  var arrayDepth = componentDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = ScalaJS.d.O;
  this.ancestors = {O: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;
};

ScalaJS.ClassTypeData.prototype.getClassOf = function() {
  if (!this._classOf)
    this._classOf = new ScalaJS.c.jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};

ScalaJS.ClassTypeData.prototype.getArrayOf = function() {
  if (!this._arrayOf)
    this._arrayOf = new ScalaJS.ArrayTypeData(this);
  return this._arrayOf;
};

// java.lang.Class support

ScalaJS.ClassTypeData.prototype["getFakeInstance"] = function() {
  if (this === ScalaJS.d.T)
    return "some string";
  else if (this === ScalaJS.d.jl_Boolean)
    return false;
  else if (this === ScalaJS.d.jl_Byte ||
           this === ScalaJS.d.jl_Short ||
           this === ScalaJS.d.jl_Integer ||
           this === ScalaJS.d.jl_Float ||
           this === ScalaJS.d.jl_Double)
    return 0;
  else if (this === ScalaJS.d.jl_Long)
    return ScalaJS.m.sjsr_RuntimeLong$().Zero$1;
  else if (this === ScalaJS.d.sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};

ScalaJS.ClassTypeData.prototype["getSuperclass"] = function() {
  return this.parentData ? this.parentData.getClassOf() : null;
};

ScalaJS.ClassTypeData.prototype["getComponentType"] = function() {
  return this.componentData ? this.componentData.getClassOf() : null;
};

ScalaJS.ClassTypeData.prototype["newArrayOfThisClass"] = function(lengths) {
  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return ScalaJS.newArrayObject(arrayClassData, lengths);
};

ScalaJS.PrimitiveTypeData.prototype = ScalaJS.ClassTypeData.prototype;
ScalaJS.ArrayTypeData.prototype = ScalaJS.ClassTypeData.prototype;

// Create primitive types

ScalaJS.d.V = new ScalaJS.PrimitiveTypeData(undefined, "V", "void");
ScalaJS.d.Z = new ScalaJS.PrimitiveTypeData(false, "Z", "boolean");
ScalaJS.d.C = new ScalaJS.PrimitiveTypeData(0, "C", "char");
ScalaJS.d.B = new ScalaJS.PrimitiveTypeData(0, "B", "byte");
ScalaJS.d.S = new ScalaJS.PrimitiveTypeData(0, "S", "short");
ScalaJS.d.I = new ScalaJS.PrimitiveTypeData(0, "I", "int");
ScalaJS.d.J = new ScalaJS.PrimitiveTypeData("longZero", "J", "long");
ScalaJS.d.F = new ScalaJS.PrimitiveTypeData(0.0, "F", "float");
ScalaJS.d.D = new ScalaJS.PrimitiveTypeData(0.0, "D", "double");

// Instance tests for array of primitives

ScalaJS.isArrayOf.Z = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.Z);
ScalaJS.d.Z.isArrayOf = ScalaJS.isArrayOf.Z;

ScalaJS.isArrayOf.C = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.C);
ScalaJS.d.C.isArrayOf = ScalaJS.isArrayOf.C;

ScalaJS.isArrayOf.B = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.B);
ScalaJS.d.B.isArrayOf = ScalaJS.isArrayOf.B;

ScalaJS.isArrayOf.S = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.S);
ScalaJS.d.S.isArrayOf = ScalaJS.isArrayOf.S;

ScalaJS.isArrayOf.I = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.I);
ScalaJS.d.I.isArrayOf = ScalaJS.isArrayOf.I;

ScalaJS.isArrayOf.J = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.J);
ScalaJS.d.J.isArrayOf = ScalaJS.isArrayOf.J;

ScalaJS.isArrayOf.F = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.F);
ScalaJS.d.F.isArrayOf = ScalaJS.isArrayOf.F;

ScalaJS.isArrayOf.D = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.D);
ScalaJS.d.D.isArrayOf = ScalaJS.isArrayOf.D;


// asInstanceOfs for array of primitives
ScalaJS.asArrayOf.Z = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.Z, "Z");
ScalaJS.asArrayOf.C = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.C, "C");
ScalaJS.asArrayOf.B = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.B, "B");
ScalaJS.asArrayOf.S = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.S, "S");
ScalaJS.asArrayOf.I = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.I, "I");
ScalaJS.asArrayOf.J = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.J, "J");
ScalaJS.asArrayOf.F = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.F, "F");
ScalaJS.asArrayOf.D = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.D, "D");


// Polyfills

ScalaJS.imul = ScalaJS.g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

ScalaJS.fround = ScalaJS.g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });

ScalaJS.is.F1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F1)))
});
ScalaJS.as.F1 = (function(obj) {
  return ((ScalaJS.is.F1(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Function1"))
});
ScalaJS.isArrayOf.F1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F1)))
});
ScalaJS.asArrayOf.F1 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.F1(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Function1;", depth))
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Colliding = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Colliding)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Colliding(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Colliding"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Colliding = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Colliding)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Colliding = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Colliding(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Colliding;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Colliding = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Colliding: 0
}, true, "com.benjaminrosenbaum.jovian.Colliding", {
  Lcom_benjaminrosenbaum_jovian_Colliding: 1
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Position = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Position)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Position = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Position(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Position"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Position = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Position)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Position = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Position(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Position;", depth))
});
/** @constructor */
ScalaJS.c.O = (function() {
  /*<skip>*/
});
/** @constructor */
ScalaJS.h.O = (function() {
  /*<skip>*/
});
ScalaJS.h.O.prototype = ScalaJS.c.O.prototype;
ScalaJS.c.O.prototype.init___ = (function() {
  return this
});
ScalaJS.c.O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
ScalaJS.c.O.prototype.toString__T = (function() {
  var jsx$2 = ScalaJS.objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = ScalaJS.uD((i >>> 0));
  var jsx$1 = x["toString"](16);
  return ((jsx$2 + "@") + ScalaJS.as.T(jsx$1))
});
ScalaJS.c.O.prototype.hashCode__I = (function() {
  return ScalaJS.systemIdentityHashCode(this)
});
ScalaJS.c.O.prototype["toString"] = (function() {
  return this.toString__T()
});
ScalaJS.is.O = (function(obj) {
  return (obj !== null)
});
ScalaJS.as.O = (function(obj) {
  return obj
});
ScalaJS.isArrayOf.O = (function(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase["isPrimitive"])))
  }
});
ScalaJS.asArrayOf.O = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.O(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Object;", depth))
});
ScalaJS.d.O = new ScalaJS.ClassTypeData({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), ScalaJS.is.O, ScalaJS.isArrayOf.O);
ScalaJS.c.O.prototype.$classData = ScalaJS.d.O;
ScalaJS.is.sc_GenTraversableOnce = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
});
ScalaJS.as.sc_GenTraversableOnce = (function(obj) {
  return ((ScalaJS.is.sc_GenTraversableOnce(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenTraversableOnce"))
});
ScalaJS.isArrayOf.sc_GenTraversableOnce = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
});
ScalaJS.asArrayOf.sc_GenTraversableOnce = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenTraversableOnce(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenTraversableOnce;", depth))
});
ScalaJS.is.scm_HashEntry = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_HashEntry)))
});
ScalaJS.as.scm_HashEntry = (function(obj) {
  return ((ScalaJS.is.scm_HashEntry(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.HashEntry"))
});
ScalaJS.isArrayOf.scm_HashEntry = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_HashEntry)))
});
ScalaJS.asArrayOf.scm_HashEntry = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_HashEntry(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.HashEntry;", depth))
});
ScalaJS.d.scm_HashEntry = new ScalaJS.ClassTypeData({
  scm_HashEntry: 0
}, true, "scala.collection.mutable.HashEntry", {
  scm_HashEntry: 1
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$.prototype.apply__D__D__Lcom_benjaminrosenbaum_jovian_StayWithin = (function(buffer, force) {
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin().init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality(buffer, (ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$().Width$1 - buffer), force, ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$().Horizontal$1)
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$: 0
}, false, "com.benjaminrosenbaum.jovian.AvoidHorizontalPlaneEdges$", {
  Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$.prototype.apply__D__D__D__Lcom_benjaminrosenbaum_jovian_CohereWithFlock = (function(range, force, minRange) {
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock().init___D__D__sc_Seq__s_Option(range, force, ScalaJS.m.sci_Nil$(), new ScalaJS.c.s_Some().init___O(minRange))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_CohereWithFlock$: 0
}, false, "com.benjaminrosenbaum.jovian.CohereWithFlock$", {
  Lcom_benjaminrosenbaum_jovian_CohereWithFlock$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$
});
ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Colliding$class__orderTuple__Lcom_benjaminrosenbaum_jovian_Colliding__T4 = (function($$this) {
  var jsx$2 = $$this.strength__D();
  var this$1 = $$this.box__Lcom_benjaminrosenbaum_jovian_Square().center$1;
  var jsx$1 = this$1.y$1;
  var this$2 = $$this.box__Lcom_benjaminrosenbaum_jovian_Square().center$1;
  return new ScalaJS.c.T4().init___O__O__O__O((-jsx$2), jsx$1, (-this$2.x$1), $$this.id$1)
});
ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Colliding$class__allTouching__Lcom_benjaminrosenbaum_jovian_Colliding__sci_List__sci_List = (function($$this, others) {
  ScalaJS.m.sci_List$();
  var b = new ScalaJS.c.scm_ListBuffer().init___();
  var these = others;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    var c = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(arg1);
    if ($$this.box__Lcom_benjaminrosenbaum_jovian_Square().intersects__Lcom_benjaminrosenbaum_jovian_Square__Z(c.box__Lcom_benjaminrosenbaum_jovian_Square())) {
      b.$$plus$eq__O__scm_ListBuffer(arg1)
    };
    var this$2 = these;
    these = this$2.tail__sci_List()
  };
  return b.toList__sci_List()
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution = (function() {
  ScalaJS.c.O.call(this);
  this.collidables$1 = null;
  this.collisions$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CollisionResolution = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype.$$js$exported$prop$collidables__O = (function() {
  return this.collidables$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype.init___sjs_js_Array__sjs_js_Array = (function(collidables, collisions) {
  this.collidables$1 = collidables;
  this.collisions$1 = collisions;
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype.$$js$exported$prop$collisions__O = (function() {
  return this.collisions$1
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype, "collidables", {
  "get": (function() {
    return this.$$js$exported$prop$collidables__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype, "collisions", {
  "get": (function() {
    return this.$$js$exported$prop$collisions__O()
  }),
  "enumerable": true
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CollisionResolution = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_CollisionResolution: 0
}, false, "com.benjaminrosenbaum.jovian.CollisionResolution", {
  Lcom_benjaminrosenbaum_jovian_CollisionResolution: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CollisionResolution;
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
/** @constructor */
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["CollisionResolution"] = (function(arg$1, arg$2) {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.call(this);
  var preparg$1 = arg$1;
  var preparg$2 = arg$2;
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype.init___sjs_js_Array__sjs_js_Array.call(this, preparg$1, preparg$2)
});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["CollisionResolution"].prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution.prototype;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CollisionResolution$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype.$$js$exported$meth$resolve__sjs_js_Array__D__O = (function(colliders, elasticity) {
  return this.resolve__sjs_js_Array__D__sjs_js_Array(colliders, elasticity)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype.resolve__sjs_js_Array__D__sjs_js_Array = (function(colliders, elasticity) {
  var evidence$1 = ScalaJS.m.s_reflect_ClassTag$().apply__jl_Class__s_reflect_ClassTag(ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Colliding.getClassOf());
  var result = evidence$1.newArray__I__O(ScalaJS.uI(colliders["length"]));
  var len = ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(result);
  var i = 0;
  var j = 0;
  var $$this = ScalaJS.uI(colliders["length"]);
  var $$this$1 = (($$this < len) ? $$this : len);
  var that = ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(result);
  var end = (($$this$1 < that) ? $$this$1 : that);
  while ((i < end)) {
    var jsx$2 = ScalaJS.m.sr_ScalaRunTime$();
    var jsx$1 = j;
    var index = i;
    jsx$2.array$undupdate__O__I__O__V(result, jsx$1, colliders[index]);
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  };
  var xs = ScalaJS.asArrayOf.O(result, 1);
  var this$11 = ScalaJS.m.sci_List$();
  var cbf = this$11.ReusableCBFInstance$2;
  var b = cbf.apply__scm_Builder();
  b.sizeHint__I__V(xs.u["length"]);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(new ScalaJS.c.scm_WrappedArray$ofRef().init___AO(xs));
  var x1 = this.getCollisionsAndCollidables__sci_List__D__T2(ScalaJS.as.sci_List(b.result__O()), elasticity);
  if ((x1 !== null)) {
    var collisions = ScalaJS.as.sci_List(x1.$$und1$f);
    var resultantColliders = ScalaJS.as.sc_Seq(x1.$$und2$f);
    var x$4_$_$$und1$f = collisions;
    var x$4_$_$$und2$f = resultantColliders
  } else {
    var x$4;
    throw new ScalaJS.c.s_MatchError().init___O(x1)
  };
  ScalaJS.as.sci_List(x$4_$_$$und1$f);
  var resultantColliders$2 = ScalaJS.as.sc_Seq(x$4_$_$$und2$f);
  var this$16 = ScalaJS.m.sjsr_package$();
  if (ScalaJS.is.sjs_js_ArrayOps(resultantColliders$2)) {
    var x2 = ScalaJS.as.sjs_js_ArrayOps(resultantColliders$2);
    return x2.scala$scalajs$js$ArrayOps$$array$f
  } else if (ScalaJS.is.sjs_js_WrappedArray(resultantColliders$2)) {
    var x3 = ScalaJS.as.sjs_js_WrappedArray(resultantColliders$2);
    return x3.array$6
  } else {
    var result$1 = [];
    resultantColliders$2.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, result$2) {
      return (function(x$2) {
        return ScalaJS.uI(result$2["push"](x$2))
      })
    })(this$16, result$1)));
    return result$1
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype.$$js$exported$meth$resolve$default$2__D = (function() {
  return 3.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype.getCollisionsAndCollidables__sci_List__D__T2 = (function(colliders, elasticity) {
  var cList = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver().init___sc_Seq__D(colliders, elasticity);
  return new ScalaJS.c.T2().init___O__O(cList.collisions$1, cList.resultantColliders__sc_Seq())
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype["resolve"] = (function(arg$1, arg$2) {
  var preparg$1 = arg$1;
  if ((arg$2 === (void 0))) {
    var preparg$2 = this.$$js$exported$meth$resolve$default$2__D()
  } else if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Double"
  } else {
    var preparg$2 = ScalaJS.uD(arg$2)
  };
  return this.$$js$exported$meth$resolve__sjs_js_Array__D__O(preparg$1, preparg$2)
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CollisionResolution$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_CollisionResolution$: 0
}, false, "com.benjaminrosenbaum.jovian.CollisionResolution$", {
  Lcom_benjaminrosenbaum_jovian_CollisionResolution$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CollisionResolution$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_CollisionResolution$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_CollisionResolution$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_CollisionResolution$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_CollisionResolution$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolution$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_CollisionResolution$
});
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["CollisionResolution"] = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_CollisionResolution$;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords = (function() {
  ScalaJS.c.O.call(this);
  this.x$1 = 0.0;
  this.y$1 = 0.0;
  this.epsilon$1 = 0.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Coords = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Coords.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype.plus__Lcom_benjaminrosenbaum_jovian_Coords__Lcom_benjaminrosenbaum_jovian_Coords = (function(c) {
  return this.copy__D__D__Lcom_benjaminrosenbaum_jovian_Coords((c.x__D() + this.x__D()), (c.y__D() + this.y__D()))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype.scaled__D__Lcom_benjaminrosenbaum_jovian_Coords = (function(factor) {
  return this.copy__D__D__Lcom_benjaminrosenbaum_jovian_Coords((this.x__D() * factor), (this.y__D() * factor))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype.toString__T = (function() {
  return (((("(" + this.x__D()) + ",") + this.y__D()) + ")")
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype.init___D__D = (function(x, y) {
  this.x$1 = x;
  this.y$1 = y;
  this.epsilon$1 = 1.0E-5;
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype.averageAmong__sc_Seq__Lcom_benjaminrosenbaum_jovian_Coords = (function(ps) {
  var scale = ((ps.length__I() === 0) ? 1.0 : (1.0 / ps.length__I()));
  var op = new ScalaJS.c.sjsr_AnonFunction2().init___sjs_js_Function2((function(a$2, b$2) {
    var a = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Coords(a$2);
    var b = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Coords(b$2);
    return a.plus__Lcom_benjaminrosenbaum_jovian_Coords__Lcom_benjaminrosenbaum_jovian_Coords(b)
  }));
  var sum = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Coords(ps.foldLeft__O__F2__O(this, op));
  return sum.scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(scale)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.prototype.equals__Lcom_benjaminrosenbaum_jovian_Coords__Z = (function(c) {
  var x = (this.x__D() - c.x__D());
  var x$1 = (this.y__D() - c.y__D());
  return ((((x < 0) ? (-x) : x) + ((x$1 < 0) ? (-x$1) : x$1)) < this.epsilon$1)
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Coords = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Coords)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Coords = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Coords(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Coords"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Coords = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Coords)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Coords = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Coords(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Coords;", depth))
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flee$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flee$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee$.prototype.apply__T__D__D__Lcom_benjaminrosenbaum_jovian_Flee = (function(kind, range, force) {
  ScalaJS.m.sci_List$();
  var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([kind]);
  var this$2 = ScalaJS.m.sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee().init___D__D__sc_Seq(range, force, ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf)))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Flee$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Flee$: 0
}, false, "com.benjaminrosenbaum.jovian.Flee$", {
  Lcom_benjaminrosenbaum_jovian_Flee$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Flee$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Flee$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Flee$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Flee$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Flee$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Flee$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Hunt$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Hunt$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt$.prototype.apply__T__D__D__Lcom_benjaminrosenbaum_jovian_Hunt = (function(kind, range, force) {
  ScalaJS.m.sci_List$();
  var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([kind]);
  var this$2 = ScalaJS.m.sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt().init___D__D__sc_Seq(range, force, ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf)))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Hunt$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Hunt$: 0
}, false, "com.benjaminrosenbaum.jovian.Hunt$", {
  Lcom_benjaminrosenbaum_jovian_Hunt$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Hunt$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Hunt$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Hunt$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Hunt$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Hunt$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Hunt$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_MotileFactory$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_MotileFactory$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$.prototype.$$js$exported$meth$create__T__T__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point__D__D__O = (function(id, kind, acc, vel, rawPos, energy, fertility) {
  return this.create__T__T__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point__D__D__Lcom_benjaminrosenbaum_jovian_Motile(id, kind, acc, vel, rawPos, energy, fertility)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$.prototype.create__T__T__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point__D__D__Lcom_benjaminrosenbaum_jovian_Motile = (function(id, kind, acc, vel, rawPos, energy, fertility) {
  var this$1 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Natures$();
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile().init___T__T__Lcom_benjaminrosenbaum_jovian_Nature__D__D__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point(id, kind, ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Nature(this$1.map$1.apply__O__O(kind)), energy, fertility, acc, vel, rawPos)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$.prototype["create"] = (function(arg$1, arg$2, arg$3, arg$4, arg$5, arg$6, arg$7) {
  var preparg$1 = ScalaJS.as.T(arg$1);
  var preparg$2 = ScalaJS.as.T(arg$2);
  var preparg$3 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(arg$3);
  var preparg$4 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(arg$4);
  var preparg$5 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Point(arg$5);
  if ((arg$6 === null)) {
    var preparg$6;
    throw "Found null, expected Double"
  } else {
    var preparg$6 = ScalaJS.uD(arg$6)
  };
  if ((arg$7 === null)) {
    var preparg$7;
    throw "Found null, expected Double"
  } else {
    var preparg$7 = ScalaJS.uD(arg$7)
  };
  return this.$$js$exported$meth$create__T__T__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point__D__D__O(preparg$1, preparg$2, preparg$3, preparg$4, preparg$5, preparg$6, preparg$7)
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_MotileFactory$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_MotileFactory$: 0
}, false, "com.benjaminrosenbaum.jovian.MotileFactory$", {
  Lcom_benjaminrosenbaum_jovian_MotileFactory$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_MotileFactory$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_MotileFactory$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_MotileFactory$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_MotileFactory$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_MotileFactory$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_MotileFactory$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_MotileFactory$
});
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["MotileFactory"] = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_MotileFactory$;
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Motivated = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Motivated)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Motivated(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Motivated"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Motivated = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Motivated)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Motivated = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Motivated(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Motivated;", depth))
});
ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Motivation$class__butOnlyWithin__Lcom_benjaminrosenbaum_jovian_Motivation__D__D__Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation = (function($$this, top, bottom) {
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Span($$this, new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span().init___D__D(top, bottom))
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Natures$ = (function() {
  ScalaJS.c.O.call(this);
  this.playerSize$1 = 0.0;
  this.map$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Natures$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Natures$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Natures$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Natures$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Natures$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Natures$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Natures$.prototype.init___ = (function() {
  ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Natures$ = this;
  this.playerSize$1 = 22.0;
  var x$4 = this.playerSize$1;
  var x$5 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(5.0, 2.0, 0.2);
  var x$6 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(100.0, 0.0, 0.02);
  ScalaJS.m.sci_List$();
  var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Flutterbye", "Ralava", "Frillist", "Kledge"]);
  var this$4 = ScalaJS.m.sci_List$();
  var cbf = this$4.ReusableCBFInstance$2;
  var y = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf));
  var array = [new ScalaJS.c.T2().init___O__O("eats", y)];
  var this$7 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  matchEnd4: {
    var i = 0;
    var len = ScalaJS.uI(array["length"]);
    while ((i < len)) {
      var index = i;
      var arg1 = array[index];
      this$7.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(arg1));
      i = ((1 + i) | 0)
    };
    break matchEnd4
  };
  var x$7 = ScalaJS.as.sci_Map(this$7.elems$1);
  var x$8 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.0, 0.0);
  var x$9 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence().init___();
  var y$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(x$4, x$5, x$6, x$8, x$9, x$7);
  var jsx$8 = new ScalaJS.c.T2().init___O__O("Beast", y$1);
  var x$14 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(1.0, 1.0, 0.013);
  var x$15 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.015, 55.0);
  var x$16 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(3.0, 2.0, 0.02);
  var x$17 = ScalaJS.as.sci_Map(ScalaJS.m.s_Predef$().Map$2.apply__sc_Seq__sc_GenMap(ScalaJS.m.sci_Nil$()));
  var this$14 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$().apply__D__D__D__Lcom_benjaminrosenbaum_jovian_CohereWithFlock(500.0, 0.09, 10.0);
  var kinds = ScalaJS.m.sci_Nil$();
  var mo = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock().init___D__D__sc_Seq(30.0, 0.2, kinds);
  var this$17 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$14, mo);
  var mo$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin().init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality(100.0, 800.0, 1.0, ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$().Vertical$1);
  var x$18 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$17, mo$1);
  var y$2 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(8.0, x$14, x$16, x$15, x$18, x$17);
  var jsx$7 = new ScalaJS.c.T2().init___O__O("Flutterbye", y$2);
  var x$23 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(0.5, 0.5, 0.03);
  var x$24 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.05, 4.0);
  var x$25 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(150.0, 5.0, 0.1);
  ScalaJS.m.sci_List$();
  var xs$1 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Flutterbye"]);
  var this$22 = ScalaJS.m.sci_List$();
  var cbf$1 = this$22.ReusableCBFInstance$2;
  var y$3 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$1, cbf$1));
  var array$1 = [new ScalaJS.c.T2().init___O__O("eats", y$3)];
  var this$25 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  matchEnd4$1: {
    var i$1 = 0;
    var len$1 = ScalaJS.uI(array$1["length"]);
    while ((i$1 < len$1)) {
      var index$1 = i$1;
      var arg1$1 = array$1[index$1];
      this$25.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(arg1$1));
      i$1 = ((1 + i$1) | 0)
    };
    break matchEnd4$1
  };
  var x$26 = ScalaJS.as.sci_Map(this$25.elems$1);
  var this$28 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin().init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality(100.0, 500.0, 1.0, ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$().Vertical$1);
  var mo$2 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_CohereWithFlock$().apply__D__D__D__Lcom_benjaminrosenbaum_jovian_CohereWithFlock(800.0, 0.2, 25.0);
  var this$31 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$28, mo$2);
  var kinds$1 = ScalaJS.m.sci_Nil$();
  var mo$3 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock().init___D__D__sc_Seq(30.0, 0.3, kinds$1);
  var this$34 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$31, mo$3);
  var kinds$2 = ScalaJS.m.sci_Nil$();
  var mo$4 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock().init___D__D__sc_Seq(150.0, 0.5, kinds$2);
  var x$27 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$34, mo$4);
  var y$4 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(16.0, x$23, x$25, x$24, x$27, x$26);
  var jsx$6 = new ScalaJS.c.T2().init___O__O("Bumbler", y$4);
  var x$32 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(0.1, 0.1, 0.01);
  var x$33 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.005, 10.0);
  var x$34 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(20.0, 100.0, 0.02);
  ScalaJS.m.sci_List$();
  var xs$2 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Viprish"]);
  var this$39 = ScalaJS.m.sci_List$();
  var cbf$2 = this$39.ReusableCBFInstance$2;
  var y$5 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$2, cbf$2));
  var array$2 = [new ScalaJS.c.T2().init___O__O("eats", y$5)];
  var this$42 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  matchEnd4$2: {
    var i$2 = 0;
    var len$2 = ScalaJS.uI(array$2["length"]);
    while ((i$2 < len$2)) {
      var index$2 = i$2;
      var arg1$2 = array$2[index$2];
      this$42.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(arg1$2));
      i$2 = ((1 + i$2) | 0)
    };
    break matchEnd4$2
  };
  var x$35 = ScalaJS.as.sci_Map(this$42.elems$1);
  var this$46 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock().init___D__D__sc_Seq__s_Option(1800.0, 0.3, ScalaJS.m.sci_Nil$(), ScalaJS.m.s_None$());
  var kinds$3 = ScalaJS.m.sci_Nil$();
  var mo$5 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock().init___D__D__sc_Seq(800.0, 0.5, kinds$3);
  var x$36 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$46, mo$5);
  var y$6 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(32.0, x$32, x$34, x$33, x$36, x$35);
  var jsx$5 = new ScalaJS.c.T2().init___O__O("Willicker", y$6);
  var x$38 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(2.0, 3.0, 0.3);
  var x$39 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.005, 2.0);
  var x$40 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(20.0, 10.0, 0.0);
  ScalaJS.m.sci_List$();
  var xs$3 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Beast"]);
  var this$51 = ScalaJS.m.sci_List$();
  var cbf$3 = this$51.ReusableCBFInstance$2;
  var y$7 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$3, cbf$3));
  var array$3 = [new ScalaJS.c.T2().init___O__O("eats", y$7)];
  var this$54 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  matchEnd4$3: {
    var i$3 = 0;
    var len$3 = ScalaJS.uI(array$3["length"]);
    while ((i$3 < len$3)) {
      var index$3 = i$3;
      var arg1$3 = array$3[index$3];
      this$54.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(arg1$3));
      i$3 = ((1 + i$3) | 0)
    };
    break matchEnd4$3
  };
  var x$41 = ScalaJS.as.sci_Map(this$54.elems$1);
  var this$55 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Hunt$().apply__T__D__D__Lcom_benjaminrosenbaum_jovian_Hunt("Beast", 1000.0, 0.5);
  var this$58 = ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Motivation$class__butOnlyWithin__Lcom_benjaminrosenbaum_jovian_Motivation__D__D__Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation(this$55, 150.0, 1200.0);
  var mo$6 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin().init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality(200.0, 1000.0, 1.0, ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$().Vertical$1);
  var x$42 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$58, mo$6);
  var y$8 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(25.0, x$38, x$40, x$39, x$42, x$41);
  var jsx$4 = new ScalaJS.c.T2().init___O__O("Viprish", y$8);
  var x$55 = this.playerSize$1;
  var x$56 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(5.8, 2.0, 0.05);
  var x$57 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.05, 4.0);
  var x$58 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(40.0, 20.0, 0.01);
  ScalaJS.m.sci_List$();
  var xs$4 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Bumbler", "Beast", "Frillist"]);
  var this$63 = ScalaJS.m.sci_List$();
  var cbf$4 = this$63.ReusableCBFInstance$2;
  var y$9 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$4, cbf$4));
  var array$4 = [new ScalaJS.c.T2().init___O__O("eats", y$9)];
  var this$66 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  matchEnd4$4: {
    var i$4 = 0;
    var len$4 = ScalaJS.uI(array$4["length"]);
    while ((i$4 < len$4)) {
      var index$4 = i$4;
      var arg1$4 = array$4[index$4];
      this$66.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(arg1$4));
      i$4 = ((1 + i$4) | 0)
    };
    break matchEnd4$4
  };
  var x$59 = ScalaJS.as.sci_Map(this$66.elems$1);
  ScalaJS.m.sci_List$();
  var xs$5 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Beast"]);
  var this$68 = ScalaJS.m.sci_List$();
  var cbf$5 = this$68.ReusableCBFInstance$2;
  var x$46 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$5, cbf$5));
  var this$70 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt().init___D__D__sc_Seq(500.0, 0.8, x$46);
  var this$71 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Z(this$70, true);
  var this$72 = ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Motivation$class__butOnlyWithin__Lcom_benjaminrosenbaum_jovian_Motivation__D__D__Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation(this$71, 800.0, 1200.0);
  var mo$7 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Flee$().apply__T__D__D__Lcom_benjaminrosenbaum_jovian_Flee("Beast", 50.0, 0.3);
  var this$73 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$72, mo$7);
  var this$76 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Z(this$73, false);
  var mo$8 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin().init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality(800.0, 1500.0, 1.0, ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$().Vertical$1);
  var this$80 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$76, mo$8);
  ScalaJS.m.sci_List$();
  var xs$6 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Bumbler", "Frillist"]);
  var this$78 = ScalaJS.m.sci_List$();
  var cbf$6 = this$78.ReusableCBFInstance$2;
  var x$52 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$6, cbf$6));
  var mo$9 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt().init___D__D__sc_Seq(400.0, 0.3, x$52);
  var this$81 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$80, mo$9);
  var this$84 = ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Motivation$class__butOnlyWithin__Lcom_benjaminrosenbaum_jovian_Motivation__D__D__Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation(this$81, 800.0, 1200.0);
  var kinds$4 = ScalaJS.m.sci_Nil$();
  var mo$10 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock().init___D__D__sc_Seq(800.0, 0.5, kinds$4);
  var x$60 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$84, mo$10);
  var y$10 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(x$55, x$56, x$58, x$57, x$60, x$59);
  var jsx$3 = new ScalaJS.c.T2().init___O__O("Ralava", y$10);
  var x$65 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(4.2, 1.9, 0.1);
  var x$66 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.005, 4.0);
  var x$67 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(10.0, 35.0, 0.03);
  ScalaJS.m.sci_List$();
  var xs$7 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Flutterbye", "Bumbler"]);
  var this$89 = ScalaJS.m.sci_List$();
  var cbf$7 = this$89.ReusableCBFInstance$2;
  var y$11 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$7, cbf$7));
  var array$5 = [new ScalaJS.c.T2().init___O__O("eats", y$11)];
  var this$92 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  matchEnd4$5: {
    var i$5 = 0;
    var len$5 = ScalaJS.uI(array$5["length"]);
    while ((i$5 < len$5)) {
      var index$5 = i$5;
      var arg1$5 = array$5[index$5];
      this$92.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(arg1$5));
      i$5 = ((1 + i$5) | 0)
    };
    break matchEnd4$5
  };
  var x$68 = ScalaJS.as.sci_Map(this$92.elems$1);
  var this$95 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin().init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality(750.0, 1500.0, 1.0, ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$().Vertical$1);
  var mo$11 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Hunt$().apply__T__D__D__Lcom_benjaminrosenbaum_jovian_Hunt("Flutterbye", 25.0, 1.5);
  var this$99 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$95, mo$11);
  ScalaJS.m.sci_List$();
  var xs$8 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Beast", "Ralava", "Frillist", "Bumbler"]);
  var this$97 = ScalaJS.m.sci_List$();
  var cbf$8 = this$97.ReusableCBFInstance$2;
  var kinds$5 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$8, cbf$8));
  var mo$12 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee().init___D__D__sc_Seq(60.0, 1.8, kinds$5);
  var this$103 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$99, mo$12);
  ScalaJS.m.sci_List$();
  var xs$9 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Bumbler"]);
  var this$101 = ScalaJS.m.sci_List$();
  var cbf$9 = this$101.ReusableCBFInstance$2;
  var kinds$6 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$9, cbf$9));
  var mo$13 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock().init___D__D__sc_Seq__s_Option(400.0, 0.2, kinds$6, ScalaJS.m.s_None$());
  var this$106 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$103, mo$13);
  var kinds$7 = ScalaJS.m.sci_Nil$();
  var mo$14 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock().init___D__D__sc_Seq(200.0, 0.3, kinds$7);
  var this$107 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$106, mo$14);
  var mo$15 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_AvoidHorizontalPlaneEdges$().apply__D__D__Lcom_benjaminrosenbaum_jovian_StayWithin(80.0, 2.0);
  var x$69 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$107, mo$15);
  var y$12 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(20.0, x$65, x$67, x$66, x$69, x$68);
  var jsx$2 = new ScalaJS.c.T2().init___O__O("Frillist", y$12);
  var x$74 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(0.3, 0.1, 0.2);
  var x$75 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.05, 10.0);
  var x$76 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(200.0, 1.0, 0.02);
  var x$77 = ScalaJS.as.sci_Map(ScalaJS.m.s_Predef$().Map$2.apply__sc_Seq__sc_GenMap(ScalaJS.m.sci_Nil$()));
  var this$113 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin().init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality(900.0, 950.0, 1.0, ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$().Vertical$1);
  var mo$16 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock().init___D__D__sc_Seq__s_Option(800.0, 0.5, ScalaJS.m.sci_Nil$(), ScalaJS.m.s_None$());
  var this$116 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$113, mo$16);
  var kinds$8 = ScalaJS.m.sci_Nil$();
  var mo$17 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock().init___D__D__sc_Seq(1800.0, 0.3, kinds$8);
  var x$78 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$116, mo$17);
  var y$13 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(62.0, x$74, x$76, x$75, x$78, x$77);
  var jsx$1 = new ScalaJS.c.T2().init___O__O("Kledge", y$13);
  var x$80 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics().init___D__D__D(6.0, 3.8, 0.1);
  var x$81 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning().init___D__D(0.01, 4.0);
  var x$82 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life().init___D__D__D(40.0, 10.0, 0.0);
  ScalaJS.m.sci_List$();
  var xs$10 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Beast"]);
  var this$121 = ScalaJS.m.sci_List$();
  var cbf$10 = this$121.ReusableCBFInstance$2;
  var y$14 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$10, cbf$10));
  var array$6 = [new ScalaJS.c.T2().init___O__O("eats", y$14)];
  var this$124 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  matchEnd4$6: {
    var i$6 = 0;
    var len$6 = ScalaJS.uI(array$6["length"]);
    while ((i$6 < len$6)) {
      var index$6 = i$6;
      var arg1$6 = array$6[index$6];
      this$124.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(arg1$6));
      i$6 = ((1 + i$6) | 0)
    };
    break matchEnd4$6
  };
  var x$83 = ScalaJS.as.sci_Map(this$124.elems$1);
  var this$125 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Hunt$().apply__T__D__D__Lcom_benjaminrosenbaum_jovian_Hunt("Beast", 1000.0, 0.5);
  var this$128 = ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Motivation$class__butOnlyWithin__Lcom_benjaminrosenbaum_jovian_Motivation__D__D__Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation(this$125, 1200.0, 5000.0);
  var mo$18 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin().init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality(1200.0, 5000.0, 1.0, ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$().Vertical$1);
  var x$84 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation().init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation(this$128, mo$18);
  var y$15 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature().init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map(23.0, x$80, x$82, x$81, x$84, x$83);
  var array$7 = [jsx$8, jsx$7, jsx$6, jsx$5, jsx$4, jsx$3, jsx$2, jsx$1, new ScalaJS.c.T2().init___O__O("Devastroph", y$15)];
  var this$131 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  matchEnd4$7: {
    var i$7 = 0;
    var len$7 = ScalaJS.uI(array$7["length"]);
    while ((i$7 < len$7)) {
      var index$7 = i$7;
      var arg1$7 = array$7[index$7];
      this$131.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(arg1$7));
      i$7 = ((1 + i$7) | 0)
    };
    break matchEnd4$7
  };
  this.map$1 = ScalaJS.as.sci_Map(this$131.elems$1);
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Natures$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Natures$: 0
}, false, "com.benjaminrosenbaum.jovian.Natures$", {
  Lcom_benjaminrosenbaum_jovian_Natures$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Natures$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Natures$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Natures$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Natures$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Natures$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Natures$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Natures$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Natures$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$ = (function() {
  ScalaJS.c.O.call(this);
  this.Width$1 = 0;
  this.Height$1 = 0;
  this.Buffer$1 = 0;
  this.XSpan$1 = null;
  this.YSpan$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Plane$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Plane$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$.prototype.init___ = (function() {
  ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Plane$ = this;
  this.Width$1 = 1500;
  this.Height$1 = 1800;
  this.Buffer$1 = 30;
  this.XSpan$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span().init___D__D(0.0, this.Width$1);
  this.YSpan$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span().init___D__D(0.0, this.Height$1);
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$.prototype.intoBottom__D__D = (function(y) {
  var y$1 = (this.Buffer$1 - (this.Height$1 - y));
  return (((0.0 > y$1) ? 0.0 : y$1) / this.Buffer$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$.prototype.intoLeft__D__D = (function(x) {
  var y = (this.Buffer$1 - x);
  return (((0.0 > y) ? 0.0 : y) / this.Buffer$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$.prototype.intoRight__D__D = (function(x) {
  var y = (this.Buffer$1 - (this.Width$1 - x));
  return (((0.0 > y) ? 0.0 : y) / this.Buffer$1)
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Plane$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Plane$: 0
}, false, "com.benjaminrosenbaum.jovian.Plane$", {
  Lcom_benjaminrosenbaum_jovian_Plane$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Plane$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Plane$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Plane$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Plane$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Plane$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Plane$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point$ = (function() {
  ScalaJS.c.O.call(this);
  this.ORIGIN$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Point$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Point$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point$.prototype.init___ = (function() {
  ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Point$ = this;
  this.ORIGIN$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point().init___D__D(0.0, 0.0);
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Point$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Point$: 0
}, false, "com.benjaminrosenbaum.jovian.Point$", {
  Lcom_benjaminrosenbaum_jovian_Point$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Point$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Point$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Point$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Point$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Point$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Point$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Position$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Position$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Position$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Position$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Position$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Position$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Position$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Position$.prototype.centerOf__sc_Seq__Lcom_benjaminrosenbaum_jovian_Point = (function(ps) {
  var this$2 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Point$();
  var jsx$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(p$2) {
    var p = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Position(p$2);
    return p.pos__Lcom_benjaminrosenbaum_jovian_Point()
  }));
  var this$1 = ScalaJS.m.sc_Seq$();
  var ps$1 = ScalaJS.as.sc_Seq(ps.map__F1__scg_CanBuildFrom__O(jsx$1, this$1.ReusableCBFInstance$2));
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Point(this$2.ORIGIN$1.averageAmong__sc_Seq__Lcom_benjaminrosenbaum_jovian_Coords(ps$1))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Position$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Position$: 0
}, false, "com.benjaminrosenbaum.jovian.Position$", {
  Lcom_benjaminrosenbaum_jovian_Position$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Position$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Position$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Position$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Position$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Position$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Position$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Position$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Position$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span = (function() {
  ScalaJS.c.O.call(this);
  this.lower$1 = 0.0;
  this.higher$1 = 0.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Span = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Span.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype.contains__Lcom_benjaminrosenbaum_jovian_Span__Z = (function(s) {
  return (this.contains__D__Z(s.lower$1) || this.contains__D__Z(s.higher$1))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype.toString__T = (function() {
  return ((this.lower$1 + " -> ") + this.higher$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype.contains__D__Z = (function(d) {
  return ((d >= this.lower$1) && (d <= this.higher$1))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype.init___D__D = (function(lower, higher) {
  this.lower$1 = lower;
  this.higher$1 = higher;
  ScalaJS.m.s_Predef$().assert__Z__V((lower <= higher));
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype.intersects__Lcom_benjaminrosenbaum_jovian_Span__Z = (function(s) {
  return (this.contains__Lcom_benjaminrosenbaum_jovian_Span__Z(s) || s.contains__Lcom_benjaminrosenbaum_jovian_Span__Z(this))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Span = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Span: 0
}, false, "com.benjaminrosenbaum.jovian.Span", {
  Lcom_benjaminrosenbaum_jovian_Span: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Span;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square = (function() {
  ScalaJS.c.O.call(this);
  this.center$1 = null;
  this.side$1 = 0.0;
  this.top$1 = 0.0;
  this.left$1 = 0.0;
  this.bottom$1 = 0.0;
  this.right$1 = 0.0;
  this.xSpan$1 = null;
  this.ySpan$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Square = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Square.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.$$js$exported$prop$top__O = (function() {
  return this.top$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.$$js$exported$prop$left__O = (function() {
  return this.left$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.$$js$exported$prop$bottom__O = (function() {
  return this.bottom$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.toString__T = (function() {
  return new ScalaJS.c.s_StringContext().init___sc_Seq(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["(", ",", ")-(", ",", ")"])).s__sc_Seq__T(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.left$1, this.bottom$1, this.right$1, this.top$1]))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.manhattanDistTo__Lcom_benjaminrosenbaum_jovian_Square__D = (function(s) {
  return this.center$1.to__Lcom_benjaminrosenbaum_jovian_Position__Lcom_benjaminrosenbaum_jovian_Vector(s.center$1).manhattanDist__D()
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.intersects__Lcom_benjaminrosenbaum_jovian_Square__Z = (function(s) {
  return (this.xSpan$1.intersects__Lcom_benjaminrosenbaum_jovian_Span__Z(s.xSpan$1) && this.ySpan$1.intersects__Lcom_benjaminrosenbaum_jovian_Span__Z(s.ySpan$1))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.$$js$exported$prop$right__O = (function() {
  return this.right$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.init___Lcom_benjaminrosenbaum_jovian_Point__D = (function(center, side) {
  this.center$1 = center;
  this.side$1 = side;
  this.top$1 = (center.y$1 + (side / 2));
  this.left$1 = (center.x$1 - (side / 2));
  this.bottom$1 = (center.y$1 - (side / 2));
  this.right$1 = (center.x$1 + (side / 2));
  this.xSpan$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span().init___D__D(this.left$1, this.right$1);
  this.ySpan$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Span().init___D__D(this.bottom$1, this.top$1);
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.$$js$exported$prop$center__O = (function() {
  return this.center$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.$$js$exported$prop$side__O = (function() {
  return this.side$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.depthOfPenetration__Lcom_benjaminrosenbaum_jovian_Square__D = (function(s) {
  var d = this.manhattanDistTo__Lcom_benjaminrosenbaum_jovian_Square__D(s);
  return ((d === 0) ? 0.0 : ((this.side$1 + s.side$1) / d))
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype, "center", {
  "get": (function() {
    return this.$$js$exported$prop$center__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype, "side", {
  "get": (function() {
    return this.$$js$exported$prop$side__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype, "top", {
  "get": (function() {
    return this.$$js$exported$prop$top__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype, "left", {
  "get": (function() {
    return this.$$js$exported$prop$left__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype, "bottom", {
  "get": (function() {
    return this.$$js$exported$prop$bottom__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype, "right", {
  "get": (function() {
    return this.$$js$exported$prop$right__O()
  }),
  "enumerable": true
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Square = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Square: 0
}, false, "com.benjaminrosenbaum.jovian.Square", {
  Lcom_benjaminrosenbaum_jovian_Square: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Square;
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
/** @constructor */
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Square"] = (function(arg$1, arg$2) {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.call(this);
  var preparg$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Point(arg$1);
  if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Double"
  } else {
    var preparg$2 = ScalaJS.uD(arg$2)
  };
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype.init___Lcom_benjaminrosenbaum_jovian_Point__D.call(this, preparg$1, preparg$2)
});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Square"].prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square.prototype;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine = (function() {
  ScalaJS.c.O.call(this);
  this.motiles$1 = null;
  this.wind$1 = null;
  this.elasticity$1 = 0.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_TimeEngine = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_TimeEngine.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine.prototype.step__sc_Seq = (function() {
  var x1 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_CollisionResolution$().getCollisionsAndCollidables__sci_List__D__T2(this.motiles$1, this.elasticity$1);
  if ((x1 !== null)) {
    var collisions = ScalaJS.as.sci_List(x1.$$und1$f);
    var resultantColliders = ScalaJS.as.sc_Seq(x1.$$und2$f);
    var x$1_$_$$und1$f = collisions;
    var x$1_$_$$und2$f = resultantColliders
  } else {
    var x$1;
    throw new ScalaJS.c.s_MatchError().init___O(x1)
  };
  ScalaJS.as.sci_List(x$1_$_$$und1$f);
  var resultantColliders$2 = ScalaJS.as.sc_Seq(x$1_$_$$und2$f);
  var jsx$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(c$2) {
    var c = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(c$2);
    return c.asMotile$1
  }));
  var this$1 = ScalaJS.m.sc_Seq$();
  var resultantMotiles = ScalaJS.as.sc_Seq(resultantColliders$2.map__F1__scg_CanBuildFrom__O(jsx$1, this$1.ReusableCBFInstance$2));
  var jsx$2 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer, resultantMotiles$1) {
    return (function(m$2) {
      var m = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motile(m$2);
      return m.motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Motile(resultantMotiles$1).inEnvironment__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile(arg$outer.wind$1).step__Lcom_benjaminrosenbaum_jovian_Motile()
    })
  })(this, resultantMotiles));
  var this$2 = ScalaJS.m.sc_Seq$();
  return ScalaJS.as.sc_Seq(resultantMotiles.map__F1__scg_CanBuildFrom__O(jsx$2, this$2.ReusableCBFInstance$2))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine.prototype.init___sci_List__Lcom_benjaminrosenbaum_jovian_Vector__D = (function(motiles, wind, elasticity) {
  this.motiles$1 = motiles;
  this.wind$1 = wind;
  this.elasticity$1 = elasticity;
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_TimeEngine = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_TimeEngine: 0
}, false, "com.benjaminrosenbaum.jovian.TimeEngine", {
  Lcom_benjaminrosenbaum_jovian_TimeEngine: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_TimeEngine;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_TimeEngine$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype.$$js$exported$meth$step$default$3__D = (function() {
  return 3.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype.$$js$exported$meth$step__sjs_js_Array__Lcom_benjaminrosenbaum_jovian_Vector__D__O = (function(motiles, wind, elasticity) {
  return this.step__sjs_js_Array__Lcom_benjaminrosenbaum_jovian_Vector__D__sjs_js_Array(motiles, wind, elasticity)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype.step__sjs_js_Array__Lcom_benjaminrosenbaum_jovian_Vector__D__sjs_js_Array = (function(motiles, wind, elasticity) {
  var evidence$1 = ScalaJS.m.s_reflect_ClassTag$().apply__jl_Class__s_reflect_ClassTag(ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Motile.getClassOf());
  var result = evidence$1.newArray__I__O(ScalaJS.uI(motiles["length"]));
  var len = ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(result);
  var i = 0;
  var j = 0;
  var $$this = ScalaJS.uI(motiles["length"]);
  var $$this$1 = (($$this < len) ? $$this : len);
  var that = ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(result);
  var end = (($$this$1 < that) ? $$this$1 : that);
  while ((i < end)) {
    var jsx$2 = ScalaJS.m.sr_ScalaRunTime$();
    var jsx$1 = j;
    var index = i;
    jsx$2.array$undupdate__O__I__O__V(result, jsx$1, motiles[index]);
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  };
  var xs = ScalaJS.asArrayOf.O(result, 1);
  var this$11 = ScalaJS.m.sci_List$();
  var cbf = this$11.ReusableCBFInstance$2;
  var b = cbf.apply__scm_Builder();
  b.sizeHint__I__V(xs.u["length"]);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(new ScalaJS.c.scm_WrappedArray$ofRef().init___AO(xs));
  var t = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine().init___sci_List__Lcom_benjaminrosenbaum_jovian_Vector__D(ScalaJS.as.sci_List(b.result__O()), wind, elasticity);
  var $$this$2 = t.step__sc_Seq();
  var this$16 = ScalaJS.m.sjsr_package$();
  if (ScalaJS.is.sjs_js_ArrayOps($$this$2)) {
    var x2 = ScalaJS.as.sjs_js_ArrayOps($$this$2);
    return x2.scala$scalajs$js$ArrayOps$$array$f
  } else if (ScalaJS.is.sjs_js_WrappedArray($$this$2)) {
    var x3 = ScalaJS.as.sjs_js_WrappedArray($$this$2);
    return x3.array$6
  } else {
    var result$1 = [];
    $$this$2.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, result$2) {
      return (function(x$2) {
        return ScalaJS.uI(result$2["push"](x$2))
      })
    })(this$16, result$1)));
    return result$1
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype["step"] = (function(arg$1, arg$2, arg$3) {
  var preparg$1 = arg$1;
  var preparg$2 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(arg$2);
  if ((arg$3 === (void 0))) {
    var preparg$3 = this.$$js$exported$meth$step$default$3__D()
  } else if ((arg$3 === null)) {
    var preparg$3;
    throw "Found null, expected Double"
  } else {
    var preparg$3 = ScalaJS.uD(arg$3)
  };
  return this.$$js$exported$meth$step__sjs_js_Array__Lcom_benjaminrosenbaum_jovian_Vector__D__O(preparg$1, preparg$2, preparg$3)
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_TimeEngine$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_TimeEngine$: 0
}, false, "com.benjaminrosenbaum.jovian.TimeEngine$", {
  Lcom_benjaminrosenbaum_jovian_TimeEngine$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_TimeEngine$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_TimeEngine$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_TimeEngine$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_TimeEngine$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_TimeEngine$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TimeEngine$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_TimeEngine$
});
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["TimeEngine"] = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_TimeEngine$;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector$ = (function() {
  ScalaJS.c.O.call(this);
  this.NULL$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Vector$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Vector$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector$.prototype.init___ = (function() {
  ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Vector$ = this;
  this.NULL$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector().init___D__D(0.0, 0.0);
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Vector$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Vector$: 0
}, false, "com.benjaminrosenbaum.jovian.Vector$", {
  Lcom_benjaminrosenbaum_jovian_Vector$: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Vector$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Vector$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Vector$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Vector$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Vector$
});
/** @constructor */
ScalaJS.c.jl_Class = (function() {
  ScalaJS.c.O.call(this);
  this.data$1 = null
});
ScalaJS.c.jl_Class.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Class.prototype.constructor = ScalaJS.c.jl_Class;
/** @constructor */
ScalaJS.h.jl_Class = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Class.prototype = ScalaJS.c.jl_Class.prototype;
ScalaJS.c.jl_Class.prototype.getName__T = (function() {
  return ScalaJS.as.T(this.data$1["name"])
});
ScalaJS.c.jl_Class.prototype.getComponentType__jl_Class = (function() {
  return ScalaJS.as.jl_Class(this.data$1["getComponentType"]())
});
ScalaJS.c.jl_Class.prototype.isPrimitive__Z = (function() {
  return ScalaJS.uZ(this.data$1["isPrimitive"])
});
ScalaJS.c.jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
ScalaJS.c.jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === ScalaJS.d.S.getClassOf()) ? (that === ScalaJS.d.B.getClassOf()) : ((this === ScalaJS.d.I.getClassOf()) ? ((that === ScalaJS.d.B.getClassOf()) || (that === ScalaJS.d.S.getClassOf())) : ((this === ScalaJS.d.F.getClassOf()) ? (((that === ScalaJS.d.B.getClassOf()) || (that === ScalaJS.d.S.getClassOf())) || (that === ScalaJS.d.I.getClassOf())) : ((this === ScalaJS.d.D.getClassOf()) && ((((that === ScalaJS.d.B.getClassOf()) || (that === ScalaJS.d.S.getClassOf())) || (that === ScalaJS.d.I.getClassOf())) || (that === ScalaJS.d.F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
ScalaJS.c.jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return ScalaJS.uZ(this.data$1["isInstance"](obj))
});
ScalaJS.c.jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
ScalaJS.c.jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1["getFakeInstance"]()
});
ScalaJS.c.jl_Class.prototype.newArrayOfThisClass__sjs_js_Array__O = (function(dimensions) {
  return this.data$1["newArrayOfThisClass"](dimensions)
});
ScalaJS.c.jl_Class.prototype.isArray__Z = (function() {
  return ScalaJS.uZ(this.data$1["isArrayClass"])
});
ScalaJS.c.jl_Class.prototype.isInterface__Z = (function() {
  return ScalaJS.uZ(this.data$1["isInterface"])
});
ScalaJS.is.jl_Class = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Class)))
});
ScalaJS.as.jl_Class = (function(obj) {
  return ((ScalaJS.is.jl_Class(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Class"))
});
ScalaJS.isArrayOf.jl_Class = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Class)))
});
ScalaJS.asArrayOf.jl_Class = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Class(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Class;", depth))
});
ScalaJS.d.jl_Class = new ScalaJS.ClassTypeData({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
ScalaJS.c.jl_Class.prototype.$classData = ScalaJS.d.jl_Class;
/** @constructor */
ScalaJS.c.jl_Double$ = (function() {
  ScalaJS.c.O.call(this);
  this.TYPE$1 = null;
  this.POSITIVE$undINFINITY$1 = 0.0;
  this.NEGATIVE$undINFINITY$1 = 0.0;
  this.NaN$1 = 0.0;
  this.MAX$undVALUE$1 = 0.0;
  this.MIN$undVALUE$1 = 0.0;
  this.MAX$undEXPONENT$1 = 0;
  this.MIN$undEXPONENT$1 = 0;
  this.SIZE$1 = 0;
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
});
ScalaJS.c.jl_Double$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Double$.prototype.constructor = ScalaJS.c.jl_Double$;
/** @constructor */
ScalaJS.h.jl_Double$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Double$.prototype = ScalaJS.c.jl_Double$.prototype;
ScalaJS.c.jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
ScalaJS.d.jl_Double$ = new ScalaJS.ClassTypeData({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1
});
ScalaJS.c.jl_Double$.prototype.$classData = ScalaJS.d.jl_Double$;
ScalaJS.n.jl_Double$ = (void 0);
ScalaJS.m.jl_Double$ = (function() {
  if ((!ScalaJS.n.jl_Double$)) {
    ScalaJS.n.jl_Double$ = new ScalaJS.c.jl_Double$().init___()
  };
  return ScalaJS.n.jl_Double$
});
/** @constructor */
ScalaJS.c.jl_Integer$ = (function() {
  ScalaJS.c.O.call(this);
  this.TYPE$1 = null;
  this.MIN$undVALUE$1 = 0;
  this.MAX$undVALUE$1 = 0;
  this.SIZE$1 = 0
});
ScalaJS.c.jl_Integer$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Integer$.prototype.constructor = ScalaJS.c.jl_Integer$;
/** @constructor */
ScalaJS.h.jl_Integer$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Integer$.prototype = ScalaJS.c.jl_Integer$.prototype;
ScalaJS.c.jl_Integer$.prototype.rotateLeft__I__I__I = (function(i, distance) {
  return ((i << distance) | ((i >>> ((-distance) | 0)) | 0))
});
ScalaJS.c.jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return (ScalaJS.imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
ScalaJS.c.jl_Integer$.prototype.reverseBytes__I__I = (function(i) {
  var byte3 = ((i >>> 24) | 0);
  var byte2 = (65280 & ((i >>> 8) | 0));
  var byte1 = (16711680 & (i << 8));
  var byte0 = (i << 24);
  return (((byte0 | byte1) | byte2) | byte3)
});
ScalaJS.c.jl_Integer$.prototype.numberOfLeadingZeros__I__I = (function(i) {
  var x = i;
  x = (x | ((x >>> 1) | 0));
  x = (x | ((x >>> 2) | 0));
  x = (x | ((x >>> 4) | 0));
  x = (x | ((x >>> 8) | 0));
  x = (x | ((x >>> 16) | 0));
  return ((32 - this.bitCount__I__I(x)) | 0)
});
ScalaJS.c.jl_Integer$.prototype.numberOfTrailingZeros__I__I = (function(i) {
  return this.bitCount__I__I((((-1) + (i & ((-i) | 0))) | 0))
});
ScalaJS.d.jl_Integer$ = new ScalaJS.ClassTypeData({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1
});
ScalaJS.c.jl_Integer$.prototype.$classData = ScalaJS.d.jl_Integer$;
ScalaJS.n.jl_Integer$ = (void 0);
ScalaJS.m.jl_Integer$ = (function() {
  if ((!ScalaJS.n.jl_Integer$)) {
    ScalaJS.n.jl_Integer$ = new ScalaJS.c.jl_Integer$().init___()
  };
  return ScalaJS.n.jl_Integer$
});
/** @constructor */
ScalaJS.c.jl_Number = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.jl_Number.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Number.prototype.constructor = ScalaJS.c.jl_Number;
/** @constructor */
ScalaJS.h.jl_Number = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Number.prototype = ScalaJS.c.jl_Number.prototype;
ScalaJS.is.jl_Number = (function(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
});
ScalaJS.as.jl_Number = (function(obj) {
  return ((ScalaJS.is.jl_Number(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Number"))
});
ScalaJS.isArrayOf.jl_Number = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
});
ScalaJS.asArrayOf.jl_Number = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Number(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Number;", depth))
});
/** @constructor */
ScalaJS.c.jl_System$ = (function() {
  ScalaJS.c.O.call(this);
  this.out$1 = null;
  this.err$1 = null;
  this.in$1 = null;
  this.getHighPrecisionTime$1 = null
});
ScalaJS.c.jl_System$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_System$.prototype.constructor = ScalaJS.c.jl_System$;
/** @constructor */
ScalaJS.h.jl_System$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_System$.prototype = ScalaJS.c.jl_System$.prototype;
ScalaJS.c.jl_System$.prototype.init___ = (function() {
  ScalaJS.n.jl_System$ = this;
  this.out$1 = new ScalaJS.c.jl_JSConsoleBasedPrintStream().init___jl_Boolean(false);
  this.err$1 = new ScalaJS.c.jl_JSConsoleBasedPrintStream().init___jl_Boolean(true);
  this.in$1 = null;
  var x = ScalaJS.g["performance"];
  if (ScalaJS.uZ((!(!x)))) {
    var x$1 = ScalaJS.g["performance"]["now"];
    if (ScalaJS.uZ((!(!x$1)))) {
      var jsx$1 = (function(this$2$1) {
        return (function() {
          return ScalaJS.uD(ScalaJS.g["performance"]["now"]())
        })
      })(this)
    } else {
      var x$2 = ScalaJS.g["performance"]["webkitNow"];
      if (ScalaJS.uZ((!(!x$2)))) {
        var jsx$1 = (function(this$3$1) {
          return (function() {
            return ScalaJS.uD(ScalaJS.g["performance"]["webkitNow"]())
          })
        })(this)
      } else {
        var jsx$1 = (function(this$4$1) {
          return (function() {
            return ScalaJS.uD(new ScalaJS.g["Date"]()["getTime"]())
          })
        })(this)
      }
    }
  } else {
    var jsx$1 = (function(this$5$1) {
      return (function() {
        return ScalaJS.uD(new ScalaJS.g["Date"]()["getTime"]())
      })
    })(this)
  };
  this.getHighPrecisionTime$1 = jsx$1;
  return this
});
ScalaJS.d.jl_System$ = new ScalaJS.ClassTypeData({
  jl_System$: 0
}, false, "java.lang.System$", {
  jl_System$: 1,
  O: 1
});
ScalaJS.c.jl_System$.prototype.$classData = ScalaJS.d.jl_System$;
ScalaJS.n.jl_System$ = (void 0);
ScalaJS.m.jl_System$ = (function() {
  if ((!ScalaJS.n.jl_System$)) {
    ScalaJS.n.jl_System$ = new ScalaJS.c.jl_System$().init___()
  };
  return ScalaJS.n.jl_System$
});
/** @constructor */
ScalaJS.c.jl_ThreadLocal = (function() {
  ScalaJS.c.O.call(this);
  this.hasValue$1 = null;
  this.v$1 = null
});
ScalaJS.c.jl_ThreadLocal.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_ThreadLocal.prototype.constructor = ScalaJS.c.jl_ThreadLocal;
/** @constructor */
ScalaJS.h.jl_ThreadLocal = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ThreadLocal.prototype = ScalaJS.c.jl_ThreadLocal.prototype;
ScalaJS.c.jl_ThreadLocal.prototype.init___ = (function() {
  this.hasValue$1 = false;
  return this
});
ScalaJS.c.jl_ThreadLocal.prototype.get__O = (function() {
  var x = this.hasValue$1;
  if ((!ScalaJS.uZ(x))) {
    this.set__O__V(this.initialValue__O())
  };
  return this.v$1
});
ScalaJS.c.jl_ThreadLocal.prototype.set__O__V = (function(o) {
  this.v$1 = o;
  this.hasValue$1 = true
});
/** @constructor */
ScalaJS.c.jl_reflect_Array$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.jl_reflect_Array$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_reflect_Array$.prototype.constructor = ScalaJS.c.jl_reflect_Array$;
/** @constructor */
ScalaJS.h.jl_reflect_Array$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_reflect_Array$.prototype = ScalaJS.c.jl_reflect_Array$.prototype;
ScalaJS.c.jl_reflect_Array$.prototype.newInstance__jl_Class__I__O = (function(componentType, length) {
  return componentType.newArrayOfThisClass__sjs_js_Array__O([length])
});
ScalaJS.d.jl_reflect_Array$ = new ScalaJS.ClassTypeData({
  jl_reflect_Array$: 0
}, false, "java.lang.reflect.Array$", {
  jl_reflect_Array$: 1,
  O: 1
});
ScalaJS.c.jl_reflect_Array$.prototype.$classData = ScalaJS.d.jl_reflect_Array$;
ScalaJS.n.jl_reflect_Array$ = (void 0);
ScalaJS.m.jl_reflect_Array$ = (function() {
  if ((!ScalaJS.n.jl_reflect_Array$)) {
    ScalaJS.n.jl_reflect_Array$ = new ScalaJS.c.jl_reflect_Array$().init___()
  };
  return ScalaJS.n.jl_reflect_Array$
});
/** @constructor */
ScalaJS.c.ju_Arrays$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.ju_Arrays$.prototype = new ScalaJS.h.O();
ScalaJS.c.ju_Arrays$.prototype.constructor = ScalaJS.c.ju_Arrays$;
/** @constructor */
ScalaJS.h.ju_Arrays$ = (function() {
  /*<skip>*/
});
ScalaJS.h.ju_Arrays$.prototype = ScalaJS.c.ju_Arrays$.prototype;
ScalaJS.c.ju_Arrays$.prototype.fillImpl$mIc$sp__p1__AI__I__V = (function(a, value) {
  var i = 0;
  while ((i !== a.u["length"])) {
    a.u[i] = value;
    i = ((1 + i) | 0)
  }
});
ScalaJS.c.ju_Arrays$.prototype.sort__AO__ju_Comparator__V = (function(array, comparator) {
  ScalaJS.m.s_util_Sorting$().stableSort__O__F2__s_reflect_ClassTag__V(array, new ScalaJS.c.sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2, comparator$1) {
    return (function(a$2, b$2) {
      return (comparator$1.compare__O__O__I(a$2, b$2) < 0)
    })
  })(this, comparator)), ScalaJS.m.s_reflect_ClassTag$().Object$1)
});
ScalaJS.d.ju_Arrays$ = new ScalaJS.ClassTypeData({
  ju_Arrays$: 0
}, false, "java.util.Arrays$", {
  ju_Arrays$: 1,
  O: 1
});
ScalaJS.c.ju_Arrays$.prototype.$classData = ScalaJS.d.ju_Arrays$;
ScalaJS.n.ju_Arrays$ = (void 0);
ScalaJS.m.ju_Arrays$ = (function() {
  if ((!ScalaJS.n.ju_Arrays$)) {
    ScalaJS.n.ju_Arrays$ = new ScalaJS.c.ju_Arrays$().init___()
  };
  return ScalaJS.n.ju_Arrays$
});
/** @constructor */
ScalaJS.c.s_DeprecatedConsole = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_DeprecatedConsole.prototype = new ScalaJS.h.O();
ScalaJS.c.s_DeprecatedConsole.prototype.constructor = ScalaJS.c.s_DeprecatedConsole;
/** @constructor */
ScalaJS.h.s_DeprecatedConsole = (function() {
  /*<skip>*/
});
ScalaJS.h.s_DeprecatedConsole.prototype = ScalaJS.c.s_DeprecatedConsole.prototype;
/** @constructor */
ScalaJS.c.s_FallbackArrayBuilding = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_FallbackArrayBuilding.prototype = new ScalaJS.h.O();
ScalaJS.c.s_FallbackArrayBuilding.prototype.constructor = ScalaJS.c.s_FallbackArrayBuilding;
/** @constructor */
ScalaJS.h.s_FallbackArrayBuilding = (function() {
  /*<skip>*/
});
ScalaJS.h.s_FallbackArrayBuilding.prototype = ScalaJS.c.s_FallbackArrayBuilding.prototype;
/** @constructor */
ScalaJS.c.s_LowPriorityImplicits = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_LowPriorityImplicits.prototype = new ScalaJS.h.O();
ScalaJS.c.s_LowPriorityImplicits.prototype.constructor = ScalaJS.c.s_LowPriorityImplicits;
/** @constructor */
ScalaJS.h.s_LowPriorityImplicits = (function() {
  /*<skip>*/
});
ScalaJS.h.s_LowPriorityImplicits.prototype = ScalaJS.c.s_LowPriorityImplicits.prototype;
ScalaJS.c.s_LowPriorityImplicits.prototype.unwrapString__sci_WrappedString__T = (function(ws) {
  return ((ws !== null) ? ws.self$4 : null)
});
/** @constructor */
ScalaJS.c.s_Option$WithFilter = (function() {
  ScalaJS.c.O.call(this);
  this.p$1 = null;
  this.$$outer$f = null
});
ScalaJS.c.s_Option$WithFilter.prototype = new ScalaJS.h.O();
ScalaJS.c.s_Option$WithFilter.prototype.constructor = ScalaJS.c.s_Option$WithFilter;
/** @constructor */
ScalaJS.h.s_Option$WithFilter = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Option$WithFilter.prototype = ScalaJS.c.s_Option$WithFilter.prototype;
ScalaJS.c.s_Option$WithFilter.prototype.withFilter__F1__s_Option$WithFilter = (function(q) {
  return new ScalaJS.c.s_Option$WithFilter().init___s_Option__F1(this.$$outer$f, new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, q$1) {
    return (function(x$2) {
      return (ScalaJS.uZ(this$2.p$1.apply__O__O(x$2)) && ScalaJS.uZ(q$1.apply__O__O(x$2)))
    })
  })(this, q)))
});
ScalaJS.c.s_Option$WithFilter.prototype.init___s_Option__F1 = (function($$outer, p) {
  this.p$1 = p;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
ScalaJS.d.s_Option$WithFilter = new ScalaJS.ClassTypeData({
  s_Option$WithFilter: 0
}, false, "scala.Option$WithFilter", {
  s_Option$WithFilter: 1,
  O: 1
});
ScalaJS.c.s_Option$WithFilter.prototype.$classData = ScalaJS.d.s_Option$WithFilter;
/** @constructor */
ScalaJS.c.s_Predef$any2stringadd$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_Predef$any2stringadd$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_Predef$any2stringadd$.prototype.constructor = ScalaJS.c.s_Predef$any2stringadd$;
/** @constructor */
ScalaJS.h.s_Predef$any2stringadd$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Predef$any2stringadd$.prototype = ScalaJS.c.s_Predef$any2stringadd$.prototype;
ScalaJS.c.s_Predef$any2stringadd$.prototype.$$plus$extension__O__T__T = (function($$this, other) {
  return (("" + ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T($$this)) + other)
});
ScalaJS.d.s_Predef$any2stringadd$ = new ScalaJS.ClassTypeData({
  s_Predef$any2stringadd$: 0
}, false, "scala.Predef$any2stringadd$", {
  s_Predef$any2stringadd$: 1,
  O: 1
});
ScalaJS.c.s_Predef$any2stringadd$.prototype.$classData = ScalaJS.d.s_Predef$any2stringadd$;
ScalaJS.n.s_Predef$any2stringadd$ = (void 0);
ScalaJS.m.s_Predef$any2stringadd$ = (function() {
  if ((!ScalaJS.n.s_Predef$any2stringadd$)) {
    ScalaJS.n.s_Predef$any2stringadd$ = new ScalaJS.c.s_Predef$any2stringadd$().init___()
  };
  return ScalaJS.n.s_Predef$any2stringadd$
});
ScalaJS.s.s_Product2$class__productElement__s_Product2__I__O = (function($$this, n) {
  switch (n) {
    case 0:
      {
        return $$this.$$und1$f;
        break
      };
    case 1:
      {
        return $$this.$$und2$f;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n));
  }
});
ScalaJS.s.s_Product4$class__productElement__s_Product4__I__O = (function($$this, n) {
  switch (n) {
    case 0:
      {
        return $$this.$$und1$1;
        break
      };
    case 1:
      {
        return $$this.$$und2$1;
        break
      };
    case 2:
      {
        return $$this.$$und3$1;
        break
      };
    case 3:
      {
        return $$this.$$und4$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n));
  }
});
ScalaJS.s.s_Proxy$class__toString__s_Proxy__T = (function($$this) {
  return ("" + $$this.self$1)
});
ScalaJS.s.s_Proxy$class__equals__s_Proxy__O__Z = (function($$this, that) {
  return ((that !== null) && (((that === $$this) || (that === $$this.self$1)) || ScalaJS.objectEquals(that, $$this.self$1)))
});
/** @constructor */
ScalaJS.c.s_math_Ordered$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Ordered$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Ordered$.prototype.constructor = ScalaJS.c.s_math_Ordered$;
/** @constructor */
ScalaJS.h.s_math_Ordered$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Ordered$.prototype = ScalaJS.c.s_math_Ordered$.prototype;
ScalaJS.d.s_math_Ordered$ = new ScalaJS.ClassTypeData({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
ScalaJS.c.s_math_Ordered$.prototype.$classData = ScalaJS.d.s_math_Ordered$;
ScalaJS.n.s_math_Ordered$ = (void 0);
ScalaJS.m.s_math_Ordered$ = (function() {
  if ((!ScalaJS.n.s_math_Ordered$)) {
    ScalaJS.n.s_math_Ordered$ = new ScalaJS.c.s_math_Ordered$().init___()
  };
  return ScalaJS.n.s_math_Ordered$
});
/** @constructor */
ScalaJS.c.s_package$ = (function() {
  ScalaJS.c.O.call(this);
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.$$hash$colon$colon$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
});
ScalaJS.c.s_package$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_package$.prototype.constructor = ScalaJS.c.s_package$;
/** @constructor */
ScalaJS.h.s_package$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_package$.prototype = ScalaJS.c.s_package$.prototype;
ScalaJS.c.s_package$.prototype.init___ = (function() {
  ScalaJS.n.s_package$ = this;
  this.AnyRef$1 = new ScalaJS.c.s_package$$anon$1().init___();
  this.Traversable$1 = ScalaJS.m.sc_Traversable$();
  this.Iterable$1 = ScalaJS.m.sc_Iterable$();
  this.Seq$1 = ScalaJS.m.sc_Seq$();
  this.IndexedSeq$1 = ScalaJS.m.sc_IndexedSeq$();
  this.Iterator$1 = ScalaJS.m.sc_Iterator$();
  this.List$1 = ScalaJS.m.sci_List$();
  this.Nil$1 = ScalaJS.m.sci_Nil$();
  this.$$colon$colon$1 = ScalaJS.m.sci_$colon$colon$();
  this.$$plus$colon$1 = ScalaJS.m.sc_$plus$colon$();
  this.$$colon$plus$1 = ScalaJS.m.sc_$colon$plus$();
  this.Stream$1 = ScalaJS.m.sci_Stream$();
  this.$$hash$colon$colon$1 = ScalaJS.m.sci_Stream$$hash$colon$colon$();
  this.Vector$1 = ScalaJS.m.sci_Vector$();
  this.StringBuilder$1 = ScalaJS.m.scm_StringBuilder$();
  this.Range$1 = ScalaJS.m.sci_Range$();
  this.Equiv$1 = ScalaJS.m.s_math_Equiv$();
  this.Fractional$1 = ScalaJS.m.s_math_Fractional$();
  this.Integral$1 = ScalaJS.m.s_math_Integral$();
  this.Numeric$1 = ScalaJS.m.s_math_Numeric$();
  this.Ordered$1 = ScalaJS.m.s_math_Ordered$();
  this.Ordering$1 = ScalaJS.m.s_math_Ordering$();
  this.Either$1 = ScalaJS.m.s_util_Either$();
  this.Left$1 = ScalaJS.m.s_util_Left$();
  this.Right$1 = ScalaJS.m.s_util_Right$();
  return this
});
ScalaJS.d.s_package$ = new ScalaJS.ClassTypeData({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
ScalaJS.c.s_package$.prototype.$classData = ScalaJS.d.s_package$;
ScalaJS.n.s_package$ = (void 0);
ScalaJS.m.s_package$ = (function() {
  if ((!ScalaJS.n.s_package$)) {
    ScalaJS.n.s_package$ = new ScalaJS.c.s_package$().init___()
  };
  return ScalaJS.n.s_package$
});
/** @constructor */
ScalaJS.c.s_reflect_ClassManifestFactory$ = (function() {
  ScalaJS.c.O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyVal$1 = null;
  this.Nothing$1 = null;
  this.Null$1 = null
});
ScalaJS.c.s_reflect_ClassManifestFactory$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_reflect_ClassManifestFactory$.prototype.constructor = ScalaJS.c.s_reflect_ClassManifestFactory$;
/** @constructor */
ScalaJS.h.s_reflect_ClassManifestFactory$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ClassManifestFactory$.prototype = ScalaJS.c.s_reflect_ClassManifestFactory$.prototype;
ScalaJS.c.s_reflect_ClassManifestFactory$.prototype.init___ = (function() {
  ScalaJS.n.s_reflect_ClassManifestFactory$ = this;
  this.Byte$1 = ScalaJS.m.s_reflect_ManifestFactory$().Byte$1;
  this.Short$1 = ScalaJS.m.s_reflect_ManifestFactory$().Short$1;
  this.Char$1 = ScalaJS.m.s_reflect_ManifestFactory$().Char$1;
  this.Int$1 = ScalaJS.m.s_reflect_ManifestFactory$().Int$1;
  this.Long$1 = ScalaJS.m.s_reflect_ManifestFactory$().Long$1;
  this.Float$1 = ScalaJS.m.s_reflect_ManifestFactory$().Float$1;
  this.Double$1 = ScalaJS.m.s_reflect_ManifestFactory$().Double$1;
  this.Boolean$1 = ScalaJS.m.s_reflect_ManifestFactory$().Boolean$1;
  this.Unit$1 = ScalaJS.m.s_reflect_ManifestFactory$().Unit$1;
  this.Any$1 = ScalaJS.m.s_reflect_ManifestFactory$().Any$1;
  this.Object$1 = ScalaJS.m.s_reflect_ManifestFactory$().Object$1;
  this.AnyVal$1 = ScalaJS.m.s_reflect_ManifestFactory$().AnyVal$1;
  this.Nothing$1 = ScalaJS.m.s_reflect_ManifestFactory$().Nothing$1;
  this.Null$1 = ScalaJS.m.s_reflect_ManifestFactory$().Null$1;
  return this
});
ScalaJS.d.s_reflect_ClassManifestFactory$ = new ScalaJS.ClassTypeData({
  s_reflect_ClassManifestFactory$: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  s_reflect_ClassManifestFactory$: 1,
  O: 1
});
ScalaJS.c.s_reflect_ClassManifestFactory$.prototype.$classData = ScalaJS.d.s_reflect_ClassManifestFactory$;
ScalaJS.n.s_reflect_ClassManifestFactory$ = (void 0);
ScalaJS.m.s_reflect_ClassManifestFactory$ = (function() {
  if ((!ScalaJS.n.s_reflect_ClassManifestFactory$)) {
    ScalaJS.n.s_reflect_ClassManifestFactory$ = new ScalaJS.c.s_reflect_ClassManifestFactory$().init___()
  };
  return ScalaJS.n.s_reflect_ClassManifestFactory$
});
ScalaJS.s.s_reflect_ClassTag$class__newArray__s_reflect_ClassTag__I__O = (function($$this, len) {
  var x1 = $$this.runtimeClass__jl_Class();
  return ((x1 === ScalaJS.d.B.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.B.getArrayOf(), [len]) : ((x1 === ScalaJS.d.S.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.S.getArrayOf(), [len]) : ((x1 === ScalaJS.d.C.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.C.getArrayOf(), [len]) : ((x1 === ScalaJS.d.I.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.I.getArrayOf(), [len]) : ((x1 === ScalaJS.d.J.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.J.getArrayOf(), [len]) : ((x1 === ScalaJS.d.F.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.F.getArrayOf(), [len]) : ((x1 === ScalaJS.d.D.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.D.getArrayOf(), [len]) : ((x1 === ScalaJS.d.Z.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.Z.getArrayOf(), [len]) : ((x1 === ScalaJS.d.V.getClassOf()) ? ScalaJS.newArrayObject(ScalaJS.d.sr_BoxedUnit.getArrayOf(), [len]) : ScalaJS.m.jl_reflect_Array$().newInstance__jl_Class__I__O($$this.runtimeClass__jl_Class(), len))))))))))
});
ScalaJS.s.s_reflect_ClassTag$class__equals__s_reflect_ClassTag__O__Z = (function($$this, x) {
  if (ScalaJS.is.s_reflect_ClassTag(x)) {
    var x$2 = $$this.runtimeClass__jl_Class();
    var x$3 = ScalaJS.as.s_reflect_ClassTag(x).runtimeClass__jl_Class();
    return (x$2 === x$3)
  } else {
    return false
  }
});
ScalaJS.s.s_reflect_ClassTag$class__prettyprint$1__p0__s_reflect_ClassTag__jl_Class__T = (function($$this, clazz) {
  return (clazz.isArray__Z() ? new ScalaJS.c.s_StringContext().init___sc_Seq(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["Array[", "]"])).s__sc_Seq__T(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([ScalaJS.s.s_reflect_ClassTag$class__prettyprint$1__p0__s_reflect_ClassTag__jl_Class__T($$this, ScalaJS.m.sr_ScalaRunTime$().arrayElementClass__O__jl_Class(clazz))])) : clazz.getName__T())
});
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$ = (function() {
  ScalaJS.c.O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.scala$reflect$ManifestFactory$$ObjectTYPE$1 = null;
  this.scala$reflect$ManifestFactory$$NothingTYPE$1 = null;
  this.scala$reflect$ManifestFactory$$NullTYPE$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyRef$1 = null;
  this.AnyVal$1 = null;
  this.Null$1 = null;
  this.Nothing$1 = null
});
ScalaJS.c.s_reflect_ManifestFactory$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_reflect_ManifestFactory$.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$.prototype = ScalaJS.c.s_reflect_ManifestFactory$.prototype;
ScalaJS.c.s_reflect_ManifestFactory$.prototype.init___ = (function() {
  ScalaJS.n.s_reflect_ManifestFactory$ = this;
  this.Byte$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$6().init___();
  this.Short$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$7().init___();
  this.Char$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$8().init___();
  this.Int$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$9().init___();
  this.Long$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$10().init___();
  this.Float$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$11().init___();
  this.Double$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$12().init___();
  this.Boolean$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$13().init___();
  this.Unit$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$14().init___();
  this.scala$reflect$ManifestFactory$$ObjectTYPE$1 = ScalaJS.d.O.getClassOf();
  this.scala$reflect$ManifestFactory$$NothingTYPE$1 = ScalaJS.d.sr_Nothing$.getClassOf();
  this.scala$reflect$ManifestFactory$$NullTYPE$1 = ScalaJS.d.sr_Null$.getClassOf();
  this.Any$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$1().init___();
  this.Object$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$2().init___();
  this.AnyRef$1 = this.Object$1;
  this.AnyVal$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$3().init___();
  this.Null$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$4().init___();
  this.Nothing$1 = new ScalaJS.c.s_reflect_ManifestFactory$$anon$5().init___();
  return this
});
ScalaJS.d.s_reflect_ManifestFactory$ = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$: 0
}, false, "scala.reflect.ManifestFactory$", {
  s_reflect_ManifestFactory$: 1,
  O: 1
});
ScalaJS.c.s_reflect_ManifestFactory$.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$;
ScalaJS.n.s_reflect_ManifestFactory$ = (void 0);
ScalaJS.m.s_reflect_ManifestFactory$ = (function() {
  if ((!ScalaJS.n.s_reflect_ManifestFactory$)) {
    ScalaJS.n.s_reflect_ManifestFactory$ = new ScalaJS.c.s_reflect_ManifestFactory$().init___()
  };
  return ScalaJS.n.s_reflect_ManifestFactory$
});
/** @constructor */
ScalaJS.c.s_reflect_package$ = (function() {
  ScalaJS.c.O.call(this);
  this.ClassManifest$1 = null;
  this.Manifest$1 = null
});
ScalaJS.c.s_reflect_package$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_reflect_package$.prototype.constructor = ScalaJS.c.s_reflect_package$;
/** @constructor */
ScalaJS.h.s_reflect_package$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_package$.prototype = ScalaJS.c.s_reflect_package$.prototype;
ScalaJS.c.s_reflect_package$.prototype.init___ = (function() {
  ScalaJS.n.s_reflect_package$ = this;
  this.ClassManifest$1 = ScalaJS.m.s_reflect_ClassManifestFactory$();
  this.Manifest$1 = ScalaJS.m.s_reflect_ManifestFactory$();
  return this
});
ScalaJS.d.s_reflect_package$ = new ScalaJS.ClassTypeData({
  s_reflect_package$: 0
}, false, "scala.reflect.package$", {
  s_reflect_package$: 1,
  O: 1
});
ScalaJS.c.s_reflect_package$.prototype.$classData = ScalaJS.d.s_reflect_package$;
ScalaJS.n.s_reflect_package$ = (void 0);
ScalaJS.m.s_reflect_package$ = (function() {
  if ((!ScalaJS.n.s_reflect_package$)) {
    ScalaJS.n.s_reflect_package$ = new ScalaJS.c.s_reflect_package$().init___()
  };
  return ScalaJS.n.s_reflect_package$
});
/** @constructor */
ScalaJS.c.s_util_DynamicVariable = (function() {
  ScalaJS.c.O.call(this);
  this.scala$util$DynamicVariable$$init$f = null;
  this.tl$1 = null
});
ScalaJS.c.s_util_DynamicVariable.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_DynamicVariable.prototype.constructor = ScalaJS.c.s_util_DynamicVariable;
/** @constructor */
ScalaJS.h.s_util_DynamicVariable = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_DynamicVariable.prototype = ScalaJS.c.s_util_DynamicVariable.prototype;
ScalaJS.c.s_util_DynamicVariable.prototype.toString__T = (function() {
  return (("DynamicVariable(" + this.tl$1.get__O()) + ")")
});
ScalaJS.c.s_util_DynamicVariable.prototype.init___O = (function(init) {
  this.scala$util$DynamicVariable$$init$f = init;
  this.tl$1 = new ScalaJS.c.s_util_DynamicVariable$$anon$1().init___s_util_DynamicVariable(this);
  return this
});
ScalaJS.d.s_util_DynamicVariable = new ScalaJS.ClassTypeData({
  s_util_DynamicVariable: 0
}, false, "scala.util.DynamicVariable", {
  s_util_DynamicVariable: 1,
  O: 1
});
ScalaJS.c.s_util_DynamicVariable.prototype.$classData = ScalaJS.d.s_util_DynamicVariable;
/** @constructor */
ScalaJS.c.s_util_Either$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_Either$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_Either$.prototype.constructor = ScalaJS.c.s_util_Either$;
/** @constructor */
ScalaJS.h.s_util_Either$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Either$.prototype = ScalaJS.c.s_util_Either$.prototype;
ScalaJS.d.s_util_Either$ = new ScalaJS.ClassTypeData({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1
});
ScalaJS.c.s_util_Either$.prototype.$classData = ScalaJS.d.s_util_Either$;
ScalaJS.n.s_util_Either$ = (void 0);
ScalaJS.m.s_util_Either$ = (function() {
  if ((!ScalaJS.n.s_util_Either$)) {
    ScalaJS.n.s_util_Either$ = new ScalaJS.c.s_util_Either$().init___()
  };
  return ScalaJS.n.s_util_Either$
});
/** @constructor */
ScalaJS.c.s_util_Sorting$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_Sorting$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_Sorting$.prototype.constructor = ScalaJS.c.s_util_Sorting$;
/** @constructor */
ScalaJS.h.s_util_Sorting$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Sorting$.prototype = ScalaJS.c.s_util_Sorting$.prototype;
ScalaJS.c.s_util_Sorting$.prototype.stableSort__p1__O__I__I__O__F2__s_reflect_ClassTag__V = (function(a, lo, hi, scratch, f, evidence$11) {
  if ((lo < hi)) {
    var mid = ((((lo + hi) | 0) / 2) | 0);
    this.stableSort__p1__O__I__I__O__F2__s_reflect_ClassTag__V(a, lo, mid, scratch, f, evidence$11);
    this.stableSort__p1__O__I__I__O__F2__s_reflect_ClassTag__V(a, ((1 + mid) | 0), hi, scratch, f, evidence$11);
    var k = lo;
    var t_lo = lo;
    var t_hi = ((1 + mid) | 0);
    while ((k <= hi)) {
      if (((t_lo <= mid) && ((t_hi > hi) || (!ScalaJS.uZ(f.apply__O__O__O(ScalaJS.m.sr_ScalaRunTime$().array$undapply__O__I__O(a, t_hi), ScalaJS.m.sr_ScalaRunTime$().array$undapply__O__I__O(a, t_lo))))))) {
        ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(scratch, k, ScalaJS.m.sr_ScalaRunTime$().array$undapply__O__I__O(a, t_lo));
        t_lo = ((1 + t_lo) | 0)
      } else {
        ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(scratch, k, ScalaJS.m.sr_ScalaRunTime$().array$undapply__O__I__O(a, t_hi));
        t_hi = ((1 + t_hi) | 0)
      };
      k = ((1 + k) | 0)
    };
    k = lo;
    while ((k <= hi)) {
      ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(a, k, ScalaJS.m.sr_ScalaRunTime$().array$undapply__O__I__O(scratch, k));
      k = ((1 + k) | 0)
    }
  }
});
ScalaJS.c.s_util_Sorting$.prototype.stableSort__O__F2__s_reflect_ClassTag__V = (function(a, f, evidence$4) {
  this.stableSort__p1__O__I__I__O__F2__s_reflect_ClassTag__V(a, 0, (((-1) + ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(a)) | 0), evidence$4.newArray__I__O(ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(a)), f, evidence$4)
});
ScalaJS.d.s_util_Sorting$ = new ScalaJS.ClassTypeData({
  s_util_Sorting$: 0
}, false, "scala.util.Sorting$", {
  s_util_Sorting$: 1,
  O: 1
});
ScalaJS.c.s_util_Sorting$.prototype.$classData = ScalaJS.d.s_util_Sorting$;
ScalaJS.n.s_util_Sorting$ = (void 0);
ScalaJS.m.s_util_Sorting$ = (function() {
  if ((!ScalaJS.n.s_util_Sorting$)) {
    ScalaJS.n.s_util_Sorting$ = new ScalaJS.c.s_util_Sorting$().init___()
  };
  return ScalaJS.n.s_util_Sorting$
});
/** @constructor */
ScalaJS.c.s_util_control_Breaks = (function() {
  ScalaJS.c.O.call(this);
  this.scala$util$control$Breaks$$breakException$1 = null
});
ScalaJS.c.s_util_control_Breaks.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_control_Breaks.prototype.constructor = ScalaJS.c.s_util_control_Breaks;
/** @constructor */
ScalaJS.h.s_util_control_Breaks = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_control_Breaks.prototype = ScalaJS.c.s_util_control_Breaks.prototype;
ScalaJS.c.s_util_control_Breaks.prototype.init___ = (function() {
  this.scala$util$control$Breaks$$breakException$1 = new ScalaJS.c.s_util_control_BreakControl().init___();
  return this
});
ScalaJS.d.s_util_control_Breaks = new ScalaJS.ClassTypeData({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
ScalaJS.c.s_util_control_Breaks.prototype.$classData = ScalaJS.d.s_util_control_Breaks;
ScalaJS.s.s_util_control_NoStackTrace$class__fillInStackTrace__s_util_control_NoStackTrace__jl_Throwable = (function($$this) {
  var this$1 = ScalaJS.m.s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $$this.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable()
  } else {
    return ScalaJS.as.jl_Throwable($$this)
  }
});
/** @constructor */
ScalaJS.c.s_util_hashing_MurmurHash3 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.constructor = ScalaJS.c.s_util_hashing_MurmurHash3;
/** @constructor */
ScalaJS.h.s_util_hashing_MurmurHash3 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_hashing_MurmurHash3.prototype = ScalaJS.c.s_util_hashing_MurmurHash3.prototype;
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = ScalaJS.imul((-862048943), k);
  k = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(k, 15);
  k = ScalaJS.imul(461845907, k);
  return (hash ^ k)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  h = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(h, 13);
  return (((-430675100) + ScalaJS.imul(5, h)) | 0)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = ScalaJS.imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = ScalaJS.imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var a = new ScalaJS.c.sr_IntRef().init___I(0);
  var b = new ScalaJS.c.sr_IntRef().init___I(0);
  var n = new ScalaJS.c.sr_IntRef().init___I(0);
  var c = new ScalaJS.c.sr_IntRef().init___I(1);
  xs.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, a$1, b$1, n$1, c$1) {
    return (function(x$2) {
      var h = ScalaJS.m.sr_ScalaRunTime$().hash__O__I(x$2);
      a$1.elem$1 = ((a$1.elem$1 + h) | 0);
      b$1.elem$1 = (b$1.elem$1 ^ h);
      if ((h !== 0)) {
        c$1.elem$1 = ScalaJS.imul(c$1.elem$1, h)
      };
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, a, b, n, c)));
  var h$1 = seed;
  h$1 = this.mix__I__I__I(h$1, a.elem$1);
  h$1 = this.mix__I__I__I(h$1, b.elem$1);
  h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
  return this.finalizeHash__I__I__I(h$1, n.elem$1)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new ScalaJS.c.sr_IntRef().init___I(0);
  var h = new ScalaJS.c.sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, n$1, h$1) {
    return (function(x$2) {
      h$1.elem$1 = this$2$1.mix__I__I__I(h$1.elem$1, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, n, h)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var this$1 = elems;
    var tail = this$1.tail__sci_List();
    h = this.mix__I__I__I(h, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
/** @constructor */
ScalaJS.c.s_util_hashing_package$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_hashing_package$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_hashing_package$.prototype.constructor = ScalaJS.c.s_util_hashing_package$;
/** @constructor */
ScalaJS.h.s_util_hashing_package$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_hashing_package$.prototype = ScalaJS.c.s_util_hashing_package$.prototype;
ScalaJS.c.s_util_hashing_package$.prototype.byteswap32__I__I = (function(v) {
  var hc = ScalaJS.imul((-1640532531), v);
  hc = ScalaJS.m.jl_Integer$().reverseBytes__I__I(hc);
  return ScalaJS.imul((-1640532531), hc)
});
ScalaJS.d.s_util_hashing_package$ = new ScalaJS.ClassTypeData({
  s_util_hashing_package$: 0
}, false, "scala.util.hashing.package$", {
  s_util_hashing_package$: 1,
  O: 1
});
ScalaJS.c.s_util_hashing_package$.prototype.$classData = ScalaJS.d.s_util_hashing_package$;
ScalaJS.n.s_util_hashing_package$ = (void 0);
ScalaJS.m.s_util_hashing_package$ = (function() {
  if ((!ScalaJS.n.s_util_hashing_package$)) {
    ScalaJS.n.s_util_hashing_package$ = new ScalaJS.c.s_util_hashing_package$().init___()
  };
  return ScalaJS.n.s_util_hashing_package$
});
/** @constructor */
ScalaJS.c.sc_$colon$plus$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_$colon$plus$.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_$colon$plus$.prototype.constructor = ScalaJS.c.sc_$colon$plus$;
/** @constructor */
ScalaJS.h.sc_$colon$plus$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_$colon$plus$.prototype = ScalaJS.c.sc_$colon$plus$.prototype;
ScalaJS.d.sc_$colon$plus$ = new ScalaJS.ClassTypeData({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
ScalaJS.c.sc_$colon$plus$.prototype.$classData = ScalaJS.d.sc_$colon$plus$;
ScalaJS.n.sc_$colon$plus$ = (void 0);
ScalaJS.m.sc_$colon$plus$ = (function() {
  if ((!ScalaJS.n.sc_$colon$plus$)) {
    ScalaJS.n.sc_$colon$plus$ = new ScalaJS.c.sc_$colon$plus$().init___()
  };
  return ScalaJS.n.sc_$colon$plus$
});
/** @constructor */
ScalaJS.c.sc_$plus$colon$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_$plus$colon$.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_$plus$colon$.prototype.constructor = ScalaJS.c.sc_$plus$colon$;
/** @constructor */
ScalaJS.h.sc_$plus$colon$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_$plus$colon$.prototype = ScalaJS.c.sc_$plus$colon$.prototype;
ScalaJS.d.sc_$plus$colon$ = new ScalaJS.ClassTypeData({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
ScalaJS.c.sc_$plus$colon$.prototype.$classData = ScalaJS.d.sc_$plus$colon$;
ScalaJS.n.sc_$plus$colon$ = (void 0);
ScalaJS.m.sc_$plus$colon$ = (function() {
  if ((!ScalaJS.n.sc_$plus$colon$)) {
    ScalaJS.n.sc_$plus$colon$ = new ScalaJS.c.sc_$plus$colon$().init___()
  };
  return ScalaJS.n.sc_$plus$colon$
});
ScalaJS.s.sc_GenMapLike$class__liftedTree1$1__p0__sc_GenMapLike__sc_GenMap__Z = (function($$this, x2$1) {
  try {
    var this$1 = $$this.iterator__sc_Iterator();
    var res = true;
    while ((res && this$1.hasNext__Z())) {
      var arg1 = this$1.next__O();
      var x0$1 = ScalaJS.as.T2(arg1);
      if ((x0$1 !== null)) {
        var k = x0$1.$$und1$f;
        var v = x0$1.$$und2$f;
        var x1$2 = x2$1.get__O__s_Option(k);
        matchEnd6: {
          if (ScalaJS.is.s_Some(x1$2)) {
            var x2 = ScalaJS.as.s_Some(x1$2);
            var p3 = x2.x$2;
            if (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(v, p3)) {
              res = true;
              break matchEnd6
            }
          };
          res = false;
          break matchEnd6
        }
      } else {
        throw new ScalaJS.c.s_MatchError().init___O(x0$1)
      }
    };
    return res
  } catch (e) {
    if (ScalaJS.is.jl_ClassCastException(e)) {
      ScalaJS.as.jl_ClassCastException(e);
      var this$3 = ScalaJS.m.s_Console$();
      var this$4 = this$3.outVar$2;
      ScalaJS.as.Ljava_io_PrintStream(this$4.tl$1.get__O()).println__O__V("class cast ");
      return false
    } else {
      throw e
    }
  }
});
ScalaJS.s.sc_GenMapLike$class__equals__sc_GenMapLike__O__Z = (function($$this, that) {
  if (ScalaJS.is.sc_GenMap(that)) {
    var x2 = ScalaJS.as.sc_GenMap(that);
    return (($$this === x2) || (($$this.size__I() === x2.size__I()) && ScalaJS.s.sc_GenMapLike$class__liftedTree1$1__p0__sc_GenMapLike__sc_GenMap__Z($$this, x2)))
  } else {
    return false
  }
});
ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z = (function($$this, that) {
  if (ScalaJS.is.sc_GenSeq(that)) {
    var x2 = ScalaJS.as.sc_GenSeq(that);
    return $$this.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
});
ScalaJS.s.sc_GenSetLike$class__liftedTree1$1__p0__sc_GenSetLike__sc_GenSet__Z = (function($$this, x2$1) {
  try {
    return $$this.subsetOf__sc_GenSet__Z(x2$1)
  } catch (e) {
    if (ScalaJS.is.jl_ClassCastException(e)) {
      ScalaJS.as.jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
});
ScalaJS.s.sc_GenSetLike$class__equals__sc_GenSetLike__O__Z = (function($$this, that) {
  if (ScalaJS.is.sc_GenSet(that)) {
    var x2 = ScalaJS.as.sc_GenSet(that);
    return (($$this === x2) || (($$this.size__I() === x2.size__I()) && ScalaJS.s.sc_GenSetLike$class__liftedTree1$1__p0__sc_GenSetLike__sc_GenSet__Z($$this, x2)))
  } else {
    return false
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I = (function($$this, len) {
  return (($$this.length__I() - len) | 0)
});
ScalaJS.s.sc_IndexedSeqOptimized$class__slice__sc_IndexedSeqOptimized__I__I__O = (function($$this, from, until) {
  var lo = ((from > 0) ? from : 0);
  var x = ((until > 0) ? until : 0);
  var y = $$this.length__I();
  var hi = ((x < y) ? x : y);
  var x$1 = ((hi - lo) | 0);
  var elems = ((x$1 > 0) ? x$1 : 0);
  var b = $$this.newBuilder__scm_Builder();
  b.sizeHint__I__V(elems);
  var i = lo;
  while ((i < hi)) {
    b.$$plus$eq__O__scm_Builder($$this.apply__I__O(i));
    i = ((1 + i) | 0)
  };
  return b.result__O()
});
ScalaJS.s.sc_IndexedSeqOptimized$class__foldl__p0__sc_IndexedSeqOptimized__I__I__O__F2__O = (function($$this, start, end, z, op) {
  _foldl: while (true) {
    if ((start === end)) {
      return z
    } else {
      var temp$start = ((1 + start) | 0);
      var temp$z = op.apply__O__O__O(z, $$this.apply__I__O(start));
      start = temp$start;
      z = temp$z;
      continue _foldl
    }
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V = (function($$this, xs, start, len) {
  var i = 0;
  var j = start;
  var $$this$1 = $$this.length__I();
  var $$this$2 = (($$this$1 < len) ? $$this$1 : len);
  var that = ((ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = (($$this$2 < that) ? $$this$2 : that);
  while ((i < end)) {
    ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $$this.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z = (function($$this, that) {
  if (ScalaJS.is.sc_IndexedSeq(that)) {
    var x2 = ScalaJS.as.sc_IndexedSeq(that);
    var len = $$this.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z($$this.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V = (function($$this, f) {
  var i = 0;
  var len = $$this.length__I();
  while ((i < len)) {
    f.apply__O__O($$this.apply__I__O(i));
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O = (function($$this) {
  var b = $$this.newBuilder__scm_Builder();
  b.sizeHint__I__V($$this.length__I());
  var i = $$this.length__I();
  while ((i > 0)) {
    i = (((-1) + i) | 0);
    b.$$plus$eq__O__scm_Builder($$this.apply__I__O(i))
  };
  return b.result__O()
});
ScalaJS.s.sc_IndexedSeqOptimized$class__prefixLengthImpl__p0__sc_IndexedSeqOptimized__F1__Z__I = (function($$this, p, expectTrue) {
  var i = 0;
  while (((i < $$this.length__I()) && (ScalaJS.uZ(p.apply__O__O($$this.apply__I__O(i))) === expectTrue))) {
    i = ((1 + i) | 0)
  };
  return i
});
ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z = (function($$this) {
  return ($$this.length__I() === 0)
});
ScalaJS.s.sc_IndexedSeqOptimized$class__exists__sc_IndexedSeqOptimized__F1__Z = (function($$this, p) {
  return (ScalaJS.s.sc_IndexedSeqOptimized$class__prefixLengthImpl__p0__sc_IndexedSeqOptimized__F1__Z__I($$this, p, false) !== $$this.length__I())
});
ScalaJS.s.sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V = (function($$this, xs, start, len) {
  var i = start;
  var $$this$1 = ((start + len) | 0);
  var that = ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs);
  var end = (($$this$1 < that) ? $$this$1 : that);
  var it = $$this.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.sc_IterableLike$class__take__sc_IterableLike__I__O = (function($$this, n) {
  var b = $$this.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    b.sizeHintBounded__I__sc_TraversableLike__V(n, $$this);
    var i = 0;
    var it = $$this.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
});
ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z = (function($$this, that) {
  var these = $$this.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
});
/** @constructor */
ScalaJS.c.sc_Iterator$ = (function() {
  ScalaJS.c.O.call(this);
  this.empty$1 = null
});
ScalaJS.c.sc_Iterator$.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_Iterator$.prototype.constructor = ScalaJS.c.sc_Iterator$;
/** @constructor */
ScalaJS.h.sc_Iterator$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterator$.prototype = ScalaJS.c.sc_Iterator$.prototype;
ScalaJS.c.sc_Iterator$.prototype.init___ = (function() {
  ScalaJS.n.sc_Iterator$ = this;
  this.empty$1 = new ScalaJS.c.sc_Iterator$$anon$2().init___();
  return this
});
ScalaJS.d.sc_Iterator$ = new ScalaJS.ClassTypeData({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
ScalaJS.c.sc_Iterator$.prototype.$classData = ScalaJS.d.sc_Iterator$;
ScalaJS.n.sc_Iterator$ = (void 0);
ScalaJS.m.sc_Iterator$ = (function() {
  if ((!ScalaJS.n.sc_Iterator$)) {
    ScalaJS.n.sc_Iterator$ = new ScalaJS.c.sc_Iterator$().init___()
  };
  return ScalaJS.n.sc_Iterator$
});
ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z = (function($$this) {
  return (!$$this.hasNext__Z())
});
ScalaJS.s.sc_Iterator$class__toStream__sc_Iterator__sci_Stream = (function($$this) {
  if ($$this.hasNext__Z()) {
    var hd = $$this.next__O();
    var tl = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function($$this$1) {
      return (function() {
        return $$this$1.toStream__sci_Stream()
      })
    })($$this));
    return new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    ScalaJS.m.sci_Stream$();
    return ScalaJS.m.sci_Stream$Empty$()
  }
});
ScalaJS.s.sc_Iterator$class__toString__sc_Iterator__T = (function($$this) {
  return (($$this.hasNext__Z() ? "non-empty" : "empty") + " iterator")
});
ScalaJS.s.sc_Iterator$class__exists__sc_Iterator__F1__Z = (function($$this, p) {
  var res = false;
  while (((!res) && $$this.hasNext__Z())) {
    res = ScalaJS.uZ(p.apply__O__O($$this.next__O()))
  };
  return res
});
ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V = (function($$this, f) {
  while ($$this.hasNext__Z()) {
    f.apply__O__O($$this.next__O())
  }
});
ScalaJS.s.sc_Iterator$class__copyToArray__sc_Iterator__O__I__I__V = (function($$this, xs, start, len) {
  var requirement = ((start >= 0) && ((start < ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs)) || (ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs) === 0)));
  if ((!requirement)) {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___T(("requirement failed: " + new ScalaJS.c.s_StringContext().init___sc_Seq(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["start ", " out of range ", ""])).s__sc_Seq__T(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([start, ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs)]))))
  };
  var i = start;
  var y = ((ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = ((start + ((len < y) ? len : y)) | 0);
  while (((i < end) && $$this.hasNext__Z())) {
    ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, $$this.next__O());
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.sc_Iterator$class__forall__sc_Iterator__F1__Z = (function($$this, p) {
  var res = true;
  while ((res && $$this.hasNext__Z())) {
    res = ScalaJS.uZ(p.apply__O__O($$this.next__O()))
  };
  return res
});
ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I = (function($$this, len) {
  return ((len < 0) ? 1 : ScalaJS.s.sc_LinearSeqOptimized$class__loop$1__p0__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($$this, 0, $$this, len))
});
ScalaJS.s.sc_LinearSeqOptimized$class__foldLeft__sc_LinearSeqOptimized__O__F2__O = (function($$this, z, f) {
  var acc = z;
  var these = $$this;
  while ((!these.isEmpty__Z())) {
    acc = f.apply__O__O__O(acc, these.head__O());
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  };
  return acc
});
ScalaJS.s.sc_LinearSeqOptimized$class__exists__sc_LinearSeqOptimized__F1__Z = (function($$this, p) {
  var these = $$this;
  while ((!these.isEmpty__Z())) {
    if (ScalaJS.uZ(p.apply__O__O(these.head__O()))) {
      return true
    };
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  };
  return false
});
ScalaJS.s.sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O = (function($$this, n) {
  var rest = $$this.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
});
ScalaJS.s.sc_LinearSeqOptimized$class__loop$1__p0__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I = (function($$this, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = ScalaJS.as.sc_LinearSeqOptimized(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
});
ScalaJS.s.sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I = (function($$this) {
  var these = $$this;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  };
  return len
});
ScalaJS.s.sc_LinearSeqOptimized$class__last__sc_LinearSeqOptimized__O = (function($$this) {
  if ($$this.isEmpty__Z()) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___()
  };
  var these = $$this;
  var nx = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O());
  while ((!nx.isEmpty__Z())) {
    these = nx;
    nx = ScalaJS.as.sc_LinearSeqOptimized(nx.tail__O())
  };
  return these.head__O()
});
ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z = (function($$this, that) {
  if (ScalaJS.is.sc_LinearSeq(that)) {
    var x2 = ScalaJS.as.sc_LinearSeq(that);
    if (($$this === x2)) {
      return true
    } else {
      var these = $$this;
      var those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O());
        those = ScalaJS.as.sc_LinearSeq(those.tail__O())
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
});
ScalaJS.s.sc_LinearSeqOptimized$class__contains__sc_LinearSeqOptimized__O__Z = (function($$this, elem) {
  var these = $$this;
  while ((!these.isEmpty__Z())) {
    if (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), elem)) {
      return true
    };
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  };
  return false
});
ScalaJS.s.sc_MapLike$class__addString__sc_MapLike__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($$this, b, start, sep, end) {
  var this$2 = $$this.iterator__sc_Iterator();
  var f = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1) {
    return (function(x0$1$2) {
      var x0$1 = ScalaJS.as.T2(x0$1$2);
      if ((x0$1 !== null)) {
        var k = x0$1.$$und1$f;
        var v = x0$1.$$und2$f;
        return (("" + ScalaJS.m.s_Predef$any2stringadd$().$$plus$extension__O__T__T(k, " -> ")) + v)
      } else {
        throw new ScalaJS.c.s_MatchError().init___O(x0$1)
      }
    })
  })($$this));
  var this$3 = new ScalaJS.c.sc_Iterator$$anon$11().init___sc_Iterator__F1(this$2, f);
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this$3, b, start, sep, end)
});
ScalaJS.s.sc_MapLike$class__apply__sc_MapLike__O__O = (function($$this, key) {
  var x1 = $$this.get__O__s_Option(key);
  var x = ScalaJS.m.s_None$();
  if ((x === x1)) {
    return $$this.$default__O__O(key)
  } else if (ScalaJS.is.s_Some(x1)) {
    var x2 = ScalaJS.as.s_Some(x1);
    var value = x2.x$2;
    return value
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(x1)
  }
});
ScalaJS.s.sc_MapLike$class__isEmpty__sc_MapLike__Z = (function($$this) {
  return ($$this.size__I() === 0)
});
ScalaJS.s.sc_MapLike$class__contains__sc_MapLike__O__Z = (function($$this, key) {
  return $$this.get__O__s_Option(key).isDefined__Z()
});
ScalaJS.s.sc_MapLike$class__$default__sc_MapLike__O__O = (function($$this, key) {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T(("key not found: " + key))
});
ScalaJS.s.sc_SeqLike$class__isEmpty__sc_SeqLike__Z = (function($$this) {
  return ($$this.lengthCompare__I__I(0) === 0)
});
ScalaJS.s.sc_SeqLike$class__reverse__sc_SeqLike__O = (function($$this) {
  var elem = ScalaJS.m.sci_Nil$();
  var xs = new ScalaJS.c.sr_ObjectRef().init___O(elem);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, xs$1) {
    return (function(x$2) {
      var this$2 = ScalaJS.as.sci_List(xs$1.elem$1);
      xs$1.elem$1 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(x$2, this$2)
    })
  })($$this, xs)));
  var b = $$this.newBuilder__scm_Builder();
  ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  var this$3 = ScalaJS.as.sci_List(xs.elem$1);
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    b.$$plus$eq__O__scm_Builder(arg1);
    var this$4 = these;
    these = this$4.tail__sci_List()
  };
  return b.result__O()
});
ScalaJS.s.sc_SeqLike$class__sortBy__sc_SeqLike__F1__s_math_Ordering__O = (function($$this, f, ord) {
  var ord$1 = new ScalaJS.c.s_math_Ordering$$anon$5().init___s_math_Ordering__F1(ord, f);
  return ScalaJS.s.sc_SeqLike$class__sorted__sc_SeqLike__s_math_Ordering__O($$this, ord$1)
});
ScalaJS.s.sc_SeqLike$class__reverseIterator__sc_SeqLike__sc_Iterator = (function($$this) {
  return $$this.toCollection__O__sc_Seq($$this.reverse__O()).iterator__sc_Iterator()
});
ScalaJS.s.sc_SeqLike$class__sorted__sc_SeqLike__s_math_Ordering__O = (function($$this, ord) {
  var len = $$this.length__I();
  var arr = new ScalaJS.c.scm_ArraySeq().init___I(len);
  var i = new ScalaJS.c.sr_IntRef().init___I(0);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, arr$1, i$1) {
    return (function(x$2) {
      arr$1.update__I__O__V(i$1.elem$1, x$2);
      i$1.elem$1 = ((1 + i$1.elem$1) | 0)
    })
  })($$this, arr, i)));
  ScalaJS.m.ju_Arrays$().sort__AO__ju_Comparator__V(arr.array$5, ord);
  var b = $$this.newBuilder__scm_Builder();
  b.sizeHint__I__V(len);
  var i$2 = 0;
  while ((i$2 < arr.length$5)) {
    var arg1 = arr.array$5.u[i$2];
    b.$$plus$eq__O__scm_Builder(arg1);
    i$2 = ((1 + i$2) | 0)
  };
  return b.result__O()
});
ScalaJS.s.sc_SeqLike$class__contains__sc_SeqLike__O__Z = (function($$this, elem) {
  return $$this.exists__F1__Z(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, elem$1) {
    return (function(x$12$2) {
      return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(x$12$2, elem$1)
    })
  })($$this, elem)))
});
ScalaJS.s.sc_SetLike$class__isEmpty__sc_SetLike__Z = (function($$this) {
  return ($$this.size__I() === 0)
});
ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O = (function($$this, cbf) {
  var b = cbf.apply__scm_Builder();
  ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Traversable());
  return b.result__O()
});
ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T = (function($$this) {
  return $$this.mkString__T__T__T__T(($$this.stringPrefix__T() + "("), ", ", ")")
});
ScalaJS.s.sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O = (function($$this, f, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1, f$1) {
    return (function(x$2) {
      return ScalaJS.as.scm_Builder(b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(ScalaJS.as.sc_GenTraversableOnce(f$1.apply__O__O(x$2)).seq__sc_TraversableOnce()))
    })
  })($$this, b, f)));
  return b.result__O()
});
ScalaJS.s.sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O = (function($$this, f, bf) {
  var b = ScalaJS.s.sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder($$this, bf);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1, f$1) {
    return (function(x$2) {
      return b$1.$$plus$eq__O__scm_Builder(f$1.apply__O__O(x$2))
    })
  })($$this, b, f)));
  return b.result__O()
});
ScalaJS.s.sc_TraversableLike$class__filterImpl__p0__sc_TraversableLike__F1__Z__O = (function($$this, p, isFlipped) {
  var b = $$this.newBuilder__scm_Builder();
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, p$1, isFlipped$1, b$1) {
    return (function(x$2) {
      return ((ScalaJS.uZ(p$1.apply__O__O(x$2)) !== isFlipped$1) ? b$1.$$plus$eq__O__scm_Builder(x$2) : (void 0))
    })
  })($$this, p, isFlipped, b)));
  return b.result__O()
});
ScalaJS.s.sc_TraversableLike$class__$$plus$plus__sc_TraversableLike__sc_GenTraversableOnce__scg_CanBuildFrom__O = (function($$this, that, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  if (ScalaJS.is.sc_IndexedSeqLike(that)) {
    var delta = that.seq__sc_TraversableOnce().size__I();
    ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__I__V(b, $$this, delta)
  };
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Traversable());
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(that.seq__sc_TraversableOnce());
  return b.result__O()
});
ScalaJS.s.sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder = (function($$this, bf$1) {
  var b = bf$1.apply__O__scm_Builder($$this.repr__O());
  ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  return b
});
ScalaJS.s.sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T = (function($$this) {
  var string = ScalaJS.objectGetClass($$this.repr__O()).getName__T();
  var idx1 = ScalaJS.m.sjsr_RuntimeString$().lastIndexOf__T__I__I(string, 46);
  if ((idx1 !== (-1))) {
    var thiz = string;
    var beginIndex = ((1 + idx1) | 0);
    string = ScalaJS.as.T(thiz["substring"](beginIndex))
  };
  var idx2 = ScalaJS.m.sjsr_RuntimeString$().indexOf__T__I__I(string, 36);
  if ((idx2 !== (-1))) {
    var thiz$1 = string;
    string = ScalaJS.as.T(thiz$1["substring"](0, idx2))
  };
  return string
});
ScalaJS.is.sc_TraversableOnce = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
});
ScalaJS.as.sc_TraversableOnce = (function(obj) {
  return ((ScalaJS.is.sc_TraversableOnce(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.TraversableOnce"))
});
ScalaJS.isArrayOf.sc_TraversableOnce = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
});
ScalaJS.asArrayOf.sc_TraversableOnce = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_TraversableOnce(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.TraversableOnce;", depth))
});
ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($$this, b, start, sep, end) {
  var first = new ScalaJS.c.sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, first$1, b$1, sep$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($$this, first, b, sep)));
  b.append__T__scm_StringBuilder(end);
  return b
});
ScalaJS.s.sc_TraversableOnce$class__to__sc_TraversableOnce__scg_CanBuildFrom__O = (function($$this, cbf) {
  var b = cbf.apply__scm_Builder();
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.seq__sc_TraversableOnce());
  return b.result__O()
});
ScalaJS.s.sc_TraversableOnce$class__foldLeft__sc_TraversableOnce__O__F2__O = (function($$this, z, op) {
  var result = new ScalaJS.c.sr_ObjectRef().init___O(z);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, result$1, op$1) {
    return (function(x$2) {
      result$1.elem$1 = op$1.apply__O__O__O(result$1.elem$1, x$2)
    })
  })($$this, result, op)));
  return result.elem$1
});
ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T = (function($$this, start, sep, end) {
  var this$1 = $$this.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new ScalaJS.c.scm_StringBuilder().init___(), start, sep, end);
  var this$2 = this$1.underlying$5;
  return this$2.content$1
});
ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z = (function($$this) {
  return (!$$this.isEmpty__Z())
});
ScalaJS.s.sc_TraversableOnce$class__size__sc_TraversableOnce__I = (function($$this) {
  var result = new ScalaJS.c.sr_IntRef().init___I(0);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, result$1) {
    return (function(x$2) {
      result$1.elem$1 = ((1 + result$1.elem$1) | 0)
    })
  })($$this, result)));
  return result.elem$1
});
ScalaJS.s.sc_TraversableOnce$class__copyToArray__sc_TraversableOnce__O__I__V = (function($$this, xs, start) {
  $$this.copyToArray__O__I__I__V(xs, start, ((ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0))
});
/** @constructor */
ScalaJS.c.scg_GenMapFactory = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.scg_GenMapFactory.prototype = new ScalaJS.h.O();
ScalaJS.c.scg_GenMapFactory.prototype.constructor = ScalaJS.c.scg_GenMapFactory;
/** @constructor */
ScalaJS.h.scg_GenMapFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenMapFactory.prototype = ScalaJS.c.scg_GenMapFactory.prototype;
ScalaJS.c.scg_GenMapFactory.prototype.apply__sc_Seq__sc_GenMap = (function(elems) {
  return ScalaJS.as.sc_GenMap(ScalaJS.as.scm_Builder(this.newBuilder__scm_Builder().$$plus$plus$eq__sc_TraversableOnce__scg_Growable(elems)).result__O())
});
ScalaJS.c.scg_GenMapFactory.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(this.empty__sc_GenMap())
});
/** @constructor */
ScalaJS.c.scg_GenericCompanion = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.scg_GenericCompanion.prototype = new ScalaJS.h.O();
ScalaJS.c.scg_GenericCompanion.prototype.constructor = ScalaJS.c.scg_GenericCompanion;
/** @constructor */
ScalaJS.h.scg_GenericCompanion = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenericCompanion.prototype = ScalaJS.c.scg_GenericCompanion.prototype;
ScalaJS.is.scg_Growable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scg_Growable)))
});
ScalaJS.as.scg_Growable = (function(obj) {
  return ((ScalaJS.is.scg_Growable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.generic.Growable"))
});
ScalaJS.isArrayOf.scg_Growable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scg_Growable)))
});
ScalaJS.asArrayOf.scg_Growable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scg_Growable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.generic.Growable;", depth))
});
ScalaJS.s.scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V = (function($$this, xs) {
  x: {
    _loop: while (true) {
      var this$1 = xs;
      if (ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
        $$this.$$plus$eq__O__scg_Growable(xs.head__O());
        xs = ScalaJS.as.sc_LinearSeq(xs.tail__O());
        continue _loop
      };
      break x
    }
  }
});
ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable = (function($$this, xs) {
  if (ScalaJS.is.sc_LinearSeq(xs)) {
    var x2 = ScalaJS.as.sc_LinearSeq(xs);
    ScalaJS.s.scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V($$this, x2)
  } else {
    xs.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1) {
      return (function(elem$2) {
        return $$this$1.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($$this)))
  };
  return $$this
});
/** @constructor */
ScalaJS.c.sci_HashMap$Merger = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_HashMap$Merger.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_HashMap$Merger.prototype.constructor = ScalaJS.c.sci_HashMap$Merger;
/** @constructor */
ScalaJS.h.sci_HashMap$Merger = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$Merger.prototype = ScalaJS.c.sci_HashMap$Merger.prototype;
ScalaJS.s.sci_Map$class__withDefaultValue__sci_Map__O__sci_Map = (function($$this, d) {
  return new ScalaJS.c.sci_Map$WithDefault().init___sci_Map__F1($$this, new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, d$1) {
    return (function(x$2) {
      return d$1
    })
  })($$this, d)))
});
/** @constructor */
ScalaJS.c.sci_Stream$$hash$colon$colon$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_Stream$$hash$colon$colon$.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_Stream$$hash$colon$colon$.prototype.constructor = ScalaJS.c.sci_Stream$$hash$colon$colon$;
/** @constructor */
ScalaJS.h.sci_Stream$$hash$colon$colon$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$$hash$colon$colon$.prototype = ScalaJS.c.sci_Stream$$hash$colon$colon$.prototype;
ScalaJS.d.sci_Stream$$hash$colon$colon$ = new ScalaJS.ClassTypeData({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
ScalaJS.c.sci_Stream$$hash$colon$colon$.prototype.$classData = ScalaJS.d.sci_Stream$$hash$colon$colon$;
ScalaJS.n.sci_Stream$$hash$colon$colon$ = (void 0);
ScalaJS.m.sci_Stream$$hash$colon$colon$ = (function() {
  if ((!ScalaJS.n.sci_Stream$$hash$colon$colon$)) {
    ScalaJS.n.sci_Stream$$hash$colon$colon$ = new ScalaJS.c.sci_Stream$$hash$colon$colon$().init___()
  };
  return ScalaJS.n.sci_Stream$$hash$colon$colon$
});
/** @constructor */
ScalaJS.c.sci_Stream$ConsWrapper = (function() {
  ScalaJS.c.O.call(this);
  this.tl$1 = null
});
ScalaJS.c.sci_Stream$ConsWrapper.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_Stream$ConsWrapper.prototype.constructor = ScalaJS.c.sci_Stream$ConsWrapper;
/** @constructor */
ScalaJS.h.sci_Stream$ConsWrapper = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$ConsWrapper.prototype = ScalaJS.c.sci_Stream$ConsWrapper.prototype;
ScalaJS.c.sci_Stream$ConsWrapper.prototype.init___F0 = (function(tl) {
  this.tl$1 = tl;
  return this
});
ScalaJS.c.sci_Stream$ConsWrapper.prototype.$$hash$colon$colon__O__sci_Stream = (function(hd) {
  var tl = this.tl$1;
  return new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd, tl)
});
ScalaJS.d.sci_Stream$ConsWrapper = new ScalaJS.ClassTypeData({
  sci_Stream$ConsWrapper: 0
}, false, "scala.collection.immutable.Stream$ConsWrapper", {
  sci_Stream$ConsWrapper: 1,
  O: 1
});
ScalaJS.c.sci_Stream$ConsWrapper.prototype.$classData = ScalaJS.d.sci_Stream$ConsWrapper;
/** @constructor */
ScalaJS.c.sci_StreamIterator$LazyCell = (function() {
  ScalaJS.c.O.call(this);
  this.st$1 = null;
  this.v$1 = null;
  this.$$outer$f = null;
  this.bitmap$0$1 = false
});
ScalaJS.c.sci_StreamIterator$LazyCell.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.constructor = ScalaJS.c.sci_StreamIterator$LazyCell;
/** @constructor */
ScalaJS.h.sci_StreamIterator$LazyCell = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_StreamIterator$LazyCell.prototype = ScalaJS.c.sci_StreamIterator$LazyCell.prototype;
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.init___sci_StreamIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.v$lzycompute__p1__sci_Stream = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = ScalaJS.as.sci_Stream(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.v__sci_Stream = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
});
ScalaJS.d.sci_StreamIterator$LazyCell = new ScalaJS.ClassTypeData({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.$classData = ScalaJS.d.sci_StreamIterator$LazyCell;
ScalaJS.s.sci_StringLike$class__slice__sci_StringLike__I__I__O = (function($$this, from, until) {
  var start = ((from > 0) ? from : 0);
  var that = $$this.length__I();
  var end = ((until < that) ? until : that);
  if ((start >= end)) {
    return $$this.newBuilder__scm_Builder().result__O()
  } else {
    var jsx$1 = $$this.newBuilder__scm_Builder();
    var thiz = $$this.toString__T();
    var x = ScalaJS.as.T(thiz["substring"](start, end));
    return ScalaJS.as.scm_Builder(jsx$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(new ScalaJS.c.sci_StringOps().init___T(x))).result__O()
  }
});
/** @constructor */
ScalaJS.c.sci_StringOps$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_StringOps$.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_StringOps$.prototype.constructor = ScalaJS.c.sci_StringOps$;
/** @constructor */
ScalaJS.h.sci_StringOps$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_StringOps$.prototype = ScalaJS.c.sci_StringOps$.prototype;
ScalaJS.c.sci_StringOps$.prototype.equals$extension__T__O__Z = (function($$this, x$1) {
  if (ScalaJS.is.sci_StringOps(x$1)) {
    var StringOps$1 = ((x$1 === null) ? null : ScalaJS.as.sci_StringOps(x$1).repr$1);
    return ($$this === StringOps$1)
  } else {
    return false
  }
});
ScalaJS.c.sci_StringOps$.prototype.slice$extension__T__I__I__T = (function($$this, from, until) {
  var start = ((from < 0) ? 0 : from);
  if (((until <= start) || (start >= ScalaJS.uI($$this["length"])))) {
    return ""
  };
  var end = ((until > ScalaJS.uI($$this["length"])) ? ScalaJS.uI($$this["length"]) : until);
  return ScalaJS.as.T($$this["substring"](start, end))
});
ScalaJS.d.sci_StringOps$ = new ScalaJS.ClassTypeData({
  sci_StringOps$: 0
}, false, "scala.collection.immutable.StringOps$", {
  sci_StringOps$: 1,
  O: 1
});
ScalaJS.c.sci_StringOps$.prototype.$classData = ScalaJS.d.sci_StringOps$;
ScalaJS.n.sci_StringOps$ = (void 0);
ScalaJS.m.sci_StringOps$ = (function() {
  if ((!ScalaJS.n.sci_StringOps$)) {
    ScalaJS.n.sci_StringOps$ = new ScalaJS.c.sci_StringOps$().init___()
  };
  return ScalaJS.n.sci_StringOps$
});
ScalaJS.s.sci_VectorPointer$class__getElem__sci_VectorPointer__I__I__O = (function($$this, index, xor) {
  if ((xor < 32)) {
    return $$this.display0__AO().u[(31 & index)]
  } else if ((xor < 1024)) {
    return ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 32768)) {
    return ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1048576)) {
    return ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 33554432)) {
    return ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O($$this.display4__AO().u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1073741824)) {
    return ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O($$this.display5__AO().u[(31 & (index >> 25))], 1).u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
ScalaJS.s.sci_VectorPointer$class__gotoNextBlockStartWritable__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor < 1024)) {
    if (($$this.depth__I() === 1)) {
      $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display1__AO().u[0] = $$this.display0__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO()
  } else if ((xor < 32768)) {
    if (($$this.depth__I() === 2)) {
      $$this.display2$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display2__AO().u[0] = $$this.display1__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO()
  } else if ((xor < 1048576)) {
    if (($$this.depth__I() === 3)) {
      $$this.display3$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display3__AO().u[0] = $$this.display2__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO()
  } else if ((xor < 33554432)) {
    if (($$this.depth__I() === 4)) {
      $$this.display4$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display4__AO().u[0] = $$this.display3__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display3$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO()
  } else if ((xor < 1073741824)) {
    if (($$this.depth__I() === 5)) {
      $$this.display5$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display5__AO().u[0] = $$this.display4__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display3$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display4$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
    $$this.display5__AO().u[(31 & (index >> 25))] = $$this.display4__AO()
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
ScalaJS.s.sci_VectorPointer$class__gotoPosWritable0__sci_VectorPointer__I__I__V = (function($$this, newIndex, xor) {
  var x1 = (((-1) + $$this.depth__I()) | 0);
  switch (x1) {
    case 5:
      {
        var a = $$this.display5__AO();
        $$this.display5$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a));
        var array = $$this.display5__AO();
        var index = (31 & (newIndex >> 25));
        $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array, index));
        var array$1 = $$this.display4__AO();
        var index$1 = (31 & (newIndex >> 20));
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$1, index$1));
        var array$2 = $$this.display3__AO();
        var index$2 = (31 & (newIndex >> 15));
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$2, index$2));
        var array$3 = $$this.display2__AO();
        var index$3 = (31 & (newIndex >> 10));
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$3, index$3));
        var array$4 = $$this.display1__AO();
        var index$4 = (31 & (newIndex >> 5));
        $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$4, index$4));
        break
      };
    case 4:
      {
        var a$1 = $$this.display4__AO();
        $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$1));
        var array$5 = $$this.display4__AO();
        var index$5 = (31 & (newIndex >> 20));
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$5, index$5));
        var array$6 = $$this.display3__AO();
        var index$6 = (31 & (newIndex >> 15));
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$6, index$6));
        var array$7 = $$this.display2__AO();
        var index$7 = (31 & (newIndex >> 10));
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$7, index$7));
        var array$8 = $$this.display1__AO();
        var index$8 = (31 & (newIndex >> 5));
        $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$8, index$8));
        break
      };
    case 3:
      {
        var a$2 = $$this.display3__AO();
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$2));
        var array$9 = $$this.display3__AO();
        var index$9 = (31 & (newIndex >> 15));
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$9, index$9));
        var array$10 = $$this.display2__AO();
        var index$10 = (31 & (newIndex >> 10));
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$10, index$10));
        var array$11 = $$this.display1__AO();
        var index$11 = (31 & (newIndex >> 5));
        $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$11, index$11));
        break
      };
    case 2:
      {
        var a$3 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$3));
        var array$12 = $$this.display2__AO();
        var index$12 = (31 & (newIndex >> 10));
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$12, index$12));
        var array$13 = $$this.display1__AO();
        var index$13 = (31 & (newIndex >> 5));
        $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$13, index$13));
        break
      };
    case 1:
      {
        var a$4 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$4));
        var array$14 = $$this.display1__AO();
        var index$14 = (31 & (newIndex >> 5));
        $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$14, index$14));
        break
      };
    case 0:
      {
        var a$5 = $$this.display0__AO();
        $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$5));
        break
      };
    default:
      throw new ScalaJS.c.s_MatchError().init___O(x1);
  }
});
ScalaJS.s.sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V = (function($$this, index) {
  var x1 = (((-1) + $$this.depth__I()) | 0);
  switch (x1) {
    case 5:
      {
        var a = $$this.display5__AO();
        $$this.display5$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a));
        var a$1 = $$this.display4__AO();
        $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$1));
        var a$2 = $$this.display3__AO();
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$2));
        var a$3 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$3));
        var a$4 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$4));
        $$this.display5__AO().u[(31 & (index >> 25))] = $$this.display4__AO();
        $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
        $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
        $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 4:
      {
        var a$5 = $$this.display4__AO();
        $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$5));
        var a$6 = $$this.display3__AO();
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$6));
        var a$7 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$7));
        var a$8 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$8));
        $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
        $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
        $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 3:
      {
        var a$9 = $$this.display3__AO();
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$9));
        var a$10 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$10));
        var a$11 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$11));
        $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
        $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 2:
      {
        var a$12 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$12));
        var a$13 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$13));
        $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 1:
      {
        var a$14 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$14));
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 0:
      break;
    default:
      throw new ScalaJS.c.s_MatchError().init___O(x1);
  }
});
ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO = (function($$this, array, index) {
  var x = array.u[index];
  array.u[index] = null;
  var a = ScalaJS.asArrayOf.O(x, 1);
  return ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a)
});
ScalaJS.s.sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V = (function($$this, that, depth) {
  $$this.depth$und$eq__I__V(depth);
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1):
      break;
    case 0:
      {
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 1:
      {
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 2:
      {
        $$this.display2$und$eq__AO__V(that.display2__AO());
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 3:
      {
        $$this.display3$und$eq__AO__V(that.display3__AO());
        $$this.display2$und$eq__AO__V(that.display2__AO());
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 4:
      {
        $$this.display4$und$eq__AO__V(that.display4__AO());
        $$this.display3$und$eq__AO__V(that.display3__AO());
        $$this.display2$und$eq__AO__V(that.display2__AO());
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 5:
      {
        $$this.display5$und$eq__AO__V(that.display5__AO());
        $$this.display4$und$eq__AO__V(that.display4__AO());
        $$this.display3$und$eq__AO__V(that.display3__AO());
        $$this.display2$und$eq__AO__V(that.display2__AO());
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    default:
      throw new ScalaJS.c.s_MatchError().init___O(x1);
  }
});
ScalaJS.s.sci_VectorPointer$class__gotoNextBlockStart__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor < 1024)) {
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
  } else if ((xor < 32768)) {
    $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[0], 1))
  } else if ((xor < 1048576)) {
    $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1));
    $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[0], 1))
  } else if ((xor < 33554432)) {
    $$this.display3$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display4__AO().u[(31 & (index >> 20))], 1));
    $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[0], 1));
    $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[0], 1))
  } else if ((xor < 1073741824)) {
    $$this.display4$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display5__AO().u[(31 & (index >> 25))], 1));
    $$this.display3$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display4__AO().u[0], 1));
    $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[0], 1));
    $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[0], 1))
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
ScalaJS.s.sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 32768)) {
      $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1048576)) {
      $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 33554432)) {
      $$this.display3$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display4__AO().u[(31 & (index >> 20))], 1));
      $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1073741824)) {
      $$this.display4$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display5__AO().u[(31 & (index >> 25))], 1));
      $$this.display3$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display4__AO().u[(31 & (index >> 20))], 1));
      $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else {
      throw new ScalaJS.c.jl_IllegalArgumentException().init___()
    }
  }
});
ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO = (function($$this, a) {
  if ((a === null)) {
    var this$2 = ScalaJS.m.s_Console$();
    var this$3 = this$2.outVar$2;
    ScalaJS.as.Ljava_io_PrintStream(this$3.tl$1.get__O()).println__O__V("NULL")
  };
  var b = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [a.u["length"]]);
  var length = a.u["length"];
  ScalaJS.systemArraycopy(a, 0, b, 0, length);
  return b
});
ScalaJS.s.sci_VectorPointer$class__gotoPosWritable1__sci_VectorPointer__I__I__I__V = (function($$this, oldIndex, newIndex, xor) {
  if ((xor < 32)) {
    var a = $$this.display0__AO();
    $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a))
  } else if ((xor < 1024)) {
    var a$1 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$1));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    var array = $$this.display1__AO();
    var index = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array, index))
  } else if ((xor < 32768)) {
    var a$2 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$2));
    var a$3 = $$this.display2__AO();
    $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$3));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
    var array$1 = $$this.display2__AO();
    var index$1 = (31 & (newIndex >> 10));
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$1, index$1));
    var array$2 = $$this.display1__AO();
    var index$2 = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$2, index$2))
  } else if ((xor < 1048576)) {
    var a$4 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$4));
    var a$5 = $$this.display2__AO();
    $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$5));
    var a$6 = $$this.display3__AO();
    $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$6));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (oldIndex >> 15))] = $$this.display2__AO();
    var array$3 = $$this.display3__AO();
    var index$3 = (31 & (newIndex >> 15));
    $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$3, index$3));
    var array$4 = $$this.display2__AO();
    var index$4 = (31 & (newIndex >> 10));
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$4, index$4));
    var array$5 = $$this.display1__AO();
    var index$5 = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$5, index$5))
  } else if ((xor < 33554432)) {
    var a$7 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$7));
    var a$8 = $$this.display2__AO();
    $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$8));
    var a$9 = $$this.display3__AO();
    $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$9));
    var a$10 = $$this.display4__AO();
    $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$10));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (oldIndex >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (oldIndex >> 20))] = $$this.display3__AO();
    var array$6 = $$this.display4__AO();
    var index$6 = (31 & (newIndex >> 20));
    $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$6, index$6));
    var array$7 = $$this.display3__AO();
    var index$7 = (31 & (newIndex >> 15));
    $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$7, index$7));
    var array$8 = $$this.display2__AO();
    var index$8 = (31 & (newIndex >> 10));
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$8, index$8));
    var array$9 = $$this.display1__AO();
    var index$9 = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$9, index$9))
  } else if ((xor < 1073741824)) {
    var a$11 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$11));
    var a$12 = $$this.display2__AO();
    $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$12));
    var a$13 = $$this.display3__AO();
    $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$13));
    var a$14 = $$this.display4__AO();
    $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$14));
    var a$15 = $$this.display5__AO();
    $$this.display5$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$15));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (oldIndex >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (oldIndex >> 20))] = $$this.display3__AO();
    $$this.display5__AO().u[(31 & (oldIndex >> 25))] = $$this.display4__AO();
    var array$10 = $$this.display5__AO();
    var index$10 = (31 & (newIndex >> 25));
    $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$10, index$10));
    var array$11 = $$this.display4__AO();
    var index$11 = (31 & (newIndex >> 20));
    $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$11, index$11));
    var array$12 = $$this.display3__AO();
    var index$12 = (31 & (newIndex >> 15));
    $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$12, index$12));
    var array$13 = $$this.display2__AO();
    var index$13 = (31 & (newIndex >> 10));
    $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$13, index$13));
    var array$14 = $$this.display1__AO();
    var index$14 = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$14, index$14))
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
/** @constructor */
ScalaJS.c.sci_WrappedString$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_WrappedString$.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_WrappedString$.prototype.constructor = ScalaJS.c.sci_WrappedString$;
/** @constructor */
ScalaJS.h.sci_WrappedString$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_WrappedString$.prototype = ScalaJS.c.sci_WrappedString$.prototype;
ScalaJS.c.sci_WrappedString$.prototype.newBuilder__scm_Builder = (function() {
  var this$3 = new ScalaJS.c.scm_StringBuilder().init___();
  var f = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(x$2) {
      var x = ScalaJS.as.T(x$2);
      return new ScalaJS.c.sci_WrappedString().init___T(x)
    })
  })(this));
  return new ScalaJS.c.scm_Builder$$anon$1().init___scm_Builder__F1(this$3, f)
});
ScalaJS.d.sci_WrappedString$ = new ScalaJS.ClassTypeData({
  sci_WrappedString$: 0
}, false, "scala.collection.immutable.WrappedString$", {
  sci_WrappedString$: 1,
  O: 1
});
ScalaJS.c.sci_WrappedString$.prototype.$classData = ScalaJS.d.sci_WrappedString$;
ScalaJS.n.sci_WrappedString$ = (void 0);
ScalaJS.m.sci_WrappedString$ = (function() {
  if ((!ScalaJS.n.sci_WrappedString$)) {
    ScalaJS.n.sci_WrappedString$ = new ScalaJS.c.sci_WrappedString$().init___()
  };
  return ScalaJS.n.sci_WrappedString$
});
ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V = (function($$this, coll) {
  if (ScalaJS.is.sc_IndexedSeqLike(coll)) {
    $$this.sizeHint__I__V(coll.size__I())
  }
});
ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__I__V = (function($$this, coll, delta) {
  if (ScalaJS.is.sc_IndexedSeqLike(coll)) {
    $$this.sizeHint__I__V(((coll.size__I() + delta) | 0))
  }
});
ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V = (function($$this, size, boundingColl) {
  if (ScalaJS.is.sc_IndexedSeqLike(boundingColl)) {
    var that = boundingColl.size__I();
    $$this.sizeHint__I__V(((size < that) ? size : that))
  }
});
/** @constructor */
ScalaJS.c.scm_FlatHashTable$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.scm_FlatHashTable$.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_FlatHashTable$.prototype.constructor = ScalaJS.c.scm_FlatHashTable$;
/** @constructor */
ScalaJS.h.scm_FlatHashTable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_FlatHashTable$.prototype = ScalaJS.c.scm_FlatHashTable$.prototype;
ScalaJS.c.scm_FlatHashTable$.prototype.newThreshold__I__I__I = (function(_loadFactor, size) {
  var assertion = (_loadFactor < 500);
  if ((!assertion)) {
    throw new ScalaJS.c.jl_AssertionError().init___O(("assertion failed: " + "loadFactor too large; must be < 0.5"))
  };
  return new ScalaJS.c.sjsr_RuntimeLong().init___I(size).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I(_loadFactor)).$$div__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(1000, 0, 0)).toInt__I()
});
ScalaJS.d.scm_FlatHashTable$ = new ScalaJS.ClassTypeData({
  scm_FlatHashTable$: 0
}, false, "scala.collection.mutable.FlatHashTable$", {
  scm_FlatHashTable$: 1,
  O: 1
});
ScalaJS.c.scm_FlatHashTable$.prototype.$classData = ScalaJS.d.scm_FlatHashTable$;
ScalaJS.n.scm_FlatHashTable$ = (void 0);
ScalaJS.m.scm_FlatHashTable$ = (function() {
  if ((!ScalaJS.n.scm_FlatHashTable$)) {
    ScalaJS.n.scm_FlatHashTable$ = new ScalaJS.c.scm_FlatHashTable$().init___()
  };
  return ScalaJS.n.scm_FlatHashTable$
});
ScalaJS.s.scm_FlatHashTable$HashUtils$class__improve__scm_FlatHashTable$HashUtils__I__I__I = (function($$this, hcode, seed) {
  var improved = ScalaJS.m.s_util_hashing_package$().byteswap32__I__I(hcode);
  var rotation = (seed % 32);
  var rotated = (((improved >>> rotation) | 0) | (improved << ((32 - rotation) | 0)));
  return rotated
});
ScalaJS.s.scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O = (function($$this, entry) {
  return ((entry === ScalaJS.m.scm_FlatHashTable$NullSentinel$()) ? null : entry)
});
ScalaJS.s.scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O = (function($$this, elem) {
  return ((elem === null) ? ScalaJS.m.scm_FlatHashTable$NullSentinel$() : elem)
});
/** @constructor */
ScalaJS.c.scm_FlatHashTable$NullSentinel$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.scm_FlatHashTable$NullSentinel$.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_FlatHashTable$NullSentinel$.prototype.constructor = ScalaJS.c.scm_FlatHashTable$NullSentinel$;
/** @constructor */
ScalaJS.h.scm_FlatHashTable$NullSentinel$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_FlatHashTable$NullSentinel$.prototype = ScalaJS.c.scm_FlatHashTable$NullSentinel$.prototype;
ScalaJS.c.scm_FlatHashTable$NullSentinel$.prototype.toString__T = (function() {
  return "NullSentinel"
});
ScalaJS.c.scm_FlatHashTable$NullSentinel$.prototype.hashCode__I = (function() {
  return 0
});
ScalaJS.d.scm_FlatHashTable$NullSentinel$ = new ScalaJS.ClassTypeData({
  scm_FlatHashTable$NullSentinel$: 0
}, false, "scala.collection.mutable.FlatHashTable$NullSentinel$", {
  scm_FlatHashTable$NullSentinel$: 1,
  O: 1
});
ScalaJS.c.scm_FlatHashTable$NullSentinel$.prototype.$classData = ScalaJS.d.scm_FlatHashTable$NullSentinel$;
ScalaJS.n.scm_FlatHashTable$NullSentinel$ = (void 0);
ScalaJS.m.scm_FlatHashTable$NullSentinel$ = (function() {
  if ((!ScalaJS.n.scm_FlatHashTable$NullSentinel$)) {
    ScalaJS.n.scm_FlatHashTable$NullSentinel$ = new ScalaJS.c.scm_FlatHashTable$NullSentinel$().init___()
  };
  return ScalaJS.n.scm_FlatHashTable$NullSentinel$
});
ScalaJS.s.scm_FlatHashTable$class__growTable__p0__scm_FlatHashTable__V = (function($$this) {
  var oldtable = $$this.table$5;
  $$this.table$5 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [ScalaJS.imul(2, $$this.table$5.u["length"])]);
  $$this.tableSize$5 = 0;
  var tableLength = $$this.table$5.u["length"];
  ScalaJS.s.scm_FlatHashTable$class__nnSizeMapReset__scm_FlatHashTable__I__V($$this, tableLength);
  $$this.seedvalue$5 = ScalaJS.s.scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I($$this);
  $$this.threshold$5 = ScalaJS.m.scm_FlatHashTable$().newThreshold__I__I__I($$this.$$undloadFactor$5, $$this.table$5.u["length"]);
  var i = 0;
  while ((i < oldtable.u["length"])) {
    var entry = oldtable.u[i];
    if ((entry !== null)) {
      ScalaJS.s.scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z($$this, entry)
    };
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.scm_FlatHashTable$class__calcSizeMapSize__scm_FlatHashTable__I__I = (function($$this, tableLength) {
  return ((1 + (tableLength >> 5)) | 0)
});
ScalaJS.s.scm_FlatHashTable$class__nnSizeMapAdd__scm_FlatHashTable__I__V = (function($$this, h) {
  if (($$this.sizemap$5 !== null)) {
    var p = (h >> 5);
    var ev$1 = $$this.sizemap$5;
    ev$1.u[p] = ((1 + ev$1.u[p]) | 0)
  }
});
ScalaJS.s.scm_FlatHashTable$class__$$init$__scm_FlatHashTable__V = (function($$this) {
  $$this.$$undloadFactor$5 = 450;
  $$this.table$5 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [ScalaJS.s.scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I($$this, 32)]);
  $$this.tableSize$5 = 0;
  $$this.threshold$5 = ScalaJS.m.scm_FlatHashTable$().newThreshold__I__I__I($$this.$$undloadFactor$5, ScalaJS.s.scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I($$this, 32));
  $$this.sizemap$5 = null;
  $$this.seedvalue$5 = ScalaJS.s.scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I($$this)
});
ScalaJS.s.scm_FlatHashTable$class__findElemImpl__p0__scm_FlatHashTable__O__O = (function($$this, elem) {
  var searchEntry = ScalaJS.s.scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O($$this, elem);
  var hcode = ScalaJS.objectHashCode(searchEntry);
  var h = ScalaJS.s.scm_FlatHashTable$class__index__scm_FlatHashTable__I__I($$this, hcode);
  var curEntry = $$this.table$5.u[h];
  while (((curEntry !== null) && (!ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(curEntry, searchEntry)))) {
    h = (((1 + h) | 0) % $$this.table$5.u["length"]);
    curEntry = $$this.table$5.u[h]
  };
  return curEntry
});
ScalaJS.s.scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z = (function($$this, newEntry) {
  var hcode = ScalaJS.objectHashCode(newEntry);
  var h = ScalaJS.s.scm_FlatHashTable$class__index__scm_FlatHashTable__I__I($$this, hcode);
  var curEntry = $$this.table$5.u[h];
  while ((curEntry !== null)) {
    if (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(curEntry, newEntry)) {
      return false
    };
    h = (((1 + h) | 0) % $$this.table$5.u["length"]);
    curEntry = $$this.table$5.u[h]
  };
  $$this.table$5.u[h] = newEntry;
  $$this.tableSize$5 = ((1 + $$this.tableSize$5) | 0);
  var h$1 = h;
  ScalaJS.s.scm_FlatHashTable$class__nnSizeMapAdd__scm_FlatHashTable__I__V($$this, h$1);
  if (($$this.tableSize$5 >= $$this.threshold$5)) {
    ScalaJS.s.scm_FlatHashTable$class__growTable__p0__scm_FlatHashTable__V($$this)
  };
  return true
});
ScalaJS.s.scm_FlatHashTable$class__addElem__scm_FlatHashTable__O__Z = (function($$this, elem) {
  var newEntry = ScalaJS.s.scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O($$this, elem);
  return ScalaJS.s.scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z($$this, newEntry)
});
ScalaJS.s.scm_FlatHashTable$class__index__scm_FlatHashTable__I__I = (function($$this, hcode) {
  var seed = $$this.seedvalue$5;
  var improved = ScalaJS.s.scm_FlatHashTable$HashUtils$class__improve__scm_FlatHashTable$HashUtils__I__I__I($$this, hcode, seed);
  var ones = (((-1) + $$this.table$5.u["length"]) | 0);
  return (((improved >>> ((32 - ScalaJS.m.jl_Integer$().bitCount__I__I(ones)) | 0)) | 0) & ones)
});
ScalaJS.s.scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I = (function($$this, expectedSize) {
  return ((expectedSize === 0) ? 1 : ScalaJS.m.scm_HashTable$().powerOfTwo__I__I(expectedSize))
});
ScalaJS.s.scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I = (function($$this) {
  return ScalaJS.m.jl_Integer$().bitCount__I__I((((-1) + $$this.table$5.u["length"]) | 0))
});
ScalaJS.s.scm_FlatHashTable$class__nnSizeMapReset__scm_FlatHashTable__I__V = (function($$this, tableLength) {
  if (($$this.sizemap$5 !== null)) {
    var nsize = ScalaJS.s.scm_FlatHashTable$class__calcSizeMapSize__scm_FlatHashTable__I__I($$this, tableLength);
    if (($$this.sizemap$5.u["length"] !== nsize)) {
      $$this.sizemap$5 = ScalaJS.newArrayObject(ScalaJS.d.I.getArrayOf(), [nsize])
    } else {
      var this$1 = ScalaJS.m.ju_Arrays$();
      var a = $$this.sizemap$5;
      this$1.fillImpl$mIc$sp__p1__AI__I__V(a, 0)
    }
  }
});
ScalaJS.s.scm_FlatHashTable$class__initWithContents__scm_FlatHashTable__scm_FlatHashTable$Contents__V = (function($$this, c) {
  if ((c !== null)) {
    $$this.$$undloadFactor$5 = c.loadFactor__I();
    $$this.table$5 = c.table__AO();
    $$this.tableSize$5 = c.tableSize__I();
    $$this.threshold$5 = c.threshold__I();
    $$this.seedvalue$5 = c.seedvalue__I();
    $$this.sizemap$5 = c.sizemap__AI()
  }
});
ScalaJS.s.scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z = (function($$this, elem) {
  return (ScalaJS.s.scm_FlatHashTable$class__findElemImpl__p0__scm_FlatHashTable__O__O($$this, elem) !== null)
});
/** @constructor */
ScalaJS.c.scm_HashTable$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.scm_HashTable$.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_HashTable$.prototype.constructor = ScalaJS.c.scm_HashTable$;
/** @constructor */
ScalaJS.h.scm_HashTable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_HashTable$.prototype = ScalaJS.c.scm_HashTable$.prototype;
ScalaJS.c.scm_HashTable$.prototype.capacity__I__I = (function(expectedSize) {
  return ((expectedSize === 0) ? 1 : this.powerOfTwo__I__I(expectedSize))
});
ScalaJS.c.scm_HashTable$.prototype.newThreshold__I__I__I = (function(_loadFactor, size) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I(size).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I(_loadFactor)).$$div__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(1000, 0, 0)).toInt__I()
});
ScalaJS.c.scm_HashTable$.prototype.powerOfTwo__I__I = (function(target) {
  var c = (((-1) + target) | 0);
  c = (c | ((c >>> 1) | 0));
  c = (c | ((c >>> 2) | 0));
  c = (c | ((c >>> 4) | 0));
  c = (c | ((c >>> 8) | 0));
  c = (c | ((c >>> 16) | 0));
  return ((1 + c) | 0)
});
ScalaJS.d.scm_HashTable$ = new ScalaJS.ClassTypeData({
  scm_HashTable$: 0
}, false, "scala.collection.mutable.HashTable$", {
  scm_HashTable$: 1,
  O: 1
});
ScalaJS.c.scm_HashTable$.prototype.$classData = ScalaJS.d.scm_HashTable$;
ScalaJS.n.scm_HashTable$ = (void 0);
ScalaJS.m.scm_HashTable$ = (function() {
  if ((!ScalaJS.n.scm_HashTable$)) {
    ScalaJS.n.scm_HashTable$ = new ScalaJS.c.scm_HashTable$().init___()
  };
  return ScalaJS.n.scm_HashTable$
});
ScalaJS.s.scm_HashTable$HashUtils$class__improve__scm_HashTable$HashUtils__I__I__I = (function($$this, hcode, seed) {
  var i = ScalaJS.m.s_util_hashing_package$().byteswap32__I__I(hcode);
  var rotation = (seed % 32);
  var rotated = (((i >>> rotation) | 0) | (i << ((32 - rotation) | 0)));
  return rotated
});
ScalaJS.s.scm_HashTable$class__initWithContents__scm_HashTable__scm_HashTable$Contents__V = (function($$this, c) {
  if ((c !== null)) {
    $$this.$$undloadFactor$5 = c.loadFactor__I();
    $$this.table$5 = c.table__Ascm_HashEntry();
    $$this.tableSize$5 = c.tableSize__I();
    $$this.threshold$5 = c.threshold__I();
    $$this.seedvalue$5 = c.seedvalue__I();
    $$this.sizemap$5 = c.sizemap__AI()
  }
});
ScalaJS.s.scm_HashTable$class__scala$collection$mutable$HashTable$$lastPopulatedIndex__scm_HashTable__I = (function($$this) {
  var idx = (((-1) + $$this.table$5.u["length"]) | 0);
  while ((($$this.table$5.u[idx] === null) && (idx > 0))) {
    idx = (((-1) + idx) | 0)
  };
  return idx
});
ScalaJS.s.scm_HashTable$class__findEntry__scm_HashTable__O__scm_HashEntry = (function($$this, key) {
  var hcode = ScalaJS.m.sr_ScalaRunTime$().hash__O__I(key);
  return ScalaJS.s.scm_HashTable$class__scala$collection$mutable$HashTable$$findEntry0__scm_HashTable__O__I__scm_HashEntry($$this, key, ScalaJS.s.scm_HashTable$class__index__scm_HashTable__I__I($$this, hcode))
});
ScalaJS.s.scm_HashTable$class__scala$collection$mutable$HashTable$$findEntry0__scm_HashTable__O__I__scm_HashEntry = (function($$this, key, h) {
  var e = $$this.table$5.u[h];
  while (true) {
    if ((e !== null)) {
      var key1 = e.key$1;
      var jsx$1 = (!ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key1, key))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      e = ScalaJS.as.scm_HashEntry(e.next$1)
    } else {
      break
    }
  };
  return e
});
ScalaJS.s.scm_HashTable$class__nnSizeMapAdd__scm_HashTable__I__V = (function($$this, h) {
  if (($$this.sizemap$5 !== null)) {
    var ev$1 = $$this.sizemap$5;
    var ev$2 = (h >> 5);
    ev$1.u[ev$2] = ((1 + ev$1.u[ev$2]) | 0)
  }
});
ScalaJS.s.scm_HashTable$class__calcSizeMapSize__scm_HashTable__I__I = (function($$this, tableLength) {
  return ((1 + (tableLength >> 5)) | 0)
});
ScalaJS.s.scm_HashTable$class__resize__p0__scm_HashTable__I__V = (function($$this, newSize) {
  var oldTable = $$this.table$5;
  $$this.table$5 = ScalaJS.newArrayObject(ScalaJS.d.scm_HashEntry.getArrayOf(), [newSize]);
  var tableLength = $$this.table$5.u["length"];
  ScalaJS.s.scm_HashTable$class__nnSizeMapReset__scm_HashTable__I__V($$this, tableLength);
  var i = (((-1) + oldTable.u["length"]) | 0);
  while ((i >= 0)) {
    var e = oldTable.u[i];
    while ((e !== null)) {
      var key = e.key$1;
      var hcode = ScalaJS.m.sr_ScalaRunTime$().hash__O__I(key);
      var h = ScalaJS.s.scm_HashTable$class__index__scm_HashTable__I__I($$this, hcode);
      var e1 = ScalaJS.as.scm_HashEntry(e.next$1);
      e.next$1 = $$this.table$5.u[h];
      $$this.table$5.u[h] = e;
      e = e1;
      ScalaJS.s.scm_HashTable$class__nnSizeMapAdd__scm_HashTable__I__V($$this, h)
    };
    i = (((-1) + i) | 0)
  };
  $$this.threshold$5 = ScalaJS.m.scm_HashTable$().newThreshold__I__I__I($$this.$$undloadFactor$5, newSize)
});
ScalaJS.s.scm_HashTable$class__$$init$__scm_HashTable__V = (function($$this) {
  $$this.$$undloadFactor$5 = 750;
  $$this.table$5 = ScalaJS.newArrayObject(ScalaJS.d.scm_HashEntry.getArrayOf(), [ScalaJS.m.scm_HashTable$().capacity__I__I(16)]);
  $$this.tableSize$5 = 0;
  $$this.threshold$5 = ScalaJS.s.scm_HashTable$class__initialThreshold__p0__scm_HashTable__I__I($$this, $$this.$$undloadFactor$5);
  $$this.sizemap$5 = null;
  $$this.seedvalue$5 = ScalaJS.s.scm_HashTable$class__tableSizeSeed__scm_HashTable__I($$this)
});
ScalaJS.s.scm_HashTable$class__index__scm_HashTable__I__I = (function($$this, hcode) {
  var ones = (((-1) + $$this.table$5.u["length"]) | 0);
  var seed = $$this.seedvalue$5;
  var improved = ScalaJS.s.scm_HashTable$HashUtils$class__improve__scm_HashTable$HashUtils__I__I__I($$this, hcode, seed);
  var shifted = ((improved >> ((32 - ScalaJS.m.jl_Integer$().bitCount__I__I(ones)) | 0)) & ones);
  return shifted
});
ScalaJS.s.scm_HashTable$class__scala$collection$mutable$HashTable$$addEntry0__scm_HashTable__scm_HashEntry__I__V = (function($$this, e, h) {
  e.next$1 = $$this.table$5.u[h];
  $$this.table$5.u[h] = e;
  $$this.tableSize$5 = ((1 + $$this.tableSize$5) | 0);
  ScalaJS.s.scm_HashTable$class__nnSizeMapAdd__scm_HashTable__I__V($$this, h);
  if (($$this.tableSize$5 > $$this.threshold$5)) {
    ScalaJS.s.scm_HashTable$class__resize__p0__scm_HashTable__I__V($$this, ScalaJS.imul(2, $$this.table$5.u["length"]))
  }
});
ScalaJS.s.scm_HashTable$class__initialThreshold__p0__scm_HashTable__I__I = (function($$this, _loadFactor) {
  return ScalaJS.m.scm_HashTable$().newThreshold__I__I__I(_loadFactor, ScalaJS.m.scm_HashTable$().capacity__I__I(16))
});
ScalaJS.s.scm_HashTable$class__findOrAddEntry__scm_HashTable__O__O__scm_HashEntry = (function($$this, key, value) {
  var hcode = ScalaJS.m.sr_ScalaRunTime$().hash__O__I(key);
  var h = ScalaJS.s.scm_HashTable$class__index__scm_HashTable__I__I($$this, hcode);
  var e = ScalaJS.s.scm_HashTable$class__scala$collection$mutable$HashTable$$findEntry0__scm_HashTable__O__I__scm_HashEntry($$this, key, h);
  return ((e !== null) ? e : (ScalaJS.s.scm_HashTable$class__scala$collection$mutable$HashTable$$addEntry0__scm_HashTable__scm_HashEntry__I__V($$this, new ScalaJS.c.scm_DefaultEntry().init___O__O(key, value), h), null))
});
ScalaJS.s.scm_HashTable$class__nnSizeMapReset__scm_HashTable__I__V = (function($$this, tableLength) {
  if (($$this.sizemap$5 !== null)) {
    var nsize = ScalaJS.s.scm_HashTable$class__calcSizeMapSize__scm_HashTable__I__I($$this, tableLength);
    if (($$this.sizemap$5.u["length"] !== nsize)) {
      $$this.sizemap$5 = ScalaJS.newArrayObject(ScalaJS.d.I.getArrayOf(), [nsize])
    } else {
      var this$1 = ScalaJS.m.ju_Arrays$();
      var a = $$this.sizemap$5;
      this$1.fillImpl$mIc$sp__p1__AI__I__V(a, 0)
    }
  }
});
ScalaJS.s.scm_HashTable$class__tableSizeSeed__scm_HashTable__I = (function($$this) {
  return ScalaJS.m.jl_Integer$().bitCount__I__I((((-1) + $$this.table$5.u["length"]) | 0))
});
ScalaJS.s.scm_ResizableArray$class__copyToArray__scm_ResizableArray__O__I__I__V = (function($$this, xs, start, len) {
  var that = ((ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var $$this$1 = ((len < that) ? len : that);
  var that$1 = $$this.size0$6;
  var len1 = (($$this$1 < that$1) ? $$this$1 : that$1);
  ScalaJS.m.s_Array$().copy__O__I__O__I__I__V($$this.array$6, 0, xs, start, len1)
});
ScalaJS.s.scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V = (function($$this, n) {
  var x = $$this.array$6.u["length"];
  var arrayLength = new ScalaJS.c.sjsr_RuntimeLong().init___I(x);
  if (new ScalaJS.c.sjsr_RuntimeLong().init___I(n).$$greater__sjsr_RuntimeLong__Z(arrayLength)) {
    var newSize = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(2, 0, 0).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(arrayLength);
    while (new ScalaJS.c.sjsr_RuntimeLong().init___I(n).$$greater__sjsr_RuntimeLong__Z(newSize)) {
      newSize = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(2, 0, 0).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(newSize)
    };
    if (newSize.$$greater__sjsr_RuntimeLong__Z(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 511, 0))) {
      newSize = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 511, 0)
    };
    var newArray = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [newSize.toInt__I()]);
    var src = $$this.array$6;
    var length = $$this.size0$6;
    ScalaJS.systemArraycopy(src, 0, newArray, 0, length);
    $$this.array$6 = newArray
  }
});
ScalaJS.s.scm_ResizableArray$class__foreach__scm_ResizableArray__F1__V = (function($$this, f) {
  var i = 0;
  var top = $$this.size0$6;
  while ((i < top)) {
    f.apply__O__O($$this.array$6.u[i]);
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.scm_ResizableArray$class__apply__scm_ResizableArray__I__O = (function($$this, idx) {
  if ((idx >= $$this.size0$6)) {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $$this.array$6.u[idx]
});
ScalaJS.s.scm_ResizableArray$class__$$init$__scm_ResizableArray__V = (function($$this) {
  var x = $$this.initialSize$6;
  $$this.array$6 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [((x > 1) ? x : 1)]);
  $$this.size0$6 = 0
});
/** @constructor */
ScalaJS.c.sjsr_Bits$ = (function() {
  ScalaJS.c.O.call(this);
  this.areTypedArraysSupported$1 = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
});
ScalaJS.c.sjsr_Bits$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_Bits$.prototype.constructor = ScalaJS.c.sjsr_Bits$;
/** @constructor */
ScalaJS.h.sjsr_Bits$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_Bits$.prototype = ScalaJS.c.sjsr_Bits$.prototype;
ScalaJS.c.sjsr_Bits$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_Bits$ = this;
  var x = (((ScalaJS.g["ArrayBuffer"] && ScalaJS.g["Int32Array"]) && ScalaJS.g["Float32Array"]) && ScalaJS.g["Float64Array"]);
  this.areTypedArraysSupported$1 = ScalaJS.uZ((!(!x)));
  this.arrayBuffer$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["ArrayBuffer"](8) : null);
  this.int32Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Int32Array"](this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Float32Array"](this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Float64Array"](this.arrayBuffer$1, 0, 1) : null);
  if ((!this.areTypedArraysSupported$1)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = (ScalaJS.uB(new ScalaJS.g["Int8Array"](this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
ScalaJS.c.sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = (value | 0);
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var this$1 = this.doubleToLongBits__D__J(value);
    return this$1.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(this$1.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I()
  }
});
ScalaJS.c.sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, (-1022))))) {
      var twoPowFbits = ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, 52));
      var a = (ScalaJS.uD(ScalaJS.g["Math"]["log"](av)) / 0.6931471805599453);
      var a$1 = (ScalaJS.uD(ScalaJS.g["Math"]["floor"](a)) | 0);
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, b))) * twoPowFbits);
      var w = ScalaJS.uD(ScalaJS.g["Math"]["floor"](n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, (-1074))));
      var w$1 = ScalaJS.uD(ScalaJS.g["Math"]["floor"](n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = ScalaJS.uZ(x1_$_$$und1$1);
  var e$1 = ScalaJS.uI(x1_$_$$und2$1);
  var f$3 = ScalaJS.uD(x1_$_$$und3$1);
  var x$2_$_$$und1$1 = s$1;
  var x$2_$_$$und2$1 = e$1;
  var x$2_$_$$und3$1 = f$3;
  var s$2 = ScalaJS.uZ(x$2_$_$$und1$1);
  var e$2 = ScalaJS.uI(x$2_$_$$und2$1);
  var f$2$1 = ScalaJS.uD(x$2_$_$$und3$1);
  var hif = ((f$2$1 / 4.294967296E9) | 0);
  var hi = (((s$2 ? (-2147483648) : 0) | (e$2 << 20)) | hif);
  var lo = (f$2$1 | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I(hi).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 1023, 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I(lo)))
});
ScalaJS.c.sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.areTypedArraysSupported$1) {
    this.float64Array$1[0] = value;
    return new ScalaJS.c.sjsr_RuntimeLong().init___I(ScalaJS.uI(this.int32Array$1[this.highOffset$1])).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 1023, 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I(ScalaJS.uI(this.int32Array$1[this.lowOffset$1]))))
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
ScalaJS.d.sjsr_Bits$ = new ScalaJS.ClassTypeData({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
ScalaJS.c.sjsr_Bits$.prototype.$classData = ScalaJS.d.sjsr_Bits$;
ScalaJS.n.sjsr_Bits$ = (void 0);
ScalaJS.m.sjsr_Bits$ = (function() {
  if ((!ScalaJS.n.sjsr_Bits$)) {
    ScalaJS.n.sjsr_Bits$ = new ScalaJS.c.sjsr_Bits$().init___()
  };
  return ScalaJS.n.sjsr_Bits$
});
/** @constructor */
ScalaJS.c.sjsr_RuntimeString$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sjsr_RuntimeString$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_RuntimeString$.prototype.constructor = ScalaJS.c.sjsr_RuntimeString$;
/** @constructor */
ScalaJS.h.sjsr_RuntimeString$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeString$.prototype = ScalaJS.c.sjsr_RuntimeString$.prototype;
ScalaJS.c.sjsr_RuntimeString$.prototype.indexOf__T__I__I__I = (function(thiz, ch, fromIndex) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return ScalaJS.uI(thiz["indexOf"](str, fromIndex))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.valueOf__O__T = (function(value) {
  return ((value === null) ? "null" : ScalaJS.objectToString(value))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.lastIndexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return ScalaJS.uI(thiz["lastIndexOf"](str))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.indexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return ScalaJS.uI(thiz["indexOf"](str))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + ScalaJS.uI(thiz["length"])) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + ScalaJS.imul((65535 & ScalaJS.uI(thiz["charCodeAt"](index))), mul)) | 0);
    mul = ScalaJS.imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
ScalaJS.c.sjsr_RuntimeString$.prototype.fromCodePoint__p1__I__T = (function(codePoint) {
  if ((((-65536) & codePoint) === 0)) {
    var array = [codePoint];
    var x = ScalaJS.g["String"];
    var jsx$4 = x["fromCharCode"];
    matchEnd5: {
      var jsx$3;
      var jsx$3 = array;
      break matchEnd5
    };
    var jsx$2 = []["concat"](jsx$3);
    var jsx$1 = jsx$4["apply"](x, jsx$2);
    return ScalaJS.as.T(jsx$1)
  } else if (((codePoint < 0) || (codePoint > 1114111))) {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  } else {
    var offsetCp = (((-65536) + codePoint) | 0);
    var array$1 = [(55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp))];
    var x$1 = ScalaJS.g["String"];
    var jsx$8 = x$1["fromCharCode"];
    matchEnd5$1: {
      var jsx$7;
      var jsx$7 = array$1;
      break matchEnd5$1
    };
    var jsx$6 = []["concat"](jsx$7);
    var jsx$5 = jsx$8["apply"](x$1, jsx$6);
    return ScalaJS.as.T(jsx$5)
  }
});
ScalaJS.d.sjsr_RuntimeString$ = new ScalaJS.ClassTypeData({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
ScalaJS.c.sjsr_RuntimeString$.prototype.$classData = ScalaJS.d.sjsr_RuntimeString$;
ScalaJS.n.sjsr_RuntimeString$ = (void 0);
ScalaJS.m.sjsr_RuntimeString$ = (function() {
  if ((!ScalaJS.n.sjsr_RuntimeString$)) {
    ScalaJS.n.sjsr_RuntimeString$ = new ScalaJS.c.sjsr_RuntimeString$().init___()
  };
  return ScalaJS.n.sjsr_RuntimeString$
});
/** @constructor */
ScalaJS.c.sjsr_StackTrace$ = (function() {
  ScalaJS.c.O.call(this);
  this.isRhino$1 = false;
  this.decompressedClasses$1 = null;
  this.decompressedPrefixes$1 = null;
  this.compressedPrefixes$1 = null;
  this.bitmap$0$1 = false
});
ScalaJS.c.sjsr_StackTrace$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_StackTrace$.prototype.constructor = ScalaJS.c.sjsr_StackTrace$;
/** @constructor */
ScalaJS.h.sjsr_StackTrace$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_StackTrace$.prototype = ScalaJS.c.sjsr_StackTrace$.prototype;
ScalaJS.c.sjsr_StackTrace$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_StackTrace$ = this;
  var dict = {
    "O": "java_lang_Object",
    "T": "java_lang_String",
    "V": "scala_Unit",
    "Z": "scala_Boolean",
    "C": "scala_Char",
    "B": "scala_Byte",
    "S": "scala_Short",
    "I": "scala_Int",
    "J": "scala_Long",
    "F": "scala_Float",
    "D": "scala_Double"
  };
  var index = 0;
  while ((index <= 22)) {
    if ((index >= 2)) {
      dict[("T" + index)] = ("scala_Tuple" + index)
    };
    dict[("F" + index)] = ("scala_Function" + index);
    index = ((1 + index) | 0)
  };
  this.decompressedClasses$1 = dict;
  this.decompressedPrefixes$1 = {
    "sjsr_": "scala_scalajs_runtime_",
    "sjs_": "scala_scalajs_",
    "sci_": "scala_collection_immutable_",
    "scm_": "scala_collection_mutable_",
    "scg_": "scala_collection_generic_",
    "sc_": "scala_collection_",
    "sr_": "scala_runtime_",
    "s_": "scala_",
    "jl_": "java_lang_",
    "ju_": "java_util_"
  };
  this.compressedPrefixes$1 = ScalaJS.g["Object"]["keys"](this.decompressedPrefixes$1);
  return this
});
ScalaJS.c.sjsr_StackTrace$.prototype.createException__p1__O = (function() {
  try {
    return this["undef"]()
  } catch (e) {
    var e$2 = ScalaJS.m.sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      if (ScalaJS.is.sjs_js_JavaScriptException(e$2)) {
        var x5 = ScalaJS.as.sjs_js_JavaScriptException(e$2);
        var e$3 = x5.exception$4;
        return e$3
      } else {
        throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
ScalaJS.c.sjsr_StackTrace$.prototype.captureState__jl_Throwable__O__V = (function(throwable, e) {
  throwable["stackdata"] = e
});
ScalaJS.d.sjsr_StackTrace$ = new ScalaJS.ClassTypeData({
  sjsr_StackTrace$: 0
}, false, "scala.scalajs.runtime.StackTrace$", {
  sjsr_StackTrace$: 1,
  O: 1
});
ScalaJS.c.sjsr_StackTrace$.prototype.$classData = ScalaJS.d.sjsr_StackTrace$;
ScalaJS.n.sjsr_StackTrace$ = (void 0);
ScalaJS.m.sjsr_StackTrace$ = (function() {
  if ((!ScalaJS.n.sjsr_StackTrace$)) {
    ScalaJS.n.sjsr_StackTrace$ = new ScalaJS.c.sjsr_StackTrace$().init___()
  };
  return ScalaJS.n.sjsr_StackTrace$
});
/** @constructor */
ScalaJS.c.sjsr_package$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sjsr_package$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_package$.prototype.constructor = ScalaJS.c.sjsr_package$;
/** @constructor */
ScalaJS.h.sjsr_package$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_package$.prototype = ScalaJS.c.sjsr_package$.prototype;
ScalaJS.c.sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if (ScalaJS.is.sjs_js_JavaScriptException(th)) {
    var x2 = ScalaJS.as.sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
ScalaJS.c.sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if (ScalaJS.is.jl_Throwable(e)) {
    var x2 = ScalaJS.as.jl_Throwable(e);
    return x2
  } else {
    return new ScalaJS.c.sjs_js_JavaScriptException().init___O(e)
  }
});
ScalaJS.d.sjsr_package$ = new ScalaJS.ClassTypeData({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
ScalaJS.c.sjsr_package$.prototype.$classData = ScalaJS.d.sjsr_package$;
ScalaJS.n.sjsr_package$ = (void 0);
ScalaJS.m.sjsr_package$ = (function() {
  if ((!ScalaJS.n.sjsr_package$)) {
    ScalaJS.n.sjsr_package$ = new ScalaJS.c.sjsr_package$().init___()
  };
  return ScalaJS.n.sjsr_package$
});
ScalaJS.isArrayOf.sr_BoxedUnit = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
});
ScalaJS.asArrayOf.sr_BoxedUnit = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
});
ScalaJS.d.sr_BoxedUnit = new ScalaJS.ClassTypeData({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1
}, (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
ScalaJS.c.sr_BoxesRunTime$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_BoxesRunTime$.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_BoxesRunTime$.prototype.constructor = ScalaJS.c.sr_BoxesRunTime$;
/** @constructor */
ScalaJS.h.sr_BoxesRunTime$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_BoxesRunTime$.prototype = ScalaJS.c.sr_BoxesRunTime$.prototype;
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if (ScalaJS.is.jl_Character(y)) {
    var x2 = ScalaJS.as.jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if (ScalaJS.is.jl_Number(y)) {
    var x3 = ScalaJS.as.jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = ScalaJS.uD(x3);
      return (x2$1 === xc.value$1)
    } else if (ScalaJS.is.sjsr_RuntimeLong(x3)) {
      var x3$1 = ScalaJS.uJ(x3);
      return x3$1.equals__sjsr_RuntimeLong__Z(new ScalaJS.c.sjsr_RuntimeLong().init___I(xc.value$1))
    } else {
      return ((x3 === null) ? (xc === null) : ScalaJS.objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if (ScalaJS.is.jl_Number(y)) {
    var x2 = ScalaJS.as.jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if (ScalaJS.is.jl_Character(y)) {
    var x3 = ScalaJS.as.jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = ScalaJS.uD(xn);
      return (x2$1 === x3.value$1)
    } else if (ScalaJS.is.sjsr_RuntimeLong(xn)) {
      var x3$1 = ScalaJS.uJ(xn);
      return x3$1.equals__sjsr_RuntimeLong__Z(new ScalaJS.c.sjsr_RuntimeLong().init___I(x3.value$1))
    } else {
      return ((xn === null) ? (x3 === null) : ScalaJS.objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : ScalaJS.objectEquals(xn, y))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if (ScalaJS.is.jl_Number(x)) {
    var x2 = ScalaJS.as.jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if (ScalaJS.is.jl_Character(x)) {
    var x3 = ScalaJS.as.jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : ScalaJS.objectEquals(x, y))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromLong__jl_Long__I = (function(n) {
  var iv = ScalaJS.uJ(n).toInt__I();
  return (new ScalaJS.c.sjsr_RuntimeLong().init___I(iv).equals__sjsr_RuntimeLong__Z(ScalaJS.uJ(n)) ? iv : ScalaJS.uJ(n).$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(ScalaJS.uJ(n).$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I())
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromNumber__jl_Number__I = (function(n) {
  if (ScalaJS.isInt(n)) {
    var x2 = ScalaJS.uI(n);
    return x2
  } else if (ScalaJS.is.sjsr_RuntimeLong(n)) {
    var x3 = ScalaJS.as.sjsr_RuntimeLong(n);
    return this.hashFromLong__jl_Long__I(x3)
  } else if (((typeof n) === "number")) {
    var x4 = ScalaJS.asDouble(n);
    return this.hashFromDouble__jl_Double__I(x4)
  } else {
    return ScalaJS.objectHashCode(n)
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = ScalaJS.uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = ScalaJS.uD(yn);
      return (x2 === x2$2)
    } else if (ScalaJS.is.sjsr_RuntimeLong(yn)) {
      var x3 = ScalaJS.uJ(yn);
      return (x2 === x3.toDouble__D())
    } else if (ScalaJS.is.s_math_ScalaNumber(yn)) {
      var x4 = ScalaJS.as.s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if (ScalaJS.is.sjsr_RuntimeLong(xn)) {
    var x3$2 = ScalaJS.uJ(xn);
    if (ScalaJS.is.sjsr_RuntimeLong(yn)) {
      var x2$3 = ScalaJS.uJ(yn);
      return x3$2.equals__sjsr_RuntimeLong__Z(x2$3)
    } else if (((typeof yn) === "number")) {
      var x3$3 = ScalaJS.uD(yn);
      return (x3$2.toDouble__D() === x3$3)
    } else if (ScalaJS.is.s_math_ScalaNumber(yn)) {
      var x4$2 = ScalaJS.as.s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(x3$2)
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : ScalaJS.objectEquals(xn, yn))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromDouble__jl_Double__I = (function(n) {
  var iv = (ScalaJS.uD(n) | 0);
  var dv = ScalaJS.uD(n);
  if ((iv === dv)) {
    return iv
  } else {
    var lv = ScalaJS.m.sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(ScalaJS.uD(n));
    return ((lv.toDouble__D() === dv) ? lv.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(lv.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I() : ScalaJS.m.sjsr_Bits$().numberHashCode__D__I(ScalaJS.uD(n)))
  }
});
ScalaJS.d.sr_BoxesRunTime$ = new ScalaJS.ClassTypeData({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
ScalaJS.c.sr_BoxesRunTime$.prototype.$classData = ScalaJS.d.sr_BoxesRunTime$;
ScalaJS.n.sr_BoxesRunTime$ = (void 0);
ScalaJS.m.sr_BoxesRunTime$ = (function() {
  if ((!ScalaJS.n.sr_BoxesRunTime$)) {
    ScalaJS.n.sr_BoxesRunTime$ = new ScalaJS.c.sr_BoxesRunTime$().init___()
  };
  return ScalaJS.n.sr_BoxesRunTime$
});
ScalaJS.d.sr_Null$ = new ScalaJS.ClassTypeData({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
/** @constructor */
ScalaJS.c.sr_ScalaRunTime$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_ScalaRunTime$.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_ScalaRunTime$.prototype.constructor = ScalaJS.c.sr_ScalaRunTime$;
/** @constructor */
ScalaJS.h.sr_ScalaRunTime$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_ScalaRunTime$.prototype = ScalaJS.c.sr_ScalaRunTime$.prototype;
ScalaJS.c.sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  if (ScalaJS.isArrayOf.O(xs, 1)) {
    var x2 = ScalaJS.asArrayOf.O(xs, 1);
    return x2.u["length"]
  } else if (ScalaJS.isArrayOf.I(xs, 1)) {
    var x3 = ScalaJS.asArrayOf.I(xs, 1);
    return x3.u["length"]
  } else if (ScalaJS.isArrayOf.D(xs, 1)) {
    var x4 = ScalaJS.asArrayOf.D(xs, 1);
    return x4.u["length"]
  } else if (ScalaJS.isArrayOf.J(xs, 1)) {
    var x5 = ScalaJS.asArrayOf.J(xs, 1);
    return x5.u["length"]
  } else if (ScalaJS.isArrayOf.F(xs, 1)) {
    var x6 = ScalaJS.asArrayOf.F(xs, 1);
    return x6.u["length"]
  } else if (ScalaJS.isArrayOf.C(xs, 1)) {
    var x7 = ScalaJS.asArrayOf.C(xs, 1);
    return x7.u["length"]
  } else if (ScalaJS.isArrayOf.B(xs, 1)) {
    var x8 = ScalaJS.asArrayOf.B(xs, 1);
    return x8.u["length"]
  } else if (ScalaJS.isArrayOf.S(xs, 1)) {
    var x9 = ScalaJS.asArrayOf.S(xs, 1);
    return x9.u["length"]
  } else if (ScalaJS.isArrayOf.Z(xs, 1)) {
    var x10 = ScalaJS.asArrayOf.Z(xs, 1);
    return x10.u["length"]
  } else if (ScalaJS.isArrayOf.sr_BoxedUnit(xs, 1)) {
    var x11 = ScalaJS.asArrayOf.sr_BoxedUnit(xs, 1);
    return x11.u["length"]
  } else if ((xs === null)) {
    throw new ScalaJS.c.jl_NullPointerException().init___()
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(xs)
  }
});
ScalaJS.c.sr_ScalaRunTime$.prototype.hash__O__I = (function(x) {
  return ((x === null) ? 0 : (ScalaJS.is.jl_Number(x) ? ScalaJS.m.sr_BoxesRunTime$().hashFromNumber__jl_Number__I(ScalaJS.as.jl_Number(x)) : ScalaJS.objectHashCode(x)))
});
ScalaJS.c.sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if (ScalaJS.isArrayOf.O(xs, 1)) {
    var x2 = ScalaJS.asArrayOf.O(xs, 1);
    x2.u[idx] = value
  } else if (ScalaJS.isArrayOf.I(xs, 1)) {
    var x3 = ScalaJS.asArrayOf.I(xs, 1);
    x3.u[idx] = ScalaJS.uI(value)
  } else if (ScalaJS.isArrayOf.D(xs, 1)) {
    var x4 = ScalaJS.asArrayOf.D(xs, 1);
    x4.u[idx] = ScalaJS.uD(value)
  } else if (ScalaJS.isArrayOf.J(xs, 1)) {
    var x5 = ScalaJS.asArrayOf.J(xs, 1);
    x5.u[idx] = ScalaJS.uJ(value)
  } else if (ScalaJS.isArrayOf.F(xs, 1)) {
    var x6 = ScalaJS.asArrayOf.F(xs, 1);
    x6.u[idx] = ScalaJS.uF(value)
  } else if (ScalaJS.isArrayOf.C(xs, 1)) {
    var x7 = ScalaJS.asArrayOf.C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = ScalaJS.as.jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.u[idx] = jsx$1
  } else if (ScalaJS.isArrayOf.B(xs, 1)) {
    var x8 = ScalaJS.asArrayOf.B(xs, 1);
    x8.u[idx] = ScalaJS.uB(value)
  } else if (ScalaJS.isArrayOf.S(xs, 1)) {
    var x9 = ScalaJS.asArrayOf.S(xs, 1);
    x9.u[idx] = ScalaJS.uS(value)
  } else if (ScalaJS.isArrayOf.Z(xs, 1)) {
    var x10 = ScalaJS.asArrayOf.Z(xs, 1);
    x10.u[idx] = ScalaJS.uZ(value)
  } else if (ScalaJS.isArrayOf.sr_BoxedUnit(xs, 1)) {
    var x11 = ScalaJS.asArrayOf.sr_BoxedUnit(xs, 1);
    x11.u[idx] = ScalaJS.asUnit(value)
  } else if ((xs === null)) {
    throw new ScalaJS.c.jl_NullPointerException().init___()
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(xs)
  }
});
ScalaJS.c.sr_ScalaRunTime$.prototype.arrayElementClass__O__jl_Class = (function(schematic) {
  if (ScalaJS.is.jl_Class(schematic)) {
    var x2 = ScalaJS.as.jl_Class(schematic);
    return x2.getComponentType__jl_Class()
  } else if (ScalaJS.is.s_reflect_ClassTag(schematic)) {
    var x3 = ScalaJS.as.s_reflect_ClassTag(schematic);
    return x3.runtimeClass__jl_Class()
  } else {
    throw new ScalaJS.c.jl_UnsupportedOperationException().init___T(new ScalaJS.c.s_StringContext().init___sc_Seq(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["unsupported schematic ", " (", ")"])).s__sc_Seq__T(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([schematic, ScalaJS.objectGetClass(schematic)])))
  }
});
ScalaJS.c.sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, ",", ")")
});
ScalaJS.c.sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if (ScalaJS.isArrayOf.O(xs, 1)) {
    var x2 = ScalaJS.asArrayOf.O(xs, 1);
    return x2.u[idx]
  } else if (ScalaJS.isArrayOf.I(xs, 1)) {
    var x3 = ScalaJS.asArrayOf.I(xs, 1);
    return x3.u[idx]
  } else if (ScalaJS.isArrayOf.D(xs, 1)) {
    var x4 = ScalaJS.asArrayOf.D(xs, 1);
    return x4.u[idx]
  } else if (ScalaJS.isArrayOf.J(xs, 1)) {
    var x5 = ScalaJS.asArrayOf.J(xs, 1);
    return x5.u[idx]
  } else if (ScalaJS.isArrayOf.F(xs, 1)) {
    var x6 = ScalaJS.asArrayOf.F(xs, 1);
    return x6.u[idx]
  } else if (ScalaJS.isArrayOf.C(xs, 1)) {
    var x7 = ScalaJS.asArrayOf.C(xs, 1);
    var c = x7.u[idx];
    return new ScalaJS.c.jl_Character().init___C(c)
  } else if (ScalaJS.isArrayOf.B(xs, 1)) {
    var x8 = ScalaJS.asArrayOf.B(xs, 1);
    return x8.u[idx]
  } else if (ScalaJS.isArrayOf.S(xs, 1)) {
    var x9 = ScalaJS.asArrayOf.S(xs, 1);
    return x9.u[idx]
  } else if (ScalaJS.isArrayOf.Z(xs, 1)) {
    var x10 = ScalaJS.asArrayOf.Z(xs, 1);
    return x10.u[idx]
  } else if (ScalaJS.isArrayOf.sr_BoxedUnit(xs, 1)) {
    var x11 = ScalaJS.asArrayOf.sr_BoxedUnit(xs, 1);
    return x11.u[idx]
  } else if ((xs === null)) {
    throw new ScalaJS.c.jl_NullPointerException().init___()
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(xs)
  }
});
ScalaJS.d.sr_ScalaRunTime$ = new ScalaJS.ClassTypeData({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
ScalaJS.c.sr_ScalaRunTime$.prototype.$classData = ScalaJS.d.sr_ScalaRunTime$;
ScalaJS.n.sr_ScalaRunTime$ = (void 0);
ScalaJS.m.sr_ScalaRunTime$ = (function() {
  if ((!ScalaJS.n.sr_ScalaRunTime$)) {
    ScalaJS.n.sr_ScalaRunTime$ = new ScalaJS.c.sr_ScalaRunTime$().init___()
  };
  return ScalaJS.n.sr_ScalaRunTime$
});
/** @constructor */
ScalaJS.c.sr_Statics$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_Statics$.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_Statics$.prototype.constructor = ScalaJS.c.sr_Statics$;
/** @constructor */
ScalaJS.h.sr_Statics$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_Statics$.prototype = ScalaJS.c.sr_Statics$.prototype;
ScalaJS.c.sr_Statics$.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = ScalaJS.imul((-862048943), k);
  k = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(k, 15);
  k = ScalaJS.imul(461845907, k);
  return (hash ^ k)
});
ScalaJS.c.sr_Statics$.prototype.floatHash__F__I = (function(fv) {
  return (fv | 0)
});
ScalaJS.c.sr_Statics$.prototype.doubleHash__D__I = (function(dv) {
  return (dv | 0)
});
ScalaJS.c.sr_Statics$.prototype.anyHash__O__I = (function(x) {
  if ((x === null)) {
    return 0
  } else if (ScalaJS.is.sjsr_RuntimeLong(x)) {
    var x3 = ScalaJS.uJ(x);
    return this.longHash__J__I(x3)
  } else if (((typeof x) === "number")) {
    var x4 = ScalaJS.uD(x);
    return this.doubleHash__D__I(x4)
  } else if (ScalaJS.isFloat(x)) {
    var x5 = ScalaJS.uF(x);
    return this.floatHash__F__I(x5)
  } else {
    return ScalaJS.objectHashCode(x)
  }
});
ScalaJS.c.sr_Statics$.prototype.avalanche__I__I = (function(h0) {
  var h = h0;
  h = (h ^ ((h >>> 16) | 0));
  h = ScalaJS.imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = ScalaJS.imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
ScalaJS.c.sr_Statics$.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  h = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(h, 13);
  return (((-430675100) + ScalaJS.imul(5, h)) | 0)
});
ScalaJS.c.sr_Statics$.prototype.longHash__J__I = (function(lv) {
  return lv.toInt__I()
});
ScalaJS.c.sr_Statics$.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__I__I((hash ^ length))
});
ScalaJS.d.sr_Statics$ = new ScalaJS.ClassTypeData({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
ScalaJS.c.sr_Statics$.prototype.$classData = ScalaJS.d.sr_Statics$;
ScalaJS.n.sr_Statics$ = (void 0);
ScalaJS.m.sr_Statics$ = (function() {
  if ((!ScalaJS.n.sr_Statics$)) {
    ScalaJS.n.sr_Statics$ = new ScalaJS.c.sr_Statics$().init___()
  };
  return ScalaJS.n.sr_Statics$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision = (function() {
  ScalaJS.c.O.call(this);
  this.bonker$1 = null;
  this.bonked$1 = null;
  this.elasticity$1 = 0.0;
  this.isChomping$1 = false;
  this.damage$1 = 0.0;
  this.isKill$1 = false;
  this.chomp$1 = null;
  this.chomped$1 = null;
  this.shoved$1 = null;
  this.bitmap$0$1 = 0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Collision = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Collision.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.chomp$lzycompute__p1__F1 = (function() {
  if (((4 & this.bitmap$0$1) === 0)) {
    this.chomp$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer) {
      return (function(c$2) {
        var c = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(c$2);
        if (arg$outer.isKill__Z()) {
          ScalaJS.m.sci_List$();
          var e = arg$outer.bonked$1.nutrition__D();
          var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([c.nourish__D__Lcom_benjaminrosenbaum_jovian_Motile(e)]);
          var this$2 = ScalaJS.m.sci_List$();
          var cbf = this$2.ReusableCBFInstance$2;
          return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf))
        } else {
          ScalaJS.m.sci_List$();
          var xs$1 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([c]);
          var this$4 = ScalaJS.m.sci_List$();
          var cbf$1 = this$4.ReusableCBFInstance$2;
          return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$1, cbf$1))
        }
      })
    })(this));
    this.bitmap$0$1 = (4 | this.bitmap$0$1)
  };
  return this.chomp$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.damage$lzycompute__p1__D = (function() {
  if (((1 & this.bitmap$0$1) === 0)) {
    var x = this.bonker$1.damage__D();
    var y = this.bonked$1.energy$1;
    this.damage$1 = ((x < y) ? x : y);
    this.bitmap$0$1 = (1 | this.bitmap$0$1)
  };
  return this.damage$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.$$js$exported$prop$bonker__O = (function() {
  return this.bonker$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.$$js$exported$prop$elasticity__O = (function() {
  return this.elasticity$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.deltaVee__Lcom_benjaminrosenbaum_jovian_Vector = (function() {
  var this$1 = this.bonker$1.box__Lcom_benjaminrosenbaum_jovian_Square().center$1.to__Lcom_benjaminrosenbaum_jovian_Position__Lcom_benjaminrosenbaum_jovian_Vector(this.bonked$1.box__Lcom_benjaminrosenbaum_jovian_Square().center$1);
  var mag = (this.elasticity$1 * this.bonker$1.box__Lcom_benjaminrosenbaum_jovian_Square().depthOfPenetration__Lcom_benjaminrosenbaum_jovian_Square__D(this.bonked$1.box__Lcom_benjaminrosenbaum_jovian_Square()));
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this$1.normalized__Lcom_benjaminrosenbaum_jovian_Vector().scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(mag))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.$$js$exported$prop$bonked__O = (function() {
  return this.bonked$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.init___Lcom_benjaminrosenbaum_jovian_Colliding__Lcom_benjaminrosenbaum_jovian_Colliding__D = (function(bonker, bonked, elasticity) {
  this.bonker$1 = bonker;
  this.bonked$1 = bonked;
  this.elasticity$1 = elasticity;
  this.isChomping$1 = bonker.canEat__Lcom_benjaminrosenbaum_jovian_Colliding__Z(bonked);
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.isKill__Z = (function() {
  return (((2 & this.bitmap$0$1) === 0) ? this.isKill$lzycompute__p1__Z() : this.isKill$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.shoved$lzycompute__p1__F1 = (function() {
  if (((16 & this.bitmap$0$1) === 0)) {
    this.shoved$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer) {
      return (function(c$2) {
        var c = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(c$2);
        ScalaJS.m.sci_List$();
        var v = arg$outer.deltaVee__Lcom_benjaminrosenbaum_jovian_Vector();
        var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([c.addVelocity__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile(v)]);
        var this$2 = ScalaJS.m.sci_List$();
        var cbf = this$2.ReusableCBFInstance$2;
        return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf))
      })
    })(this));
    this.bitmap$0$1 = (16 | this.bitmap$0$1)
  };
  return this.shoved$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.damage__D = (function() {
  return (((1 & this.bitmap$0$1) === 0) ? this.damage$lzycompute__p1__D() : this.damage$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.shoved__F1 = (function() {
  return (((16 & this.bitmap$0$1) === 0) ? this.shoved$lzycompute__p1__F1() : this.shoved$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.chomp__F1 = (function() {
  return (((4 & this.bitmap$0$1) === 0) ? this.chomp$lzycompute__p1__F1() : this.chomp$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.bonkerEffects__sci_List = (function() {
  if (this.isChomping$1) {
    ScalaJS.m.sci_List$();
    var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.chomp__F1()]);
    var this$2 = ScalaJS.m.sci_List$();
    var cbf = this$2.ReusableCBFInstance$2;
    return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf))
  } else {
    return ScalaJS.m.sci_Nil$()
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.bonkedEffects__sci_List = (function() {
  if (this.isChomping$1) {
    ScalaJS.m.sci_List$();
    var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.shoved__F1(), this.chomped__F1()]);
    var this$2 = ScalaJS.m.sci_List$();
    var cbf = this$2.ReusableCBFInstance$2;
    return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf))
  } else {
    ScalaJS.m.sci_List$();
    var xs$1 = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.shoved__F1()]);
    var this$4 = ScalaJS.m.sci_List$();
    var cbf$1 = this$4.ReusableCBFInstance$2;
    return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$1, cbf$1))
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.chomped$lzycompute__p1__F1 = (function() {
  if (((8 & this.bitmap$0$1) === 0)) {
    this.chomped$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer) {
      return (function(c$2) {
        var c = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(c$2);
        if (arg$outer.isKill__Z()) {
          return ScalaJS.m.sci_Nil$()
        } else {
          ScalaJS.m.sci_List$();
          var damage = arg$outer.damage__D();
          var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([c.wound__D__Lcom_benjaminrosenbaum_jovian_Motile(damage)]);
          var this$2 = ScalaJS.m.sci_List$();
          var cbf = this$2.ReusableCBFInstance$2;
          return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf))
        }
      })
    })(this));
    this.bitmap$0$1 = (8 | this.bitmap$0$1)
  };
  return this.chomped$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.chomped__F1 = (function() {
  return (((8 & this.bitmap$0$1) === 0) ? this.chomped$lzycompute__p1__F1() : this.chomped$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.isKill$lzycompute__p1__Z = (function() {
  if (((2 & this.bitmap$0$1) === 0)) {
    this.isKill$1 = (this.damage__D() >= this.bonked$1.energy$1);
    this.bitmap$0$1 = (2 | this.bitmap$0$1)
  };
  return this.isKill$1
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype, "bonker", {
  "get": (function() {
    return this.$$js$exported$prop$bonker__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype, "bonked", {
  "get": (function() {
    return this.$$js$exported$prop$bonked__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype, "elasticity", {
  "get": (function() {
    return this.$$js$exported$prop$elasticity__O()
  }),
  "enumerable": true
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Collision = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Collision)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Collision = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Collision(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Collision"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Collision = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Collision)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Collision = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Collision(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Collision;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Collision = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Collision: 0
}, false, "com.benjaminrosenbaum.jovian.Collision", {
  Lcom_benjaminrosenbaum_jovian_Collision: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Effectual: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Collision;
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
/** @constructor */
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Collision"] = (function(arg$1, arg$2, arg$3) {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.call(this);
  var preparg$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(arg$1);
  var preparg$2 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(arg$2);
  if ((arg$3 === null)) {
    var preparg$3;
    throw "Found null, expected Double"
  } else {
    var preparg$3 = ScalaJS.uD(arg$3)
  };
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype.init___Lcom_benjaminrosenbaum_jovian_Colliding__Lcom_benjaminrosenbaum_jovian_Colliding__D.call(this, preparg$1, preparg$2, preparg$3)
});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Collision"].prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision.prototype;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver = (function() {
  ScalaJS.c.O.call(this);
  this.unsorted$1 = null;
  this.elasticity$1 = 0.0;
  this.sorted$1 = null;
  this.collisions$1 = null;
  this.collisionsByBonked$1 = null;
  this.collisionsByBonker$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CollisionResolver = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype.resultantColliders__sc_Seq = (function() {
  var jsx$2 = this.sorted$1;
  var jsx$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer) {
    return (function(collider$2) {
      var collider = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(collider$2);
      return arg$outer.applyEffects__Lcom_benjaminrosenbaum_jovian_Colliding__sci_List(collider)
    })
  })(this));
  var this$1 = ScalaJS.m.sc_Seq$();
  return ScalaJS.as.sc_Seq(jsx$2.flatMap__F1__scg_CanBuildFrom__O(jsx$1, this$1.ReusableCBFInstance$2))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype.collisionsIn__sc_Seq__sci_List = (function(colliders) {
  var x = ScalaJS.m.sci_Nil$();
  if (((x === null) ? (colliders === null) : x.equals__O__Z(colliders))) {
    return ScalaJS.m.sci_Nil$()
  } else if (ScalaJS.is.sci_$colon$colon(colliders)) {
    var x2 = ScalaJS.as.sci_$colon$colon(colliders);
    var tail = x2.tl$5;
    var x$1 = this.collisionsWithHead$1__p1__sc_Seq__sci_List(colliders);
    return this.collisionsIn__sc_Seq__sci_List(tail).$$colon$colon$colon__sci_List__sci_List(x$1)
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(colliders)
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype.collisionsWithHead$1__p1__sc_Seq__sci_List = (function(colliders) {
  var x = ScalaJS.m.sci_Nil$();
  if (((x === null) ? (colliders === null) : x.equals__O__Z(colliders))) {
    return ScalaJS.m.sci_Nil$()
  } else if (ScalaJS.is.sci_$colon$colon(colliders)) {
    var x2 = ScalaJS.as.sci_$colon$colon(colliders);
    var head = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(x2.head$5);
    var tail = x2.tl$5;
    var this$2 = ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Colliding$class__allTouching__Lcom_benjaminrosenbaum_jovian_Colliding__sci_List__sci_List(head, tail);
    var f = (function(arg$outer, head$1) {
      return (function(c$2) {
        var c = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(c$2);
        return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Collision().init___Lcom_benjaminrosenbaum_jovian_Colliding__Lcom_benjaminrosenbaum_jovian_Colliding__D(head$1, c, arg$outer.elasticity$1)
      })
    })(this, head);
    var this$1 = ScalaJS.m.sci_List$();
    var bf = this$1.ReusableCBFInstance$2;
    if ((bf === ScalaJS.m.sci_List$().ReusableCBFInstance$2)) {
      if ((this$2 === ScalaJS.m.sci_Nil$())) {
        var jsx$1 = ScalaJS.m.sci_Nil$()
      } else {
        var arg1 = this$2.head__O();
        var h = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(f(arg1), ScalaJS.m.sci_Nil$());
        var t = h;
        var rest = this$2.tail__sci_List();
        while ((rest !== ScalaJS.m.sci_Nil$())) {
          var arg1$1 = rest.head__O();
          var nx = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(f(arg1$1), ScalaJS.m.sci_Nil$());
          t.tl$5 = nx;
          t = nx;
          var this$3 = rest;
          rest = this$3.tail__sci_List()
        };
        var jsx$1 = h
      }
    } else {
      var b = ScalaJS.s.sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder(this$2, bf);
      var these = this$2;
      while ((!these.isEmpty__Z())) {
        var arg1$2 = these.head__O();
        b.$$plus$eq__O__scm_Builder(f(arg1$2));
        var this$4 = these;
        these = this$4.tail__sci_List()
      };
      var jsx$1 = b.result__O()
    };
    return ScalaJS.as.sci_List(jsx$1)
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(colliders)
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype.applyEffects__Lcom_benjaminrosenbaum_jovian_Colliding__sci_List = (function(collider) {
  var this$3 = this.effectsOn__Lcom_benjaminrosenbaum_jovian_Colliding__sci_List(collider);
  ScalaJS.m.sci_List$();
  var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([collider]);
  var this$2 = ScalaJS.m.sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  var z = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf));
  var acc = z;
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = acc;
    var arg2 = these.head__O();
    var colliders = ScalaJS.as.sci_List(arg1);
    var effect = ScalaJS.as.F1(arg2);
    var this$4 = ScalaJS.m.sci_List$();
    acc = ScalaJS.as.sci_List(colliders.flatMap__F1__scg_CanBuildFrom__O(effect, this$4.ReusableCBFInstance$2));
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  };
  return ScalaJS.as.sci_List(acc)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype.init___sc_Seq__D = (function(unsorted, elasticity) {
  this.unsorted$1 = unsorted;
  this.elasticity$1 = elasticity;
  var f = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(c$2) {
    var c = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Colliding(c$2);
    return ScalaJS.s.Lcom_benjaminrosenbaum_jovian_Colliding$class__orderTuple__Lcom_benjaminrosenbaum_jovian_Colliding__T4(c)
  }));
  var ord1 = ScalaJS.m.s_math_Ordering$Double$();
  var ord2 = ScalaJS.m.s_math_Ordering$Double$();
  var ord3 = ScalaJS.m.s_math_Ordering$Double$();
  var ord4 = ScalaJS.m.s_math_Ordering$String$();
  var ord = new ScalaJS.c.s_math_Ordering$$anon$13().init___s_math_Ordering__s_math_Ordering__s_math_Ordering__s_math_Ordering(ord1, ord2, ord3, ord4);
  this.sorted$1 = ScalaJS.as.sc_Seq(ScalaJS.s.sc_SeqLike$class__sortBy__sc_SeqLike__F1__s_math_Ordering__O(unsorted, f, ord));
  this.collisions$1 = this.collisionsIn__sc_Seq__sci_List(this.sorted$1);
  var this$2 = this.collisions$1;
  var m = new ScalaJS.c.scm_HashMap().init___();
  var these = this$2;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    var c$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Collision(arg1);
    var key = c$1.bonked$1;
    var x1 = m.get__O__s_Option(key);
    if (ScalaJS.is.s_Some(x1)) {
      var x2 = ScalaJS.as.s_Some(x1);
      var v = x2.x$2;
      var jsx$1 = v
    } else {
      var x = ScalaJS.m.s_None$();
      if ((x === x1)) {
        ScalaJS.m.sci_List$();
        var d = new ScalaJS.c.scm_ListBuffer().init___();
        m.put__O__O__s_Option(key, d);
        var jsx$1 = d
      } else {
        var jsx$1;
        throw new ScalaJS.c.s_MatchError().init___O(x1)
      }
    };
    var bldr = ScalaJS.as.scm_Builder(jsx$1);
    bldr.$$plus$eq__O__scm_Builder(arg1);
    var this$5 = these;
    these = this$5.tail__sci_List()
  };
  var b = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  var p = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this) {
    return (function(check$ifrefutable$1$2) {
      var check$ifrefutable$1 = ScalaJS.as.T2(check$ifrefutable$1$2);
      return (check$ifrefutable$1 !== null)
    })
  })(this$2));
  new ScalaJS.c.sc_TraversableLike$WithFilter().init___sc_TraversableLike__F1(m, p).foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1) {
    return (function(x$2$2) {
      var x$2 = ScalaJS.as.T2(x$2$2);
      if ((x$2 !== null)) {
        var k = x$2.$$und1$f;
        var v$1 = ScalaJS.as.scm_Builder(x$2.$$und2$f);
        return b$1.$$plus$eq__O__scm_Builder(new ScalaJS.c.T2().init___O__O(k, v$1.result__O()))
      } else {
        throw new ScalaJS.c.s_MatchError().init___O(x$2)
      }
    })
  })(this$2, b)));
  this.collisionsByBonked$1 = ScalaJS.as.sci_Map(b.elems$1).withDefaultValue__O__sci_Map(ScalaJS.m.sci_Nil$());
  var this$7 = this.collisions$1;
  var m$1 = new ScalaJS.c.scm_HashMap().init___();
  var these$1 = this$7;
  while ((!these$1.isEmpty__Z())) {
    var arg1$1 = these$1.head__O();
    var c$3 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Collision(arg1$1);
    var key$1 = c$3.bonker$1;
    var x1$1 = m$1.get__O__s_Option(key$1);
    if (ScalaJS.is.s_Some(x1$1)) {
      var x2$1 = ScalaJS.as.s_Some(x1$1);
      var v$2 = x2$1.x$2;
      var jsx$2 = v$2
    } else {
      var x$1 = ScalaJS.m.s_None$();
      if ((x$1 === x1$1)) {
        ScalaJS.m.sci_List$();
        var d$1 = new ScalaJS.c.scm_ListBuffer().init___();
        m$1.put__O__O__s_Option(key$1, d$1);
        var jsx$2 = d$1
      } else {
        var jsx$2;
        throw new ScalaJS.c.s_MatchError().init___O(x1$1)
      }
    };
    var bldr$1 = ScalaJS.as.scm_Builder(jsx$2);
    bldr$1.$$plus$eq__O__scm_Builder(arg1$1);
    var this$10 = these$1;
    these$1 = this$10.tail__sci_List()
  };
  var b$2 = new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(ScalaJS.m.sci_Map$EmptyMap$());
  var p$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$2) {
    return (function(check$ifrefutable$1$2$1) {
      var check$ifrefutable$1$1 = ScalaJS.as.T2(check$ifrefutable$1$2$1);
      return (check$ifrefutable$1$1 !== null)
    })
  })(this$7));
  new ScalaJS.c.sc_TraversableLike$WithFilter().init___sc_TraversableLike__F1(m$1, p$1).foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$3, b$3) {
    return (function(x$2$2$1) {
      var x$2$1 = ScalaJS.as.T2(x$2$2$1);
      if ((x$2$1 !== null)) {
        var k$1 = x$2$1.$$und1$f;
        var v$3 = ScalaJS.as.scm_Builder(x$2$1.$$und2$f);
        return b$3.$$plus$eq__O__scm_Builder(new ScalaJS.c.T2().init___O__O(k$1, v$3.result__O()))
      } else {
        throw new ScalaJS.c.s_MatchError().init___O(x$2$1)
      }
    })
  })(this$7, b$2)));
  this.collisionsByBonker$1 = ScalaJS.as.sci_Map(b$2.elems$1).withDefaultValue__O__sci_Map(ScalaJS.m.sci_Nil$());
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype.effectsOn__Lcom_benjaminrosenbaum_jovian_Colliding__sci_List = (function(c) {
  var this$2 = ScalaJS.as.sci_List(this.collisionsByBonked$1.apply__O__O(c));
  var f = (function(x$2$2) {
    var x$2 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Collision(x$2$2);
    return x$2.bonkedEffects__sci_List()
  });
  var this$1 = ScalaJS.m.sci_List$();
  var bf = this$1.ReusableCBFInstance$2;
  if ((bf === ScalaJS.m.sci_List$().ReusableCBFInstance$2)) {
    if ((this$2 === ScalaJS.m.sci_Nil$())) {
      var jsx$4 = ScalaJS.m.sci_Nil$()
    } else {
      var rest = this$2;
      var found = new ScalaJS.c.sr_BooleanRef().init___Z(false);
      var h = new ScalaJS.c.sr_ObjectRef().init___O(null);
      var t = new ScalaJS.c.sr_ObjectRef().init___O(null);
      while ((rest !== ScalaJS.m.sci_Nil$())) {
        var arg1 = rest.head__O();
        ScalaJS.as.sc_GenTraversableOnce(f(arg1)).foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, found$1, h$1, t$1) {
          return (function(b$2) {
            if ((!found$1.elem$1)) {
              h$1.elem$1 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(b$2, ScalaJS.m.sci_Nil$());
              t$1.elem$1 = ScalaJS.as.sci_$colon$colon(h$1.elem$1);
              found$1.elem$1 = true
            } else {
              var nx = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(b$2, ScalaJS.m.sci_Nil$());
              ScalaJS.as.sci_$colon$colon(t$1.elem$1).tl$5 = nx;
              t$1.elem$1 = nx
            }
          })
        })(this$2, found, h, t)));
        var this$6 = rest;
        rest = this$6.tail__sci_List()
      };
      var jsx$4 = ((!found.elem$1) ? ScalaJS.m.sci_Nil$() : ScalaJS.as.sci_$colon$colon(h.elem$1))
    }
  } else {
    ScalaJS.m.sci_List$();
    var b = new ScalaJS.c.scm_ListBuffer().init___();
    var these = this$2;
    while ((!these.isEmpty__Z())) {
      var arg1$1 = these.head__O();
      var xs = ScalaJS.as.sc_GenTraversableOnce(f(arg1$1)).seq__sc_TraversableOnce();
      b.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs);
      var this$8 = these;
      these = this$8.tail__sci_List()
    };
    var jsx$4 = b.toList__sci_List()
  };
  var jsx$3 = ScalaJS.as.sci_List(jsx$4);
  var this$10 = ScalaJS.as.sci_List(this.collisionsByBonker$1.apply__O__O(c));
  var f$1 = (function(x$3$2) {
    var x$3 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Collision(x$3$2);
    return x$3.bonkerEffects__sci_List()
  });
  var this$9 = ScalaJS.m.sci_List$();
  var bf$1 = this$9.ReusableCBFInstance$2;
  if ((bf$1 === ScalaJS.m.sci_List$().ReusableCBFInstance$2)) {
    if ((this$10 === ScalaJS.m.sci_Nil$())) {
      var jsx$2 = ScalaJS.m.sci_Nil$()
    } else {
      var rest$1 = this$10;
      var found$2 = new ScalaJS.c.sr_BooleanRef().init___Z(false);
      var h$2 = new ScalaJS.c.sr_ObjectRef().init___O(null);
      var t$2 = new ScalaJS.c.sr_ObjectRef().init___O(null);
      while ((rest$1 !== ScalaJS.m.sci_Nil$())) {
        var arg1$2 = rest$1.head__O();
        ScalaJS.as.sc_GenTraversableOnce(f$1(arg1$2)).foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$2, found$3, h$3, t$3) {
          return (function(b$2$1) {
            if ((!found$3.elem$1)) {
              h$3.elem$1 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(b$2$1, ScalaJS.m.sci_Nil$());
              t$3.elem$1 = ScalaJS.as.sci_$colon$colon(h$3.elem$1);
              found$3.elem$1 = true
            } else {
              var nx$1 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(b$2$1, ScalaJS.m.sci_Nil$());
              ScalaJS.as.sci_$colon$colon(t$3.elem$1).tl$5 = nx$1;
              t$3.elem$1 = nx$1
            }
          })
        })(this$10, found$2, h$2, t$2)));
        var this$14 = rest$1;
        rest$1 = this$14.tail__sci_List()
      };
      var jsx$2 = ((!found$2.elem$1) ? ScalaJS.m.sci_Nil$() : ScalaJS.as.sci_$colon$colon(h$2.elem$1))
    }
  } else {
    ScalaJS.m.sci_List$();
    var b$1 = new ScalaJS.c.scm_ListBuffer().init___();
    var these$1 = this$10;
    while ((!these$1.isEmpty__Z())) {
      var arg1$3 = these$1.head__O();
      var xs$1 = ScalaJS.as.sc_GenTraversableOnce(f$1(arg1$3)).seq__sc_TraversableOnce();
      b$1.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs$1);
      var this$16 = these$1;
      these$1 = this$16.tail__sci_List()
    };
    var jsx$2 = b$1.toList__sci_List()
  };
  var jsx$1 = ScalaJS.as.sc_GenTraversableOnce(jsx$2);
  var this$17 = ScalaJS.m.sci_List$();
  return ScalaJS.as.sci_List(jsx$3.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(jsx$1, this$17.ReusableCBFInstance$2))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CollisionResolver = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_CollisionResolver: 0
}, false, "com.benjaminrosenbaum.jovian.CollisionResolver", {
  Lcom_benjaminrosenbaum_jovian_CollisionResolver: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Effectual: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CollisionResolver.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CollisionResolver;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation = (function() {
  ScalaJS.c.O.call(this);
  this.m1$1 = null;
  this.com$benjaminrosenbaum$jovian$CombinedMotivation$$m2$f = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CombinedMotivation = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CombinedMotivation.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, visibles) {
  return this.combine__Lcom_benjaminrosenbaum_jovian_Vector__F0__Lcom_benjaminrosenbaum_jovian_Vector(this.m1$1.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector(m, visibles), new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(arg$outer, m$2, visibles$1) {
    return (function() {
      return arg$outer.com$benjaminrosenbaum$jovian$CombinedMotivation$$m2$f.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector(m$2, visibles$1)
    })
  })(this, m, visibles)))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation.prototype.init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Motivation = (function(m1, m2) {
  this.m1$1 = m1;
  this.com$benjaminrosenbaum$jovian$CombinedMotivation$$m2$f = m2;
  return this
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking = (function() {
  ScalaJS.c.O.call(this);
  this.com$benjaminrosenbaum$jovian$Flocking$$range$f = 0.0;
  this.kinds$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flocking = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flocking.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype.flock__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__sc_Seq = (function(m, ms) {
  var x = this.kinds$1;
  var x$2 = ScalaJS.m.sci_Nil$();
  if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
    ScalaJS.m.sci_List$();
    var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([m.kind$1]);
    var this$2 = ScalaJS.m.sci_List$();
    var cbf = this$2.ReusableCBFInstance$2;
    var flockKinds = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf))
  } else {
    var flockKinds = this.kinds$1
  };
  return ScalaJS.as.sc_Seq(ms.filter__F1__O(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer, m$3, flockKinds$1) {
    return (function(f$2) {
      var f = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(f$2);
      return (((f.id$1 !== m$3.id$1) && m$3.pos$1.isWithinManhattanDistanceOf__Lcom_benjaminrosenbaum_jovian_Position__D__Z(f, arg$outer.com$benjaminrosenbaum$jovian$Flocking$$range$f)) && flockKinds$1.contains__O__Z(f.kind$1))
    })
  })(this, m, flockKinds))))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype.init___D__sc_Seq = (function(range, kinds) {
  this.com$benjaminrosenbaum$jovian$Flocking$$range$f = range;
  this.kinds$1 = kinds;
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype.averageOf__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__F2__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, ms, fn) {
  var this$2 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$();
  var jsx$2 = this.flock__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__sc_Seq(m, ms);
  var jsx$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(m$4, fn$1) {
    return (function(f$2) {
      var f = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(f$2);
      return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(fn$1.apply__O__O__O(m$4, f))
    })
  })(m, fn));
  var this$1 = ScalaJS.m.sc_Seq$();
  var vs = ScalaJS.as.sc_Seq(jsx$2.map__F1__scg_CanBuildFrom__O(jsx$1, this$1.ReusableCBFInstance$2));
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this$2.NULL$1.averageAmong__sc_Seq__Lcom_benjaminrosenbaum_jovian_Coords(vs))
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Quiescence = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Quiescence.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence.prototype.init___ = (function() {
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, visibles) {
  return ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$().NULL$1
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Quiescence = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Quiescence: 0
}, false, "com.benjaminrosenbaum.jovian.Quiescence", {
  Lcom_benjaminrosenbaum_jovian_Quiescence: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Quiescence.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Quiescence;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation = (function() {
  ScalaJS.c.O.call(this);
  this.underlying$1 = null;
  this.com$benjaminrosenbaum$jovian$RangeLimitedMotivation$$verticalSpan$f = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, visibles) {
  return this.underlying$1.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector(m, ScalaJS.as.sc_Seq(visibles.filter__F1__O(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer) {
    return (function(v$2) {
      var v = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(v$2);
      var jsx$1 = arg$outer.com$benjaminrosenbaum$jovian$RangeLimitedMotivation$$verticalSpan$f;
      var this$1 = v.pos$1;
      return jsx$1.contains__D__Z(this$1.y$1)
    })
  })(this)))))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation.prototype.init___Lcom_benjaminrosenbaum_jovian_Motivation__Lcom_benjaminrosenbaum_jovian_Span = (function(underlying, verticalSpan) {
  this.underlying$1 = underlying;
  this.com$benjaminrosenbaum$jovian$RangeLimitedMotivation$$verticalSpan$f = verticalSpan;
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation: 0
}, false, "com.benjaminrosenbaum.jovian.RangeLimitedMotivation", {
  Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_RangeLimitedMotivation;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation = (function() {
  ScalaJS.c.O.call(this);
  this.underlying$1 = null;
  this.com$benjaminrosenbaum$jovian$RelativePositionConstrainedMotivation$$ifAbove$f = false
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation.prototype.init___Lcom_benjaminrosenbaum_jovian_Motivation__Z = (function(underlying, ifAbove) {
  this.underlying$1 = underlying;
  this.com$benjaminrosenbaum$jovian$RelativePositionConstrainedMotivation$$ifAbove$f = ifAbove;
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, visibles) {
  return this.underlying$1.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector(m, ScalaJS.as.sc_Seq(visibles.filter__F1__O(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer, m$1) {
    return (function(v$2) {
      var v = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(v$2);
      var jsx$2 = arg$outer.com$benjaminrosenbaum$jovian$RelativePositionConstrainedMotivation$$ifAbove$f;
      var this$1 = m$1.pos$1;
      var jsx$1 = this$1.y$1;
      var this$2 = v.pos$1;
      return (jsx$2 === (jsx$1 < this$2.y$1))
    })
  })(this, m)))))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation: 0
}, false, "com.benjaminrosenbaum.jovian.RelativePositionConstrainedMotivation", {
  Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_RelativePositionConstrainedMotivation;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin = (function() {
  ScalaJS.c.O.call(this);
  this.min$1 = 0.0;
  this.max$1 = 0.0;
  this.force$1 = 0.0;
  this.dim$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_StayWithin = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_StayWithin.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin.prototype.init___D__D__D__Lcom_benjaminrosenbaum_jovian_Dimensionality = (function(min, max, force, dim) {
  this.min$1 = min;
  this.max$1 = max;
  this.force$1 = force;
  this.dim$1 = dim;
  ScalaJS.m.s_Predef$().assert__Z__V((min < max));
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, visibles) {
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this.dim$1.direction$1.scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(this.nudge__D__D(ScalaJS.uD(this.dim$1.getCoord$1.apply__O__O(m)))))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin.prototype.nudge__D__D = (function(whence) {
  return ((whence < this.min$1) ? this.force$1 : ((whence > this.max$1) ? (-this.force$1) : 0.0))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_StayWithin = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_StayWithin: 0
}, false, "com.benjaminrosenbaum.jovian.StayWithin", {
  Lcom_benjaminrosenbaum_jovian_StayWithin: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_StayWithin.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_StayWithin;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Coords();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Vector = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Vector.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.$$js$exported$prop$x__O = (function() {
  return this.x$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.copy__D__D__Lcom_benjaminrosenbaum_jovian_Coords = (function(x, y) {
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector().init___D__D(x, y)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.manhattanDist__D = (function() {
  var x = this.x$1;
  var x$1 = this.y$1;
  return (((x < 0) ? (-x) : x) + ((x$1 < 0) ? (-x$1) : x$1))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.capMagnitudeAt__D__Lcom_benjaminrosenbaum_jovian_Vector = (function(mag) {
  return ((this.magnitude__D() > mag) ? ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this.normalized__Lcom_benjaminrosenbaum_jovian_Vector().scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(mag)) : this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.x__D = (function() {
  return this.x$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.$$js$exported$prop$y__O = (function() {
  return this.y$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.magnitude__D = (function() {
  var x = ((this.x$1 * this.x$1) + (this.y$1 * this.y$1));
  return ScalaJS.uD(ScalaJS.g["Math"]["sqrt"](x))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.y__D = (function() {
  return this.y$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.normalized__Lcom_benjaminrosenbaum_jovian_Vector = (function() {
  return (this.equals__Lcom_benjaminrosenbaum_jovian_Coords__Z(ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$().NULL$1) ? ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$().NULL$1 : ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this.scaled__D__Lcom_benjaminrosenbaum_jovian_Coords((1.0 / this.magnitude__D()))))
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype, "x", {
  "get": (function() {
    return this.$$js$exported$prop$x__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype, "y", {
  "get": (function() {
    return this.$$js$exported$prop$y__O()
  }),
  "enumerable": true
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Vector = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Vector)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Vector(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Vector"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Vector = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Vector)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Vector = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Vector(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Vector;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Vector = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Vector: 0
}, false, "com.benjaminrosenbaum.jovian.Vector", {
  Lcom_benjaminrosenbaum_jovian_Vector: 1,
  Lcom_benjaminrosenbaum_jovian_Coords: 1,
  O: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Vector;
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
/** @constructor */
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Vector"] = (function(arg$1, arg$2) {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.call(this);
  if ((arg$1 === null)) {
    var preparg$1;
    throw "Found null, expected Double"
  } else {
    var preparg$1 = ScalaJS.uD(arg$1)
  };
  if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Double"
  } else {
    var preparg$2 = ScalaJS.uD(arg$2)
  };
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype.init___D__D.call(this, preparg$1, preparg$2)
});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Vector"].prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector.prototype;
/** @constructor */
ScalaJS.c.Ltutorial_webapp_TutorialApp$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype = new ScalaJS.h.O();
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype.constructor = ScalaJS.c.Ltutorial_webapp_TutorialApp$;
/** @constructor */
ScalaJS.h.Ltutorial_webapp_TutorialApp$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Ltutorial_webapp_TutorialApp$.prototype = ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype;
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype.init___ = (function() {
  ScalaJS.n.Ltutorial_webapp_TutorialApp$ = this;
  return this
});
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype.$$js$exported$meth$foo__O = (function() {
  return "argh"
});
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype.$$js$exported$meth$addClickedMessage__O = (function() {
  return (void 0)
});
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype.$$js$exported$meth$main__O = (function() {
  var this$2 = ScalaJS.m.s_Console$();
  var this$3 = this$2.outVar$2;
  ScalaJS.as.Ljava_io_PrintStream(this$3.tl$1.get__O()).println__O__V("ugh")
});
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype["main"] = (function() {
  return this.$$js$exported$meth$main__O()
});
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype["addClickedMessage"] = (function() {
  return this.$$js$exported$meth$addClickedMessage__O()
});
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype["foo"] = (function() {
  return this.$$js$exported$meth$foo__O()
});
ScalaJS.d.Ltutorial_webapp_TutorialApp$ = new ScalaJS.ClassTypeData({
  Ltutorial_webapp_TutorialApp$: 0
}, false, "tutorial.webapp.TutorialApp$", {
  Ltutorial_webapp_TutorialApp$: 1,
  O: 1,
  sjs_js_JSApp: 1
});
ScalaJS.c.Ltutorial_webapp_TutorialApp$.prototype.$classData = ScalaJS.d.Ltutorial_webapp_TutorialApp$;
ScalaJS.n.Ltutorial_webapp_TutorialApp$ = (void 0);
ScalaJS.m.Ltutorial_webapp_TutorialApp$ = (function() {
  if ((!ScalaJS.n.Ltutorial_webapp_TutorialApp$)) {
    ScalaJS.n.Ltutorial_webapp_TutorialApp$ = new ScalaJS.c.Ltutorial_webapp_TutorialApp$().init___()
  };
  return ScalaJS.n.Ltutorial_webapp_TutorialApp$
});
ScalaJS.e["tutorial"] = (ScalaJS.e["tutorial"] || {});
ScalaJS.e["tutorial"]["webapp"] = (ScalaJS.e["tutorial"]["webapp"] || {});
ScalaJS.e["tutorial"]["webapp"]["TutorialApp"] = ScalaJS.m.Ltutorial_webapp_TutorialApp$;
ScalaJS.d.jl_Boolean = new ScalaJS.ClassTypeData({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
ScalaJS.c.jl_Character = (function() {
  ScalaJS.c.O.call(this);
  this.value$1 = 0
});
ScalaJS.c.jl_Character.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Character.prototype.constructor = ScalaJS.c.jl_Character;
/** @constructor */
ScalaJS.h.jl_Character = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Character.prototype = ScalaJS.c.jl_Character.prototype;
ScalaJS.c.jl_Character.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = ScalaJS.as.jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
ScalaJS.c.jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c))
});
ScalaJS.c.jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
ScalaJS.c.jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
ScalaJS.is.jl_Character = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
});
ScalaJS.as.jl_Character = (function(obj) {
  return ((ScalaJS.is.jl_Character(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Character"))
});
ScalaJS.isArrayOf.jl_Character = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
});
ScalaJS.asArrayOf.jl_Character = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Character(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Character;", depth))
});
ScalaJS.d.jl_Character = new ScalaJS.ClassTypeData({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  jl_Comparable: 1
});
ScalaJS.c.jl_Character.prototype.$classData = ScalaJS.d.jl_Character;
/** @constructor */
ScalaJS.c.jl_InheritableThreadLocal = (function() {
  ScalaJS.c.jl_ThreadLocal.call(this)
});
ScalaJS.c.jl_InheritableThreadLocal.prototype = new ScalaJS.h.jl_ThreadLocal();
ScalaJS.c.jl_InheritableThreadLocal.prototype.constructor = ScalaJS.c.jl_InheritableThreadLocal;
/** @constructor */
ScalaJS.h.jl_InheritableThreadLocal = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_InheritableThreadLocal.prototype = ScalaJS.c.jl_InheritableThreadLocal.prototype;
/** @constructor */
ScalaJS.c.jl_Throwable = (function() {
  ScalaJS.c.O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
});
ScalaJS.c.jl_Throwable.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Throwable.prototype.constructor = ScalaJS.c.jl_Throwable;
/** @constructor */
ScalaJS.h.jl_Throwable = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Throwable.prototype = ScalaJS.c.jl_Throwable.prototype;
ScalaJS.c.jl_Throwable.prototype.init___ = (function() {
  ScalaJS.c.jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var this$1 = ScalaJS.m.sjsr_StackTrace$();
  this$1.captureState__jl_Throwable__O__V(this, this$1.createException__p1__O());
  return this
});
ScalaJS.c.jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
ScalaJS.c.jl_Throwable.prototype.toString__T = (function() {
  var className = ScalaJS.objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
ScalaJS.c.jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
ScalaJS.is.jl_Throwable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
});
ScalaJS.as.jl_Throwable = (function(obj) {
  return ((ScalaJS.is.jl_Throwable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Throwable"))
});
ScalaJS.isArrayOf.jl_Throwable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
});
ScalaJS.asArrayOf.jl_Throwable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Throwable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
});
/** @constructor */
ScalaJS.c.s_Predef$$anon$3 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_Predef$$anon$3.prototype = new ScalaJS.h.O();
ScalaJS.c.s_Predef$$anon$3.prototype.constructor = ScalaJS.c.s_Predef$$anon$3;
/** @constructor */
ScalaJS.h.s_Predef$$anon$3 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Predef$$anon$3.prototype = ScalaJS.c.s_Predef$$anon$3.prototype;
ScalaJS.c.s_Predef$$anon$3.prototype.apply__scm_Builder = (function() {
  return new ScalaJS.c.scm_StringBuilder().init___()
});
ScalaJS.c.s_Predef$$anon$3.prototype.apply__O__scm_Builder = (function(from) {
  ScalaJS.as.T(from);
  return new ScalaJS.c.scm_StringBuilder().init___()
});
ScalaJS.d.s_Predef$$anon$3 = new ScalaJS.ClassTypeData({
  s_Predef$$anon$3: 0
}, false, "scala.Predef$$anon$3", {
  s_Predef$$anon$3: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
ScalaJS.c.s_Predef$$anon$3.prototype.$classData = ScalaJS.d.s_Predef$$anon$3;
ScalaJS.is.s_math_ScalaNumber = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
});
ScalaJS.as.s_math_ScalaNumber = (function(obj) {
  return ((ScalaJS.is.s_math_ScalaNumber(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.math.ScalaNumber"))
});
ScalaJS.isArrayOf.s_math_ScalaNumber = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
});
ScalaJS.asArrayOf.s_math_ScalaNumber = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
});
/** @constructor */
ScalaJS.c.s_package$$anon$1 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_package$$anon$1.prototype = new ScalaJS.h.O();
ScalaJS.c.s_package$$anon$1.prototype.constructor = ScalaJS.c.s_package$$anon$1;
/** @constructor */
ScalaJS.h.s_package$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_package$$anon$1.prototype = ScalaJS.c.s_package$$anon$1.prototype;
ScalaJS.c.s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
ScalaJS.d.s_package$$anon$1 = new ScalaJS.ClassTypeData({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
ScalaJS.c.s_package$$anon$1.prototype.$classData = ScalaJS.d.s_package$$anon$1;
/** @constructor */
ScalaJS.c.s_util_hashing_MurmurHash3$ = (function() {
  ScalaJS.c.s_util_hashing_MurmurHash3.call(this);
  this.arraySeed$2 = 0;
  this.stringSeed$2 = 0;
  this.productSeed$2 = 0;
  this.symmetricSeed$2 = 0;
  this.traversableSeed$2 = 0;
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype = new ScalaJS.h.s_util_hashing_MurmurHash3();
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.constructor = ScalaJS.c.s_util_hashing_MurmurHash3$;
/** @constructor */
ScalaJS.h.s_util_hashing_MurmurHash3$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_hashing_MurmurHash3$.prototype = ScalaJS.c.s_util_hashing_MurmurHash3$.prototype;
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  ScalaJS.n.s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if (ScalaJS.is.sci_List(xs)) {
    var x2 = ScalaJS.as.sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
ScalaJS.d.s_util_hashing_MurmurHash3$ = new ScalaJS.ClassTypeData({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.$classData = ScalaJS.d.s_util_hashing_MurmurHash3$;
ScalaJS.n.s_util_hashing_MurmurHash3$ = (void 0);
ScalaJS.m.s_util_hashing_MurmurHash3$ = (function() {
  if ((!ScalaJS.n.s_util_hashing_MurmurHash3$)) {
    ScalaJS.n.s_util_hashing_MurmurHash3$ = new ScalaJS.c.s_util_hashing_MurmurHash3$().init___()
  };
  return ScalaJS.n.s_util_hashing_MurmurHash3$
});
/** @constructor */
ScalaJS.c.sc_TraversableLike$WithFilter = (function() {
  ScalaJS.c.O.call(this);
  this.p$1 = null;
  this.$$outer$f = null
});
ScalaJS.c.sc_TraversableLike$WithFilter.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_TraversableLike$WithFilter.prototype.constructor = ScalaJS.c.sc_TraversableLike$WithFilter;
/** @constructor */
ScalaJS.h.sc_TraversableLike$WithFilter = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_TraversableLike$WithFilter.prototype = ScalaJS.c.sc_TraversableLike$WithFilter.prototype;
ScalaJS.c.sc_TraversableLike$WithFilter.prototype.foreach__F1__V = (function(f) {
  this.$$outer$f.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, f$1) {
    return (function(x$2) {
      return (ScalaJS.uZ(this$2.p$1.apply__O__O(x$2)) ? f$1.apply__O__O(x$2) : (void 0))
    })
  })(this, f)))
});
ScalaJS.c.sc_TraversableLike$WithFilter.prototype.init___sc_TraversableLike__F1 = (function($$outer, p) {
  this.p$1 = p;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
ScalaJS.d.sc_TraversableLike$WithFilter = new ScalaJS.ClassTypeData({
  sc_TraversableLike$WithFilter: 0
}, false, "scala.collection.TraversableLike$WithFilter", {
  sc_TraversableLike$WithFilter: 1,
  O: 1,
  scg_FilterMonadic: 1
});
ScalaJS.c.sc_TraversableLike$WithFilter.prototype.$classData = ScalaJS.d.sc_TraversableLike$WithFilter;
/** @constructor */
ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom = (function() {
  ScalaJS.c.O.call(this);
  this.$$outer$f = null
});
ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom.prototype = new ScalaJS.h.O();
ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom.prototype.constructor = ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom;
/** @constructor */
ScalaJS.h.scg_GenMapFactory$MapCanBuildFrom = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenMapFactory$MapCanBuildFrom.prototype = ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom.prototype;
ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$f.newBuilder__scm_Builder()
});
ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  ScalaJS.as.sc_GenMap(from);
  return this.$$outer$f.newBuilder__scm_Builder()
});
ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom.prototype.init___scg_GenMapFactory = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
ScalaJS.d.scg_GenMapFactory$MapCanBuildFrom = new ScalaJS.ClassTypeData({
  scg_GenMapFactory$MapCanBuildFrom: 0
}, false, "scala.collection.generic.GenMapFactory$MapCanBuildFrom", {
  scg_GenMapFactory$MapCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom.prototype.$classData = ScalaJS.d.scg_GenMapFactory$MapCanBuildFrom;
/** @constructor */
ScalaJS.c.scg_GenSetFactory = (function() {
  ScalaJS.c.scg_GenericCompanion.call(this)
});
ScalaJS.c.scg_GenSetFactory.prototype = new ScalaJS.h.scg_GenericCompanion();
ScalaJS.c.scg_GenSetFactory.prototype.constructor = ScalaJS.c.scg_GenSetFactory;
/** @constructor */
ScalaJS.h.scg_GenSetFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenSetFactory.prototype = ScalaJS.c.scg_GenSetFactory.prototype;
/** @constructor */
ScalaJS.c.scg_GenTraversableFactory = (function() {
  ScalaJS.c.scg_GenericCompanion.call(this);
  this.ReusableCBFInstance$2 = null
});
ScalaJS.c.scg_GenTraversableFactory.prototype = new ScalaJS.h.scg_GenericCompanion();
ScalaJS.c.scg_GenTraversableFactory.prototype.constructor = ScalaJS.c.scg_GenTraversableFactory;
/** @constructor */
ScalaJS.h.scg_GenTraversableFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenTraversableFactory.prototype = ScalaJS.c.scg_GenTraversableFactory.prototype;
ScalaJS.c.scg_GenTraversableFactory.prototype.init___ = (function() {
  this.ReusableCBFInstance$2 = new ScalaJS.c.scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
  return this
});
/** @constructor */
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom = (function() {
  ScalaJS.c.O.call(this);
  this.$$outer$f = null
});
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype = new ScalaJS.h.O();
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.constructor = ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom;
/** @constructor */
ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom.prototype = ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype;
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$f.newBuilder__scm_Builder()
});
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  var from$1 = ScalaJS.as.sc_GenTraversable(from);
  return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
/** @constructor */
ScalaJS.c.scg_MapFactory = (function() {
  ScalaJS.c.scg_GenMapFactory.call(this)
});
ScalaJS.c.scg_MapFactory.prototype = new ScalaJS.h.scg_GenMapFactory();
ScalaJS.c.scg_MapFactory.prototype.constructor = ScalaJS.c.scg_MapFactory;
/** @constructor */
ScalaJS.h.scg_MapFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_MapFactory.prototype = ScalaJS.c.scg_MapFactory.prototype;
/** @constructor */
ScalaJS.c.sci_HashMap$$anon$2 = (function() {
  ScalaJS.c.sci_HashMap$Merger.call(this);
  this.invert$2 = null;
  this.mergef$1$f = null
});
ScalaJS.c.sci_HashMap$$anon$2.prototype = new ScalaJS.h.sci_HashMap$Merger();
ScalaJS.c.sci_HashMap$$anon$2.prototype.constructor = ScalaJS.c.sci_HashMap$$anon$2;
/** @constructor */
ScalaJS.h.sci_HashMap$$anon$2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$$anon$2.prototype = ScalaJS.c.sci_HashMap$$anon$2.prototype;
ScalaJS.c.sci_HashMap$$anon$2.prototype.init___F2 = (function(mergef$1) {
  this.mergef$1$f = mergef$1;
  this.invert$2 = new ScalaJS.c.sci_HashMap$$anon$2$$anon$3().init___sci_HashMap$$anon$2(this);
  return this
});
ScalaJS.c.sci_HashMap$$anon$2.prototype.apply__T2__T2__T2 = (function(kv1, kv2) {
  return ScalaJS.as.T2(this.mergef$1$f.apply__O__O__O(kv1, kv2))
});
ScalaJS.d.sci_HashMap$$anon$2 = new ScalaJS.ClassTypeData({
  sci_HashMap$$anon$2: 0
}, false, "scala.collection.immutable.HashMap$$anon$2", {
  sci_HashMap$$anon$2: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
ScalaJS.c.sci_HashMap$$anon$2.prototype.$classData = ScalaJS.d.sci_HashMap$$anon$2;
/** @constructor */
ScalaJS.c.sci_HashMap$$anon$2$$anon$3 = (function() {
  ScalaJS.c.sci_HashMap$Merger.call(this);
  this.$$outer$2 = null
});
ScalaJS.c.sci_HashMap$$anon$2$$anon$3.prototype = new ScalaJS.h.sci_HashMap$Merger();
ScalaJS.c.sci_HashMap$$anon$2$$anon$3.prototype.constructor = ScalaJS.c.sci_HashMap$$anon$2$$anon$3;
/** @constructor */
ScalaJS.h.sci_HashMap$$anon$2$$anon$3 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$$anon$2$$anon$3.prototype = ScalaJS.c.sci_HashMap$$anon$2$$anon$3.prototype;
ScalaJS.c.sci_HashMap$$anon$2$$anon$3.prototype.apply__T2__T2__T2 = (function(kv1, kv2) {
  return ScalaJS.as.T2(this.$$outer$2.mergef$1$f.apply__O__O__O(kv2, kv1))
});
ScalaJS.c.sci_HashMap$$anon$2$$anon$3.prototype.init___sci_HashMap$$anon$2 = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  return this
});
ScalaJS.d.sci_HashMap$$anon$2$$anon$3 = new ScalaJS.ClassTypeData({
  sci_HashMap$$anon$2$$anon$3: 0
}, false, "scala.collection.immutable.HashMap$$anon$2$$anon$3", {
  sci_HashMap$$anon$2$$anon$3: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
ScalaJS.c.sci_HashMap$$anon$2$$anon$3.prototype.$classData = ScalaJS.d.sci_HashMap$$anon$2$$anon$3;
/** @constructor */
ScalaJS.c.sci_List$$anon$1 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_List$$anon$1.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_List$$anon$1.prototype.constructor = ScalaJS.c.sci_List$$anon$1;
/** @constructor */
ScalaJS.h.sci_List$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_List$$anon$1.prototype = ScalaJS.c.sci_List$$anon$1.prototype;
ScalaJS.c.sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
ScalaJS.c.sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
ScalaJS.d.sci_List$$anon$1 = new ScalaJS.ClassTypeData({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
ScalaJS.c.sci_List$$anon$1.prototype.$classData = ScalaJS.d.sci_List$$anon$1;
ScalaJS.is.scm_Builder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
});
ScalaJS.as.scm_Builder = (function(obj) {
  return ((ScalaJS.is.scm_Builder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.Builder"))
});
ScalaJS.isArrayOf.scm_Builder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
});
ScalaJS.asArrayOf.scm_Builder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_Builder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
});
/** @constructor */
ScalaJS.c.sr_AbstractFunction0 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction0.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction0.prototype.constructor = ScalaJS.c.sr_AbstractFunction0;
/** @constructor */
ScalaJS.h.sr_AbstractFunction0 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction0.prototype = ScalaJS.c.sr_AbstractFunction0.prototype;
ScalaJS.c.sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
ScalaJS.c.sr_AbstractFunction1 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction1.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction1.prototype.constructor = ScalaJS.c.sr_AbstractFunction1;
/** @constructor */
ScalaJS.h.sr_AbstractFunction1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction1.prototype = ScalaJS.c.sr_AbstractFunction1.prototype;
ScalaJS.c.sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
ScalaJS.c.sr_AbstractFunction2 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction2.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction2.prototype.constructor = ScalaJS.c.sr_AbstractFunction2;
/** @constructor */
ScalaJS.h.sr_AbstractFunction2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction2.prototype = ScalaJS.c.sr_AbstractFunction2.prototype;
ScalaJS.c.sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
/** @constructor */
ScalaJS.c.sr_AbstractFunction8 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction8.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction8.prototype.constructor = ScalaJS.c.sr_AbstractFunction8;
/** @constructor */
ScalaJS.h.sr_AbstractFunction8 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction8.prototype = ScalaJS.c.sr_AbstractFunction8.prototype;
ScalaJS.c.sr_AbstractFunction8.prototype.init___ = (function() {
  return this
});
/** @constructor */
ScalaJS.c.sr_BooleanRef = (function() {
  ScalaJS.c.O.call(this);
  this.elem$1 = false
});
ScalaJS.c.sr_BooleanRef.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_BooleanRef.prototype.constructor = ScalaJS.c.sr_BooleanRef;
/** @constructor */
ScalaJS.h.sr_BooleanRef = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_BooleanRef.prototype = ScalaJS.c.sr_BooleanRef.prototype;
ScalaJS.c.sr_BooleanRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
ScalaJS.c.sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
ScalaJS.d.sr_BooleanRef = new ScalaJS.ClassTypeData({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sr_BooleanRef.prototype.$classData = ScalaJS.d.sr_BooleanRef;
/** @constructor */
ScalaJS.c.sr_IntRef = (function() {
  ScalaJS.c.O.call(this);
  this.elem$1 = 0
});
ScalaJS.c.sr_IntRef.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_IntRef.prototype.constructor = ScalaJS.c.sr_IntRef;
/** @constructor */
ScalaJS.h.sr_IntRef = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_IntRef.prototype = ScalaJS.c.sr_IntRef.prototype;
ScalaJS.c.sr_IntRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
ScalaJS.c.sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
ScalaJS.d.sr_IntRef = new ScalaJS.ClassTypeData({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sr_IntRef.prototype.$classData = ScalaJS.d.sr_IntRef;
/** @constructor */
ScalaJS.c.sr_ObjectRef = (function() {
  ScalaJS.c.O.call(this);
  this.elem$1 = null
});
ScalaJS.c.sr_ObjectRef.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_ObjectRef.prototype.constructor = ScalaJS.c.sr_ObjectRef;
/** @constructor */
ScalaJS.h.sr_ObjectRef = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_ObjectRef.prototype = ScalaJS.c.sr_ObjectRef.prototype;
ScalaJS.c.sr_ObjectRef.prototype.toString__T = (function() {
  return ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T(this.elem$1)
});
ScalaJS.c.sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
ScalaJS.d.sr_ObjectRef = new ScalaJS.ClassTypeData({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sr_ObjectRef.prototype.$classData = ScalaJS.d.sr_ObjectRef;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.call(this);
  this.force$2 = 0.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flocking();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_AlignWithFlock = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_AlignWithFlock.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, ms) {
  var this$1 = this.averageOf__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__F2__Lcom_benjaminrosenbaum_jovian_Vector(m, ms, new ScalaJS.c.sjsr_AnonFunction2().init___sjs_js_Function2((function(m$2, f$2) {
    ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(m$2);
    var f = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(f$2);
    return f.vel$1
  })));
  var mag = this.force$2;
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this$1.normalized__Lcom_benjaminrosenbaum_jovian_Vector().scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(mag))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock.prototype.init___D__D__sc_Seq = (function(range, force, kinds) {
  this.force$2 = force;
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype.init___D__sc_Seq.call(this, range, kinds);
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_AlignWithFlock = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_AlignWithFlock: 0
}, false, "com.benjaminrosenbaum.jovian.AlignWithFlock", {
  Lcom_benjaminrosenbaum_jovian_AlignWithFlock: 1,
  Lcom_benjaminrosenbaum_jovian_Flocking: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AlignWithFlock.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_AlignWithFlock;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CombinedMotivation();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_AndedMotivation = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_AndedMotivation.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation.prototype.combine__Lcom_benjaminrosenbaum_jovian_Vector__F0__Lcom_benjaminrosenbaum_jovian_Vector = (function(v1, v2) {
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(v1.plus__Lcom_benjaminrosenbaum_jovian_Coords__Lcom_benjaminrosenbaum_jovian_Coords(ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Coords(v2.apply__O())))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_AndedMotivation = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_AndedMotivation: 0
}, false, "com.benjaminrosenbaum.jovian.AndedMotivation", {
  Lcom_benjaminrosenbaum_jovian_AndedMotivation: 1,
  Lcom_benjaminrosenbaum_jovian_CombinedMotivation: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_AndedMotivation.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_AndedMotivation;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.call(this);
  this.com$benjaminrosenbaum$jovian$CohereWithFlock$$force$f = 0.0;
  this.minRange$2 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flocking();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CohereWithFlock = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype.init___D__D__sc_Seq__s_Option = (function(range, force, kinds, minRange) {
  this.com$benjaminrosenbaum$jovian$CohereWithFlock$$force$f = force;
  this.minRange$2 = minRange;
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype.init___D__sc_Seq.call(this, range, kinds);
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype.nullIfTooClose__Lcom_benjaminrosenbaum_jovian_Vector__s_Option = (function(v) {
  var this$1 = this.minRange$2;
  var p = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(check$ifrefutable$1$2) {
    ScalaJS.uD(check$ifrefutable$1$2);
    return true
  }));
  var this$2 = new ScalaJS.c.s_Option$WithFilter().init___s_Option__F1(this$1, p).withFilter__F1__s_Option$WithFilter(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(v$1) {
    return (function(r$2) {
      var r = ScalaJS.uD(r$2);
      return (v$1.manhattanDist__D() < r)
    })
  })(v)));
  var this$3 = this$2.$$outer$f;
  var p$1 = this$2.p$1;
  var this$4 = ((this$3.isEmpty__Z() || ScalaJS.uZ(p$1.apply__O__O(this$3.get__O()))) ? this$3 : ScalaJS.m.s_None$());
  if (this$4.isEmpty__Z()) {
    return ScalaJS.m.s_None$()
  } else {
    var arg1 = this$4.get__O();
    ScalaJS.uD(arg1);
    return new ScalaJS.c.s_Some().init___O(ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$().NULL$1)
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, ms) {
  var v = this.towardsCenter__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector(m, this.flock__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__sc_Seq(m, ms));
  var this$1 = this.nullIfTooClose__Lcom_benjaminrosenbaum_jovian_Vector__s_Option(v);
  if (this$1.isEmpty__Z()) {
    var mag = this.com$benjaminrosenbaum$jovian$CohereWithFlock$$force$f;
    var jsx$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(v.normalized__Lcom_benjaminrosenbaum_jovian_Vector().scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(mag))
  } else {
    var jsx$1 = this$1.get__O()
  };
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(jsx$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype.towardsCenter__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, ms) {
  var x$2 = ScalaJS.m.sci_Nil$();
  if (((ms === null) ? (x$2 === null) : ms.equals__O__Z(x$2))) {
    return ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$().NULL$1
  } else {
    return m.pos$1.to__Lcom_benjaminrosenbaum_jovian_Position__Lcom_benjaminrosenbaum_jovian_Vector(ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Position$().centerOf__sc_Seq__Lcom_benjaminrosenbaum_jovian_Point(this.flock__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__sc_Seq(m, ms)))
  }
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CohereWithFlock = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_CohereWithFlock: 0
}, false, "com.benjaminrosenbaum.jovian.CohereWithFlock", {
  Lcom_benjaminrosenbaum_jovian_CohereWithFlock: 1,
  Lcom_benjaminrosenbaum_jovian_Flocking: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_CohereWithFlock;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality$ = (function() {
  ScalaJS.c.O.call(this);
  this.Vertical$1 = null;
  this.Horizontal$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality$.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Dimensionality$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Dimensionality$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality$.prototype.init___ = (function() {
  ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Dimensionality$ = this;
  this.Vertical$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality().init___Lcom_benjaminrosenbaum_jovian_Vector__F1((ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$(), new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector().init___D__D(0.0, 1.0)), new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(p$2) {
    var p = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Position(p$2);
    var this$2 = p.pos__Lcom_benjaminrosenbaum_jovian_Point();
    return this$2.y$1
  })));
  this.Horizontal$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality().init___Lcom_benjaminrosenbaum_jovian_Vector__F1((ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$(), new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector().init___D__D(1.0, 0.0)), new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(p$2$1) {
    var p$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Position(p$2$1);
    var this$4 = p$1.pos__Lcom_benjaminrosenbaum_jovian_Point();
    return this$4.x$1
  })));
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Dimensionality$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Dimensionality$: 0
}, false, "com.benjaminrosenbaum.jovian.Dimensionality$", {
  Lcom_benjaminrosenbaum_jovian_Dimensionality$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Dimensionality$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Dimensionality$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Dimensionality$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Dimensionality$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Dimensionality$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Dimensionality$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Coords.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Coords();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Point = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Point.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.$$js$exported$prop$x__O = (function() {
  return this.x$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.copy__D__D__Lcom_benjaminrosenbaum_jovian_Coords = (function(x, y) {
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point().init___D__D(x, y)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.x__D = (function() {
  return this.x$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.isWithinManhattanDistanceOf__Lcom_benjaminrosenbaum_jovian_Position__D__Z = (function(p, dist) {
  return (this.to__Lcom_benjaminrosenbaum_jovian_Position__Lcom_benjaminrosenbaum_jovian_Vector(p).manhattanDist__D() <= dist)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.constrainToPlane__Lcom_benjaminrosenbaum_jovian_Point = (function() {
  if ((ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$().XSpan$1.contains__D__Z(this.x$1) && ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$().YSpan$1.contains__D__Z(this.y$1))) {
    return this
  } else {
    var x$1 = ((this.x$1 + ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$().Width$1) % ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$().Width$1);
    var y = this.y$1;
    var x = ((0.0 > y) ? 0.0 : y);
    var y$1 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$().Height$1;
    var y$2 = ((x < y$1) ? x : y$1);
    return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point().init___D__D(x$1, y$2)
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.$$js$exported$prop$y__O = (function() {
  return this.y$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.to__Lcom_benjaminrosenbaum_jovian_Position__Lcom_benjaminrosenbaum_jovian_Vector = (function(p) {
  var this$1 = p.pos__Lcom_benjaminrosenbaum_jovian_Point();
  var jsx$2 = this$1.x$1;
  var jsx$1 = this.x$1;
  var this$2 = p.pos__Lcom_benjaminrosenbaum_jovian_Point();
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector().init___D__D((jsx$2 - jsx$1), (this$2.y$1 - this.y$1))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.pos__Lcom_benjaminrosenbaum_jovian_Point = (function() {
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.y__D = (function() {
  return this.y$1
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype, "x", {
  "get": (function() {
    return this.$$js$exported$prop$x__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype, "y", {
  "get": (function() {
    return this.$$js$exported$prop$y__O()
  }),
  "enumerable": true
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Point = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Point)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Point = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Point(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Point"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Point = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Point)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Point = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Point(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Point;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Point = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Point: 0
}, false, "com.benjaminrosenbaum.jovian.Point", {
  Lcom_benjaminrosenbaum_jovian_Point: 1,
  Lcom_benjaminrosenbaum_jovian_Coords: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Position: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Point;
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
/** @constructor */
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Point"] = (function(arg$1, arg$2) {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.call(this);
  if ((arg$1 === null)) {
    var preparg$1;
    throw "Found null, expected Double"
  } else {
    var preparg$1 = ScalaJS.uD(arg$1)
  };
  if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Double"
  } else {
    var preparg$2 = ScalaJS.uD(arg$2)
  };
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype.init___D__D.call(this, preparg$1, preparg$2)
});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Point"].prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Point.prototype;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.call(this);
  this.force$2 = 0.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flocking();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, ms) {
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this.averageOf__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__F2__Lcom_benjaminrosenbaum_jovian_Vector(m, ms, this.separation__F2()).scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(this.force$2))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock.prototype.separation__F2 = (function() {
  return new ScalaJS.c.sjsr_AnonFunction2().init___sjs_js_Function2((function(m$2, f$2) {
    var m = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(m$2);
    var f = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(f$2);
    return f.pos$1.to__Lcom_benjaminrosenbaum_jovian_Position__Lcom_benjaminrosenbaum_jovian_Vector(m).normalized__Lcom_benjaminrosenbaum_jovian_Vector()
  }))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock.prototype.init___D__D__sc_Seq = (function(range, force, kinds) {
  this.force$2 = force;
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype.init___D__sc_Seq.call(this, range, kinds);
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_SeparateFromFlock: 0
}, false, "com.benjaminrosenbaum.jovian.SeparateFromFlock", {
  Lcom_benjaminrosenbaum_jovian_SeparateFromFlock: 1,
  Lcom_benjaminrosenbaum_jovian_Flocking: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_SeparateFromFlock;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CombinedMotivation.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CombinedMotivation();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation.prototype.combine__Lcom_benjaminrosenbaum_jovian_Vector__F0__Lcom_benjaminrosenbaum_jovian_Vector = (function(v1, v2) {
  return (v1.equals__Lcom_benjaminrosenbaum_jovian_Coords__Z(ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$().NULL$1) ? ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(v2.apply__O()) : v1)
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_TrumpedMotivation: 0
}, false, "com.benjaminrosenbaum.jovian.TrumpedMotivation", {
  Lcom_benjaminrosenbaum_jovian_TrumpedMotivation: 1,
  Lcom_benjaminrosenbaum_jovian_CombinedMotivation: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_TrumpedMotivation;
/** @constructor */
ScalaJS.c.Ljava_io_OutputStream = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Ljava_io_OutputStream.prototype = new ScalaJS.h.O();
ScalaJS.c.Ljava_io_OutputStream.prototype.constructor = ScalaJS.c.Ljava_io_OutputStream;
/** @constructor */
ScalaJS.h.Ljava_io_OutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_OutputStream.prototype = ScalaJS.c.Ljava_io_OutputStream.prototype;
ScalaJS.d.jl_Byte = new ScalaJS.ClassTypeData({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.isByte(x)
}));
ScalaJS.isArrayOf.jl_Double = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
});
ScalaJS.asArrayOf.jl_Double = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Double(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Double;", depth))
});
ScalaJS.d.jl_Double = new ScalaJS.ClassTypeData({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ((typeof x) === "number")
}));
/** @constructor */
ScalaJS.c.jl_Error = (function() {
  ScalaJS.c.jl_Throwable.call(this)
});
ScalaJS.c.jl_Error.prototype = new ScalaJS.h.jl_Throwable();
ScalaJS.c.jl_Error.prototype.constructor = ScalaJS.c.jl_Error;
/** @constructor */
ScalaJS.h.jl_Error = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Error.prototype = ScalaJS.c.jl_Error.prototype;
ScalaJS.c.jl_Error.prototype.init___T = (function(s) {
  ScalaJS.c.jl_Error.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
/** @constructor */
ScalaJS.c.jl_Exception = (function() {
  ScalaJS.c.jl_Throwable.call(this)
});
ScalaJS.c.jl_Exception.prototype = new ScalaJS.h.jl_Throwable();
ScalaJS.c.jl_Exception.prototype.constructor = ScalaJS.c.jl_Exception;
/** @constructor */
ScalaJS.h.jl_Exception = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Exception.prototype = ScalaJS.c.jl_Exception.prototype;
ScalaJS.isArrayOf.jl_Float = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Float)))
});
ScalaJS.asArrayOf.jl_Float = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Float(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Float;", depth))
});
ScalaJS.d.jl_Float = new ScalaJS.ClassTypeData({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.isFloat(x)
}));
ScalaJS.isArrayOf.jl_Integer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Integer)))
});
ScalaJS.asArrayOf.jl_Integer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Integer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Integer;", depth))
});
ScalaJS.d.jl_Integer = new ScalaJS.ClassTypeData({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.isInt(x)
}));
ScalaJS.isArrayOf.jl_Long = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
});
ScalaJS.asArrayOf.jl_Long = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Long(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Long;", depth))
});
ScalaJS.d.jl_Long = new ScalaJS.ClassTypeData({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.is.sjsr_RuntimeLong(x)
}));
ScalaJS.d.jl_Short = new ScalaJS.ClassTypeData({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.isShort(x)
}));
/** @constructor */
ScalaJS.c.s_Console$ = (function() {
  ScalaJS.c.s_DeprecatedConsole.call(this);
  this.outVar$2 = null;
  this.errVar$2 = null;
  this.inVar$2 = null
});
ScalaJS.c.s_Console$.prototype = new ScalaJS.h.s_DeprecatedConsole();
ScalaJS.c.s_Console$.prototype.constructor = ScalaJS.c.s_Console$;
/** @constructor */
ScalaJS.h.s_Console$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Console$.prototype = ScalaJS.c.s_Console$.prototype;
ScalaJS.c.s_Console$.prototype.init___ = (function() {
  ScalaJS.n.s_Console$ = this;
  this.outVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(ScalaJS.m.jl_System$().out$1);
  this.errVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(ScalaJS.m.jl_System$().err$1);
  this.inVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(null);
  return this
});
ScalaJS.d.s_Console$ = new ScalaJS.ClassTypeData({
  s_Console$: 0
}, false, "scala.Console$", {
  s_Console$: 1,
  s_DeprecatedConsole: 1,
  O: 1,
  s_io_AnsiColor: 1
});
ScalaJS.c.s_Console$.prototype.$classData = ScalaJS.d.s_Console$;
ScalaJS.n.s_Console$ = (void 0);
ScalaJS.m.s_Console$ = (function() {
  if ((!ScalaJS.n.s_Console$)) {
    ScalaJS.n.s_Console$ = new ScalaJS.c.s_Console$().init___()
  };
  return ScalaJS.n.s_Console$
});
/** @constructor */
ScalaJS.c.s_Predef$ = (function() {
  ScalaJS.c.s_LowPriorityImplicits.call(this);
  this.Map$2 = null;
  this.Set$2 = null;
  this.ClassManifest$2 = null;
  this.Manifest$2 = null;
  this.NoManifest$2 = null;
  this.StringCanBuildFrom$2 = null;
  this.singleton$und$less$colon$less$2 = null;
  this.scala$Predef$$singleton$und$eq$colon$eq$f = null
});
ScalaJS.c.s_Predef$.prototype = new ScalaJS.h.s_LowPriorityImplicits();
ScalaJS.c.s_Predef$.prototype.constructor = ScalaJS.c.s_Predef$;
/** @constructor */
ScalaJS.h.s_Predef$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Predef$.prototype = ScalaJS.c.s_Predef$.prototype;
ScalaJS.c.s_Predef$.prototype.init___ = (function() {
  ScalaJS.n.s_Predef$ = this;
  ScalaJS.m.s_package$();
  ScalaJS.m.sci_List$();
  this.Map$2 = ScalaJS.m.sci_Map$();
  this.Set$2 = ScalaJS.m.sci_Set$();
  this.ClassManifest$2 = ScalaJS.m.s_reflect_package$().ClassManifest$1;
  this.Manifest$2 = ScalaJS.m.s_reflect_package$().Manifest$1;
  this.NoManifest$2 = ScalaJS.m.s_reflect_NoManifest$();
  this.StringCanBuildFrom$2 = new ScalaJS.c.s_Predef$$anon$3().init___();
  this.singleton$und$less$colon$less$2 = new ScalaJS.c.s_Predef$$anon$1().init___();
  this.scala$Predef$$singleton$und$eq$colon$eq$f = new ScalaJS.c.s_Predef$$anon$2().init___();
  return this
});
ScalaJS.c.s_Predef$.prototype.assert__Z__V = (function(assertion) {
  if ((!assertion)) {
    throw new ScalaJS.c.jl_AssertionError().init___O("assertion failed")
  }
});
ScalaJS.c.s_Predef$.prototype.require__Z__V = (function(requirement) {
  if ((!requirement)) {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___T("requirement failed")
  }
});
ScalaJS.d.s_Predef$ = new ScalaJS.ClassTypeData({
  s_Predef$: 0
}, false, "scala.Predef$", {
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  O: 1,
  s_DeprecatedPredef: 1
});
ScalaJS.c.s_Predef$.prototype.$classData = ScalaJS.d.s_Predef$;
ScalaJS.n.s_Predef$ = (void 0);
ScalaJS.m.s_Predef$ = (function() {
  if ((!ScalaJS.n.s_Predef$)) {
    ScalaJS.n.s_Predef$ = new ScalaJS.c.s_Predef$().init___()
  };
  return ScalaJS.n.s_Predef$
});
/** @constructor */
ScalaJS.c.s_StringContext$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_StringContext$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_StringContext$.prototype.constructor = ScalaJS.c.s_StringContext$;
/** @constructor */
ScalaJS.h.s_StringContext$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_StringContext$.prototype = ScalaJS.c.s_StringContext$.prototype;
ScalaJS.c.s_StringContext$.prototype.treatEscapes0__p1__T__Z__T = (function(str, strict) {
  var len = ScalaJS.uI(str["length"]);
  var x1 = ScalaJS.m.sjsr_RuntimeString$().indexOf__T__I__I(str, 92);
  switch (x1) {
    case (-1):
      {
        return str;
        break
      };
    default:
      return this.replace$1__p1__I__T__Z__I__T(x1, str, strict, len);
  }
});
ScalaJS.c.s_StringContext$.prototype.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T = (function(i, next, str$1, strict$1, len$1, b$1) {
  _loop: while (true) {
    if ((next >= 0)) {
      if ((next > i)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, next)
      };
      var idx = ((1 + next) | 0);
      if ((idx >= len$1)) {
        throw new ScalaJS.c.s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
      };
      var index = idx;
      var x1 = (65535 & ScalaJS.uI(str$1["charCodeAt"](index)));
      switch (x1) {
        case 98:
          {
            var c = 8;
            break
          };
        case 116:
          {
            var c = 9;
            break
          };
        case 110:
          {
            var c = 10;
            break
          };
        case 102:
          {
            var c = 12;
            break
          };
        case 114:
          {
            var c = 13;
            break
          };
        case 34:
          {
            var c = 34;
            break
          };
        case 39:
          {
            var c = 39;
            break
          };
        case 92:
          {
            var c = 92;
            break
          };
        default:
          if (((x1 >= 48) && (x1 <= 55))) {
            if (strict$1) {
              throw new ScalaJS.c.s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
            };
            var index$1 = idx;
            var leadch = (65535 & ScalaJS.uI(str$1["charCodeAt"](index$1)));
            var oct = (((-48) + leadch) | 0);
            idx = ((1 + idx) | 0);
            if ((idx < len$1)) {
              var index$2 = idx;
              var jsx$2 = ((65535 & ScalaJS.uI(str$1["charCodeAt"](index$2))) >= 48)
            } else {
              var jsx$2 = false
            };
            if (jsx$2) {
              var index$3 = idx;
              var jsx$1 = ((65535 & ScalaJS.uI(str$1["charCodeAt"](index$3))) <= 55)
            } else {
              var jsx$1 = false
            };
            if (jsx$1) {
              var jsx$3 = oct;
              var index$4 = idx;
              oct = (((-48) + ((ScalaJS.imul(8, jsx$3) + (65535 & ScalaJS.uI(str$1["charCodeAt"](index$4)))) | 0)) | 0);
              idx = ((1 + idx) | 0);
              if (((idx < len$1) && (leadch <= 51))) {
                var index$5 = idx;
                var jsx$5 = ((65535 & ScalaJS.uI(str$1["charCodeAt"](index$5))) >= 48)
              } else {
                var jsx$5 = false
              };
              if (jsx$5) {
                var index$6 = idx;
                var jsx$4 = ((65535 & ScalaJS.uI(str$1["charCodeAt"](index$6))) <= 55)
              } else {
                var jsx$4 = false
              };
              if (jsx$4) {
                var jsx$6 = oct;
                var index$7 = idx;
                oct = (((-48) + ((ScalaJS.imul(8, jsx$6) + (65535 & ScalaJS.uI(str$1["charCodeAt"](index$7)))) | 0)) | 0);
                idx = ((1 + idx) | 0)
              }
            };
            idx = (((-1) + idx) | 0);
            var c = (65535 & oct)
          } else {
            var c;
            throw new ScalaJS.c.s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
          };
      };
      idx = ((1 + idx) | 0);
      b$1.append__C__jl_StringBuilder(c);
      var temp$i = idx;
      var temp$next = ScalaJS.m.sjsr_RuntimeString$().indexOf__T__I__I__I(str$1, 92, idx);
      i = temp$i;
      next = temp$next;
      continue _loop
    } else {
      if ((i < len$1)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, len$1)
      };
      return b$1.content$1
    }
  }
});
ScalaJS.c.s_StringContext$.prototype.replace$1__p1__I__T__Z__I__T = (function(first, str$1, strict$1, len$1) {
  var b = new ScalaJS.c.jl_StringBuilder().init___();
  return this.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T(0, first, str$1, strict$1, len$1, b)
});
ScalaJS.d.s_StringContext$ = new ScalaJS.ClassTypeData({
  s_StringContext$: 0
}, false, "scala.StringContext$", {
  s_StringContext$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_StringContext$.prototype.$classData = ScalaJS.d.s_StringContext$;
ScalaJS.n.s_StringContext$ = (void 0);
ScalaJS.m.s_StringContext$ = (function() {
  if ((!ScalaJS.n.s_StringContext$)) {
    ScalaJS.n.s_StringContext$ = new ScalaJS.c.s_StringContext$().init___()
  };
  return ScalaJS.n.s_StringContext$
});
/** @constructor */
ScalaJS.c.s_math_Fractional$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Fractional$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Fractional$.prototype.constructor = ScalaJS.c.s_math_Fractional$;
/** @constructor */
ScalaJS.h.s_math_Fractional$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Fractional$.prototype = ScalaJS.c.s_math_Fractional$.prototype;
ScalaJS.d.s_math_Fractional$ = new ScalaJS.ClassTypeData({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Fractional$.prototype.$classData = ScalaJS.d.s_math_Fractional$;
ScalaJS.n.s_math_Fractional$ = (void 0);
ScalaJS.m.s_math_Fractional$ = (function() {
  if ((!ScalaJS.n.s_math_Fractional$)) {
    ScalaJS.n.s_math_Fractional$ = new ScalaJS.c.s_math_Fractional$().init___()
  };
  return ScalaJS.n.s_math_Fractional$
});
/** @constructor */
ScalaJS.c.s_math_Integral$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Integral$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Integral$.prototype.constructor = ScalaJS.c.s_math_Integral$;
/** @constructor */
ScalaJS.h.s_math_Integral$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Integral$.prototype = ScalaJS.c.s_math_Integral$.prototype;
ScalaJS.d.s_math_Integral$ = new ScalaJS.ClassTypeData({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Integral$.prototype.$classData = ScalaJS.d.s_math_Integral$;
ScalaJS.n.s_math_Integral$ = (void 0);
ScalaJS.m.s_math_Integral$ = (function() {
  if ((!ScalaJS.n.s_math_Integral$)) {
    ScalaJS.n.s_math_Integral$ = new ScalaJS.c.s_math_Integral$().init___()
  };
  return ScalaJS.n.s_math_Integral$
});
/** @constructor */
ScalaJS.c.s_math_Numeric$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Numeric$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Numeric$.prototype.constructor = ScalaJS.c.s_math_Numeric$;
/** @constructor */
ScalaJS.h.s_math_Numeric$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Numeric$.prototype = ScalaJS.c.s_math_Numeric$.prototype;
ScalaJS.d.s_math_Numeric$ = new ScalaJS.ClassTypeData({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Numeric$.prototype.$classData = ScalaJS.d.s_math_Numeric$;
ScalaJS.n.s_math_Numeric$ = (void 0);
ScalaJS.m.s_math_Numeric$ = (function() {
  if ((!ScalaJS.n.s_math_Numeric$)) {
    ScalaJS.n.s_math_Numeric$ = new ScalaJS.c.s_math_Numeric$().init___()
  };
  return ScalaJS.n.s_math_Numeric$
});
/** @constructor */
ScalaJS.c.s_reflect_ClassTag$ = (function() {
  ScalaJS.c.O.call(this);
  this.ObjectTYPE$1 = null;
  this.NothingTYPE$1 = null;
  this.NullTYPE$1 = null;
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyVal$1 = null;
  this.AnyRef$1 = null;
  this.Nothing$1 = null;
  this.Null$1 = null
});
ScalaJS.c.s_reflect_ClassTag$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_reflect_ClassTag$.prototype.constructor = ScalaJS.c.s_reflect_ClassTag$;
/** @constructor */
ScalaJS.h.s_reflect_ClassTag$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ClassTag$.prototype = ScalaJS.c.s_reflect_ClassTag$.prototype;
ScalaJS.c.s_reflect_ClassTag$.prototype.init___ = (function() {
  ScalaJS.n.s_reflect_ClassTag$ = this;
  this.ObjectTYPE$1 = ScalaJS.d.O.getClassOf();
  this.NothingTYPE$1 = ScalaJS.d.sr_Nothing$.getClassOf();
  this.NullTYPE$1 = ScalaJS.d.sr_Null$.getClassOf();
  this.Byte$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Byte$1;
  this.Short$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Short$1;
  this.Char$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Char$1;
  this.Int$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Int$1;
  this.Long$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Long$1;
  this.Float$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Float$1;
  this.Double$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Double$1;
  this.Boolean$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Boolean$1;
  this.Unit$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Unit$1;
  this.Any$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Any$1;
  this.Object$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Object$1;
  this.AnyVal$1 = ScalaJS.m.s_reflect_package$().Manifest$1.AnyVal$1;
  this.AnyRef$1 = ScalaJS.m.s_reflect_package$().Manifest$1.AnyRef$1;
  this.Nothing$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Nothing$1;
  this.Null$1 = ScalaJS.m.s_reflect_package$().Manifest$1.Null$1;
  return this
});
ScalaJS.c.s_reflect_ClassTag$.prototype.apply__jl_Class__s_reflect_ClassTag = (function(runtimeClass1) {
  if ((runtimeClass1 === ScalaJS.d.B.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Byte$1
  } else if ((runtimeClass1 === ScalaJS.d.S.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Short$1
  } else if ((runtimeClass1 === ScalaJS.d.C.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Char$1
  } else if ((runtimeClass1 === ScalaJS.d.I.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Int$1
  } else if ((runtimeClass1 === ScalaJS.d.J.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Long$1
  } else if ((runtimeClass1 === ScalaJS.d.F.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Float$1
  } else if ((runtimeClass1 === ScalaJS.d.D.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Double$1
  } else if ((runtimeClass1 === ScalaJS.d.Z.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Boolean$1
  } else if ((runtimeClass1 === ScalaJS.d.V.getClassOf())) {
    return ScalaJS.m.s_reflect_ClassTag$().Unit$1
  } else {
    var x$19 = this.ObjectTYPE$1;
    if ((x$19 === runtimeClass1)) {
      return ScalaJS.m.s_reflect_ClassTag$().Object$1
    } else {
      var x$21 = this.NothingTYPE$1;
      if ((x$21 === runtimeClass1)) {
        return ScalaJS.m.s_reflect_ClassTag$().Nothing$1
      } else {
        var x$23 = this.NullTYPE$1;
        if ((x$23 === runtimeClass1)) {
          return ScalaJS.m.s_reflect_ClassTag$().Null$1
        } else {
          return new ScalaJS.c.s_reflect_ClassTag$$anon$1().init___jl_Class(runtimeClass1)
        }
      }
    }
  }
});
ScalaJS.d.s_reflect_ClassTag$ = new ScalaJS.ClassTypeData({
  s_reflect_ClassTag$: 0
}, false, "scala.reflect.ClassTag$", {
  s_reflect_ClassTag$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_reflect_ClassTag$.prototype.$classData = ScalaJS.d.s_reflect_ClassTag$;
ScalaJS.n.s_reflect_ClassTag$ = (void 0);
ScalaJS.m.s_reflect_ClassTag$ = (function() {
  if ((!ScalaJS.n.s_reflect_ClassTag$)) {
    ScalaJS.n.s_reflect_ClassTag$ = new ScalaJS.c.s_reflect_ClassTag$().init___()
  };
  return ScalaJS.n.s_reflect_ClassTag$
});
/** @constructor */
ScalaJS.c.s_util_DynamicVariable$$anon$1 = (function() {
  ScalaJS.c.jl_InheritableThreadLocal.call(this);
  this.$$outer$3 = null
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype = new ScalaJS.h.jl_InheritableThreadLocal();
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.constructor = ScalaJS.c.s_util_DynamicVariable$$anon$1;
/** @constructor */
ScalaJS.h.s_util_DynamicVariable$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_DynamicVariable$$anon$1.prototype = ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype;
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.init___s_util_DynamicVariable = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$3 = $$outer
  };
  ScalaJS.c.jl_InheritableThreadLocal.prototype.init___.call(this);
  return this
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.initialValue__O = (function() {
  return this.$$outer$3.scala$util$DynamicVariable$$init$f
});
ScalaJS.d.s_util_DynamicVariable$$anon$1 = new ScalaJS.ClassTypeData({
  s_util_DynamicVariable$$anon$1: 0
}, false, "scala.util.DynamicVariable$$anon$1", {
  s_util_DynamicVariable$$anon$1: 1,
  jl_InheritableThreadLocal: 1,
  jl_ThreadLocal: 1,
  O: 1
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.$classData = ScalaJS.d.s_util_DynamicVariable$$anon$1;
/** @constructor */
ScalaJS.c.s_util_Left$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_Left$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_Left$.prototype.constructor = ScalaJS.c.s_util_Left$;
/** @constructor */
ScalaJS.h.s_util_Left$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Left$.prototype = ScalaJS.c.s_util_Left$.prototype;
ScalaJS.c.s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
ScalaJS.d.s_util_Left$ = new ScalaJS.ClassTypeData({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_util_Left$.prototype.$classData = ScalaJS.d.s_util_Left$;
ScalaJS.n.s_util_Left$ = (void 0);
ScalaJS.m.s_util_Left$ = (function() {
  if ((!ScalaJS.n.s_util_Left$)) {
    ScalaJS.n.s_util_Left$ = new ScalaJS.c.s_util_Left$().init___()
  };
  return ScalaJS.n.s_util_Left$
});
/** @constructor */
ScalaJS.c.s_util_Right$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_Right$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_Right$.prototype.constructor = ScalaJS.c.s_util_Right$;
/** @constructor */
ScalaJS.h.s_util_Right$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Right$.prototype = ScalaJS.c.s_util_Right$.prototype;
ScalaJS.c.s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
ScalaJS.d.s_util_Right$ = new ScalaJS.ClassTypeData({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_util_Right$.prototype.$classData = ScalaJS.d.s_util_Right$;
ScalaJS.n.s_util_Right$ = (void 0);
ScalaJS.m.s_util_Right$ = (function() {
  if ((!ScalaJS.n.s_util_Right$)) {
    ScalaJS.n.s_util_Right$ = new ScalaJS.c.s_util_Right$().init___()
  };
  return ScalaJS.n.s_util_Right$
});
/** @constructor */
ScalaJS.c.s_util_control_NoStackTrace$ = (function() {
  ScalaJS.c.O.call(this);
  this.$$undnoSuppression$1 = false
});
ScalaJS.c.s_util_control_NoStackTrace$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_control_NoStackTrace$.prototype.constructor = ScalaJS.c.s_util_control_NoStackTrace$;
/** @constructor */
ScalaJS.h.s_util_control_NoStackTrace$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_control_NoStackTrace$.prototype = ScalaJS.c.s_util_control_NoStackTrace$.prototype;
ScalaJS.c.s_util_control_NoStackTrace$.prototype.init___ = (function() {
  ScalaJS.n.s_util_control_NoStackTrace$ = this;
  this.$$undnoSuppression$1 = false;
  return this
});
ScalaJS.d.s_util_control_NoStackTrace$ = new ScalaJS.ClassTypeData({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_util_control_NoStackTrace$.prototype.$classData = ScalaJS.d.s_util_control_NoStackTrace$;
ScalaJS.n.s_util_control_NoStackTrace$ = (void 0);
ScalaJS.m.s_util_control_NoStackTrace$ = (function() {
  if ((!ScalaJS.n.s_util_control_NoStackTrace$)) {
    ScalaJS.n.s_util_control_NoStackTrace$ = new ScalaJS.c.s_util_control_NoStackTrace$().init___()
  };
  return ScalaJS.n.s_util_control_NoStackTrace$
});
/** @constructor */
ScalaJS.c.sc_IndexedSeq$$anon$1 = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
});
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype = new ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom();
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype.constructor = ScalaJS.c.sc_IndexedSeq$$anon$1;
/** @constructor */
ScalaJS.h.sc_IndexedSeq$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_IndexedSeq$$anon$1.prototype = ScalaJS.c.sc_IndexedSeq$$anon$1.prototype;
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype.init___ = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, ScalaJS.m.sc_IndexedSeq$());
  return this
});
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype.apply__scm_Builder = (function() {
  ScalaJS.m.sc_IndexedSeq$();
  ScalaJS.m.sci_IndexedSeq$();
  ScalaJS.m.sci_Vector$();
  return new ScalaJS.c.sci_VectorBuilder().init___()
});
ScalaJS.d.sc_IndexedSeq$$anon$1 = new ScalaJS.ClassTypeData({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype.$classData = ScalaJS.d.sc_IndexedSeq$$anon$1;
/** @constructor */
ScalaJS.c.scg_GenSeqFactory = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.scg_GenSeqFactory.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.scg_GenSeqFactory.prototype.constructor = ScalaJS.c.scg_GenSeqFactory;
/** @constructor */
ScalaJS.h.scg_GenSeqFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenSeqFactory.prototype = ScalaJS.c.scg_GenSeqFactory.prototype;
/** @constructor */
ScalaJS.c.scg_GenTraversableFactory$$anon$1 = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.call(this);
  this.$$outer$2 = null
});
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype = new ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom();
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype.constructor = ScalaJS.c.scg_GenTraversableFactory$$anon$1;
/** @constructor */
ScalaJS.h.scg_GenTraversableFactory$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenTraversableFactory$$anon$1.prototype = ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype;
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  return this.$$outer$2.newBuilder__scm_Builder()
});
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
  return this
});
ScalaJS.d.scg_GenTraversableFactory$$anon$1 = new ScalaJS.ClassTypeData({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype.$classData = ScalaJS.d.scg_GenTraversableFactory$$anon$1;
/** @constructor */
ScalaJS.c.scg_ImmutableMapFactory = (function() {
  ScalaJS.c.scg_MapFactory.call(this)
});
ScalaJS.c.scg_ImmutableMapFactory.prototype = new ScalaJS.h.scg_MapFactory();
ScalaJS.c.scg_ImmutableMapFactory.prototype.constructor = ScalaJS.c.scg_ImmutableMapFactory;
/** @constructor */
ScalaJS.h.scg_ImmutableMapFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_ImmutableMapFactory.prototype = ScalaJS.c.scg_ImmutableMapFactory.prototype;
/** @constructor */
ScalaJS.c.sci_$colon$colon$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_$colon$colon$.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_$colon$colon$.prototype.constructor = ScalaJS.c.sci_$colon$colon$;
/** @constructor */
ScalaJS.h.sci_$colon$colon$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_$colon$colon$.prototype = ScalaJS.c.sci_$colon$colon$.prototype;
ScalaJS.c.sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
ScalaJS.d.sci_$colon$colon$ = new ScalaJS.ClassTypeData({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_$colon$colon$.prototype.$classData = ScalaJS.d.sci_$colon$colon$;
ScalaJS.n.sci_$colon$colon$ = (void 0);
ScalaJS.m.sci_$colon$colon$ = (function() {
  if ((!ScalaJS.n.sci_$colon$colon$)) {
    ScalaJS.n.sci_$colon$colon$ = new ScalaJS.c.sci_$colon$colon$().init___()
  };
  return ScalaJS.n.sci_$colon$colon$
});
/** @constructor */
ScalaJS.c.sci_Range$ = (function() {
  ScalaJS.c.O.call(this);
  this.MAX$undPRINT$1 = 0
});
ScalaJS.c.sci_Range$.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_Range$.prototype.constructor = ScalaJS.c.sci_Range$;
/** @constructor */
ScalaJS.h.sci_Range$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Range$.prototype = ScalaJS.c.sci_Range$.prototype;
ScalaJS.c.sci_Range$.prototype.init___ = (function() {
  ScalaJS.n.sci_Range$ = this;
  this.MAX$undPRINT$1 = 512;
  return this
});
ScalaJS.d.sci_Range$ = new ScalaJS.ClassTypeData({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Range$.prototype.$classData = ScalaJS.d.sci_Range$;
ScalaJS.n.sci_Range$ = (void 0);
ScalaJS.m.sci_Range$ = (function() {
  if ((!ScalaJS.n.sci_Range$)) {
    ScalaJS.n.sci_Range$ = new ScalaJS.c.sci_Range$().init___()
  };
  return ScalaJS.n.sci_Range$
});
/** @constructor */
ScalaJS.c.sci_Stream$StreamCanBuildFrom = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
});
ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype = new ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom();
ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype.constructor = ScalaJS.c.sci_Stream$StreamCanBuildFrom;
/** @constructor */
ScalaJS.h.sci_Stream$StreamCanBuildFrom = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$StreamCanBuildFrom.prototype = ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype;
ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype.init___ = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, ScalaJS.m.sci_Stream$());
  return this
});
ScalaJS.d.sci_Stream$StreamCanBuildFrom = new ScalaJS.ClassTypeData({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype.$classData = ScalaJS.d.sci_Stream$StreamCanBuildFrom;
/** @constructor */
ScalaJS.c.scm_StringBuilder$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.scm_StringBuilder$.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_StringBuilder$.prototype.constructor = ScalaJS.c.scm_StringBuilder$;
/** @constructor */
ScalaJS.h.scm_StringBuilder$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_StringBuilder$.prototype = ScalaJS.c.scm_StringBuilder$.prototype;
ScalaJS.d.scm_StringBuilder$ = new ScalaJS.ClassTypeData({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_StringBuilder$.prototype.$classData = ScalaJS.d.scm_StringBuilder$;
ScalaJS.n.scm_StringBuilder$ = (void 0);
ScalaJS.m.scm_StringBuilder$ = (function() {
  if ((!ScalaJS.n.scm_StringBuilder$)) {
    ScalaJS.n.scm_StringBuilder$ = new ScalaJS.c.scm_StringBuilder$().init___()
  };
  return ScalaJS.n.scm_StringBuilder$
});
/** @constructor */
ScalaJS.c.sjsr_AnonFunction0 = (function() {
  ScalaJS.c.sr_AbstractFunction0.call(this);
  this.f$2 = null
});
ScalaJS.c.sjsr_AnonFunction0.prototype = new ScalaJS.h.sr_AbstractFunction0();
ScalaJS.c.sjsr_AnonFunction0.prototype.constructor = ScalaJS.c.sjsr_AnonFunction0;
/** @constructor */
ScalaJS.h.sjsr_AnonFunction0 = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_AnonFunction0.prototype = ScalaJS.c.sjsr_AnonFunction0.prototype;
ScalaJS.c.sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
ScalaJS.c.sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
ScalaJS.d.sjsr_AnonFunction0 = new ScalaJS.ClassTypeData({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
ScalaJS.c.sjsr_AnonFunction0.prototype.$classData = ScalaJS.d.sjsr_AnonFunction0;
/** @constructor */
ScalaJS.c.sjsr_AnonFunction1 = (function() {
  ScalaJS.c.sr_AbstractFunction1.call(this);
  this.f$2 = null
});
ScalaJS.c.sjsr_AnonFunction1.prototype = new ScalaJS.h.sr_AbstractFunction1();
ScalaJS.c.sjsr_AnonFunction1.prototype.constructor = ScalaJS.c.sjsr_AnonFunction1;
/** @constructor */
ScalaJS.h.sjsr_AnonFunction1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_AnonFunction1.prototype = ScalaJS.c.sjsr_AnonFunction1.prototype;
ScalaJS.c.sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
ScalaJS.c.sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
ScalaJS.d.sjsr_AnonFunction1 = new ScalaJS.ClassTypeData({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
ScalaJS.c.sjsr_AnonFunction1.prototype.$classData = ScalaJS.d.sjsr_AnonFunction1;
/** @constructor */
ScalaJS.c.sjsr_AnonFunction2 = (function() {
  ScalaJS.c.sr_AbstractFunction2.call(this);
  this.f$2 = null
});
ScalaJS.c.sjsr_AnonFunction2.prototype = new ScalaJS.h.sr_AbstractFunction2();
ScalaJS.c.sjsr_AnonFunction2.prototype.constructor = ScalaJS.c.sjsr_AnonFunction2;
/** @constructor */
ScalaJS.h.sjsr_AnonFunction2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_AnonFunction2.prototype = ScalaJS.c.sjsr_AnonFunction2.prototype;
ScalaJS.c.sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
ScalaJS.c.sjsr_AnonFunction2.prototype.apply__O__O__O = (function(arg1, arg2) {
  return (0, this.f$2)(arg1, arg2)
});
ScalaJS.d.sjsr_AnonFunction2 = new ScalaJS.ClassTypeData({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
ScalaJS.c.sjsr_AnonFunction2.prototype.$classData = ScalaJS.d.sjsr_AnonFunction2;
/** @constructor */
ScalaJS.c.sjsr_RuntimeLong = (function() {
  ScalaJS.c.jl_Number.call(this);
  this.l$2 = 0;
  this.m$2 = 0;
  this.h$2 = 0
});
ScalaJS.c.sjsr_RuntimeLong.prototype = new ScalaJS.h.jl_Number();
ScalaJS.c.sjsr_RuntimeLong.prototype.constructor = ScalaJS.c.sjsr_RuntimeLong;
/** @constructor */
ScalaJS.h.sjsr_RuntimeLong = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeLong.prototype = ScalaJS.c.sjsr_RuntimeLong.prototype;
ScalaJS.c.sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return ScalaJS.uJ(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.powerOfTwo__p2__I = (function() {
  return (((((this.h$2 === 0) && (this.m$2 === 0)) && (this.l$2 !== 0)) && ((this.l$2 & (((-1) + this.l$2) | 0)) === 0)) ? ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.l$2) : (((((this.h$2 === 0) && (this.m$2 !== 0)) && (this.l$2 === 0)) && ((this.m$2 & (((-1) + this.m$2) | 0)) === 0)) ? ((22 + ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.m$2)) | 0) : (((((this.h$2 !== 0) && (this.m$2 === 0)) && (this.l$2 === 0)) && ((this.h$2 & (((-1) + this.h$2) | 0)) === 0)) ? ((44 + ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.h$2)) | 0) : (-1))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 | y.l$2), (this.m$2 | y.m$2), (this.h$2 | y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(y) {
  return (((524288 & this.h$2) === 0) ? (((((524288 & y.h$2) !== 0) || (this.h$2 > y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 > y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 >= y.l$2))) : (!(((((524288 & y.h$2) === 0) || (this.h$2 < y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 < y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 < y.l$2)))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return this.toByte__B()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toShort__S = (function() {
  return ((this.toInt__I() << 16) >> 16)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.sjsr_RuntimeLong(that)) {
    var x2 = ScalaJS.as.sjsr_RuntimeLong(that);
    return this.equals__sjsr_RuntimeLong__Z(x2)
  } else {
    return false
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(y) {
  return y.$$greater__sjsr_RuntimeLong__Z(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  var _1 = (8191 & this.l$2);
  var _2 = ((this.l$2 >> 13) | ((15 & this.m$2) << 9));
  var _3 = (8191 & (this.m$2 >> 4));
  var _4 = ((this.m$2 >> 17) | ((255 & this.h$2) << 5));
  var _5 = ((1048320 & this.h$2) >> 8);
  matchEnd3: {
    var x$1;
    var x$1_$_$$und1$1 = _1;
    var x$1_$_$$und2$1 = _2;
    var x$1_$_$$und3$1 = _3;
    var x$1_$_$$und4$1 = _4;
    var x$1_$_$$und5$1 = _5;
    break matchEnd3
  };
  var a0$2 = ScalaJS.uI(x$1_$_$$und1$1);
  var a1$2 = ScalaJS.uI(x$1_$_$$und2$1);
  var a2$2 = ScalaJS.uI(x$1_$_$$und3$1);
  var a3$2 = ScalaJS.uI(x$1_$_$$und4$1);
  var a4$2 = ScalaJS.uI(x$1_$_$$und5$1);
  var _1$1 = (8191 & y.l$2);
  var _2$1 = ((y.l$2 >> 13) | ((15 & y.m$2) << 9));
  var _3$1 = (8191 & (y.m$2 >> 4));
  var _4$1 = ((y.m$2 >> 17) | ((255 & y.h$2) << 5));
  var _5$1 = ((1048320 & y.h$2) >> 8);
  matchEnd3$2: {
    var x$2;
    var x$2_$_$$und1$1 = _1$1;
    var x$2_$_$$und2$1 = _2$1;
    var x$2_$_$$und3$1 = _3$1;
    var x$2_$_$$und4$1 = _4$1;
    var x$2_$_$$und5$1 = _5$1;
    break matchEnd3$2
  };
  var b0$2 = ScalaJS.uI(x$2_$_$$und1$1);
  var b1$2 = ScalaJS.uI(x$2_$_$$und2$1);
  var b2$2 = ScalaJS.uI(x$2_$_$$und3$1);
  var b3$2 = ScalaJS.uI(x$2_$_$$und4$1);
  var b4$2 = ScalaJS.uI(x$2_$_$$und5$1);
  var p0 = ScalaJS.imul(a0$2, b0$2);
  var p1 = ScalaJS.imul(a1$2, b0$2);
  var p2 = ScalaJS.imul(a2$2, b0$2);
  var p3 = ScalaJS.imul(a3$2, b0$2);
  var p4 = ScalaJS.imul(a4$2, b0$2);
  if ((b1$2 !== 0)) {
    p1 = ((p1 + ScalaJS.imul(a0$2, b1$2)) | 0);
    p2 = ((p2 + ScalaJS.imul(a1$2, b1$2)) | 0);
    p3 = ((p3 + ScalaJS.imul(a2$2, b1$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a3$2, b1$2)) | 0)
  };
  if ((b2$2 !== 0)) {
    p2 = ((p2 + ScalaJS.imul(a0$2, b2$2)) | 0);
    p3 = ((p3 + ScalaJS.imul(a1$2, b2$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a2$2, b2$2)) | 0)
  };
  if ((b3$2 !== 0)) {
    p3 = ((p3 + ScalaJS.imul(a0$2, b3$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a1$2, b3$2)) | 0)
  };
  if ((b4$2 !== 0)) {
    p4 = ((p4 + ScalaJS.imul(a0$2, b4$2)) | 0)
  };
  var c00 = (4194303 & p0);
  var c01 = ((511 & p1) << 13);
  var c0 = ((c00 + c01) | 0);
  var c10 = (p0 >> 22);
  var c11 = (p1 >> 9);
  var c12 = ((262143 & p2) << 4);
  var c13 = ((31 & p3) << 17);
  var c1 = ((((((c10 + c11) | 0) + c12) | 0) + c13) | 0);
  var c22 = (p2 >> 18);
  var c23 = (p3 >> 5);
  var c24 = ((4095 & p4) << 8);
  var c2 = ((((c22 + c23) | 0) + c24) | 0);
  var c1n = ((c1 + (c0 >> 22)) | 0);
  var h = ((c2 + (c1n >> 22)) | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & c0), (4194303 & c1n), (1048575 & h))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  this.l$2 = l;
  this.m$2 = m;
  this.h$2 = h;
  return this
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return ScalaJS.as.sjsr_RuntimeLong(this.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(y)[1])
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toString__T = (function() {
  if ((((this.l$2 === 0) && (this.m$2 === 0)) && (this.h$2 === 0))) {
    return "0"
  } else if (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1)) {
    return "-9223372036854775808"
  } else if (((524288 & this.h$2) !== 0)) {
    return ("-" + this.unary$und$minus__sjsr_RuntimeLong().toString__T())
  } else {
    var tenPow9 = ScalaJS.m.sjsr_RuntimeLong$().TenPow9$1;
    var v = this;
    var acc = "";
    _toString0: while (true) {
      var this$1 = v;
      if ((((this$1.l$2 === 0) && (this$1.m$2 === 0)) && (this$1.h$2 === 0))) {
        return acc
      } else {
        var quotRem = v.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(tenPow9);
        var quot = ScalaJS.as.sjsr_RuntimeLong(quotRem[0]);
        var rem = ScalaJS.as.sjsr_RuntimeLong(quotRem[1]);
        var this$2 = rem.toInt__I();
        var digits = ("" + this$2);
        if ((((quot.l$2 === 0) && (quot.m$2 === 0)) && (quot.h$2 === 0))) {
          var zeroPrefix = ""
        } else {
          var beginIndex = ScalaJS.uI(digits["length"]);
          var zeroPrefix = ScalaJS.as.T("000000000"["substring"](beginIndex))
        };
        var temp$acc = ((zeroPrefix + digits) + acc);
        v = quot;
        acc = temp$acc;
        continue _toString0
      }
    }
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(y) {
  return y.$$greater$eq__sjsr_RuntimeLong__Z(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = ScalaJS.as.sjsr_RuntimeLong(x$1);
  return this.compareTo__sjsr_RuntimeLong__I(ScalaJS.as.sjsr_RuntimeLong(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.scala$scalajs$runtime$RuntimeLong$$setBit__I__sjsr_RuntimeLong = (function(bit) {
  return ((bit < 22) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 | (1 << bit)), this.m$2, this.h$2) : ((bit < 44) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(this.l$2, (this.m$2 | (1 << (((-22) + bit) | 0))), this.h$2) : new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(this.l$2, this.m$2, (this.h$2 | (1 << (((-44) + bit) | 0))))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array = (function(y) {
  if ((((y.l$2 === 0) && (y.m$2 === 0)) && (y.h$2 === 0))) {
    throw new ScalaJS.c.jl_ArithmeticException().init___T("/ by zero")
  } else if ((((this.l$2 === 0) && (this.m$2 === 0)) && (this.h$2 === 0))) {
    return [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, ScalaJS.m.sjsr_RuntimeLong$().Zero$1]
  } else if (y.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1)) {
    return (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1) ? [ScalaJS.m.sjsr_RuntimeLong$().One$1, ScalaJS.m.sjsr_RuntimeLong$().Zero$1] : [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, this])
  } else {
    var xNegative = ((524288 & this.h$2) !== 0);
    var yNegative = ((524288 & y.h$2) !== 0);
    var xMinValue = this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1);
    var pow = y.powerOfTwo__p2__I();
    if ((pow >= 0)) {
      if (xMinValue) {
        var z = this.$$greater$greater__I__sjsr_RuntimeLong(pow);
        return [(yNegative ? z.unary$und$minus__sjsr_RuntimeLong() : z), ScalaJS.m.sjsr_RuntimeLong$().Zero$1]
      } else {
        var absX = (((524288 & this.h$2) !== 0) ? this.unary$und$minus__sjsr_RuntimeLong() : this);
        var absZ = absX.$$greater$greater__I__sjsr_RuntimeLong(pow);
        var z$2 = ((xNegative !== yNegative) ? absZ.unary$und$minus__sjsr_RuntimeLong() : absZ);
        var remAbs = ((pow <= 22) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((absX.l$2 & (((-1) + (1 << pow)) | 0)), 0, 0) : ((pow <= 44) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(absX.l$2, (absX.m$2 & (((-1) + (1 << (((-22) + pow) | 0))) | 0)), 0) : new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(absX.l$2, absX.m$2, (absX.h$2 & (((-1) + (1 << (((-44) + pow) | 0))) | 0)))));
        var rem = (xNegative ? remAbs.unary$und$minus__sjsr_RuntimeLong() : remAbs);
        return [z$2, rem]
      }
    } else {
      var absY = (((524288 & y.h$2) !== 0) ? y.unary$und$minus__sjsr_RuntimeLong() : y);
      if (xMinValue) {
        var newX = ScalaJS.m.sjsr_RuntimeLong$().MaxValue$1
      } else {
        var absX$2 = (((524288 & this.h$2) !== 0) ? this.unary$und$minus__sjsr_RuntimeLong() : this);
        if (absY.$$greater__sjsr_RuntimeLong__Z(absX$2)) {
          var newX;
          return [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, this]
        } else {
          var newX = absX$2
        }
      };
      var shift = ((absY.numberOfLeadingZeros__I() - newX.numberOfLeadingZeros__I()) | 0);
      var yShift = absY.$$less$less__I__sjsr_RuntimeLong(shift);
      var shift$1 = shift;
      var yShift$1 = yShift;
      var curX = newX;
      var quot = ScalaJS.m.sjsr_RuntimeLong$().Zero$1;
      x: {
        var x1;
        _divide0: while (true) {
          if ((shift$1 < 0)) {
            var jsx$1 = true
          } else {
            var this$1 = curX;
            var jsx$1 = (((this$1.l$2 === 0) && (this$1.m$2 === 0)) && (this$1.h$2 === 0))
          };
          if (jsx$1) {
            var _1 = quot;
            var _2 = curX;
            var x1_$_$$und1$f = _1;
            var x1_$_$$und2$f = _2;
            break x
          } else {
            var this$2 = curX;
            var y$1 = yShift$1;
            var newX$1 = this$2.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y$1.unary$und$minus__sjsr_RuntimeLong());
            if (((524288 & newX$1.h$2) === 0)) {
              var temp$shift = (((-1) + shift$1) | 0);
              var temp$yShift = yShift$1.$$greater$greater__I__sjsr_RuntimeLong(1);
              var temp$quot = quot.scala$scalajs$runtime$RuntimeLong$$setBit__I__sjsr_RuntimeLong(shift$1);
              shift$1 = temp$shift;
              yShift$1 = temp$yShift;
              curX = newX$1;
              quot = temp$quot;
              continue _divide0
            } else {
              var temp$shift$2 = (((-1) + shift$1) | 0);
              var temp$yShift$2 = yShift$1.$$greater$greater__I__sjsr_RuntimeLong(1);
              shift$1 = temp$shift$2;
              yShift$1 = temp$yShift$2;
              continue _divide0
            }
          }
        }
      };
      var absQuot = ScalaJS.as.sjsr_RuntimeLong(x1_$_$$und1$f);
      var absRem = ScalaJS.as.sjsr_RuntimeLong(x1_$_$$und2$f);
      var x$3_$_$$und1$f = absQuot;
      var x$3_$_$$und2$f = absRem;
      var absQuot$2 = ScalaJS.as.sjsr_RuntimeLong(x$3_$_$$und1$f);
      var absRem$2 = ScalaJS.as.sjsr_RuntimeLong(x$3_$_$$und2$f);
      var quot$1 = ((xNegative !== yNegative) ? absQuot$2.unary$und$minus__sjsr_RuntimeLong() : absQuot$2);
      if ((xNegative && xMinValue)) {
        var this$3 = absRem$2.unary$und$minus__sjsr_RuntimeLong();
        var y$2 = ScalaJS.m.sjsr_RuntimeLong$().One$1;
        var rem$1 = this$3.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y$2.unary$und$minus__sjsr_RuntimeLong())
      } else {
        var rem$1 = (xNegative ? absRem$2.unary$und$minus__sjsr_RuntimeLong() : absRem$2)
      };
      return [quot$1, rem$1]
    }
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 & y.l$2), (this.m$2 & y.m$2), (this.h$2 & y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = ((this.l$2 >> n) | (this.m$2 << remBits));
    var m = ((this.m$2 >> n) | (this.h$2 << remBits));
    var h = ((this.h$2 >>> n) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var l$1 = ((this.m$2 >> shfBits) | (this.h$2 << remBits$2));
    var m$1 = ((this.h$2 >>> shfBits) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$1), (4194303 & m$1), 0)
  } else {
    var l$2 = ((this.h$2 >>> (((-44) + n) | 0)) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$2), 0, 0)
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__sjsr_RuntimeLong__I = (function(that) {
  return (this.equals__sjsr_RuntimeLong__Z(that) ? 0 : (this.$$greater__sjsr_RuntimeLong__Z(that) ? 1 : (-1)))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(y) {
  return (((524288 & this.h$2) === 0) ? (((((524288 & y.h$2) !== 0) || (this.h$2 > y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 > y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 > y.l$2))) : (!(((((524288 & y.h$2) === 0) || (this.h$2 < y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 < y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 <= y.l$2)))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = (this.l$2 << n);
    var m = ((this.m$2 << n) | (this.l$2 >> remBits));
    var h = ((this.h$2 << n) | (this.m$2 >> remBits));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var m$1 = (this.l$2 << shfBits);
    var h$1 = ((this.m$2 << shfBits) | (this.l$2 >> remBits$2));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, (4194303 & m$1), (1048575 & h$1))
  } else {
    var h$2 = (this.l$2 << (((-44) + n) | 0));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, (1048575 & h$2))
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return (this.l$2 | (this.m$2 << 22))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.init___I = (function(value) {
  ScalaJS.c.sjsr_RuntimeLong.prototype.init___I__I__I.call(this, (4194303 & value), (4194303 & (value >> 22)), ((value < 0) ? 1048575 : 0));
  return this
});
ScalaJS.c.sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(that) {
  return (!this.equals__sjsr_RuntimeLong__Z(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var neg0 = (4194303 & ((1 + (~this.l$2)) | 0));
  var neg1 = (4194303 & (((~this.m$2) + ((neg0 === 0) ? 1 : 0)) | 0));
  var neg2 = (1048575 & (((~this.h$2) + (((neg0 === 0) && (neg1 === 0)) ? 1 : 0)) | 0));
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(neg0, neg1, neg2)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return this.toShort__S()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  var sum0 = ((this.l$2 + y.l$2) | 0);
  var sum1 = ((((this.m$2 + y.m$2) | 0) + (sum0 >> 22)) | 0);
  var sum2 = ((((this.h$2 + y.h$2) | 0) + (sum1 >> 22)) | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & sum0), (4194303 & sum1), (1048575 & sum2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  var negative = ((524288 & this.h$2) !== 0);
  var xh = (negative ? ((-1048576) | this.h$2) : this.h$2);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = ((this.l$2 >> n) | (this.m$2 << remBits));
    var m = ((this.m$2 >> n) | (xh << remBits));
    var h = (xh >> n);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var l$1 = ((this.m$2 >> shfBits) | (xh << remBits$2));
    var m$1 = (xh >> shfBits);
    var h$1 = (negative ? 1048575 : 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$1), (4194303 & m$1), (1048575 & h$1))
  } else {
    var l$2 = (xh >> (((-44) + n) | 0));
    var m$2 = (negative ? 4194303 : 0);
    var h$2 = (negative ? 1048575 : 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$2), (4194303 & m$2), (1048575 & h$2))
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1) ? (-9.223372036854776E18) : (((524288 & this.h$2) !== 0) ? (-this.unary$und$minus__sjsr_RuntimeLong().toDouble__D()) : ((this.l$2 + (4194304.0 * this.m$2)) + (1.7592186044416E13 * this.h$2))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return ScalaJS.as.sjsr_RuntimeLong(this.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(y)[0])
});
ScalaJS.c.sjsr_RuntimeLong.prototype.numberOfLeadingZeros__I = (function() {
  return ((this.h$2 !== 0) ? (((-12) + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.h$2)) | 0) : ((this.m$2 !== 0) ? ((10 + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.m$2)) | 0) : ((32 + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.l$2)) | 0)))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toByte__B = (function() {
  return ((this.toInt__I() << 24) >> 24)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return this.toDouble__D()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return this.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(this.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.toInt__I()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  var l = (~this.l$2);
  var m = (~this.m$2);
  var h = (~this.h$2);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return this.compareTo__sjsr_RuntimeLong__I(ScalaJS.as.sjsr_RuntimeLong(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return this.toFloat__F()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return this.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y.unary$und$minus__sjsr_RuntimeLong())
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toFloat__F = (function() {
  return ScalaJS.fround(this.toDouble__D())
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 ^ y.l$2), (this.m$2 ^ y.m$2), (this.h$2 ^ y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(y) {
  return (((this.l$2 === y.l$2) && (this.m$2 === y.m$2)) && (this.h$2 === y.h$2))
});
ScalaJS.is.sjsr_RuntimeLong = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
});
ScalaJS.as.sjsr_RuntimeLong = (function(obj) {
  return ((ScalaJS.is.sjsr_RuntimeLong(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
});
ScalaJS.isArrayOf.sjsr_RuntimeLong = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
});
ScalaJS.asArrayOf.sjsr_RuntimeLong = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
});
ScalaJS.d.sjsr_RuntimeLong = new ScalaJS.ClassTypeData({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$classData = ScalaJS.d.sjsr_RuntimeLong;
/** @constructor */
ScalaJS.c.sjsr_RuntimeLong$ = (function() {
  ScalaJS.c.O.call(this);
  this.BITS$1 = 0;
  this.BITS01$1 = 0;
  this.BITS2$1 = 0;
  this.MASK$1 = 0;
  this.MASK$und2$1 = 0;
  this.SIGN$undBIT$1 = 0;
  this.SIGN$undBIT$undVALUE$1 = 0;
  this.TWO$undPWR$und15$undDBL$1 = 0.0;
  this.TWO$undPWR$und16$undDBL$1 = 0.0;
  this.TWO$undPWR$und22$undDBL$1 = 0.0;
  this.TWO$undPWR$und31$undDBL$1 = 0.0;
  this.TWO$undPWR$und32$undDBL$1 = 0.0;
  this.TWO$undPWR$und44$undDBL$1 = 0.0;
  this.TWO$undPWR$und63$undDBL$1 = 0.0;
  this.Zero$1 = null;
  this.One$1 = null;
  this.MinusOne$1 = null;
  this.MinValue$1 = null;
  this.MaxValue$1 = null;
  this.TenPow9$1 = null
});
ScalaJS.c.sjsr_RuntimeLong$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_RuntimeLong$.prototype.constructor = ScalaJS.c.sjsr_RuntimeLong$;
/** @constructor */
ScalaJS.h.sjsr_RuntimeLong$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeLong$.prototype = ScalaJS.c.sjsr_RuntimeLong$.prototype;
ScalaJS.c.sjsr_RuntimeLong$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_RuntimeLong$ = this;
  this.Zero$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, 0);
  this.One$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(1, 0, 0);
  this.MinusOne$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 4194303, 1048575);
  this.MinValue$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, 524288);
  this.MaxValue$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 4194303, 524287);
  this.TenPow9$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(1755648, 238, 0);
  return this
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  if ((value !== value)) {
    return this.Zero$1
  } else if ((value < (-9.223372036854776E18))) {
    return this.MinValue$1
  } else if ((value >= 9.223372036854776E18)) {
    return this.MaxValue$1
  } else if ((value < 0)) {
    return this.fromDouble__D__sjsr_RuntimeLong((-value)).unary$und$minus__sjsr_RuntimeLong()
  } else {
    var acc = value;
    var a2 = ((acc >= 1.7592186044416E13) ? ((acc / 1.7592186044416E13) | 0) : 0);
    acc = (acc - (1.7592186044416E13 * a2));
    var a1 = ((acc >= 4194304.0) ? ((acc / 4194304.0) | 0) : 0);
    acc = (acc - (4194304.0 * a1));
    var a0 = (acc | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(a0, a1, a2)
  }
});
ScalaJS.d.sjsr_RuntimeLong$ = new ScalaJS.ClassTypeData({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.$classData = ScalaJS.d.sjsr_RuntimeLong$;
ScalaJS.n.sjsr_RuntimeLong$ = (void 0);
ScalaJS.m.sjsr_RuntimeLong$ = (function() {
  if ((!ScalaJS.n.sjsr_RuntimeLong$)) {
    ScalaJS.n.sjsr_RuntimeLong$ = new ScalaJS.c.sjsr_RuntimeLong$().init___()
  };
  return ScalaJS.n.sjsr_RuntimeLong$
});
ScalaJS.d.sr_Nothing$ = new ScalaJS.ClassTypeData({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_CohereWithFlock();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Hunt = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Hunt.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt.prototype.flock__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__sc_Seq = (function(m, ms) {
  return this.nearest__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__sc_Seq(m, ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flocking.prototype.flock__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__sc_Seq.call(this, m, ms))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt.prototype.nearest__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__sc_Seq = (function(m, ms) {
  var f$1 = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(m$5) {
    return (function(f$2) {
      var f = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motivated(f$2);
      return (-f.pos$1.to__Lcom_benjaminrosenbaum_jovian_Position__Lcom_benjaminrosenbaum_jovian_Vector(m$5).manhattanDist__D())
    })
  })(m));
  var ord = ScalaJS.m.s_math_Ordering$Double$();
  return ScalaJS.as.sc_Seq(ScalaJS.as.sc_IterableLike(ScalaJS.s.sc_SeqLike$class__sortBy__sc_SeqLike__F1__s_math_Ordering__O(ms, f$1, ord)).take__I__O(1))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt.prototype.init___D__D__sc_Seq = (function(range, force, kinds) {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype.init___D__D__sc_Seq__s_Option.call(this, range, force, kinds, ScalaJS.m.s_None$());
  return this
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Hunt = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Hunt: 0
}, false, "com.benjaminrosenbaum.jovian.Hunt", {
  Lcom_benjaminrosenbaum_jovian_Hunt: 1,
  Lcom_benjaminrosenbaum_jovian_CohereWithFlock: 1,
  Lcom_benjaminrosenbaum_jovian_Flocking: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Hunt;
/** @constructor */
ScalaJS.c.Ljava_io_FilterOutputStream = (function() {
  ScalaJS.c.Ljava_io_OutputStream.call(this);
  this.out$2 = null
});
ScalaJS.c.Ljava_io_FilterOutputStream.prototype = new ScalaJS.h.Ljava_io_OutputStream();
ScalaJS.c.Ljava_io_FilterOutputStream.prototype.constructor = ScalaJS.c.Ljava_io_FilterOutputStream;
/** @constructor */
ScalaJS.h.Ljava_io_FilterOutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_FilterOutputStream.prototype = ScalaJS.c.Ljava_io_FilterOutputStream.prototype;
ScalaJS.c.Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  this.out$2 = out;
  return this
});
ScalaJS.is.T = (function(obj) {
  return ((typeof obj) === "string")
});
ScalaJS.as.T = (function(obj) {
  return ((ScalaJS.is.T(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.String"))
});
ScalaJS.isArrayOf.T = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
});
ScalaJS.asArrayOf.T = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.T(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.String;", depth))
});
ScalaJS.d.T = new ScalaJS.ClassTypeData({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), ScalaJS.is.T);
/** @constructor */
ScalaJS.c.jl_AssertionError = (function() {
  ScalaJS.c.jl_Error.call(this)
});
ScalaJS.c.jl_AssertionError.prototype = new ScalaJS.h.jl_Error();
ScalaJS.c.jl_AssertionError.prototype.constructor = ScalaJS.c.jl_AssertionError;
/** @constructor */
ScalaJS.h.jl_AssertionError = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_AssertionError.prototype = ScalaJS.c.jl_AssertionError.prototype;
ScalaJS.c.jl_AssertionError.prototype.init___O = (function(o) {
  ScalaJS.c.jl_AssertionError.prototype.init___T.call(this, ScalaJS.objectToString(o));
  return this
});
ScalaJS.d.jl_AssertionError = new ScalaJS.ClassTypeData({
  jl_AssertionError: 0
}, false, "java.lang.AssertionError", {
  jl_AssertionError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_AssertionError.prototype.$classData = ScalaJS.d.jl_AssertionError;
/** @constructor */
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function() {
  ScalaJS.c.Ljava_io_OutputStream.call(this)
});
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = new ScalaJS.h.Ljava_io_OutputStream();
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.constructor = ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
ScalaJS.h.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype;
ScalaJS.d.jl_JSConsoleBasedPrintStream$DummyOutputStream = new ScalaJS.ClassTypeData({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1
});
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = ScalaJS.d.jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
ScalaJS.c.jl_RuntimeException = (function() {
  ScalaJS.c.jl_Exception.call(this)
});
ScalaJS.c.jl_RuntimeException.prototype = new ScalaJS.h.jl_Exception();
ScalaJS.c.jl_RuntimeException.prototype.constructor = ScalaJS.c.jl_RuntimeException;
/** @constructor */
ScalaJS.h.jl_RuntimeException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_RuntimeException.prototype = ScalaJS.c.jl_RuntimeException.prototype;
ScalaJS.c.jl_RuntimeException.prototype.init___ = (function() {
  ScalaJS.c.jl_RuntimeException.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
ScalaJS.c.jl_RuntimeException.prototype.init___T = (function(s) {
  ScalaJS.c.jl_RuntimeException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
/** @constructor */
ScalaJS.c.jl_StringBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.content$1 = null
});
ScalaJS.c.jl_StringBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_StringBuilder.prototype.constructor = ScalaJS.c.jl_StringBuilder;
/** @constructor */
ScalaJS.h.jl_StringBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_StringBuilder.prototype = ScalaJS.c.jl_StringBuilder.prototype;
ScalaJS.c.jl_StringBuilder.prototype.init___ = (function() {
  ScalaJS.c.jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.append__T__jl_StringBuilder = (function(s) {
  this.content$1 = (("" + this.content$1) + ((s === null) ? "null" : s));
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var thiz = this.content$1;
  return ScalaJS.as.T(thiz["substring"](start, end))
});
ScalaJS.c.jl_StringBuilder.prototype.toString__T = (function() {
  return this.content$1
});
ScalaJS.c.jl_StringBuilder.prototype.init___jl_CharSequence = (function(csq) {
  ScalaJS.c.jl_StringBuilder.prototype.init___T.call(this, ScalaJS.objectToString(csq));
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.append__O__jl_StringBuilder = (function(obj) {
  return ((obj === null) ? this.append__T__jl_StringBuilder(null) : this.append__T__jl_StringBuilder(ScalaJS.objectToString(obj)))
});
ScalaJS.c.jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  ScalaJS.c.jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.append__jl_CharSequence__I__I__jl_StringBuilder = (function(csq, start, end) {
  return ((csq === null) ? this.append__jl_CharSequence__I__I__jl_StringBuilder("null", start, end) : this.append__T__jl_StringBuilder(ScalaJS.objectToString(ScalaJS.charSequenceSubSequence(csq, start, end))))
});
ScalaJS.c.jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  return this.append__T__jl_StringBuilder(ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c)))
});
ScalaJS.c.jl_StringBuilder.prototype.init___T = (function(content) {
  this.content$1 = content;
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.reverse__jl_StringBuilder = (function() {
  var original = this.content$1;
  var result = "";
  var i = 0;
  while ((i < ScalaJS.uI(original["length"]))) {
    var index = i;
    var c = (65535 & ScalaJS.uI(original["charCodeAt"](index)));
    if ((((64512 & c) === 55296) && (((1 + i) | 0) < ScalaJS.uI(original["length"])))) {
      var index$1 = ((1 + i) | 0);
      var c2 = (65535 & ScalaJS.uI(original["charCodeAt"](index$1)));
      if (((64512 & c2) === 56320)) {
        result = ((("" + ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c))) + ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c2))) + result);
        i = ((2 + i) | 0)
      } else {
        result = (("" + ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c))) + result);
        i = ((1 + i) | 0)
      }
    } else {
      result = (("" + ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c))) + result);
      i = ((1 + i) | 0)
    }
  };
  this.content$1 = result;
  return this
});
ScalaJS.d.jl_StringBuilder = new ScalaJS.ClassTypeData({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_StringBuilder.prototype.$classData = ScalaJS.d.jl_StringBuilder;
/** @constructor */
ScalaJS.c.s_Array$ = (function() {
  ScalaJS.c.s_FallbackArrayBuilding.call(this);
  this.emptyBooleanArray$2 = null;
  this.emptyByteArray$2 = null;
  this.emptyCharArray$2 = null;
  this.emptyDoubleArray$2 = null;
  this.emptyFloatArray$2 = null;
  this.emptyIntArray$2 = null;
  this.emptyLongArray$2 = null;
  this.emptyShortArray$2 = null;
  this.emptyObjectArray$2 = null
});
ScalaJS.c.s_Array$.prototype = new ScalaJS.h.s_FallbackArrayBuilding();
ScalaJS.c.s_Array$.prototype.constructor = ScalaJS.c.s_Array$;
/** @constructor */
ScalaJS.h.s_Array$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Array$.prototype = ScalaJS.c.s_Array$.prototype;
ScalaJS.c.s_Array$.prototype.init___ = (function() {
  ScalaJS.n.s_Array$ = this;
  this.emptyBooleanArray$2 = ScalaJS.newArrayObject(ScalaJS.d.Z.getArrayOf(), [0]);
  this.emptyByteArray$2 = ScalaJS.newArrayObject(ScalaJS.d.B.getArrayOf(), [0]);
  this.emptyCharArray$2 = ScalaJS.newArrayObject(ScalaJS.d.C.getArrayOf(), [0]);
  this.emptyDoubleArray$2 = ScalaJS.newArrayObject(ScalaJS.d.D.getArrayOf(), [0]);
  this.emptyFloatArray$2 = ScalaJS.newArrayObject(ScalaJS.d.F.getArrayOf(), [0]);
  this.emptyIntArray$2 = ScalaJS.newArrayObject(ScalaJS.d.I.getArrayOf(), [0]);
  this.emptyLongArray$2 = ScalaJS.newArrayObject(ScalaJS.d.J.getArrayOf(), [0]);
  this.emptyShortArray$2 = ScalaJS.newArrayObject(ScalaJS.d.S.getArrayOf(), [0]);
  this.emptyObjectArray$2 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [0]);
  return this
});
ScalaJS.c.s_Array$.prototype.slowcopy__p2__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, ScalaJS.m.sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
ScalaJS.c.s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = ScalaJS.objectGetClass(src);
  if ((srcClass.isArray__Z() && ScalaJS.objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    ScalaJS.systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
ScalaJS.d.s_Array$ = new ScalaJS.ClassTypeData({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_Array$.prototype.$classData = ScalaJS.d.s_Array$;
ScalaJS.n.s_Array$ = (void 0);
ScalaJS.m.s_Array$ = (function() {
  if ((!ScalaJS.n.s_Array$)) {
    ScalaJS.n.s_Array$ = new ScalaJS.c.s_Array$().init___()
  };
  return ScalaJS.n.s_Array$
});
/** @constructor */
ScalaJS.c.s_Predef$$eq$colon$eq = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_Predef$$eq$colon$eq.prototype = new ScalaJS.h.O();
ScalaJS.c.s_Predef$$eq$colon$eq.prototype.constructor = ScalaJS.c.s_Predef$$eq$colon$eq;
/** @constructor */
ScalaJS.h.s_Predef$$eq$colon$eq = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Predef$$eq$colon$eq.prototype = ScalaJS.c.s_Predef$$eq$colon$eq.prototype;
ScalaJS.c.s_Predef$$eq$colon$eq.prototype.init___ = (function() {
  return this
});
ScalaJS.c.s_Predef$$eq$colon$eq.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
ScalaJS.c.s_Predef$$less$colon$less = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_Predef$$less$colon$less.prototype = new ScalaJS.h.O();
ScalaJS.c.s_Predef$$less$colon$less.prototype.constructor = ScalaJS.c.s_Predef$$less$colon$less;
/** @constructor */
ScalaJS.h.s_Predef$$less$colon$less = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Predef$$less$colon$less.prototype = ScalaJS.c.s_Predef$$less$colon$less.prototype;
ScalaJS.c.s_Predef$$less$colon$less.prototype.init___ = (function() {
  return this
});
ScalaJS.c.s_Predef$$less$colon$less.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
ScalaJS.c.s_math_Equiv$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Equiv$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Equiv$.prototype.constructor = ScalaJS.c.s_math_Equiv$;
/** @constructor */
ScalaJS.h.s_math_Equiv$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Equiv$.prototype = ScalaJS.c.s_math_Equiv$.prototype;
ScalaJS.c.s_math_Equiv$.prototype.init___ = (function() {
  ScalaJS.n.s_math_Equiv$ = this;
  return this
});
ScalaJS.d.s_math_Equiv$ = new ScalaJS.ClassTypeData({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Equiv$.prototype.$classData = ScalaJS.d.s_math_Equiv$;
ScalaJS.n.s_math_Equiv$ = (void 0);
ScalaJS.m.s_math_Equiv$ = (function() {
  if ((!ScalaJS.n.s_math_Equiv$)) {
    ScalaJS.n.s_math_Equiv$ = new ScalaJS.c.s_math_Equiv$().init___()
  };
  return ScalaJS.n.s_math_Equiv$
});
/** @constructor */
ScalaJS.c.s_math_Ordering$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Ordering$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Ordering$.prototype.constructor = ScalaJS.c.s_math_Ordering$;
/** @constructor */
ScalaJS.h.s_math_Ordering$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Ordering$.prototype = ScalaJS.c.s_math_Ordering$.prototype;
ScalaJS.c.s_math_Ordering$.prototype.init___ = (function() {
  ScalaJS.n.s_math_Ordering$ = this;
  return this
});
ScalaJS.d.s_math_Ordering$ = new ScalaJS.ClassTypeData({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Ordering$.prototype.$classData = ScalaJS.d.s_math_Ordering$;
ScalaJS.n.s_math_Ordering$ = (void 0);
ScalaJS.m.s_math_Ordering$ = (function() {
  if ((!ScalaJS.n.s_math_Ordering$)) {
    ScalaJS.n.s_math_Ordering$ = new ScalaJS.c.s_math_Ordering$().init___()
  };
  return ScalaJS.n.s_math_Ordering$
});
/** @constructor */
ScalaJS.c.s_reflect_NoManifest$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_reflect_NoManifest$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_reflect_NoManifest$.prototype.constructor = ScalaJS.c.s_reflect_NoManifest$;
/** @constructor */
ScalaJS.h.s_reflect_NoManifest$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_NoManifest$.prototype = ScalaJS.c.s_reflect_NoManifest$.prototype;
ScalaJS.c.s_reflect_NoManifest$.prototype.toString__T = (function() {
  return "<?>"
});
ScalaJS.d.s_reflect_NoManifest$ = new ScalaJS.ClassTypeData({
  s_reflect_NoManifest$: 0
}, false, "scala.reflect.NoManifest$", {
  s_reflect_NoManifest$: 1,
  O: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_reflect_NoManifest$.prototype.$classData = ScalaJS.d.s_reflect_NoManifest$;
ScalaJS.n.s_reflect_NoManifest$ = (void 0);
ScalaJS.m.s_reflect_NoManifest$ = (function() {
  if ((!ScalaJS.n.s_reflect_NoManifest$)) {
    ScalaJS.n.s_reflect_NoManifest$ = new ScalaJS.c.s_reflect_NoManifest$().init___()
  };
  return ScalaJS.n.s_reflect_NoManifest$
});
/** @constructor */
ScalaJS.c.sc_AbstractIterator = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_AbstractIterator.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_AbstractIterator.prototype.constructor = ScalaJS.c.sc_AbstractIterator;
/** @constructor */
ScalaJS.h.sc_AbstractIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractIterator.prototype = ScalaJS.c.sc_AbstractIterator.prototype;
ScalaJS.c.sc_AbstractIterator.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sc_AbstractIterator.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sc_AbstractIterator.prototype.toList__sci_List = (function() {
  var this$1 = ScalaJS.m.sci_List$();
  var cbf = this$1.ReusableCBFInstance$2;
  return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableOnce$class__to__sc_TraversableOnce__scg_CanBuildFrom__O(this, cbf))
});
ScalaJS.c.sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.toString__T = (function() {
  return ScalaJS.s.sc_Iterator$class__toString__sc_Iterator__T(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this, f)
});
ScalaJS.c.sc_AbstractIterator.prototype.size__I = (function() {
  return ScalaJS.s.sc_TraversableOnce$class__size__sc_TraversableOnce__I(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.toStream__sci_Stream = (function() {
  return ScalaJS.s.sc_Iterator$class__toStream__sc_Iterator__sci_Stream(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.c.sc_AbstractIterator.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_Iterator$class__copyToArray__sc_Iterator__O__I__I__V(this, xs, start, len)
});
/** @constructor */
ScalaJS.c.scg_SetFactory = (function() {
  ScalaJS.c.scg_GenSetFactory.call(this)
});
ScalaJS.c.scg_SetFactory.prototype = new ScalaJS.h.scg_GenSetFactory();
ScalaJS.c.scg_SetFactory.prototype.constructor = ScalaJS.c.scg_SetFactory;
/** @constructor */
ScalaJS.h.scg_SetFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_SetFactory.prototype = ScalaJS.c.scg_SetFactory.prototype;
/** @constructor */
ScalaJS.c.sci_ListSet$ListSetBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.elems$1 = null;
  this.seen$1 = null
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.constructor = ScalaJS.c.sci_ListSet$ListSetBuilder;
/** @constructor */
ScalaJS.h.sci_ListSet$ListSetBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListSet$ListSetBuilder.prototype = ScalaJS.c.sci_ListSet$ListSetBuilder.prototype;
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.result__sci_ListSet = (function() {
  var this$2 = this.elems$1;
  var z = ScalaJS.m.sci_ListSet$EmptyListSet$();
  var this$3 = this$2.scala$collection$mutable$ListBuffer$$start$6;
  var acc = z;
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = acc;
    var arg2 = these.head__O();
    var x$1 = ScalaJS.as.sci_ListSet(arg1);
    acc = new ScalaJS.c.sci_ListSet$Node().init___sci_ListSet__O(x$1, arg2);
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  };
  return ScalaJS.as.sci_ListSet(acc)
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.init___ = (function() {
  ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.init___sci_ListSet.call(this, ScalaJS.m.sci_ListSet$EmptyListSet$());
  return this
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_ListSet$ListSetBuilder(elem)
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.init___sci_ListSet = (function(initial) {
  var this$1 = new ScalaJS.c.scm_ListBuffer().init___().$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(initial);
  this.elems$1 = ScalaJS.as.scm_ListBuffer(ScalaJS.s.sc_SeqLike$class__reverse__sc_SeqLike__O(this$1));
  var this$2 = new ScalaJS.c.scm_HashSet().init___();
  this.seen$1 = ScalaJS.as.scm_HashSet(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this$2, initial));
  return this
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.result__O = (function() {
  return this.result__sci_ListSet()
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_ListSet$ListSetBuilder(elem)
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__sci_ListSet$ListSetBuilder = (function(x) {
  var this$1 = this.seen$1;
  if ((!ScalaJS.s.scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z(this$1, x))) {
    this.elems$1.$$plus$eq__O__scm_ListBuffer(x);
    this.seen$1.$$plus$eq__O__scm_HashSet(x)
  };
  return this
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.d.sci_ListSet$ListSetBuilder = new ScalaJS.ClassTypeData({
  sci_ListSet$ListSetBuilder: 0
}, false, "scala.collection.immutable.ListSet$ListSetBuilder", {
  sci_ListSet$ListSetBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.sci_ListSet$ListSetBuilder.prototype.$classData = ScalaJS.d.sci_ListSet$ListSetBuilder;
/** @constructor */
ScalaJS.c.sci_Map$ = (function() {
  ScalaJS.c.scg_ImmutableMapFactory.call(this)
});
ScalaJS.c.sci_Map$.prototype = new ScalaJS.h.scg_ImmutableMapFactory();
ScalaJS.c.sci_Map$.prototype.constructor = ScalaJS.c.sci_Map$;
/** @constructor */
ScalaJS.h.sci_Map$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Map$.prototype = ScalaJS.c.sci_Map$.prototype;
ScalaJS.c.sci_Map$.prototype.empty__sc_GenMap = (function() {
  return ScalaJS.m.sci_Map$EmptyMap$()
});
ScalaJS.d.sci_Map$ = new ScalaJS.ClassTypeData({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1
});
ScalaJS.c.sci_Map$.prototype.$classData = ScalaJS.d.sci_Map$;
ScalaJS.n.sci_Map$ = (void 0);
ScalaJS.m.sci_Map$ = (function() {
  if ((!ScalaJS.n.sci_Map$)) {
    ScalaJS.n.sci_Map$ = new ScalaJS.c.sci_Map$().init___()
  };
  return ScalaJS.n.sci_Map$
});
/** @constructor */
ScalaJS.c.scm_DefaultEntry = (function() {
  ScalaJS.c.O.call(this);
  this.key$1 = null;
  this.value$1 = null;
  this.next$1 = null
});
ScalaJS.c.scm_DefaultEntry.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_DefaultEntry.prototype.constructor = ScalaJS.c.scm_DefaultEntry;
/** @constructor */
ScalaJS.h.scm_DefaultEntry = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_DefaultEntry.prototype = ScalaJS.c.scm_DefaultEntry.prototype;
ScalaJS.c.scm_DefaultEntry.prototype.chainString__T = (function() {
  var jsx$3 = this.key$1;
  var jsx$2 = this.value$1;
  if ((this.next$1 !== null)) {
    var this$1 = ScalaJS.as.scm_DefaultEntry(this.next$1);
    var jsx$1 = (" -> " + this$1.chainString__T())
  } else {
    var jsx$1 = ""
  };
  return ((((("(kv: " + jsx$3) + ", ") + jsx$2) + ")") + jsx$1)
});
ScalaJS.c.scm_DefaultEntry.prototype.init___O__O = (function(key, value) {
  this.key$1 = key;
  this.value$1 = value;
  return this
});
ScalaJS.c.scm_DefaultEntry.prototype.toString__T = (function() {
  return this.chainString__T()
});
ScalaJS.is.scm_DefaultEntry = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_DefaultEntry)))
});
ScalaJS.as.scm_DefaultEntry = (function(obj) {
  return ((ScalaJS.is.scm_DefaultEntry(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.DefaultEntry"))
});
ScalaJS.isArrayOf.scm_DefaultEntry = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_DefaultEntry)))
});
ScalaJS.asArrayOf.scm_DefaultEntry = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_DefaultEntry(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.DefaultEntry;", depth))
});
ScalaJS.d.scm_DefaultEntry = new ScalaJS.ClassTypeData({
  scm_DefaultEntry: 0
}, false, "scala.collection.mutable.DefaultEntry", {
  scm_DefaultEntry: 1,
  O: 1,
  scm_HashEntry: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_DefaultEntry.prototype.$classData = ScalaJS.d.scm_DefaultEntry;
/** @constructor */
ScalaJS.c.scm_GrowingBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
});
ScalaJS.c.scm_GrowingBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_GrowingBuilder.prototype.constructor = ScalaJS.c.scm_GrowingBuilder;
/** @constructor */
ScalaJS.h.scm_GrowingBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_GrowingBuilder.prototype = ScalaJS.c.scm_GrowingBuilder.prototype;
ScalaJS.c.scm_GrowingBuilder.prototype.init___scg_Growable = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
ScalaJS.c.scm_GrowingBuilder.prototype.$$plus$eq__O__scm_GrowingBuilder = (function(x) {
  this.elems$1.$$plus$eq__O__scg_Growable(x);
  return this
});
ScalaJS.c.scm_GrowingBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
ScalaJS.c.scm_GrowingBuilder.prototype.result__O = (function() {
  return this.elems$1
});
ScalaJS.c.scm_GrowingBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_GrowingBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
ScalaJS.c.scm_GrowingBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_GrowingBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.d.scm_GrowingBuilder = new ScalaJS.ClassTypeData({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.scm_GrowingBuilder.prototype.$classData = ScalaJS.d.scm_GrowingBuilder;
/** @constructor */
ScalaJS.c.scm_LazyBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.parts$1 = null
});
ScalaJS.c.scm_LazyBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_LazyBuilder.prototype.constructor = ScalaJS.c.scm_LazyBuilder;
/** @constructor */
ScalaJS.h.scm_LazyBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_LazyBuilder.prototype = ScalaJS.c.scm_LazyBuilder.prototype;
ScalaJS.c.scm_LazyBuilder.prototype.init___ = (function() {
  this.parts$1 = new ScalaJS.c.scm_ListBuffer().init___();
  return this
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder = (function(xs) {
  this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
  return this
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$eq__O__scm_LazyBuilder = (function(x) {
  var jsx$1 = this.parts$1;
  ScalaJS.m.sci_List$();
  var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([x]);
  var this$2 = ScalaJS.m.sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  jsx$1.$$plus$eq__O__scm_ListBuffer(ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf)));
  return this
});
ScalaJS.c.scm_LazyBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
ScalaJS.c.scm_LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
});
/** @constructor */
ScalaJS.c.scm_MapBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
});
ScalaJS.c.scm_MapBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_MapBuilder.prototype.constructor = ScalaJS.c.scm_MapBuilder;
/** @constructor */
ScalaJS.h.scm_MapBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_MapBuilder.prototype = ScalaJS.c.scm_MapBuilder.prototype;
ScalaJS.c.scm_MapBuilder.prototype.$$plus$eq__T2__scm_MapBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__T2__sc_GenMap(x);
  return this
});
ScalaJS.c.scm_MapBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(elem))
});
ScalaJS.c.scm_MapBuilder.prototype.result__O = (function() {
  return this.elems$1
});
ScalaJS.c.scm_MapBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_MapBuilder.prototype.init___sc_GenMap = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
ScalaJS.c.scm_MapBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__T2__scm_MapBuilder(ScalaJS.as.T2(elem))
});
ScalaJS.c.scm_MapBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_MapBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.d.scm_MapBuilder = new ScalaJS.ClassTypeData({
  scm_MapBuilder: 0
}, false, "scala.collection.mutable.MapBuilder", {
  scm_MapBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.scm_MapBuilder.prototype.$classData = ScalaJS.d.scm_MapBuilder;
/** @constructor */
ScalaJS.c.scm_SetBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
});
ScalaJS.c.scm_SetBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_SetBuilder.prototype.constructor = ScalaJS.c.scm_SetBuilder;
/** @constructor */
ScalaJS.h.scm_SetBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_SetBuilder.prototype = ScalaJS.c.scm_SetBuilder.prototype;
ScalaJS.c.scm_SetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
ScalaJS.c.scm_SetBuilder.prototype.result__O = (function() {
  return this.elems$1
});
ScalaJS.c.scm_SetBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_SetBuilder.prototype.$$plus$eq__O__scm_SetBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__O__sc_Set(x);
  return this
});
ScalaJS.c.scm_SetBuilder.prototype.init___sc_Set = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
ScalaJS.c.scm_SetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
ScalaJS.c.scm_SetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_SetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.d.scm_SetBuilder = new ScalaJS.ClassTypeData({
  scm_SetBuilder: 0
}, false, "scala.collection.mutable.SetBuilder", {
  scm_SetBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.scm_SetBuilder.prototype.$classData = ScalaJS.d.scm_SetBuilder;
/** @constructor */
ScalaJS.c.scm_WrappedArrayBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.tag$1 = null;
  this.manifest$1 = null;
  this.elems$1 = null;
  this.capacity$1 = 0;
  this.size$1 = 0
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_WrappedArrayBuilder.prototype.constructor = ScalaJS.c.scm_WrappedArrayBuilder;
/** @constructor */
ScalaJS.h.scm_WrappedArrayBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArrayBuilder.prototype = ScalaJS.c.scm_WrappedArrayBuilder.prototype;
ScalaJS.c.scm_WrappedArrayBuilder.prototype.init___s_reflect_ClassTag = (function(tag) {
  this.tag$1 = tag;
  this.manifest$1 = tag;
  this.capacity$1 = 0;
  this.size$1 = 0;
  return this
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.ensureSize__p1__I__V = (function(size) {
  if ((this.capacity$1 < size)) {
    var newsize = ((this.capacity$1 === 0) ? 16 : ScalaJS.imul(2, this.capacity$1));
    while ((newsize < size)) {
      newsize = ScalaJS.imul(2, newsize)
    };
    this.resize__p1__I__V(newsize)
  }
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_WrappedArrayBuilder(elem)
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scm_WrappedArrayBuilder = (function(elem) {
  this.ensureSize__p1__I__V(((1 + this.size$1) | 0));
  this.elems$1.update__I__O__V(this.size$1, elem);
  this.size$1 = ((1 + this.size$1) | 0);
  return this
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.mkArray__p1__I__scm_WrappedArray = (function(size) {
  var runtimeClass = ScalaJS.m.sr_ScalaRunTime$().arrayElementClass__O__jl_Class(this.tag$1);
  var newelems = ((runtimeClass === ScalaJS.d.B.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofByte().init___AB(ScalaJS.newArrayObject(ScalaJS.d.B.getArrayOf(), [size])) : ((runtimeClass === ScalaJS.d.S.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofShort().init___AS(ScalaJS.newArrayObject(ScalaJS.d.S.getArrayOf(), [size])) : ((runtimeClass === ScalaJS.d.C.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofChar().init___AC(ScalaJS.newArrayObject(ScalaJS.d.C.getArrayOf(), [size])) : ((runtimeClass === ScalaJS.d.I.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofInt().init___AI(ScalaJS.newArrayObject(ScalaJS.d.I.getArrayOf(), [size])) : ((runtimeClass === ScalaJS.d.J.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofLong().init___AJ(ScalaJS.newArrayObject(ScalaJS.d.J.getArrayOf(), [size])) : ((runtimeClass === ScalaJS.d.F.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofFloat().init___AF(ScalaJS.newArrayObject(ScalaJS.d.F.getArrayOf(), [size])) : ((runtimeClass === ScalaJS.d.D.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofDouble().init___AD(ScalaJS.newArrayObject(ScalaJS.d.D.getArrayOf(), [size])) : ((runtimeClass === ScalaJS.d.Z.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofBoolean().init___AZ(ScalaJS.newArrayObject(ScalaJS.d.Z.getArrayOf(), [size])) : ((runtimeClass === ScalaJS.d.V.getClassOf()) ? new ScalaJS.c.scm_WrappedArray$ofUnit().init___Asr_BoxedUnit(ScalaJS.newArrayObject(ScalaJS.d.sr_BoxedUnit.getArrayOf(), [size])) : new ScalaJS.c.scm_WrappedArray$ofRef().init___AO(ScalaJS.asArrayOf.O(this.tag$1.newArray__I__O(size), 1)))))))))));
  if ((this.size$1 > 0)) {
    ScalaJS.m.s_Array$().copy__O__I__O__I__I__V(this.elems$1.array__O(), 0, newelems.array__O(), 0, this.size$1)
  };
  return newelems
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.result__O = (function() {
  return this.result__scm_WrappedArray()
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.resize__p1__I__V = (function(size) {
  this.elems$1 = this.mkArray__p1__I__scm_WrappedArray(size);
  this.capacity$1 = size
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.result__scm_WrappedArray = (function() {
  return (((this.capacity$1 !== 0) && (this.capacity$1 === this.size$1)) ? this.elems$1 : this.mkArray__p1__I__scm_WrappedArray(this.size$1))
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_WrappedArrayBuilder(elem)
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$1 < size)) {
    this.resize__p1__I__V(size)
  }
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.d.scm_WrappedArrayBuilder = new ScalaJS.ClassTypeData({
  scm_WrappedArrayBuilder: 0
}, false, "scala.collection.mutable.WrappedArrayBuilder", {
  scm_WrappedArrayBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.scm_WrappedArrayBuilder.prototype.$classData = ScalaJS.d.scm_WrappedArrayBuilder;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality = (function() {
  ScalaJS.c.O.call(this);
  this.direction$1 = null;
  this.getCoord$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Dimensionality = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.productPrefix__T = (function() {
  return "Dimensionality"
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.productArity__I = (function() {
  return 2
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Dimensionality(x$1)) {
    var Dimensionality$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Dimensionality(x$1);
    var x = this.direction$1;
    var x$2 = Dimensionality$1.direction$1;
    if ((x === x$2)) {
      var x$3 = this.getCoord$1;
      var x$4 = Dimensionality$1.getCoord$1;
      return ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      return false
    }
  } else {
    return false
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.direction$1;
        break
      };
    case 1:
      {
        return this.getCoord$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.init___Lcom_benjaminrosenbaum_jovian_Vector__F1 = (function(direction, getCoord) {
  this.direction$1 = direction;
  this.getCoord$1 = getCoord;
  return this
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Dimensionality = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Dimensionality)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Dimensionality = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Dimensionality(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Dimensionality"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Dimensionality = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Dimensionality)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Dimensionality = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Dimensionality(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Dimensionality;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Dimensionality = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Dimensionality: 0
}, false, "com.benjaminrosenbaum.jovian.Dimensionality", {
  Lcom_benjaminrosenbaum_jovian_Dimensionality: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Dimensionality.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Dimensionality;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee = (function() {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Hunt.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee.prototype = new ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Hunt();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flee = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Flee.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector = (function(m, visibles) {
  return ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(ScalaJS.c.Lcom_benjaminrosenbaum_jovian_CohereWithFlock.prototype.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector.call(this, m, visibles).scaled__D__Lcom_benjaminrosenbaum_jovian_Coords((-1.0)))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Flee = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Flee: 0
}, false, "com.benjaminrosenbaum.jovian.Flee", {
  Lcom_benjaminrosenbaum_jovian_Flee: 1,
  Lcom_benjaminrosenbaum_jovian_Hunt: 1,
  Lcom_benjaminrosenbaum_jovian_CohereWithFlock: 1,
  Lcom_benjaminrosenbaum_jovian_Flocking: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Motivation: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Flee.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Flee;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics = (function() {
  ScalaJS.c.O.call(this);
  this.maxSpeed$1 = 0.0;
  this.maxForce$1 = 0.0;
  this.friction$1 = 0.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Kinetics = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.productPrefix__T = (function() {
  return "Kinetics"
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.productArity__I = (function() {
  return 3
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Kinetics(x$1)) {
    var Kinetics$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Kinetics(x$1);
    return (((this.maxSpeed$1 === Kinetics$1.maxSpeed$1) && (this.maxForce$1 === Kinetics$1.maxForce$1)) && (this.friction$1 === Kinetics$1.friction$1))
  } else {
    return false
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.maxSpeed$1;
        break
      };
    case 1:
      {
        return this.maxForce$1;
        break
      };
    case 2:
      {
        return this.friction$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.maxSpeed$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.maxForce$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.friction$1));
  return ScalaJS.m.sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.init___D__D__D = (function(maxSpeed, maxForce, friction) {
  this.maxSpeed$1 = maxSpeed;
  this.maxForce$1 = maxForce;
  this.friction$1 = friction;
  return this
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Kinetics = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Kinetics)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Kinetics = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Kinetics(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Kinetics"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Kinetics = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Kinetics)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Kinetics = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Kinetics(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Kinetics;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Kinetics = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Kinetics: 0
}, false, "com.benjaminrosenbaum.jovian.Kinetics", {
  Lcom_benjaminrosenbaum_jovian_Kinetics: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Kinetics.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Kinetics;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life = (function() {
  ScalaJS.c.O.call(this);
  this.maxEnergy$1 = 0.0;
  this.nutrition$1 = 0.0;
  this.healing$1 = 0.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Life = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Life.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.productPrefix__T = (function() {
  return "Life"
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.productArity__I = (function() {
  return 3
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Life(x$1)) {
    var Life$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Life(x$1);
    return (((this.maxEnergy$1 === Life$1.maxEnergy$1) && (this.nutrition$1 === Life$1.nutrition$1)) && (this.healing$1 === Life$1.healing$1))
  } else {
    return false
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.maxEnergy$1;
        break
      };
    case 1:
      {
        return this.nutrition$1;
        break
      };
    case 2:
      {
        return this.healing$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.maxEnergy$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.nutrition$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.healing$1));
  return ScalaJS.m.sr_Statics$().finalizeHash__I__I__I(acc, 3)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.init___D__D__D = (function(maxEnergy, nutrition, healing) {
  this.maxEnergy$1 = maxEnergy;
  this.nutrition$1 = nutrition;
  this.healing$1 = healing;
  return this
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Life = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Life)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Life = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Life(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Life"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Life = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Life)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Life = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Life(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Life;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Life = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Life: 0
}, false, "com.benjaminrosenbaum.jovian.Life", {
  Lcom_benjaminrosenbaum_jovian_Life: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Life.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Life;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$ = (function() {
  ScalaJS.c.sr_AbstractFunction8.call(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$.prototype = new ScalaJS.h.sr_AbstractFunction8();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Motile$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Motile$.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$.prototype.toString__T = (function() {
  return "Motile"
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$.prototype.$$lessinit$greater$default$8__Lcom_benjaminrosenbaum_jovian_Point = (function() {
  return ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Point$().ORIGIN$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$.prototype.$$lessinit$greater$default$7__Lcom_benjaminrosenbaum_jovian_Vector = (function() {
  return ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$().NULL$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$.prototype.$$lessinit$greater$default$6__Lcom_benjaminrosenbaum_jovian_Vector = (function() {
  return ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$().NULL$1
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Motile$ = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Motile$: 0
}, false, "com.benjaminrosenbaum.jovian.Motile$", {
  Lcom_benjaminrosenbaum_jovian_Motile$: 1,
  sr_AbstractFunction8: 1,
  O: 1,
  F8: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Motile$;
ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Motile$ = (void 0);
ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Motile$ = (function() {
  if ((!ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Motile$)) {
    ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Motile$ = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile$().init___()
  };
  return ScalaJS.n.Lcom_benjaminrosenbaum_jovian_Motile$
});
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature = (function() {
  ScalaJS.c.O.call(this);
  this.size$1 = 0.0;
  this.kinetics$1 = null;
  this.life$1 = null;
  this.spawning$1 = null;
  this.motivation$1 = null;
  this.relations$1 = null
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Nature = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Nature.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.productPrefix__T = (function() {
  return "Nature"
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.productArity__I = (function() {
  return 6
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Nature(x$1)) {
    var Nature$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Nature(x$1);
    if ((this.size$1 === Nature$1.size$1)) {
      var x = this.kinetics$1;
      var x$2 = Nature$1.kinetics$1;
      var jsx$4 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
    } else {
      var jsx$4 = false
    };
    if (jsx$4) {
      var x$3 = this.life$1;
      var x$4 = Nature$1.life$1;
      var jsx$3 = ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      var jsx$3 = false
    };
    if (jsx$3) {
      var x$5 = this.spawning$1;
      var x$6 = Nature$1.spawning$1;
      var jsx$2 = ((x$5 === null) ? (x$6 === null) : x$5.equals__O__Z(x$6))
    } else {
      var jsx$2 = false
    };
    if (jsx$2) {
      var x$7 = this.motivation$1;
      var x$8 = Nature$1.motivation$1;
      var jsx$1 = (x$7 === x$8)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$9 = this.relations$1;
      var x$10 = Nature$1.relations$1;
      return ((x$9 === null) ? (x$10 === null) : ScalaJS.s.sc_GenMapLike$class__equals__sc_GenMapLike__O__Z(x$9, x$10))
    } else {
      return false
    }
  } else {
    return false
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.edibleKinds__sci_List = (function() {
  var this$1 = this.relations$1.get__O__s_Option("eats");
  return ScalaJS.as.sci_List((this$1.isEmpty__Z() ? ScalaJS.m.sci_Nil$() : this$1.get__O()))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.size$1;
        break
      };
    case 1:
      {
        return this.kinetics$1;
        break
      };
    case 2:
      {
        return this.life$1;
        break
      };
    case 3:
      {
        return this.spawning$1;
        break
      };
    case 4:
      {
        return this.motivation$1;
        break
      };
    case 5:
      {
        return this.relations$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.init___D__Lcom_benjaminrosenbaum_jovian_Kinetics__Lcom_benjaminrosenbaum_jovian_Life__Lcom_benjaminrosenbaum_jovian_Spawning__Lcom_benjaminrosenbaum_jovian_Motivation__sci_Map = (function(size, kinetics, life, spawning, motivation, relations) {
  this.size$1 = size;
  this.kinetics$1 = kinetics;
  this.life$1 = life;
  this.spawning$1 = spawning;
  this.motivation$1 = motivation;
  this.relations$1 = relations;
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.size$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.kinetics$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.life$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.spawning$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.motivation$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.relations$1));
  return ScalaJS.m.sr_Statics$().finalizeHash__I__I__I(acc, 6)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Nature = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Nature)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Nature = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Nature(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Nature"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Nature = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Nature)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Nature = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Nature(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Nature;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Nature = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Nature: 0
}, false, "com.benjaminrosenbaum.jovian.Nature", {
  Lcom_benjaminrosenbaum_jovian_Nature: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Nature.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Nature;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning = (function() {
  ScalaJS.c.O.call(this);
  this.spawnChance$1 = 0.0;
  this.spawnCap$1 = 0.0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Spawning = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Spawning.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.productPrefix__T = (function() {
  return "Spawning"
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.productArity__I = (function() {
  return 2
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Spawning(x$1)) {
    var Spawning$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Spawning(x$1);
    return ((this.spawnChance$1 === Spawning$1.spawnChance$1) && (this.spawnCap$1 === Spawning$1.spawnCap$1))
  } else {
    return false
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.spawnChance$1;
        break
      };
    case 1:
      {
        return this.spawnCap$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.init___D__D = (function(spawnChance, spawnCap) {
  this.spawnChance$1 = spawnChance;
  this.spawnCap$1 = spawnCap;
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.spawnChance$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.spawnCap$1));
  return ScalaJS.m.sr_Statics$().finalizeHash__I__I__I(acc, 2)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Spawning = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Spawning)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Spawning = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Spawning(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Spawning"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Spawning = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Spawning)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Spawning = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Spawning(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Spawning;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Spawning = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Spawning: 0
}, false, "com.benjaminrosenbaum.jovian.Spawning", {
  Lcom_benjaminrosenbaum_jovian_Spawning: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Spawning.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Spawning;
/** @constructor */
ScalaJS.c.jl_ArithmeticException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_ArithmeticException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_ArithmeticException.prototype.constructor = ScalaJS.c.jl_ArithmeticException;
/** @constructor */
ScalaJS.h.jl_ArithmeticException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ArithmeticException.prototype = ScalaJS.c.jl_ArithmeticException.prototype;
ScalaJS.d.jl_ArithmeticException = new ScalaJS.ClassTypeData({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_ArithmeticException.prototype.$classData = ScalaJS.d.jl_ArithmeticException;
/** @constructor */
ScalaJS.c.jl_ClassCastException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_ClassCastException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_ClassCastException.prototype.constructor = ScalaJS.c.jl_ClassCastException;
/** @constructor */
ScalaJS.h.jl_ClassCastException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ClassCastException.prototype = ScalaJS.c.jl_ClassCastException.prototype;
ScalaJS.is.jl_ClassCastException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
});
ScalaJS.as.jl_ClassCastException = (function(obj) {
  return ((ScalaJS.is.jl_ClassCastException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.ClassCastException"))
});
ScalaJS.isArrayOf.jl_ClassCastException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
});
ScalaJS.asArrayOf.jl_ClassCastException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_ClassCastException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
});
ScalaJS.d.jl_ClassCastException = new ScalaJS.ClassTypeData({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_ClassCastException.prototype.$classData = ScalaJS.d.jl_ClassCastException;
/** @constructor */
ScalaJS.c.jl_IllegalArgumentException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_IllegalArgumentException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_IllegalArgumentException.prototype.constructor = ScalaJS.c.jl_IllegalArgumentException;
/** @constructor */
ScalaJS.h.jl_IllegalArgumentException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_IllegalArgumentException.prototype = ScalaJS.c.jl_IllegalArgumentException.prototype;
ScalaJS.c.jl_IllegalArgumentException.prototype.init___ = (function() {
  ScalaJS.c.jl_IllegalArgumentException.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
ScalaJS.c.jl_IllegalArgumentException.prototype.init___T = (function(s) {
  ScalaJS.c.jl_IllegalArgumentException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
ScalaJS.d.jl_IllegalArgumentException = new ScalaJS.ClassTypeData({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_IllegalArgumentException.prototype.$classData = ScalaJS.d.jl_IllegalArgumentException;
/** @constructor */
ScalaJS.c.jl_IndexOutOfBoundsException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_IndexOutOfBoundsException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_IndexOutOfBoundsException.prototype.constructor = ScalaJS.c.jl_IndexOutOfBoundsException;
/** @constructor */
ScalaJS.h.jl_IndexOutOfBoundsException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_IndexOutOfBoundsException.prototype = ScalaJS.c.jl_IndexOutOfBoundsException.prototype;
ScalaJS.d.jl_IndexOutOfBoundsException = new ScalaJS.ClassTypeData({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_IndexOutOfBoundsException.prototype.$classData = ScalaJS.d.jl_IndexOutOfBoundsException;
/** @constructor */
ScalaJS.c.jl_NullPointerException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_NullPointerException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_NullPointerException.prototype.constructor = ScalaJS.c.jl_NullPointerException;
/** @constructor */
ScalaJS.h.jl_NullPointerException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_NullPointerException.prototype = ScalaJS.c.jl_NullPointerException.prototype;
ScalaJS.c.jl_NullPointerException.prototype.init___ = (function() {
  ScalaJS.c.jl_NullPointerException.prototype.init___T.call(this, null);
  return this
});
ScalaJS.d.jl_NullPointerException = new ScalaJS.ClassTypeData({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_NullPointerException.prototype.$classData = ScalaJS.d.jl_NullPointerException;
/** @constructor */
ScalaJS.c.jl_UnsupportedOperationException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_UnsupportedOperationException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_UnsupportedOperationException.prototype.constructor = ScalaJS.c.jl_UnsupportedOperationException;
/** @constructor */
ScalaJS.h.jl_UnsupportedOperationException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_UnsupportedOperationException.prototype = ScalaJS.c.jl_UnsupportedOperationException.prototype;
ScalaJS.c.jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  ScalaJS.c.jl_UnsupportedOperationException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
ScalaJS.d.jl_UnsupportedOperationException = new ScalaJS.ClassTypeData({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_UnsupportedOperationException.prototype.$classData = ScalaJS.d.jl_UnsupportedOperationException;
/** @constructor */
ScalaJS.c.ju_NoSuchElementException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.ju_NoSuchElementException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.ju_NoSuchElementException.prototype.constructor = ScalaJS.c.ju_NoSuchElementException;
/** @constructor */
ScalaJS.h.ju_NoSuchElementException = (function() {
  /*<skip>*/
});
ScalaJS.h.ju_NoSuchElementException.prototype = ScalaJS.c.ju_NoSuchElementException.prototype;
ScalaJS.c.ju_NoSuchElementException.prototype.init___ = (function() {
  ScalaJS.c.ju_NoSuchElementException.prototype.init___T.call(this, null);
  return this
});
ScalaJS.d.ju_NoSuchElementException = new ScalaJS.ClassTypeData({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.ju_NoSuchElementException.prototype.$classData = ScalaJS.d.ju_NoSuchElementException;
/** @constructor */
ScalaJS.c.s_MatchError = (function() {
  ScalaJS.c.jl_RuntimeException.call(this);
  this.obj$4 = null;
  this.objString$4 = null;
  this.bitmap$0$4 = false
});
ScalaJS.c.s_MatchError.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.s_MatchError.prototype.constructor = ScalaJS.c.s_MatchError;
/** @constructor */
ScalaJS.h.s_MatchError = (function() {
  /*<skip>*/
});
ScalaJS.h.s_MatchError.prototype = ScalaJS.c.s_MatchError.prototype;
ScalaJS.c.s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
ScalaJS.c.s_MatchError.prototype.ofClass$1__p4__T = (function() {
  return ("of class " + ScalaJS.objectGetClass(this.obj$4).getName__T())
});
ScalaJS.c.s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return (((ScalaJS.objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = ScalaJS.m.sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
ScalaJS.c.s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
ScalaJS.c.s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
ScalaJS.c.s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  ScalaJS.c.jl_RuntimeException.prototype.init___.call(this);
  return this
});
ScalaJS.d.s_MatchError = new ScalaJS.ClassTypeData({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_MatchError.prototype.$classData = ScalaJS.d.s_MatchError;
/** @constructor */
ScalaJS.c.s_Option = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_Option.prototype = new ScalaJS.h.O();
ScalaJS.c.s_Option.prototype.constructor = ScalaJS.c.s_Option;
/** @constructor */
ScalaJS.h.s_Option = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Option.prototype = ScalaJS.c.s_Option.prototype;
ScalaJS.c.s_Option.prototype.init___ = (function() {
  return this
});
ScalaJS.c.s_Option.prototype.isDefined__Z = (function() {
  return (!this.isEmpty__Z())
});
/** @constructor */
ScalaJS.c.s_Predef$$anon$1 = (function() {
  ScalaJS.c.s_Predef$$less$colon$less.call(this)
});
ScalaJS.c.s_Predef$$anon$1.prototype = new ScalaJS.h.s_Predef$$less$colon$less();
ScalaJS.c.s_Predef$$anon$1.prototype.constructor = ScalaJS.c.s_Predef$$anon$1;
/** @constructor */
ScalaJS.h.s_Predef$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Predef$$anon$1.prototype = ScalaJS.c.s_Predef$$anon$1.prototype;
ScalaJS.c.s_Predef$$anon$1.prototype.apply__O__O = (function(x) {
  return x
});
ScalaJS.d.s_Predef$$anon$1 = new ScalaJS.ClassTypeData({
  s_Predef$$anon$1: 0
}, false, "scala.Predef$$anon$1", {
  s_Predef$$anon$1: 1,
  s_Predef$$less$colon$less: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_Predef$$anon$1.prototype.$classData = ScalaJS.d.s_Predef$$anon$1;
/** @constructor */
ScalaJS.c.s_Predef$$anon$2 = (function() {
  ScalaJS.c.s_Predef$$eq$colon$eq.call(this)
});
ScalaJS.c.s_Predef$$anon$2.prototype = new ScalaJS.h.s_Predef$$eq$colon$eq();
ScalaJS.c.s_Predef$$anon$2.prototype.constructor = ScalaJS.c.s_Predef$$anon$2;
/** @constructor */
ScalaJS.h.s_Predef$$anon$2 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Predef$$anon$2.prototype = ScalaJS.c.s_Predef$$anon$2.prototype;
ScalaJS.c.s_Predef$$anon$2.prototype.apply__O__O = (function(x) {
  return x
});
ScalaJS.d.s_Predef$$anon$2 = new ScalaJS.ClassTypeData({
  s_Predef$$anon$2: 0
}, false, "scala.Predef$$anon$2", {
  s_Predef$$anon$2: 1,
  s_Predef$$eq$colon$eq: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_Predef$$anon$2.prototype.$classData = ScalaJS.d.s_Predef$$anon$2;
/** @constructor */
ScalaJS.c.s_StringContext = (function() {
  ScalaJS.c.O.call(this);
  this.parts$1 = null
});
ScalaJS.c.s_StringContext.prototype = new ScalaJS.h.O();
ScalaJS.c.s_StringContext.prototype.constructor = ScalaJS.c.s_StringContext;
/** @constructor */
ScalaJS.h.s_StringContext = (function() {
  /*<skip>*/
});
ScalaJS.h.s_StringContext.prototype = ScalaJS.c.s_StringContext.prototype;
ScalaJS.c.s_StringContext.prototype.productPrefix__T = (function() {
  return "StringContext"
});
ScalaJS.c.s_StringContext.prototype.productArity__I = (function() {
  return 1
});
ScalaJS.c.s_StringContext.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.s_StringContext(x$1)) {
    var StringContext$1 = ScalaJS.as.s_StringContext(x$1);
    var x = this.parts$1;
    var x$2 = StringContext$1.parts$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
ScalaJS.c.s_StringContext.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.parts$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.s_StringContext.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.s_StringContext.prototype.checkLengths__sc_Seq__V = (function(args) {
  if ((this.parts$1.length__I() !== ((1 + args.length__I()) | 0))) {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___T((((("wrong number of arguments (" + args.length__I()) + ") for interpolated string with ") + this.parts$1.length__I()) + " parts"))
  }
});
ScalaJS.c.s_StringContext.prototype.s__sc_Seq__T = (function(args) {
  var f = (function(this$2) {
    return (function(str$2) {
      var str = ScalaJS.as.T(str$2);
      var this$1 = ScalaJS.m.s_StringContext$();
      return this$1.treatEscapes0__p1__T__Z__T(str, false)
    })
  })(this);
  this.checkLengths__sc_Seq__V(args);
  var pi = this.parts$1.iterator__sc_Iterator();
  var ai = args.iterator__sc_Iterator();
  var arg1 = pi.next__O();
  var bldr = new ScalaJS.c.jl_StringBuilder().init___T(ScalaJS.as.T(f(arg1)));
  while (ai.hasNext__Z()) {
    bldr.append__O__jl_StringBuilder(ai.next__O());
    var arg1$1 = pi.next__O();
    bldr.append__T__jl_StringBuilder(ScalaJS.as.T(f(arg1$1)))
  };
  return bldr.content$1
});
ScalaJS.c.s_StringContext.prototype.init___sc_Seq = (function(parts) {
  this.parts$1 = parts;
  return this
});
ScalaJS.c.s_StringContext.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.s_StringContext.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.s_StringContext = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_StringContext)))
});
ScalaJS.as.s_StringContext = (function(obj) {
  return ((ScalaJS.is.s_StringContext(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.StringContext"))
});
ScalaJS.isArrayOf.s_StringContext = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_StringContext)))
});
ScalaJS.asArrayOf.s_StringContext = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_StringContext(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.StringContext;", depth))
});
ScalaJS.d.s_StringContext = new ScalaJS.ClassTypeData({
  s_StringContext: 0
}, false, "scala.StringContext", {
  s_StringContext: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_StringContext.prototype.$classData = ScalaJS.d.s_StringContext;
ScalaJS.is.s_reflect_ClassTag = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_reflect_ClassTag)))
});
ScalaJS.as.s_reflect_ClassTag = (function(obj) {
  return ((ScalaJS.is.s_reflect_ClassTag(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.reflect.ClassTag"))
});
ScalaJS.isArrayOf.s_reflect_ClassTag = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_reflect_ClassTag)))
});
ScalaJS.asArrayOf.s_reflect_ClassTag = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_reflect_ClassTag(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.reflect.ClassTag;", depth))
});
/** @constructor */
ScalaJS.c.s_util_control_BreakControl = (function() {
  ScalaJS.c.jl_Throwable.call(this)
});
ScalaJS.c.s_util_control_BreakControl.prototype = new ScalaJS.h.jl_Throwable();
ScalaJS.c.s_util_control_BreakControl.prototype.constructor = ScalaJS.c.s_util_control_BreakControl;
/** @constructor */
ScalaJS.h.s_util_control_BreakControl = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_control_BreakControl.prototype = ScalaJS.c.s_util_control_BreakControl.prototype;
ScalaJS.c.s_util_control_BreakControl.prototype.init___ = (function() {
  ScalaJS.c.jl_Throwable.prototype.init___.call(this);
  return this
});
ScalaJS.c.s_util_control_BreakControl.prototype.fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.s.s_util_control_NoStackTrace$class__fillInStackTrace__s_util_control_NoStackTrace__jl_Throwable(this)
});
ScalaJS.c.s_util_control_BreakControl.prototype.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
ScalaJS.d.s_util_control_BreakControl = new ScalaJS.ClassTypeData({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
ScalaJS.c.s_util_control_BreakControl.prototype.$classData = ScalaJS.d.s_util_control_BreakControl;
ScalaJS.is.sc_GenTraversable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
});
ScalaJS.as.sc_GenTraversable = (function(obj) {
  return ((ScalaJS.is.sc_GenTraversable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenTraversable"))
});
ScalaJS.isArrayOf.sc_GenTraversable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
});
ScalaJS.asArrayOf.sc_GenTraversable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenTraversable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenTraversable;", depth))
});
/** @constructor */
ScalaJS.c.sc_Iterable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.sc_Iterable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.sc_Iterable$.prototype.constructor = ScalaJS.c.sc_Iterable$;
/** @constructor */
ScalaJS.h.sc_Iterable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterable$.prototype = ScalaJS.c.sc_Iterable$.prototype;
ScalaJS.c.sc_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_Iterable$();
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sc_Iterable$ = new ScalaJS.ClassTypeData({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sc_Iterable$.prototype.$classData = ScalaJS.d.sc_Iterable$;
ScalaJS.n.sc_Iterable$ = (void 0);
ScalaJS.m.sc_Iterable$ = (function() {
  if ((!ScalaJS.n.sc_Iterable$)) {
    ScalaJS.n.sc_Iterable$ = new ScalaJS.c.sc_Iterable$().init___()
  };
  return ScalaJS.n.sc_Iterable$
});
/** @constructor */
ScalaJS.c.sc_Iterator$$anon$11 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.$$outer$2 = null;
  this.f$3$2 = null
});
ScalaJS.c.sc_Iterator$$anon$11.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_Iterator$$anon$11.prototype.constructor = ScalaJS.c.sc_Iterator$$anon$11;
/** @constructor */
ScalaJS.h.sc_Iterator$$anon$11 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterator$$anon$11.prototype = ScalaJS.c.sc_Iterator$$anon$11.prototype;
ScalaJS.c.sc_Iterator$$anon$11.prototype.next__O = (function() {
  return this.f$3$2.apply__O__O(this.$$outer$2.next__O())
});
ScalaJS.c.sc_Iterator$$anon$11.prototype.init___sc_Iterator__F1 = (function($$outer, f$3) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.f$3$2 = f$3;
  return this
});
ScalaJS.c.sc_Iterator$$anon$11.prototype.hasNext__Z = (function() {
  return this.$$outer$2.hasNext__Z()
});
ScalaJS.d.sc_Iterator$$anon$11 = new ScalaJS.ClassTypeData({
  sc_Iterator$$anon$11: 0
}, false, "scala.collection.Iterator$$anon$11", {
  sc_Iterator$$anon$11: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_Iterator$$anon$11.prototype.$classData = ScalaJS.d.sc_Iterator$$anon$11;
/** @constructor */
ScalaJS.c.sc_Iterator$$anon$2 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this)
});
ScalaJS.c.sc_Iterator$$anon$2.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_Iterator$$anon$2.prototype.constructor = ScalaJS.c.sc_Iterator$$anon$2;
/** @constructor */
ScalaJS.h.sc_Iterator$$anon$2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterator$$anon$2.prototype = ScalaJS.c.sc_Iterator$$anon$2.prototype;
ScalaJS.c.sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("next on empty iterator")
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
ScalaJS.d.sc_Iterator$$anon$2 = new ScalaJS.ClassTypeData({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.$classData = ScalaJS.d.sc_Iterator$$anon$2;
/** @constructor */
ScalaJS.c.sc_LinearSeqLike$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.these$2 = null
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.constructor = ScalaJS.c.sc_LinearSeqLike$$anon$1;
/** @constructor */
ScalaJS.h.sc_LinearSeqLike$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_LinearSeqLike$$anon$1.prototype = ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype;
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.init___sc_LinearSeqLike = (function($$outer) {
  this.these$2 = $$outer;
  return this
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var result = this.these$2.head__O();
    this.these$2 = ScalaJS.as.sc_LinearSeqLike(this.these$2.tail__O());
    return result
  } else {
    return ScalaJS.m.sc_Iterator$().empty$1.next__O()
  }
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.toList__sci_List = (function() {
  var xs = this.these$2.toList__sci_List();
  this.these$2 = ScalaJS.as.sc_LinearSeqLike(this.these$2.take__I__O(0));
  return xs
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.these$2.isEmpty__Z())
});
ScalaJS.d.sc_LinearSeqLike$$anon$1 = new ScalaJS.ClassTypeData({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.$classData = ScalaJS.d.sc_LinearSeqLike$$anon$1;
/** @constructor */
ScalaJS.c.sc_Traversable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this);
  this.breaks$3 = null
});
ScalaJS.c.sc_Traversable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.sc_Traversable$.prototype.constructor = ScalaJS.c.sc_Traversable$;
/** @constructor */
ScalaJS.h.sc_Traversable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Traversable$.prototype = ScalaJS.c.sc_Traversable$.prototype;
ScalaJS.c.sc_Traversable$.prototype.init___ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.prototype.init___.call(this);
  ScalaJS.n.sc_Traversable$ = this;
  this.breaks$3 = new ScalaJS.c.s_util_control_Breaks().init___();
  return this
});
ScalaJS.c.sc_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_Traversable$();
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sc_Traversable$ = new ScalaJS.ClassTypeData({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sc_Traversable$.prototype.$classData = ScalaJS.d.sc_Traversable$;
ScalaJS.n.sc_Traversable$ = (void 0);
ScalaJS.m.sc_Traversable$ = (function() {
  if ((!ScalaJS.n.sc_Traversable$)) {
    ScalaJS.n.sc_Traversable$ = new ScalaJS.c.sc_Traversable$().init___()
  };
  return ScalaJS.n.sc_Traversable$
});
/** @constructor */
ScalaJS.c.scg_ImmutableSetFactory = (function() {
  ScalaJS.c.scg_SetFactory.call(this)
});
ScalaJS.c.scg_ImmutableSetFactory.prototype = new ScalaJS.h.scg_SetFactory();
ScalaJS.c.scg_ImmutableSetFactory.prototype.constructor = ScalaJS.c.scg_ImmutableSetFactory;
/** @constructor */
ScalaJS.h.scg_ImmutableSetFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_ImmutableSetFactory.prototype = ScalaJS.c.scg_ImmutableSetFactory.prototype;
ScalaJS.c.scg_ImmutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_SetBuilder().init___sc_Set(this.emptyInstance__sci_Set())
});
/** @constructor */
ScalaJS.c.scg_MutableSetFactory = (function() {
  ScalaJS.c.scg_SetFactory.call(this)
});
ScalaJS.c.scg_MutableSetFactory.prototype = new ScalaJS.h.scg_SetFactory();
ScalaJS.c.scg_MutableSetFactory.prototype.constructor = ScalaJS.c.scg_MutableSetFactory;
/** @constructor */
ScalaJS.h.scg_MutableSetFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_MutableSetFactory.prototype = ScalaJS.c.scg_MutableSetFactory.prototype;
ScalaJS.c.scg_MutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_GrowingBuilder().init___scg_Growable(ScalaJS.as.scg_Growable(this.empty__sc_GenTraversable()))
});
/** @constructor */
ScalaJS.c.sci_Iterable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.sci_Iterable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.sci_Iterable$.prototype.constructor = ScalaJS.c.sci_Iterable$;
/** @constructor */
ScalaJS.h.sci_Iterable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Iterable$.prototype = ScalaJS.c.sci_Iterable$.prototype;
ScalaJS.c.sci_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sci_Iterable$ = new ScalaJS.ClassTypeData({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_Iterable$.prototype.$classData = ScalaJS.d.sci_Iterable$;
ScalaJS.n.sci_Iterable$ = (void 0);
ScalaJS.m.sci_Iterable$ = (function() {
  if ((!ScalaJS.n.sci_Iterable$)) {
    ScalaJS.n.sci_Iterable$ = new ScalaJS.c.sci_Iterable$().init___()
  };
  return ScalaJS.n.sci_Iterable$
});
/** @constructor */
ScalaJS.c.sci_ListMap$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.self$2 = null
});
ScalaJS.c.sci_ListMap$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sci_ListMap$$anon$1.prototype.constructor = ScalaJS.c.sci_ListMap$$anon$1;
/** @constructor */
ScalaJS.h.sci_ListMap$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListMap$$anon$1.prototype = ScalaJS.c.sci_ListMap$$anon$1.prototype;
ScalaJS.c.sci_ListMap$$anon$1.prototype.next__O = (function() {
  return this.next__T2()
});
ScalaJS.c.sci_ListMap$$anon$1.prototype.init___sci_ListMap = (function($$outer) {
  this.self$2 = $$outer;
  return this
});
ScalaJS.c.sci_ListMap$$anon$1.prototype.next__T2 = (function() {
  if ((!this.hasNext__Z())) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("next on empty iterator")
  } else {
    var res = new ScalaJS.c.T2().init___O__O(this.self$2.key__O(), this.self$2.value__O());
    this.self$2 = this.self$2.next__sci_ListMap();
    return res
  }
});
ScalaJS.c.sci_ListMap$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.self$2.isEmpty__Z())
});
ScalaJS.d.sci_ListMap$$anon$1 = new ScalaJS.ClassTypeData({
  sci_ListMap$$anon$1: 0
}, false, "scala.collection.immutable.ListMap$$anon$1", {
  sci_ListMap$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sci_ListMap$$anon$1.prototype.$classData = ScalaJS.d.sci_ListMap$$anon$1;
/** @constructor */
ScalaJS.c.sci_ListSet$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.that$2 = null
});
ScalaJS.c.sci_ListSet$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sci_ListSet$$anon$1.prototype.constructor = ScalaJS.c.sci_ListSet$$anon$1;
/** @constructor */
ScalaJS.h.sci_ListSet$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListSet$$anon$1.prototype = ScalaJS.c.sci_ListSet$$anon$1.prototype;
ScalaJS.c.sci_ListSet$$anon$1.prototype.next__O = (function() {
  var this$1 = this.that$2;
  if (ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
    var res = this.that$2.head__O();
    this.that$2 = this.that$2.tail__sci_ListSet();
    return res
  } else {
    return ScalaJS.m.sc_Iterator$().empty$1.next__O()
  }
});
ScalaJS.c.sci_ListSet$$anon$1.prototype.init___sci_ListSet = (function($$outer) {
  this.that$2 = $$outer;
  return this
});
ScalaJS.c.sci_ListSet$$anon$1.prototype.hasNext__Z = (function() {
  var this$1 = this.that$2;
  return ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
ScalaJS.d.sci_ListSet$$anon$1 = new ScalaJS.ClassTypeData({
  sci_ListSet$$anon$1: 0
}, false, "scala.collection.immutable.ListSet$$anon$1", {
  sci_ListSet$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sci_ListSet$$anon$1.prototype.$classData = ScalaJS.d.sci_ListSet$$anon$1;
/** @constructor */
ScalaJS.c.sci_Stream$StreamBuilder = (function() {
  ScalaJS.c.scm_LazyBuilder.call(this)
});
ScalaJS.c.sci_Stream$StreamBuilder.prototype = new ScalaJS.h.scm_LazyBuilder();
ScalaJS.c.sci_Stream$StreamBuilder.prototype.constructor = ScalaJS.c.sci_Stream$StreamBuilder;
/** @constructor */
ScalaJS.h.sci_Stream$StreamBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$StreamBuilder.prototype = ScalaJS.c.sci_Stream$StreamBuilder.prototype;
ScalaJS.c.sci_Stream$StreamBuilder.prototype.result__O = (function() {
  return this.result__sci_Stream()
});
ScalaJS.c.sci_Stream$StreamBuilder.prototype.result__sci_Stream = (function() {
  var this$1 = this.parts$1;
  return ScalaJS.as.sci_Stream(this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(x$5$2) {
      var x$5 = ScalaJS.as.sc_TraversableOnce(x$5$2);
      return x$5.toStream__sci_Stream()
    })
  })(this)), (ScalaJS.m.sci_Stream$(), new ScalaJS.c.sci_Stream$StreamCanBuildFrom().init___())))
});
ScalaJS.is.sci_Stream$StreamBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
});
ScalaJS.as.sci_Stream$StreamBuilder = (function(obj) {
  return ((ScalaJS.is.sci_Stream$StreamBuilder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.Stream$StreamBuilder"))
});
ScalaJS.isArrayOf.sci_Stream$StreamBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
});
ScalaJS.asArrayOf.sci_Stream$StreamBuilder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_Stream$StreamBuilder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.Stream$StreamBuilder;", depth))
});
ScalaJS.d.sci_Stream$StreamBuilder = new ScalaJS.ClassTypeData({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.sci_Stream$StreamBuilder.prototype.$classData = ScalaJS.d.sci_Stream$StreamBuilder;
/** @constructor */
ScalaJS.c.sci_StreamIterator = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.these$2 = null
});
ScalaJS.c.sci_StreamIterator.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sci_StreamIterator.prototype.constructor = ScalaJS.c.sci_StreamIterator;
/** @constructor */
ScalaJS.h.sci_StreamIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_StreamIterator.prototype = ScalaJS.c.sci_StreamIterator.prototype;
ScalaJS.c.sci_StreamIterator.prototype.next__O = (function() {
  if (ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z(this)) {
    return ScalaJS.m.sc_Iterator$().empty$1.next__O()
  } else {
    var cur = this.these$2.v__sci_Stream();
    var result = cur.head__O();
    this.these$2 = new ScalaJS.c.sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, cur$1) {
      return (function() {
        return ScalaJS.as.sci_Stream(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
ScalaJS.c.sci_StreamIterator.prototype.toList__sci_List = (function() {
  var this$1 = this.toStream__sci_Stream();
  var this$2 = ScalaJS.m.sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(this$1, cbf))
});
ScalaJS.c.sci_StreamIterator.prototype.init___sci_Stream = (function(self) {
  this.these$2 = new ScalaJS.c.sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, self$1) {
    return (function() {
      return self$1
    })
  })(this, self)));
  return this
});
ScalaJS.c.sci_StreamIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sci_Stream();
  return ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
ScalaJS.c.sci_StreamIterator.prototype.toStream__sci_Stream = (function() {
  var result = this.these$2.v__sci_Stream();
  this.these$2 = new ScalaJS.c.sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      ScalaJS.m.sci_Stream$();
      return ScalaJS.m.sci_Stream$Empty$()
    })
  })(this)));
  return result
});
ScalaJS.d.sci_StreamIterator = new ScalaJS.ClassTypeData({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sci_StreamIterator.prototype.$classData = ScalaJS.d.sci_StreamIterator;
/** @constructor */
ScalaJS.c.sci_Traversable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.sci_Traversable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.sci_Traversable$.prototype.constructor = ScalaJS.c.sci_Traversable$;
/** @constructor */
ScalaJS.h.sci_Traversable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Traversable$.prototype = ScalaJS.c.sci_Traversable$.prototype;
ScalaJS.c.sci_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sci_Traversable$ = new ScalaJS.ClassTypeData({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_Traversable$.prototype.$classData = ScalaJS.d.sci_Traversable$;
ScalaJS.n.sci_Traversable$ = (void 0);
ScalaJS.m.sci_Traversable$ = (function() {
  if ((!ScalaJS.n.sci_Traversable$)) {
    ScalaJS.n.sci_Traversable$ = new ScalaJS.c.sci_Traversable$().init___()
  };
  return ScalaJS.n.sci_Traversable$
});
/** @constructor */
ScalaJS.c.sci_TrieIterator = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.elems$2 = null;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = null;
  this.scala$collection$immutable$TrieIterator$$posStack$f = null;
  this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null
});
ScalaJS.c.sci_TrieIterator.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sci_TrieIterator.prototype.constructor = ScalaJS.c.sci_TrieIterator;
/** @constructor */
ScalaJS.h.sci_TrieIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_TrieIterator.prototype = ScalaJS.c.sci_TrieIterator.prototype;
ScalaJS.c.sci_TrieIterator.prototype.isContainer__p2__O__Z = (function(x) {
  return (ScalaJS.is.sci_HashMap$HashMap1(x) || ScalaJS.is.sci_HashSet$HashSet1(x))
});
ScalaJS.c.sci_TrieIterator.prototype.next__O = (function() {
  if ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null)) {
    var el = this.scala$collection$immutable$TrieIterator$$subIter$f.next__O();
    if ((!this.scala$collection$immutable$TrieIterator$$subIter$f.hasNext__Z())) {
      this.scala$collection$immutable$TrieIterator$$subIter$f = null
    };
    return el
  } else {
    return this.next0__p2__Asci_Iterable__I__O(this.scala$collection$immutable$TrieIterator$$arrayD$f, this.scala$collection$immutable$TrieIterator$$posD$f)
  }
});
ScalaJS.c.sci_TrieIterator.prototype.initPosStack__AI = (function() {
  return ScalaJS.newArrayObject(ScalaJS.d.I.getArrayOf(), [6])
});
ScalaJS.c.sci_TrieIterator.prototype.hasNext__Z = (function() {
  return ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null) || (this.scala$collection$immutable$TrieIterator$$depth$f >= 0))
});
ScalaJS.c.sci_TrieIterator.prototype.next0__p2__Asci_Iterable__I__O = (function(elems, i) {
  _next0: while (true) {
    if ((i === (((-1) + elems.u["length"]) | 0))) {
      this.scala$collection$immutable$TrieIterator$$depth$f = (((-1) + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
        this.scala$collection$immutable$TrieIterator$$posD$f = this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = null
      } else {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
        this.scala$collection$immutable$TrieIterator$$posD$f = 0
      }
    } else {
      this.scala$collection$immutable$TrieIterator$$posD$f = ((1 + this.scala$collection$immutable$TrieIterator$$posD$f) | 0)
    };
    var m = elems.u[i];
    if (this.isContainer__p2__O__Z(m)) {
      return this.getElem__O__O(m)
    } else if (this.isTrie__p2__O__Z(m)) {
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$arrayD$f;
        this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$posD$f
      };
      this.scala$collection$immutable$TrieIterator$$depth$f = ((1 + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      this.scala$collection$immutable$TrieIterator$$arrayD$f = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      this.scala$collection$immutable$TrieIterator$$posD$f = 0;
      var temp$elems = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      elems = temp$elems;
      i = 0;
      continue _next0
    } else {
      this.scala$collection$immutable$TrieIterator$$subIter$f = m.iterator__sc_Iterator();
      return this.next__O()
    }
  }
});
ScalaJS.c.sci_TrieIterator.prototype.getElems__p2__sci_Iterable__Asci_Iterable = (function(x) {
  if (ScalaJS.is.sci_HashMap$HashTrieMap(x)) {
    var x2 = ScalaJS.as.sci_HashMap$HashTrieMap(x);
    var jsx$1 = x2.elems$6
  } else if (ScalaJS.is.sci_HashSet$HashTrieSet(x)) {
    var x3 = ScalaJS.as.sci_HashSet$HashTrieSet(x);
    var jsx$1 = x3.elems$5
  } else {
    var jsx$1;
    throw new ScalaJS.c.s_MatchError().init___O(x)
  };
  return ScalaJS.asArrayOf.sci_Iterable(jsx$1, 1)
});
ScalaJS.c.sci_TrieIterator.prototype.init___Asci_Iterable = (function(elems) {
  this.elems$2 = elems;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = this.initArrayStack__AAsci_Iterable();
  this.scala$collection$immutable$TrieIterator$$posStack$f = this.initPosStack__AI();
  this.scala$collection$immutable$TrieIterator$$arrayD$f = this.elems$2;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null;
  return this
});
ScalaJS.c.sci_TrieIterator.prototype.isTrie__p2__O__Z = (function(x) {
  return (ScalaJS.is.sci_HashMap$HashTrieMap(x) || ScalaJS.is.sci_HashSet$HashTrieSet(x))
});
ScalaJS.c.sci_TrieIterator.prototype.initArrayStack__AAsci_Iterable = (function() {
  return ScalaJS.newArrayObject(ScalaJS.d.sci_Iterable.getArrayOf().getArrayOf(), [6])
});
/** @constructor */
ScalaJS.c.sci_VectorBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  this.depth$1 = 0;
  this.display0$1 = null;
  this.display1$1 = null;
  this.display2$1 = null;
  this.display3$1 = null;
  this.display4$1 = null;
  this.display5$1 = null
});
ScalaJS.c.sci_VectorBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_VectorBuilder.prototype.constructor = ScalaJS.c.sci_VectorBuilder;
/** @constructor */
ScalaJS.h.sci_VectorBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_VectorBuilder.prototype = ScalaJS.c.sci_VectorBuilder.prototype;
ScalaJS.c.sci_VectorBuilder.prototype.display3__AO = (function() {
  return this.display3$1
});
ScalaJS.c.sci_VectorBuilder.prototype.init___ = (function() {
  this.display0$1 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]);
  this.depth$1 = 1;
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  return this
});
ScalaJS.c.sci_VectorBuilder.prototype.depth__I = (function() {
  return this.depth$1
});
ScalaJS.c.sci_VectorBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
ScalaJS.c.sci_VectorBuilder.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display0__AO = (function() {
  return this.display0$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display4__AO = (function() {
  return this.display4$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.$$plus$eq__O__sci_VectorBuilder = (function(elem) {
  if ((this.lo$1 >= this.display0$1.u["length"])) {
    var newBlockIndex = ((32 + this.blockIndex$1) | 0);
    var xor = (this.blockIndex$1 ^ newBlockIndex);
    ScalaJS.s.sci_VectorPointer$class__gotoNextBlockStartWritable__sci_VectorPointer__I__I__V(this, newBlockIndex, xor);
    this.blockIndex$1 = newBlockIndex;
    this.lo$1 = 0
  };
  this.display0$1.u[this.lo$1] = elem;
  this.lo$1 = ((1 + this.lo$1) | 0);
  return this
});
ScalaJS.c.sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
ScalaJS.c.sci_VectorBuilder.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.sci_VectorBuilder.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display1__AO = (function() {
  return this.display1$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display5__AO = (function() {
  return this.display5$1
});
ScalaJS.c.sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var size = ((this.blockIndex$1 + this.lo$1) | 0);
  if ((size === 0)) {
    var this$1 = ScalaJS.m.sci_Vector$();
    return this$1.NIL$6
  };
  var s = new ScalaJS.c.sci_Vector().init___I__I__I(0, size, 0);
  var depth = this.depth$1;
  ScalaJS.s.sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  if ((this.depth$1 > 1)) {
    var xor = (((-1) + size) | 0);
    ScalaJS.s.sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V(s, 0, xor)
  };
  return s
});
ScalaJS.c.sci_VectorBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
ScalaJS.c.sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.sci_VectorBuilder.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display2__AO = (function() {
  return this.display2$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.as.sci_VectorBuilder(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
});
ScalaJS.c.sci_VectorBuilder.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$1 = x$1
});
ScalaJS.is.sci_VectorBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
});
ScalaJS.as.sci_VectorBuilder = (function(obj) {
  return ((ScalaJS.is.sci_VectorBuilder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
});
ScalaJS.isArrayOf.sci_VectorBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
});
ScalaJS.asArrayOf.sci_VectorBuilder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
});
ScalaJS.d.sci_VectorBuilder = new ScalaJS.ClassTypeData({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
ScalaJS.c.sci_VectorBuilder.prototype.$classData = ScalaJS.d.sci_VectorBuilder;
/** @constructor */
ScalaJS.c.scm_Builder$$anon$1 = (function() {
  ScalaJS.c.O.call(this);
  this.self$1 = null;
  this.f$1$1 = null
});
ScalaJS.c.scm_Builder$$anon$1.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_Builder$$anon$1.prototype.constructor = ScalaJS.c.scm_Builder$$anon$1;
/** @constructor */
ScalaJS.h.scm_Builder$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_Builder$$anon$1.prototype = ScalaJS.c.scm_Builder$$anon$1.prototype;
ScalaJS.c.scm_Builder$$anon$1.prototype.init___scm_Builder__F1 = (function($$outer, f$1) {
  this.f$1$1 = f$1;
  this.self$1 = $$outer;
  return this
});
ScalaJS.c.scm_Builder$$anon$1.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.s_Proxy$class__equals__s_Proxy__O__Z(this, that)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.toString__T = (function() {
  return ScalaJS.s.s_Proxy$class__toString__s_Proxy__T(this)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1 = (function(xs) {
  this.self$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs);
  return this
});
ScalaJS.c.scm_Builder$$anon$1.prototype.result__O = (function() {
  return this.f$1$1.apply__O__O(this.self$1.result__O())
});
ScalaJS.c.scm_Builder$$anon$1.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundColl) {
  this.self$1.sizeHintBounded__I__sc_TraversableLike__V(size, boundColl)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder$$anon$1 = (function(x) {
  this.self$1.$$plus$eq__O__scm_Builder(x);
  return this
});
ScalaJS.c.scm_Builder$$anon$1.prototype.hashCode__I = (function() {
  return this.self$1.hashCode__I()
});
ScalaJS.c.scm_Builder$$anon$1.prototype.sizeHint__I__V = (function(size) {
  this.self$1.sizeHint__I__V(size)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1(xs)
});
ScalaJS.d.scm_Builder$$anon$1 = new ScalaJS.ClassTypeData({
  scm_Builder$$anon$1: 0
}, false, "scala.collection.mutable.Builder$$anon$1", {
  scm_Builder$$anon$1: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Proxy: 1
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$classData = ScalaJS.d.scm_Builder$$anon$1;
/** @constructor */
ScalaJS.c.scm_FlatHashTable$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.i$2 = 0;
  this.$$outer$2 = null
});
ScalaJS.c.scm_FlatHashTable$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.scm_FlatHashTable$$anon$1.prototype.constructor = ScalaJS.c.scm_FlatHashTable$$anon$1;
/** @constructor */
ScalaJS.h.scm_FlatHashTable$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_FlatHashTable$$anon$1.prototype = ScalaJS.c.scm_FlatHashTable$$anon$1.prototype;
ScalaJS.c.scm_FlatHashTable$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    this.i$2 = ((1 + this.i$2) | 0);
    var this$1 = this.$$outer$2;
    var entry = this.$$outer$2.table$5.u[(((-1) + this.i$2) | 0)];
    return ScalaJS.s.scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O(this$1, entry)
  } else {
    return ScalaJS.m.sc_Iterator$().empty$1.next__O()
  }
});
ScalaJS.c.scm_FlatHashTable$$anon$1.prototype.init___scm_FlatHashTable = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.i$2 = 0;
  return this
});
ScalaJS.c.scm_FlatHashTable$$anon$1.prototype.hasNext__Z = (function() {
  while (((this.i$2 < this.$$outer$2.table$5.u["length"]) && (this.$$outer$2.table$5.u[this.i$2] === null))) {
    this.i$2 = ((1 + this.i$2) | 0)
  };
  return (this.i$2 < this.$$outer$2.table$5.u["length"])
});
ScalaJS.d.scm_FlatHashTable$$anon$1 = new ScalaJS.ClassTypeData({
  scm_FlatHashTable$$anon$1: 0
}, false, "scala.collection.mutable.FlatHashTable$$anon$1", {
  scm_FlatHashTable$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.scm_FlatHashTable$$anon$1.prototype.$classData = ScalaJS.d.scm_FlatHashTable$$anon$1;
/** @constructor */
ScalaJS.c.scm_HashTable$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.iterTable$2 = null;
  this.idx$2 = 0;
  this.es$2 = null
});
ScalaJS.c.scm_HashTable$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.scm_HashTable$$anon$1.prototype.constructor = ScalaJS.c.scm_HashTable$$anon$1;
/** @constructor */
ScalaJS.h.scm_HashTable$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_HashTable$$anon$1.prototype = ScalaJS.c.scm_HashTable$$anon$1.prototype;
ScalaJS.c.scm_HashTable$$anon$1.prototype.init___scm_HashTable = (function($$outer) {
  this.iterTable$2 = $$outer.table$5;
  this.idx$2 = ScalaJS.s.scm_HashTable$class__scala$collection$mutable$HashTable$$lastPopulatedIndex__scm_HashTable__I($$outer);
  this.es$2 = this.iterTable$2.u[this.idx$2];
  return this
});
ScalaJS.c.scm_HashTable$$anon$1.prototype.next__O = (function() {
  return this.next__scm_HashEntry()
});
ScalaJS.c.scm_HashTable$$anon$1.prototype.next__scm_HashEntry = (function() {
  var res = this.es$2;
  this.es$2 = ScalaJS.as.scm_HashEntry(this.es$2.next$1);
  while (((this.es$2 === null) && (this.idx$2 > 0))) {
    this.idx$2 = (((-1) + this.idx$2) | 0);
    this.es$2 = this.iterTable$2.u[this.idx$2]
  };
  return res
});
ScalaJS.c.scm_HashTable$$anon$1.prototype.hasNext__Z = (function() {
  return (this.es$2 !== null)
});
ScalaJS.d.scm_HashTable$$anon$1 = new ScalaJS.ClassTypeData({
  scm_HashTable$$anon$1: 0
}, false, "scala.collection.mutable.HashTable$$anon$1", {
  scm_HashTable$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.scm_HashTable$$anon$1.prototype.$classData = ScalaJS.d.scm_HashTable$$anon$1;
/** @constructor */
ScalaJS.c.scm_Iterable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.scm_Iterable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.scm_Iterable$.prototype.constructor = ScalaJS.c.scm_Iterable$;
/** @constructor */
ScalaJS.h.scm_Iterable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_Iterable$.prototype = ScalaJS.c.scm_Iterable$.prototype;
ScalaJS.c.scm_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ArrayBuffer().init___()
});
ScalaJS.d.scm_Iterable$ = new ScalaJS.ClassTypeData({
  scm_Iterable$: 0
}, false, "scala.collection.mutable.Iterable$", {
  scm_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.scm_Iterable$.prototype.$classData = ScalaJS.d.scm_Iterable$;
ScalaJS.n.scm_Iterable$ = (void 0);
ScalaJS.m.scm_Iterable$ = (function() {
  if ((!ScalaJS.n.scm_Iterable$)) {
    ScalaJS.n.scm_Iterable$ = new ScalaJS.c.scm_Iterable$().init___()
  };
  return ScalaJS.n.scm_Iterable$
});
/** @constructor */
ScalaJS.c.scm_ListBuffer$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.cursor$2 = null
});
ScalaJS.c.scm_ListBuffer$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.constructor = ScalaJS.c.scm_ListBuffer$$anon$1;
/** @constructor */
ScalaJS.h.scm_ListBuffer$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ListBuffer$$anon$1.prototype = ScalaJS.c.scm_ListBuffer$$anon$1.prototype;
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.init___scm_ListBuffer = (function($$outer) {
  this.cursor$2 = ($$outer.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z() ? ScalaJS.m.sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
  return this
});
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("next on empty Iterator")
  } else {
    var ans = this.cursor$2.head__O();
    var this$1 = this.cursor$2;
    this.cursor$2 = this$1.tail__sci_List();
    return ans
  }
});
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.hasNext__Z = (function() {
  return (this.cursor$2 !== ScalaJS.m.sci_Nil$())
});
ScalaJS.d.scm_ListBuffer$$anon$1 = new ScalaJS.ClassTypeData({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.$classData = ScalaJS.d.scm_ListBuffer$$anon$1;
/** @constructor */
ScalaJS.c.sr_ScalaRunTime$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.constructor = ScalaJS.c.sr_ScalaRunTime$$anon$1;
/** @constructor */
ScalaJS.h.sr_ScalaRunTime$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_ScalaRunTime$$anon$1.prototype = ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype;
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
ScalaJS.d.sr_ScalaRunTime$$anon$1 = new ScalaJS.ClassTypeData({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.$classData = ScalaJS.d.sr_ScalaRunTime$$anon$1;
/** @constructor */
ScalaJS.c.Ljava_io_PrintStream = (function() {
  ScalaJS.c.Ljava_io_FilterOutputStream.call(this);
  this.autoFlush$3 = false;
  this.charset$3 = null;
  this.encoder$3 = null;
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  this.bitmap$0$3 = false
});
ScalaJS.c.Ljava_io_PrintStream.prototype = new ScalaJS.h.Ljava_io_FilterOutputStream();
ScalaJS.c.Ljava_io_PrintStream.prototype.constructor = ScalaJS.c.Ljava_io_PrintStream;
/** @constructor */
ScalaJS.h.Ljava_io_PrintStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_PrintStream.prototype = ScalaJS.c.Ljava_io_PrintStream.prototype;
ScalaJS.c.Ljava_io_PrintStream.prototype.println__O__V = (function(obj) {
  this.print__O__V(obj);
  this.printString__p4__T__V("\n")
});
ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset = (function(_out, autoFlush, charset) {
  this.autoFlush$3 = autoFlush;
  this.charset$3 = charset;
  ScalaJS.c.Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  return this
});
ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
  return this
});
ScalaJS.is.Ljava_io_PrintStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_PrintStream)))
});
ScalaJS.as.Ljava_io_PrintStream = (function(obj) {
  return ((ScalaJS.is.Ljava_io_PrintStream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.io.PrintStream"))
});
ScalaJS.isArrayOf.Ljava_io_PrintStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_PrintStream)))
});
ScalaJS.asArrayOf.Ljava_io_PrintStream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Ljava_io_PrintStream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.io.PrintStream;", depth))
});
/** @constructor */
ScalaJS.c.T2 = (function() {
  ScalaJS.c.O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
});
ScalaJS.c.T2.prototype = new ScalaJS.h.O();
ScalaJS.c.T2.prototype.constructor = ScalaJS.c.T2;
/** @constructor */
ScalaJS.h.T2 = (function() {
  /*<skip>*/
});
ScalaJS.h.T2.prototype = ScalaJS.c.T2.prototype;
ScalaJS.c.T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
ScalaJS.c.T2.prototype.productArity__I = (function() {
  return 2
});
ScalaJS.c.T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.T2(x$1)) {
    var Tuple2$1 = ScalaJS.as.T2(x$1);
    return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$f, Tuple2$1.$$und1$f) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$f, Tuple2$1.$$und2$f))
  } else {
    return false
  }
});
ScalaJS.c.T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
ScalaJS.c.T2.prototype.productElement__I__O = (function(n) {
  return ScalaJS.s.s_Product2$class__productElement__s_Product2__I__O(this, n)
});
ScalaJS.c.T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
});
ScalaJS.c.T2.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.T2.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.T2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
});
ScalaJS.as.T2 = (function(obj) {
  return ((ScalaJS.is.T2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Tuple2"))
});
ScalaJS.isArrayOf.T2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
});
ScalaJS.asArrayOf.T2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.T2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Tuple2;", depth))
});
ScalaJS.d.T2 = new ScalaJS.ClassTypeData({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.T2.prototype.$classData = ScalaJS.d.T2;
/** @constructor */
ScalaJS.c.T4 = (function() {
  ScalaJS.c.O.call(this);
  this.$$und1$1 = null;
  this.$$und2$1 = null;
  this.$$und3$1 = null;
  this.$$und4$1 = null
});
ScalaJS.c.T4.prototype = new ScalaJS.h.O();
ScalaJS.c.T4.prototype.constructor = ScalaJS.c.T4;
/** @constructor */
ScalaJS.h.T4 = (function() {
  /*<skip>*/
});
ScalaJS.h.T4.prototype = ScalaJS.c.T4.prototype;
ScalaJS.c.T4.prototype.productPrefix__T = (function() {
  return "Tuple4"
});
ScalaJS.c.T4.prototype.productArity__I = (function() {
  return 4
});
ScalaJS.c.T4.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.T4(x$1)) {
    var Tuple4$1 = ScalaJS.as.T4(x$1);
    return (((ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$1, Tuple4$1.$$und1$1) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$1, Tuple4$1.$$und2$1)) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und3$1, Tuple4$1.$$und3$1)) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und4$1, Tuple4$1.$$und4$1))
  } else {
    return false
  }
});
ScalaJS.c.T4.prototype.productElement__I__O = (function(n) {
  return ScalaJS.s.s_Product4$class__productElement__s_Product4__I__O(this, n)
});
ScalaJS.c.T4.prototype.toString__T = (function() {
  return (((((((("(" + this.$$und1$1) + ",") + this.$$und2$1) + ",") + this.$$und3$1) + ",") + this.$$und4$1) + ")")
});
ScalaJS.c.T4.prototype.init___O__O__O__O = (function(_1, _2, _3, _4) {
  this.$$und1$1 = _1;
  this.$$und2$1 = _2;
  this.$$und3$1 = _3;
  this.$$und4$1 = _4;
  return this
});
ScalaJS.c.T4.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.T4.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.T4 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T4)))
});
ScalaJS.as.T4 = (function(obj) {
  return ((ScalaJS.is.T4(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Tuple4"))
});
ScalaJS.isArrayOf.T4 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T4)))
});
ScalaJS.asArrayOf.T4 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.T4(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Tuple4;", depth))
});
ScalaJS.d.T4 = new ScalaJS.ClassTypeData({
  T4: 0
}, false, "scala.Tuple4", {
  T4: 1,
  O: 1,
  s_Product4: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.T4.prototype.$classData = ScalaJS.d.T4;
/** @constructor */
ScalaJS.c.s_None$ = (function() {
  ScalaJS.c.s_Option.call(this)
});
ScalaJS.c.s_None$.prototype = new ScalaJS.h.s_Option();
ScalaJS.c.s_None$.prototype.constructor = ScalaJS.c.s_None$;
/** @constructor */
ScalaJS.h.s_None$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_None$.prototype = ScalaJS.c.s_None$.prototype;
ScalaJS.c.s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
ScalaJS.c.s_None$.prototype.productArity__I = (function() {
  return 0
});
ScalaJS.c.s_None$.prototype.isEmpty__Z = (function() {
  return true
});
ScalaJS.c.s_None$.prototype.get__O = (function() {
  this.get__sr_Nothing$()
});
ScalaJS.c.s_None$.prototype.productElement__I__O = (function(x$1) {
  matchEnd3: {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1))
  }
});
ScalaJS.c.s_None$.prototype.toString__T = (function() {
  return "None"
});
ScalaJS.c.s_None$.prototype.get__sr_Nothing$ = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("None.get")
});
ScalaJS.c.s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
ScalaJS.c.s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.d.s_None$ = new ScalaJS.ClassTypeData({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_None$.prototype.$classData = ScalaJS.d.s_None$;
ScalaJS.n.s_None$ = (void 0);
ScalaJS.m.s_None$ = (function() {
  if ((!ScalaJS.n.s_None$)) {
    ScalaJS.n.s_None$ = new ScalaJS.c.s_None$().init___()
  };
  return ScalaJS.n.s_None$
});
/** @constructor */
ScalaJS.c.s_Some = (function() {
  ScalaJS.c.s_Option.call(this);
  this.x$2 = null
});
ScalaJS.c.s_Some.prototype = new ScalaJS.h.s_Option();
ScalaJS.c.s_Some.prototype.constructor = ScalaJS.c.s_Some;
/** @constructor */
ScalaJS.h.s_Some = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Some.prototype = ScalaJS.c.s_Some.prototype;
ScalaJS.c.s_Some.prototype.productPrefix__T = (function() {
  return "Some"
});
ScalaJS.c.s_Some.prototype.productArity__I = (function() {
  return 1
});
ScalaJS.c.s_Some.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.s_Some(x$1)) {
    var Some$1 = ScalaJS.as.s_Some(x$1);
    return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.x$2, Some$1.x$2)
  } else {
    return false
  }
});
ScalaJS.c.s_Some.prototype.isEmpty__Z = (function() {
  return false
});
ScalaJS.c.s_Some.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.x$2;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.s_Some.prototype.get__O = (function() {
  return this.x$2
});
ScalaJS.c.s_Some.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.s_Some.prototype.init___O = (function(x) {
  this.x$2 = x;
  return this
});
ScalaJS.c.s_Some.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.s_Some.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.s_Some = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Some)))
});
ScalaJS.as.s_Some = (function(obj) {
  return ((ScalaJS.is.s_Some(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Some"))
});
ScalaJS.isArrayOf.s_Some = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
});
ScalaJS.asArrayOf.s_Some = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_Some(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Some;", depth))
});
ScalaJS.d.s_Some = new ScalaJS.ClassTypeData({
  s_Some: 0
}, false, "scala.Some", {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_Some.prototype.$classData = ScalaJS.d.s_Some;
/** @constructor */
ScalaJS.c.s_StringContext$InvalidEscapeException = (function() {
  ScalaJS.c.jl_IllegalArgumentException.call(this);
  this.index$5 = 0
});
ScalaJS.c.s_StringContext$InvalidEscapeException.prototype = new ScalaJS.h.jl_IllegalArgumentException();
ScalaJS.c.s_StringContext$InvalidEscapeException.prototype.constructor = ScalaJS.c.s_StringContext$InvalidEscapeException;
/** @constructor */
ScalaJS.h.s_StringContext$InvalidEscapeException = (function() {
  /*<skip>*/
});
ScalaJS.h.s_StringContext$InvalidEscapeException.prototype = ScalaJS.c.s_StringContext$InvalidEscapeException.prototype;
ScalaJS.c.s_StringContext$InvalidEscapeException.prototype.init___T__I = (function(str, index) {
  this.index$5 = index;
  var jsx$3 = new ScalaJS.c.s_StringContext().init___sc_Seq(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["invalid escape ", " index ", " in \"", "\". Use \\\\\\\\ for literal \\\\."]));
  ScalaJS.m.s_Predef$().require__Z__V(((index >= 0) && (index < ScalaJS.uI(str["length"]))));
  if ((index === (((-1) + ScalaJS.uI(str["length"])) | 0))) {
    var jsx$1 = "at terminal"
  } else {
    var jsx$2 = new ScalaJS.c.s_StringContext().init___sc_Seq(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(["'\\\\", "' not one of ", " at"]));
    var index$1 = ((1 + index) | 0);
    var c = (65535 & ScalaJS.uI(str["charCodeAt"](index$1)));
    var jsx$1 = jsx$2.s__sc_Seq__T(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([new ScalaJS.c.jl_Character().init___C(c), "[\\b, \\t, \\n, \\f, \\r, \\\\, \\\", \\']"]))
  };
  ScalaJS.c.jl_IllegalArgumentException.prototype.init___T.call(this, jsx$3.s__sc_Seq__T(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, index, str])));
  return this
});
ScalaJS.d.s_StringContext$InvalidEscapeException = new ScalaJS.ClassTypeData({
  s_StringContext$InvalidEscapeException: 0
}, false, "scala.StringContext$InvalidEscapeException", {
  s_StringContext$InvalidEscapeException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_StringContext$InvalidEscapeException.prototype.$classData = ScalaJS.d.s_StringContext$InvalidEscapeException;
/** @constructor */
ScalaJS.c.scg_SeqFactory = (function() {
  ScalaJS.c.scg_GenSeqFactory.call(this)
});
ScalaJS.c.scg_SeqFactory.prototype = new ScalaJS.h.scg_GenSeqFactory();
ScalaJS.c.scg_SeqFactory.prototype.constructor = ScalaJS.c.scg_SeqFactory;
/** @constructor */
ScalaJS.h.scg_SeqFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_SeqFactory.prototype = ScalaJS.c.scg_SeqFactory.prototype;
/** @constructor */
ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1 = (function() {
  ScalaJS.c.sci_TrieIterator.call(this)
});
ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1.prototype = new ScalaJS.h.sci_TrieIterator();
ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1.prototype.constructor = ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1;
/** @constructor */
ScalaJS.h.sci_HashMap$HashTrieMap$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$HashTrieMap$$anon$1.prototype = ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1.prototype;
ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1.prototype.init___sci_HashMap$HashTrieMap = (function($$outer) {
  ScalaJS.c.sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$6);
  return this
});
ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1.prototype.getElem__O__O = (function(x) {
  return ScalaJS.as.sci_HashMap$HashMap1(x).ensurePair__T2()
});
ScalaJS.d.sci_HashMap$HashTrieMap$$anon$1 = new ScalaJS.ClassTypeData({
  sci_HashMap$HashTrieMap$$anon$1: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap$$anon$1", {
  sci_HashMap$HashTrieMap$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1.prototype.$classData = ScalaJS.d.sci_HashMap$HashTrieMap$$anon$1;
/** @constructor */
ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1 = (function() {
  ScalaJS.c.sci_TrieIterator.call(this)
});
ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1.prototype = new ScalaJS.h.sci_TrieIterator();
ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1.prototype.constructor = ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
ScalaJS.h.sci_HashSet$HashTrieSet$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashSet$HashTrieSet$$anon$1.prototype = ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1.prototype;
ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1.prototype.init___sci_HashSet$HashTrieSet = (function($$outer) {
  ScalaJS.c.sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$5);
  return this
});
ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1.prototype.getElem__O__O = (function(cc) {
  return ScalaJS.as.sci_HashSet$HashSet1(cc).key$6
});
ScalaJS.d.sci_HashSet$HashTrieSet$$anon$1 = new ScalaJS.ClassTypeData({
  sci_HashSet$HashTrieSet$$anon$1: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet$$anon$1", {
  sci_HashSet$HashTrieSet$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1.prototype.$classData = ScalaJS.d.sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
ScalaJS.c.sci_Set$ = (function() {
  ScalaJS.c.scg_ImmutableSetFactory.call(this)
});
ScalaJS.c.sci_Set$.prototype = new ScalaJS.h.scg_ImmutableSetFactory();
ScalaJS.c.sci_Set$.prototype.constructor = ScalaJS.c.sci_Set$;
/** @constructor */
ScalaJS.h.sci_Set$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Set$.prototype = ScalaJS.c.sci_Set$.prototype;
ScalaJS.c.sci_Set$.prototype.emptyInstance__sci_Set = (function() {
  return ScalaJS.m.sci_Set$EmptySet$()
});
ScalaJS.d.sci_Set$ = new ScalaJS.ClassTypeData({
  sci_Set$: 0
}, false, "scala.collection.immutable.Set$", {
  sci_Set$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_Set$.prototype.$classData = ScalaJS.d.sci_Set$;
ScalaJS.n.sci_Set$ = (void 0);
ScalaJS.m.sci_Set$ = (function() {
  if ((!ScalaJS.n.sci_Set$)) {
    ScalaJS.n.sci_Set$ = new ScalaJS.c.sci_Set$().init___()
  };
  return ScalaJS.n.sci_Set$
});
/** @constructor */
ScalaJS.c.sci_VectorIterator = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.endIndex$2 = 0;
  this.blockIndex$2 = 0;
  this.lo$2 = 0;
  this.endLo$2 = 0;
  this.$$undhasNext$2 = false;
  this.depth$2 = 0;
  this.display0$2 = null;
  this.display1$2 = null;
  this.display2$2 = null;
  this.display3$2 = null;
  this.display4$2 = null;
  this.display5$2 = null
});
ScalaJS.c.sci_VectorIterator.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sci_VectorIterator.prototype.constructor = ScalaJS.c.sci_VectorIterator;
/** @constructor */
ScalaJS.h.sci_VectorIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_VectorIterator.prototype = ScalaJS.c.sci_VectorIterator.prototype;
ScalaJS.c.sci_VectorIterator.prototype.next__O = (function() {
  if ((!this.$$undhasNext$2)) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("reached iterator end")
  };
  var res = this.display0$2.u[this.lo$2];
  this.lo$2 = ((1 + this.lo$2) | 0);
  if ((this.lo$2 === this.endLo$2)) {
    if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
      var newBlockIndex = ((32 + this.blockIndex$2) | 0);
      var xor = (this.blockIndex$2 ^ newBlockIndex);
      ScalaJS.s.sci_VectorPointer$class__gotoNextBlockStart__sci_VectorPointer__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$2 = newBlockIndex;
      var x = ((this.endIndex$2 - this.blockIndex$2) | 0);
      this.endLo$2 = ((x < 32) ? x : 32);
      this.lo$2 = 0
    } else {
      this.$$undhasNext$2 = false
    }
  };
  return res
});
ScalaJS.c.sci_VectorIterator.prototype.display3__AO = (function() {
  return this.display3$2
});
ScalaJS.c.sci_VectorIterator.prototype.depth__I = (function() {
  return this.depth$2
});
ScalaJS.c.sci_VectorIterator.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.init___I__I = (function(_startIndex, endIndex) {
  this.endIndex$2 = endIndex;
  this.blockIndex$2 = ((-32) & _startIndex);
  this.lo$2 = (31 & _startIndex);
  var x = ((endIndex - this.blockIndex$2) | 0);
  this.endLo$2 = ((x < 32) ? x : 32);
  this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
  return this
});
ScalaJS.c.sci_VectorIterator.prototype.display0__AO = (function() {
  return this.display0$2
});
ScalaJS.c.sci_VectorIterator.prototype.display4__AO = (function() {
  return this.display4$2
});
ScalaJS.c.sci_VectorIterator.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.hasNext__Z = (function() {
  return this.$$undhasNext$2
});
ScalaJS.c.sci_VectorIterator.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.display1__AO = (function() {
  return this.display1$2
});
ScalaJS.c.sci_VectorIterator.prototype.display5__AO = (function() {
  return this.display5$2
});
ScalaJS.c.sci_VectorIterator.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.display2__AO = (function() {
  return this.display2$2
});
ScalaJS.c.sci_VectorIterator.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$2 = x$1
});
ScalaJS.d.sci_VectorIterator = new ScalaJS.ClassTypeData({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
ScalaJS.c.sci_VectorIterator.prototype.$classData = ScalaJS.d.sci_VectorIterator;
/** @constructor */
ScalaJS.c.sjsr_UndefinedBehaviorError = (function() {
  ScalaJS.c.jl_Error.call(this)
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype = new ScalaJS.h.jl_Error();
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.constructor = ScalaJS.c.sjsr_UndefinedBehaviorError;
/** @constructor */
ScalaJS.h.sjsr_UndefinedBehaviorError = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_UndefinedBehaviorError.prototype = ScalaJS.c.sjsr_UndefinedBehaviorError.prototype;
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  ScalaJS.c.jl_Error.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
ScalaJS.d.sjsr_UndefinedBehaviorError = new ScalaJS.ClassTypeData({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.$classData = ScalaJS.d.sjsr_UndefinedBehaviorError;
/** @constructor */
ScalaJS.c.jl_JSConsoleBasedPrintStream = (function() {
  ScalaJS.c.Ljava_io_PrintStream.call(this);
  this.isErr$4 = null;
  this.flushed$4 = false;
  this.buffer$4 = null
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype = new ScalaJS.h.Ljava_io_PrintStream();
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.constructor = ScalaJS.c.jl_JSConsoleBasedPrintStream;
/** @constructor */
ScalaJS.h.jl_JSConsoleBasedPrintStream = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_JSConsoleBasedPrintStream.prototype = ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype;
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.init___jl_Boolean = (function(isErr) {
  this.isErr$4 = isErr;
  ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream.call(this, new ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream().init___());
  this.flushed$4 = true;
  this.buffer$4 = "";
  return this
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.doWriteLine__p4__T__V = (function(line) {
  var x = ScalaJS.g["console"];
  if (ScalaJS.uZ((!(!x)))) {
    var x$1 = this.isErr$4;
    if (ScalaJS.uZ(x$1)) {
      var x$2 = ScalaJS.g["console"]["error"];
      var jsx$1 = ScalaJS.uZ((!(!x$2)))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      ScalaJS.g["console"]["error"](line)
    } else {
      ScalaJS.g["console"]["log"](line)
    }
  }
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.print__O__V = (function(obj) {
  this.printString__p4__T__V(ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T(obj))
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.printString__p4__T__V = (function(s) {
  var rest = s;
  while ((rest !== "")) {
    var thiz = rest;
    var nlPos = ScalaJS.uI(thiz["indexOf"]("\n"));
    if ((nlPos < 0)) {
      this.buffer$4 = (("" + this.buffer$4) + rest);
      this.flushed$4 = false;
      rest = ""
    } else {
      var jsx$1 = this.buffer$4;
      var thiz$1 = rest;
      this.doWriteLine__p4__T__V((("" + jsx$1) + ScalaJS.as.T(thiz$1["substring"](0, nlPos))));
      this.buffer$4 = "";
      this.flushed$4 = true;
      var thiz$2 = rest;
      var beginIndex = ((1 + nlPos) | 0);
      rest = ScalaJS.as.T(thiz$2["substring"](beginIndex))
    }
  }
});
ScalaJS.d.jl_JSConsoleBasedPrintStream = new ScalaJS.ClassTypeData({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.$classData = ScalaJS.d.jl_JSConsoleBasedPrintStream;
/** @constructor */
ScalaJS.c.s_math_Ordering$$anon$13 = (function() {
  ScalaJS.c.O.call(this);
  this.ord1$6$1 = null;
  this.ord2$6$1 = null;
  this.ord3$6$1 = null;
  this.ord4$6$1 = null
});
ScalaJS.c.s_math_Ordering$$anon$13.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Ordering$$anon$13.prototype.constructor = ScalaJS.c.s_math_Ordering$$anon$13;
/** @constructor */
ScalaJS.h.s_math_Ordering$$anon$13 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Ordering$$anon$13.prototype = ScalaJS.c.s_math_Ordering$$anon$13.prototype;
ScalaJS.c.s_math_Ordering$$anon$13.prototype.compare__T4__T4__I = (function(x, y) {
  var compare1 = this.ord1$6$1.compare__O__O__I(x.$$und1$1, y.$$und1$1);
  if ((compare1 !== 0)) {
    return compare1
  };
  var compare2 = this.ord2$6$1.compare__O__O__I(x.$$und2$1, y.$$und2$1);
  if ((compare2 !== 0)) {
    return compare2
  };
  var compare3 = this.ord3$6$1.compare__O__O__I(x.$$und3$1, y.$$und3$1);
  if ((compare3 !== 0)) {
    return compare3
  };
  var compare4 = this.ord4$6$1.compare__O__O__I(x.$$und4$1, y.$$und4$1);
  if ((compare4 !== 0)) {
    return compare4
  };
  return 0
});
ScalaJS.c.s_math_Ordering$$anon$13.prototype.compare__O__O__I = (function(x, y) {
  return this.compare__T4__T4__I(ScalaJS.as.T4(x), ScalaJS.as.T4(y))
});
ScalaJS.c.s_math_Ordering$$anon$13.prototype.init___s_math_Ordering__s_math_Ordering__s_math_Ordering__s_math_Ordering = (function(ord1$6, ord2$6, ord3$6, ord4$6) {
  this.ord1$6$1 = ord1$6;
  this.ord2$6$1 = ord2$6;
  this.ord3$6$1 = ord3$6;
  this.ord4$6$1 = ord4$6;
  return this
});
ScalaJS.d.s_math_Ordering$$anon$13 = new ScalaJS.ClassTypeData({
  s_math_Ordering$$anon$13: 0
}, false, "scala.math.Ordering$$anon$13", {
  s_math_Ordering$$anon$13: 1,
  O: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Ordering$$anon$13.prototype.$classData = ScalaJS.d.s_math_Ordering$$anon$13;
/** @constructor */
ScalaJS.c.s_math_Ordering$$anon$5 = (function() {
  ScalaJS.c.O.call(this);
  this.$$outer$1 = null;
  this.f$2$1 = null
});
ScalaJS.c.s_math_Ordering$$anon$5.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Ordering$$anon$5.prototype.constructor = ScalaJS.c.s_math_Ordering$$anon$5;
/** @constructor */
ScalaJS.h.s_math_Ordering$$anon$5 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Ordering$$anon$5.prototype = ScalaJS.c.s_math_Ordering$$anon$5.prototype;
ScalaJS.c.s_math_Ordering$$anon$5.prototype.compare__O__O__I = (function(x, y) {
  return this.$$outer$1.compare__O__O__I(this.f$2$1.apply__O__O(x), this.f$2$1.apply__O__O(y))
});
ScalaJS.c.s_math_Ordering$$anon$5.prototype.init___s_math_Ordering__F1 = (function($$outer, f$2) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.f$2$1 = f$2;
  return this
});
ScalaJS.d.s_math_Ordering$$anon$5 = new ScalaJS.ClassTypeData({
  s_math_Ordering$$anon$5: 0
}, false, "scala.math.Ordering$$anon$5", {
  s_math_Ordering$$anon$5: 1,
  O: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Ordering$$anon$5.prototype.$classData = ScalaJS.d.s_math_Ordering$$anon$5;
/** @constructor */
ScalaJS.c.s_reflect_ClassTag$$anon$1 = (function() {
  ScalaJS.c.O.call(this);
  this.runtimeClass1$1$1 = null
});
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype = new ScalaJS.h.O();
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype.constructor = ScalaJS.c.s_reflect_ClassTag$$anon$1;
/** @constructor */
ScalaJS.h.s_reflect_ClassTag$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ClassTag$$anon$1.prototype = ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype;
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype.newArray__I__O = (function(len) {
  return ScalaJS.s.s_reflect_ClassTag$class__newArray__s_reflect_ClassTag__I__O(this, len)
});
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype.equals__O__Z = (function(x) {
  return ScalaJS.s.s_reflect_ClassTag$class__equals__s_reflect_ClassTag__O__Z(this, x)
});
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype.toString__T = (function() {
  return ScalaJS.s.s_reflect_ClassTag$class__prettyprint$1__p0__s_reflect_ClassTag__jl_Class__T(this, this.runtimeClass1$1$1)
});
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype.runtimeClass__jl_Class = (function() {
  return this.runtimeClass1$1$1
});
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype.init___jl_Class = (function(runtimeClass1$1) {
  this.runtimeClass1$1$1 = runtimeClass1$1;
  return this
});
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype.hashCode__I = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().hash__O__I(this.runtimeClass1$1$1)
});
ScalaJS.d.s_reflect_ClassTag$$anon$1 = new ScalaJS.ClassTypeData({
  s_reflect_ClassTag$$anon$1: 0
}, false, "scala.reflect.ClassTag$$anon$1", {
  s_reflect_ClassTag$$anon$1: 1,
  O: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ClassTag$$anon$1.prototype.$classData = ScalaJS.d.s_reflect_ClassTag$$anon$1;
/** @constructor */
ScalaJS.c.sc_Seq$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.sc_Seq$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sc_Seq$.prototype.constructor = ScalaJS.c.sc_Seq$;
/** @constructor */
ScalaJS.h.sc_Seq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Seq$.prototype = ScalaJS.c.sc_Seq$.prototype;
ScalaJS.c.sc_Seq$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_Seq$();
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sc_Seq$ = new ScalaJS.ClassTypeData({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sc_Seq$.prototype.$classData = ScalaJS.d.sc_Seq$;
ScalaJS.n.sc_Seq$ = (void 0);
ScalaJS.m.sc_Seq$ = (function() {
  if ((!ScalaJS.n.sc_Seq$)) {
    ScalaJS.n.sc_Seq$ = new ScalaJS.c.sc_Seq$().init___()
  };
  return ScalaJS.n.sc_Seq$
});
/** @constructor */
ScalaJS.c.scg_IndexedSeqFactory = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scg_IndexedSeqFactory.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scg_IndexedSeqFactory.prototype.constructor = ScalaJS.c.scg_IndexedSeqFactory;
/** @constructor */
ScalaJS.h.scg_IndexedSeqFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_IndexedSeqFactory.prototype = ScalaJS.c.scg_IndexedSeqFactory.prototype;
/** @constructor */
ScalaJS.c.sci_HashMap$ = (function() {
  ScalaJS.c.scg_ImmutableMapFactory.call(this);
  this.defaultMerger$4 = null
});
ScalaJS.c.sci_HashMap$.prototype = new ScalaJS.h.scg_ImmutableMapFactory();
ScalaJS.c.sci_HashMap$.prototype.constructor = ScalaJS.c.sci_HashMap$;
/** @constructor */
ScalaJS.h.sci_HashMap$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$.prototype = ScalaJS.c.sci_HashMap$.prototype;
ScalaJS.c.sci_HashMap$.prototype.init___ = (function() {
  ScalaJS.n.sci_HashMap$ = this;
  var mergef = new ScalaJS.c.sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2) {
    return (function(a$2, b$2) {
      var a = ScalaJS.as.T2(a$2);
      ScalaJS.as.T2(b$2);
      return a
    })
  })(this));
  this.defaultMerger$4 = new ScalaJS.c.sci_HashMap$$anon$2().init___F2(mergef);
  return this
});
ScalaJS.c.sci_HashMap$.prototype.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap = (function(hash0, elem0, hash1, elem1, level, size) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = ScalaJS.newArrayObject(ScalaJS.d.sci_HashMap.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.u[0] = elem0;
      elems.u[1] = elem1
    } else {
      elems.u[0] = elem1;
      elems.u[1] = elem0
    };
    return new ScalaJS.c.sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap, elems, size)
  } else {
    var elems$2 = ScalaJS.newArrayObject(ScalaJS.d.sci_HashMap.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    elems$2.u[0] = this.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(hash0, elem0, hash1, elem1, ((5 + level) | 0), size);
    return new ScalaJS.c.sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap$2, elems$2, size)
  }
});
ScalaJS.c.sci_HashMap$.prototype.empty__sc_GenMap = (function() {
  return ScalaJS.m.sci_HashMap$EmptyHashMap$()
});
ScalaJS.d.sci_HashMap$ = new ScalaJS.ClassTypeData({
  sci_HashMap$: 0
}, false, "scala.collection.immutable.HashMap$", {
  sci_HashMap$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1,
  scg_BitOperations$Int: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_HashMap$.prototype.$classData = ScalaJS.d.sci_HashMap$;
ScalaJS.n.sci_HashMap$ = (void 0);
ScalaJS.m.sci_HashMap$ = (function() {
  if ((!ScalaJS.n.sci_HashMap$)) {
    ScalaJS.n.sci_HashMap$ = new ScalaJS.c.sci_HashMap$().init___()
  };
  return ScalaJS.n.sci_HashMap$
});
/** @constructor */
ScalaJS.c.sci_Seq$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.sci_Seq$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sci_Seq$.prototype.constructor = ScalaJS.c.sci_Seq$;
/** @constructor */
ScalaJS.h.sci_Seq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Seq$.prototype = ScalaJS.c.sci_Seq$.prototype;
ScalaJS.c.sci_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sci_Seq$ = new ScalaJS.ClassTypeData({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_Seq$.prototype.$classData = ScalaJS.d.sci_Seq$;
ScalaJS.n.sci_Seq$ = (void 0);
ScalaJS.m.sci_Seq$ = (function() {
  if ((!ScalaJS.n.sci_Seq$)) {
    ScalaJS.n.sci_Seq$ = new ScalaJS.c.sci_Seq$().init___()
  };
  return ScalaJS.n.sci_Seq$
});
/** @constructor */
ScalaJS.c.scm_IndexedSeq$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_IndexedSeq$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_IndexedSeq$.prototype.constructor = ScalaJS.c.scm_IndexedSeq$;
/** @constructor */
ScalaJS.h.scm_IndexedSeq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_IndexedSeq$.prototype = ScalaJS.c.scm_IndexedSeq$.prototype;
ScalaJS.c.scm_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ArrayBuffer().init___()
});
ScalaJS.d.scm_IndexedSeq$ = new ScalaJS.ClassTypeData({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.scm_IndexedSeq$.prototype.$classData = ScalaJS.d.scm_IndexedSeq$;
ScalaJS.n.scm_IndexedSeq$ = (void 0);
ScalaJS.m.scm_IndexedSeq$ = (function() {
  if ((!ScalaJS.n.scm_IndexedSeq$)) {
    ScalaJS.n.scm_IndexedSeq$ = new ScalaJS.c.scm_IndexedSeq$().init___()
  };
  return ScalaJS.n.scm_IndexedSeq$
});
/** @constructor */
ScalaJS.c.sjs_js_WrappedArray$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.sjs_js_WrappedArray$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sjs_js_WrappedArray$.prototype.constructor = ScalaJS.c.sjs_js_WrappedArray$;
/** @constructor */
ScalaJS.h.sjs_js_WrappedArray$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_WrappedArray$.prototype = ScalaJS.c.sjs_js_WrappedArray$.prototype;
ScalaJS.c.sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.sjs_js_WrappedArray().init___()
});
ScalaJS.d.sjs_js_WrappedArray$ = new ScalaJS.ClassTypeData({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sjs_js_WrappedArray$.prototype.$classData = ScalaJS.d.sjs_js_WrappedArray$;
ScalaJS.n.sjs_js_WrappedArray$ = (void 0);
ScalaJS.m.sjs_js_WrappedArray$ = (function() {
  if ((!ScalaJS.n.sjs_js_WrappedArray$)) {
    ScalaJS.n.sjs_js_WrappedArray$ = new ScalaJS.c.sjs_js_WrappedArray$().init___()
  };
  return ScalaJS.n.sjs_js_WrappedArray$
});
/** @constructor */
ScalaJS.c.s_math_Ordering$Double$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Ordering$Double$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Ordering$Double$.prototype.constructor = ScalaJS.c.s_math_Ordering$Double$;
/** @constructor */
ScalaJS.h.s_math_Ordering$Double$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Ordering$Double$.prototype = ScalaJS.c.s_math_Ordering$Double$.prototype;
ScalaJS.c.s_math_Ordering$Double$.prototype.init___ = (function() {
  ScalaJS.n.s_math_Ordering$Double$ = this;
  return this
});
ScalaJS.c.s_math_Ordering$Double$.prototype.compare__O__O__I = (function(x, y) {
  var x$1 = ScalaJS.uD(x);
  var y$1 = ScalaJS.uD(y);
  return ScalaJS.m.jl_Double$().compare__D__D__I(x$1, y$1)
});
ScalaJS.d.s_math_Ordering$Double$ = new ScalaJS.ClassTypeData({
  s_math_Ordering$Double$: 0
}, false, "scala.math.Ordering$Double$", {
  s_math_Ordering$Double$: 1,
  O: 1,
  s_math_Ordering$DoubleOrdering: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Ordering$Double$.prototype.$classData = ScalaJS.d.s_math_Ordering$Double$;
ScalaJS.n.s_math_Ordering$Double$ = (void 0);
ScalaJS.m.s_math_Ordering$Double$ = (function() {
  if ((!ScalaJS.n.s_math_Ordering$Double$)) {
    ScalaJS.n.s_math_Ordering$Double$ = new ScalaJS.c.s_math_Ordering$Double$().init___()
  };
  return ScalaJS.n.s_math_Ordering$Double$
});
/** @constructor */
ScalaJS.c.s_math_Ordering$String$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Ordering$String$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Ordering$String$.prototype.constructor = ScalaJS.c.s_math_Ordering$String$;
/** @constructor */
ScalaJS.h.s_math_Ordering$String$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Ordering$String$.prototype = ScalaJS.c.s_math_Ordering$String$.prototype;
ScalaJS.c.s_math_Ordering$String$.prototype.init___ = (function() {
  ScalaJS.n.s_math_Ordering$String$ = this;
  return this
});
ScalaJS.c.s_math_Ordering$String$.prototype.compare__O__O__I = (function(x, y) {
  var x$1 = ScalaJS.as.T(x);
  var y$1 = ScalaJS.as.T(y);
  return ((x$1 === y$1) ? 0 : (ScalaJS.uZ((x$1 < y$1)) ? (-1) : 1))
});
ScalaJS.d.s_math_Ordering$String$ = new ScalaJS.ClassTypeData({
  s_math_Ordering$String$: 0
}, false, "scala.math.Ordering$String$", {
  s_math_Ordering$String$: 1,
  O: 1,
  s_math_Ordering$StringOrdering: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Ordering$String$.prototype.$classData = ScalaJS.d.s_math_Ordering$String$;
ScalaJS.n.s_math_Ordering$String$ = (void 0);
ScalaJS.m.s_math_Ordering$String$ = (function() {
  if ((!ScalaJS.n.s_math_Ordering$String$)) {
    ScalaJS.n.s_math_Ordering$String$ = new ScalaJS.c.s_math_Ordering$String$().init___()
  };
  return ScalaJS.n.s_math_Ordering$String$
});
/** @constructor */
ScalaJS.c.s_reflect_AnyValManifest = (function() {
  ScalaJS.c.O.call(this);
  this.toString$1 = null;
  this.hashCode$1 = 0
});
ScalaJS.c.s_reflect_AnyValManifest.prototype = new ScalaJS.h.O();
ScalaJS.c.s_reflect_AnyValManifest.prototype.constructor = ScalaJS.c.s_reflect_AnyValManifest;
/** @constructor */
ScalaJS.h.s_reflect_AnyValManifest = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_AnyValManifest.prototype = ScalaJS.c.s_reflect_AnyValManifest.prototype;
ScalaJS.c.s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
ScalaJS.c.s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.toString$1
});
ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T = (function(toString) {
  this.toString$1 = toString;
  this.hashCode$1 = ScalaJS.systemIdentityHashCode(this);
  return this
});
ScalaJS.c.s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return this.hashCode$1
});
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest = (function() {
  ScalaJS.c.O.call(this);
  this.prefix$1 = null;
  this.runtimeClass$1 = null;
  this.typeArguments$1 = null
});
ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest.prototype = new ScalaJS.h.O();
ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$ClassTypeManifest = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$ClassTypeManifest.prototype = ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest.prototype;
ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest.prototype.runtimeClass__jl_Class = (function() {
  return this.runtimeClass$1
});
ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest.prototype.init___s_Option__jl_Class__sci_List = (function(prefix, runtimeClass, typeArguments) {
  this.prefix$1 = prefix;
  this.runtimeClass$1 = runtimeClass;
  this.typeArguments$1 = typeArguments;
  return this
});
/** @constructor */
ScalaJS.c.sc_IndexedSeq$ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.call(this);
  this.ReusableCBF$6 = null
});
ScalaJS.c.sc_IndexedSeq$.prototype = new ScalaJS.h.scg_IndexedSeqFactory();
ScalaJS.c.sc_IndexedSeq$.prototype.constructor = ScalaJS.c.sc_IndexedSeq$;
/** @constructor */
ScalaJS.h.sc_IndexedSeq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_IndexedSeq$.prototype = ScalaJS.c.sc_IndexedSeq$.prototype;
ScalaJS.c.sc_IndexedSeq$.prototype.init___ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.prototype.init___.call(this);
  ScalaJS.n.sc_IndexedSeq$ = this;
  this.ReusableCBF$6 = new ScalaJS.c.sc_IndexedSeq$$anon$1().init___();
  return this
});
ScalaJS.c.sc_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_IndexedSeq$();
  ScalaJS.m.sci_Vector$();
  return new ScalaJS.c.sci_VectorBuilder().init___()
});
ScalaJS.d.sc_IndexedSeq$ = new ScalaJS.ClassTypeData({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sc_IndexedSeq$.prototype.$classData = ScalaJS.d.sc_IndexedSeq$;
ScalaJS.n.sc_IndexedSeq$ = (void 0);
ScalaJS.m.sc_IndexedSeq$ = (function() {
  if ((!ScalaJS.n.sc_IndexedSeq$)) {
    ScalaJS.n.sc_IndexedSeq$ = new ScalaJS.c.sc_IndexedSeq$().init___()
  };
  return ScalaJS.n.sc_IndexedSeq$
});
/** @constructor */
ScalaJS.c.sc_IndexedSeqLike$Elements = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$f = null
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.constructor = ScalaJS.c.sc_IndexedSeqLike$Elements;
/** @constructor */
ScalaJS.h.sc_IndexedSeqLike$Elements = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_IndexedSeqLike$Elements.prototype = ScalaJS.c.sc_IndexedSeqLike$Elements.prototype;
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    ScalaJS.m.sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$f.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  this.index$2 = start;
  return this
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
ScalaJS.d.sc_IndexedSeqLike$Elements = new ScalaJS.ClassTypeData({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.$classData = ScalaJS.d.sc_IndexedSeqLike$Elements;
/** @constructor */
ScalaJS.c.sci_HashSet$ = (function() {
  ScalaJS.c.scg_ImmutableSetFactory.call(this)
});
ScalaJS.c.sci_HashSet$.prototype = new ScalaJS.h.scg_ImmutableSetFactory();
ScalaJS.c.sci_HashSet$.prototype.constructor = ScalaJS.c.sci_HashSet$;
/** @constructor */
ScalaJS.h.sci_HashSet$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashSet$.prototype = ScalaJS.c.sci_HashSet$.prototype;
ScalaJS.c.sci_HashSet$.prototype.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet = (function(hash0, elem0, hash1, elem1, level) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = ScalaJS.newArrayObject(ScalaJS.d.sci_HashSet.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.u[0] = elem0;
      elems.u[1] = elem1
    } else {
      elems.u[0] = elem1;
      elems.u[1] = elem0
    };
    return new ScalaJS.c.sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap, elems, ((elem0.size__I() + elem1.size__I()) | 0))
  } else {
    var elems$2 = ScalaJS.newArrayObject(ScalaJS.d.sci_HashSet.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    var child = this.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, ((5 + level) | 0));
    elems$2.u[0] = child;
    return new ScalaJS.c.sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap$2, elems$2, child.size0$5)
  }
});
ScalaJS.c.sci_HashSet$.prototype.emptyInstance__sci_Set = (function() {
  return ScalaJS.m.sci_HashSet$EmptyHashSet$()
});
ScalaJS.d.sci_HashSet$ = new ScalaJS.ClassTypeData({
  sci_HashSet$: 0
}, false, "scala.collection.immutable.HashSet$", {
  sci_HashSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_HashSet$.prototype.$classData = ScalaJS.d.sci_HashSet$;
ScalaJS.n.sci_HashSet$ = (void 0);
ScalaJS.m.sci_HashSet$ = (function() {
  if ((!ScalaJS.n.sci_HashSet$)) {
    ScalaJS.n.sci_HashSet$ = new ScalaJS.c.sci_HashSet$().init___()
  };
  return ScalaJS.n.sci_HashSet$
});
/** @constructor */
ScalaJS.c.sci_IndexedSeq$ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.call(this)
});
ScalaJS.c.sci_IndexedSeq$.prototype = new ScalaJS.h.scg_IndexedSeqFactory();
ScalaJS.c.sci_IndexedSeq$.prototype.constructor = ScalaJS.c.sci_IndexedSeq$;
/** @constructor */
ScalaJS.h.sci_IndexedSeq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_IndexedSeq$.prototype = ScalaJS.c.sci_IndexedSeq$.prototype;
ScalaJS.c.sci_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_Vector$();
  return new ScalaJS.c.sci_VectorBuilder().init___()
});
ScalaJS.d.sci_IndexedSeq$ = new ScalaJS.ClassTypeData({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_IndexedSeq$.prototype.$classData = ScalaJS.d.sci_IndexedSeq$;
ScalaJS.n.sci_IndexedSeq$ = (void 0);
ScalaJS.m.sci_IndexedSeq$ = (function() {
  if ((!ScalaJS.n.sci_IndexedSeq$)) {
    ScalaJS.n.sci_IndexedSeq$ = new ScalaJS.c.sci_IndexedSeq$().init___()
  };
  return ScalaJS.n.sci_IndexedSeq$
});
/** @constructor */
ScalaJS.c.sci_ListSet$ = (function() {
  ScalaJS.c.scg_ImmutableSetFactory.call(this)
});
ScalaJS.c.sci_ListSet$.prototype = new ScalaJS.h.scg_ImmutableSetFactory();
ScalaJS.c.sci_ListSet$.prototype.constructor = ScalaJS.c.sci_ListSet$;
/** @constructor */
ScalaJS.h.sci_ListSet$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListSet$.prototype = ScalaJS.c.sci_ListSet$.prototype;
ScalaJS.c.sci_ListSet$.prototype.emptyInstance__sci_Set = (function() {
  return ScalaJS.m.sci_ListSet$EmptyListSet$()
});
ScalaJS.c.sci_ListSet$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.sci_ListSet$ListSetBuilder().init___()
});
ScalaJS.d.sci_ListSet$ = new ScalaJS.ClassTypeData({
  sci_ListSet$: 0
}, false, "scala.collection.immutable.ListSet$", {
  sci_ListSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_ListSet$.prototype.$classData = ScalaJS.d.sci_ListSet$;
ScalaJS.n.sci_ListSet$ = (void 0);
ScalaJS.m.sci_ListSet$ = (function() {
  if ((!ScalaJS.n.sci_ListSet$)) {
    ScalaJS.n.sci_ListSet$ = new ScalaJS.c.sci_ListSet$().init___()
  };
  return ScalaJS.n.sci_ListSet$
});
/** @constructor */
ScalaJS.c.scm_HashSet$ = (function() {
  ScalaJS.c.scg_MutableSetFactory.call(this)
});
ScalaJS.c.scm_HashSet$.prototype = new ScalaJS.h.scg_MutableSetFactory();
ScalaJS.c.scm_HashSet$.prototype.constructor = ScalaJS.c.scm_HashSet$;
/** @constructor */
ScalaJS.h.scm_HashSet$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_HashSet$.prototype = ScalaJS.c.scm_HashSet$.prototype;
ScalaJS.c.scm_HashSet$.prototype.empty__sc_GenTraversable = (function() {
  return new ScalaJS.c.scm_HashSet().init___()
});
ScalaJS.d.scm_HashSet$ = new ScalaJS.ClassTypeData({
  scm_HashSet$: 0
}, false, "scala.collection.mutable.HashSet$", {
  scm_HashSet$: 1,
  scg_MutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_HashSet$.prototype.$classData = ScalaJS.d.scm_HashSet$;
ScalaJS.n.scm_HashSet$ = (void 0);
ScalaJS.m.scm_HashSet$ = (function() {
  if ((!ScalaJS.n.scm_HashSet$)) {
    ScalaJS.n.scm_HashSet$ = new ScalaJS.c.scm_HashSet$().init___()
  };
  return ScalaJS.n.scm_HashSet$
});
/** @constructor */
ScalaJS.c.sjs_js_JavaScriptException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this);
  this.exception$4 = null
});
ScalaJS.c.sjs_js_JavaScriptException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.sjs_js_JavaScriptException.prototype.constructor = ScalaJS.c.sjs_js_JavaScriptException;
/** @constructor */
ScalaJS.h.sjs_js_JavaScriptException = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_JavaScriptException.prototype = ScalaJS.c.sjs_js_JavaScriptException.prototype;
ScalaJS.c.sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  ScalaJS.m.sjsr_StackTrace$().captureState__jl_Throwable__O__V(this, this.exception$4);
  return this
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = ScalaJS.as.sjs_js_JavaScriptException(x$1);
    return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.exception$4;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.toString__T = (function() {
  return ScalaJS.objectToString(this.exception$4)
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  ScalaJS.c.jl_RuntimeException.prototype.init___.call(this);
  return this
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.sjs_js_JavaScriptException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
});
ScalaJS.as.sjs_js_JavaScriptException = (function(obj) {
  return ((ScalaJS.is.sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
});
ScalaJS.isArrayOf.sjs_js_JavaScriptException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
});
ScalaJS.asArrayOf.sjs_js_JavaScriptException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
});
ScalaJS.d.sjs_js_JavaScriptException = new ScalaJS.ClassTypeData({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.$classData = ScalaJS.d.sjs_js_JavaScriptException;
/** @constructor */
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile = (function() {
  ScalaJS.c.O.call(this);
  this.id$1 = null;
  this.kind$1 = null;
  this.nature$1 = null;
  this.energy$1 = 0.0;
  this.fertility$1 = 0.0;
  this.acc$1 = null;
  this.vel$1 = null;
  this.rawPos$1 = null;
  this.pos$1 = null;
  this.size$1 = 0.0;
  this.strength$1 = 0.0;
  this.damage$1 = 0.0;
  this.maxSpeed$1 = 0.0;
  this.maxForce$1 = 0.0;
  this.maxEnergy$1 = 0.0;
  this.healing$1 = 0.0;
  this.nutrition$1 = 0.0;
  this.friction$1 = 0.0;
  this.box$1 = null;
  this.asMotile$1 = null;
  this.bitmap$0$1 = 0
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype = new ScalaJS.h.O();
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.constructor = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile;
/** @constructor */
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Motile = (function() {
  /*<skip>*/
});
ScalaJS.h.Lcom_benjaminrosenbaum_jovian_Motile.prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype;
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.maxSpeed__D = (function() {
  return (((8 & this.bitmap$0$1) === 0) ? this.maxSpeed$lzycompute__p1__D() : this.maxSpeed$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.productPrefix__T = (function() {
  return "Motile"
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.addEnergy__D__Lcom_benjaminrosenbaum_jovian_Motile = (function(e) {
  var x = (this.energy$1 + e);
  var y = this.maxEnergy__D();
  var x$1 = ((x < y) ? x : y);
  var x$2 = this.id$1;
  var x$3 = this.kind$1;
  var x$4 = this.nature$1;
  var x$5 = this.fertility$1;
  var x$6 = this.acc$1;
  var x$7 = this.vel$1;
  var x$8 = this.rawPos$1;
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile().init___T__T__Lcom_benjaminrosenbaum_jovian_Nature__D__D__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point(x$2, x$3, x$4, x$1, x$5, x$6, x$7, x$8)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.moveTo__Lcom_benjaminrosenbaum_jovian_Point__Lcom_benjaminrosenbaum_jovian_Motile = (function(p) {
  var x$18 = this.id$1;
  var x$19 = this.kind$1;
  var x$20 = this.nature$1;
  var x$21 = this.energy$1;
  var x$22 = this.fertility$1;
  var x$23 = this.acc$1;
  var x$24 = this.vel$1;
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile().init___T__T__Lcom_benjaminrosenbaum_jovian_Nature__D__D__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point(x$18, x$19, x$20, x$21, x$22, x$23, x$24, p)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.productArity__I = (function() {
  return 8
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.glide__p1__Lcom_benjaminrosenbaum_jovian_Motile = (function() {
  return this.moveTo__Lcom_benjaminrosenbaum_jovian_Point__Lcom_benjaminrosenbaum_jovian_Motile(ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Point(this.pos$1.plus__Lcom_benjaminrosenbaum_jovian_Coords__Lcom_benjaminrosenbaum_jovian_Coords(this.vel$1)))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.setAcceleration__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile = (function(a) {
  var x$33 = a.capMagnitudeAt__D__Lcom_benjaminrosenbaum_jovian_Vector(this.maxForce__D());
  var x$34 = this.id$1;
  var x$35 = this.kind$1;
  var x$36 = this.nature$1;
  var x$37 = this.energy$1;
  var x$38 = this.fertility$1;
  var x$39 = this.vel$1;
  var x$40 = this.rawPos$1;
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile().init___T__T__Lcom_benjaminrosenbaum_jovian_Nature__D__D__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point(x$34, x$35, x$36, x$37, x$38, x$33, x$39, x$40)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.damage$lzycompute__p1__D = (function() {
  if (((4 & this.bitmap$0$1) === 0)) {
    this.damage$1 = (this.strength__D() / 5);
    this.bitmap$0$1 = (4 | this.bitmap$0$1)
  };
  return this.damage$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.wound__D__Lcom_benjaminrosenbaum_jovian_Motile = (function(damage) {
  return this.addEnergy__D__Lcom_benjaminrosenbaum_jovian_Motile((-damage))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$rawPos__O = (function() {
  return this.rawPos$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.size__D = (function() {
  return (((1 & this.bitmap$0$1) === 0) ? this.size$lzycompute__p1__D() : this.size$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.healing$lzycompute__p1__D = (function() {
  if (((64 & this.bitmap$0$1) === 0)) {
    this.healing$1 = this.nature$1.life$1.healing$1;
    this.bitmap$0$1 = (64 | this.bitmap$0$1)
  };
  return this.healing$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Motile(x$1)) {
    var Motile$1 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motile(x$1);
    if (((this.id$1 === Motile$1.id$1) && (this.kind$1 === Motile$1.kind$1))) {
      var x = this.nature$1;
      var x$2 = Motile$1.nature$1;
      var jsx$3 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
    } else {
      var jsx$3 = false
    };
    if (((jsx$3 && (this.energy$1 === Motile$1.energy$1)) && (this.fertility$1 === Motile$1.fertility$1))) {
      var x$3 = this.acc$1;
      var x$4 = Motile$1.acc$1;
      var jsx$2 = (x$3 === x$4)
    } else {
      var jsx$2 = false
    };
    if (jsx$2) {
      var x$5 = this.vel$1;
      var x$6 = Motile$1.vel$1;
      var jsx$1 = (x$5 === x$6)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$7 = this.rawPos$1;
      var x$8 = Motile$1.rawPos$1;
      return (x$7 === x$8)
    } else {
      return false
    }
  } else {
    return false
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.maxEnergy__D = (function() {
  return (((32 & this.bitmap$0$1) === 0) ? this.maxEnergy$lzycompute__p1__D() : this.maxEnergy$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.addVelocity__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile = (function(v) {
  return this.setVelocity__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile(ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this.vel$1.plus__Lcom_benjaminrosenbaum_jovian_Coords__Lcom_benjaminrosenbaum_jovian_Coords(v)))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.canEat__Lcom_benjaminrosenbaum_jovian_Colliding__Z = (function(c) {
  var this$1 = this.nature$1.edibleKinds__sci_List();
  var elem = c.kind$1;
  return ScalaJS.s.sc_LinearSeqOptimized$class__contains__sc_LinearSeqOptimized__O__Z(this$1, elem)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.id$1;
        break
      };
    case 1:
      {
        return this.kind$1;
        break
      };
    case 2:
      {
        return this.nature$1;
        break
      };
    case 3:
      {
        return this.energy$1;
        break
      };
    case 4:
      {
        return this.fertility$1;
        break
      };
    case 5:
      {
        return this.acc$1;
        break
      };
    case 6:
      {
        return this.vel$1;
        break
      };
    case 7:
      {
        return this.rawPos$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$nature__O = (function() {
  return this.nature$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$fertility__O = (function() {
  return this.fertility$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.size$lzycompute__p1__D = (function() {
  if (((1 & this.bitmap$0$1) === 0)) {
    this.size$1 = this.nature$1.size$1;
    this.bitmap$0$1 = (1 | this.bitmap$0$1)
  };
  return this.size$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$energy__O = (function() {
  return this.energy$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.step__Lcom_benjaminrosenbaum_jovian_Motile = (function() {
  var this$1 = this.addVelocity__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile(this.acc$1).glide__p1__Lcom_benjaminrosenbaum_jovian_Motile();
  return this$1.addEnergy__D__Lcom_benjaminrosenbaum_jovian_Motile(this$1.healing__D())
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$kind__O = (function() {
  return this.kind$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.nutrition$lzycompute__p1__D = (function() {
  if (((128 & this.bitmap$0$1) === 0)) {
    this.nutrition$1 = this.nature$1.life$1.nutrition$1;
    this.bitmap$0$1 = (128 | this.bitmap$0$1)
  };
  return this.nutrition$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.init___T__T__Lcom_benjaminrosenbaum_jovian_Nature__D__D__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point = (function(id, kind, nature, energy, fertility, acc, vel, rawPos) {
  this.id$1 = id;
  this.kind$1 = kind;
  this.nature$1 = nature;
  this.energy$1 = energy;
  this.fertility$1 = fertility;
  this.acc$1 = acc;
  this.vel$1 = vel;
  this.rawPos$1 = rawPos;
  this.pos$1 = rawPos.constrainToPlane__Lcom_benjaminrosenbaum_jovian_Point();
  this.asMotile$1 = this;
  return this
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.addAcceleration__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile = (function(a) {
  return this.setAcceleration__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile(ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this.acc$1.plus__Lcom_benjaminrosenbaum_jovian_Coords__Lcom_benjaminrosenbaum_jovian_Coords(a)))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.strength$lzycompute__p1__D = (function() {
  if (((2 & this.bitmap$0$1) === 0)) {
    this.strength$1 = this.nature$1.size$1;
    this.bitmap$0$1 = (2 | this.bitmap$0$1)
  };
  return this.strength$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.maxSpeed$lzycompute__p1__D = (function() {
  if (((8 & this.bitmap$0$1) === 0)) {
    this.maxSpeed$1 = this.nature$1.kinetics$1.maxSpeed$1;
    this.bitmap$0$1 = (8 | this.bitmap$0$1)
  };
  return this.maxSpeed$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.friction$lzycompute__p1__D = (function() {
  if (((256 & this.bitmap$0$1) === 0)) {
    this.friction$1 = this.nature$1.kinetics$1.friction$1;
    this.bitmap$0$1 = (256 | this.bitmap$0$1)
  };
  return this.friction$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.nutrition__D = (function() {
  return (((128 & this.bitmap$0$1) === 0) ? this.nutrition$lzycompute__p1__D() : this.nutrition$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.damage__D = (function() {
  return (((4 & this.bitmap$0$1) === 0) ? this.damage$lzycompute__p1__D() : this.damage$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.box$lzycompute__p1__Lcom_benjaminrosenbaum_jovian_Square = (function() {
  if (((512 & this.bitmap$0$1) === 0)) {
    this.box$1 = new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Square().init___Lcom_benjaminrosenbaum_jovian_Point__D(this.pos$1, this.size__D());
    this.bitmap$0$1 = (512 | this.bitmap$0$1)
  };
  return this.box$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.healing__D = (function() {
  return (((64 & this.bitmap$0$1) === 0) ? this.healing$lzycompute__p1__D() : this.healing$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Motile = (function(ms) {
  return this.setAcceleration__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile(this.nature$1.motivation$1.apply__Lcom_benjaminrosenbaum_jovian_Motivated__sc_Seq__Lcom_benjaminrosenbaum_jovian_Vector(this, ms))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.inEnvironment__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile = (function(wind) {
  ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Vector$();
  var jsx$3 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$();
  var this$1 = this.pos$1;
  var jsx$2 = jsx$3.intoLeft__D__D(this$1.x$1);
  var jsx$1 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$();
  var this$2 = this.pos$1;
  var x = (jsx$2 - jsx$1.intoRight__D__D(this$2.x$1));
  var jsx$4 = ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Plane$();
  var this$3 = this.pos$1;
  var y = (-jsx$4.intoBottom__D__D(this$3.y$1));
  var borderWind = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Vector().init___D__D(x, y).scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(8.0));
  var drag = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(this.vel$1.scaled__D__Lcom_benjaminrosenbaum_jovian_Coords(((-this.friction__D()) * this.acc$1.magnitude__D())));
  return this.addAcceleration__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile(drag).addVelocity__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile(ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(wind.plus__Lcom_benjaminrosenbaum_jovian_Coords__Lcom_benjaminrosenbaum_jovian_Coords(borderWind)))
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.maxForce__D = (function() {
  return (((16 & this.bitmap$0$1) === 0) ? this.maxForce$lzycompute__p1__D() : this.maxForce$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$id__O = (function() {
  return this.id$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.pos__Lcom_benjaminrosenbaum_jovian_Point = (function() {
  return this.pos$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$pos__O = (function() {
  return this.pos$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.nourish__D__Lcom_benjaminrosenbaum_jovian_Motile = (function(nutrition) {
  var energized = this.addEnergy__D__Lcom_benjaminrosenbaum_jovian_Motile(nutrition);
  var y = ((-15.0) + nutrition);
  var fertilizer = (((0.0 > y) ? 0.0 : y) / 4);
  var fertilized = energized.addFertility__D__Lcom_benjaminrosenbaum_jovian_Motile(fertilizer);
  var this$3 = ScalaJS.m.s_Console$();
  var x = ((((((("Added " + fertilizer) + " fertility to ") + this.id$1) + " from ") + nutrition) + " nutrition, result = ") + fertilized.fertility$1);
  var this$4 = this$3.outVar$2;
  ScalaJS.as.Ljava_io_PrintStream(this$4.tl$1.get__O()).println__O__V(x);
  return fertilized
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.addFertility__D__Lcom_benjaminrosenbaum_jovian_Motile = (function(f) {
  var x = (this.fertility$1 + f);
  var x$9 = ((x < 100.0) ? x : 100.0);
  var x$10 = this.id$1;
  var x$11 = this.kind$1;
  var x$12 = this.nature$1;
  var x$13 = this.energy$1;
  var x$14 = this.acc$1;
  var x$15 = this.vel$1;
  var x$16 = this.rawPos$1;
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile().init___T__T__Lcom_benjaminrosenbaum_jovian_Nature__D__D__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point(x$10, x$11, x$12, x$13, x$9, x$14, x$15, x$16)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.id$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.kind$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.nature$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.energy$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().doubleHash__D__I(this.fertility$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.acc$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.vel$1));
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, ScalaJS.m.sr_Statics$().anyHash__O__I(this.rawPos$1));
  return ScalaJS.m.sr_Statics$().finalizeHash__I__I__I(acc, 8)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.friction__D = (function() {
  return (((256 & this.bitmap$0$1) === 0) ? this.friction$lzycompute__p1__D() : this.friction$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.maxEnergy$lzycompute__p1__D = (function() {
  if (((32 & this.bitmap$0$1) === 0)) {
    this.maxEnergy$1 = this.nature$1.life$1.maxEnergy$1;
    this.bitmap$0$1 = (32 | this.bitmap$0$1)
  };
  return this.maxEnergy$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$vel__O = (function() {
  return this.vel$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.box__Lcom_benjaminrosenbaum_jovian_Square = (function() {
  return (((512 & this.bitmap$0$1) === 0) ? this.box$lzycompute__p1__Lcom_benjaminrosenbaum_jovian_Square() : this.box$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.setVelocity__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Motile = (function(v) {
  var x$25 = v.capMagnitudeAt__D__Lcom_benjaminrosenbaum_jovian_Vector(this.maxSpeed__D());
  var x$26 = this.id$1;
  var x$27 = this.kind$1;
  var x$28 = this.nature$1;
  var x$29 = this.energy$1;
  var x$30 = this.fertility$1;
  var x$31 = this.acc$1;
  var x$32 = this.rawPos$1;
  return new ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile().init___T__T__Lcom_benjaminrosenbaum_jovian_Nature__D__D__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point(x$26, x$27, x$28, x$29, x$30, x$31, x$25, x$32)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.strength__D = (function() {
  return (((2 & this.bitmap$0$1) === 0) ? this.strength$lzycompute__p1__D() : this.strength$1)
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.maxForce$lzycompute__p1__D = (function() {
  if (((16 & this.bitmap$0$1) === 0)) {
    this.maxForce$1 = this.nature$1.kinetics$1.maxForce$1;
    this.bitmap$0$1 = (16 | this.bitmap$0$1)
  };
  return this.maxForce$1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$$js$exported$prop$acc__O = (function() {
  return this.acc$1
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "id", {
  "get": (function() {
    return this.$$js$exported$prop$id__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "kind", {
  "get": (function() {
    return this.$$js$exported$prop$kind__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "nature", {
  "get": (function() {
    return this.$$js$exported$prop$nature__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "energy", {
  "get": (function() {
    return this.$$js$exported$prop$energy__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "fertility", {
  "get": (function() {
    return this.$$js$exported$prop$fertility__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "acc", {
  "get": (function() {
    return this.$$js$exported$prop$acc__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "vel", {
  "get": (function() {
    return this.$$js$exported$prop$vel__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "rawPos", {
  "get": (function() {
    return this.$$js$exported$prop$rawPos__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype, "pos", {
  "get": (function() {
    return this.$$js$exported$prop$pos__O()
  }),
  "enumerable": true
});
ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Motile = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lcom_benjaminrosenbaum_jovian_Motile)))
});
ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Motile = (function(obj) {
  return ((ScalaJS.is.Lcom_benjaminrosenbaum_jovian_Motile(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "com.benjaminrosenbaum.jovian.Motile"))
});
ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Motile = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lcom_benjaminrosenbaum_jovian_Motile)))
});
ScalaJS.asArrayOf.Lcom_benjaminrosenbaum_jovian_Motile = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Lcom_benjaminrosenbaum_jovian_Motile(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lcom.benjaminrosenbaum.jovian.Motile;", depth))
});
ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Motile = new ScalaJS.ClassTypeData({
  Lcom_benjaminrosenbaum_jovian_Motile: 0
}, false, "com.benjaminrosenbaum.jovian.Motile", {
  Lcom_benjaminrosenbaum_jovian_Motile: 1,
  O: 1,
  Lcom_benjaminrosenbaum_jovian_Identity: 1,
  Lcom_benjaminrosenbaum_jovian_Position: 1,
  Lcom_benjaminrosenbaum_jovian_Colliding: 1,
  Lcom_benjaminrosenbaum_jovian_Motivated: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.$classData = ScalaJS.d.Lcom_benjaminrosenbaum_jovian_Motile;
ScalaJS.e["com"] = (ScalaJS.e["com"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"] = (ScalaJS.e["com"]["benjaminrosenbaum"] || {});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] = (ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"] || {});
/** @constructor */
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Motile"] = (function(arg$1, arg$2, arg$3, arg$4, arg$5, arg$6, arg$7, arg$8) {
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.call(this);
  var preparg$1 = ScalaJS.as.T(arg$1);
  var preparg$2 = ScalaJS.as.T(arg$2);
  var preparg$3 = ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Nature(arg$3);
  if ((arg$4 === null)) {
    var preparg$4;
    throw "Found null, expected Double"
  } else {
    var preparg$4 = ScalaJS.uD(arg$4)
  };
  if ((arg$5 === null)) {
    var preparg$5;
    throw "Found null, expected Double"
  } else {
    var preparg$5 = ScalaJS.uD(arg$5)
  };
  var preparg$6 = ((arg$6 === (void 0)) ? ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Motile$().$$lessinit$greater$default$6__Lcom_benjaminrosenbaum_jovian_Vector() : ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(arg$6));
  var preparg$7 = ((arg$7 === (void 0)) ? ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Motile$().$$lessinit$greater$default$7__Lcom_benjaminrosenbaum_jovian_Vector() : ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Vector(arg$7));
  var preparg$8 = ((arg$8 === (void 0)) ? ScalaJS.m.Lcom_benjaminrosenbaum_jovian_Motile$().$$lessinit$greater$default$8__Lcom_benjaminrosenbaum_jovian_Point() : ScalaJS.as.Lcom_benjaminrosenbaum_jovian_Point(arg$8));
  ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype.init___T__T__Lcom_benjaminrosenbaum_jovian_Nature__D__D__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Vector__Lcom_benjaminrosenbaum_jovian_Point.call(this, preparg$1, preparg$2, preparg$3, preparg$4, preparg$5, preparg$6, preparg$7, preparg$8)
});
ScalaJS.e["com"]["benjaminrosenbaum"]["jovian"]["Motile"].prototype = ScalaJS.c.Lcom_benjaminrosenbaum_jovian_Motile.prototype;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$10 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$10.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$10.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$10;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$10 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$10.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$10.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$10.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Long");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$10.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AJ(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$10.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.J.getClassOf()
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$10.prototype.newArray__I__AJ = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.J.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$10 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$10: 0
}, false, "scala.reflect.ManifestFactory$$anon$10", {
  s_reflect_ManifestFactory$$anon$10: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$10.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$10;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$11 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$11.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$11.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$11;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$11 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$11.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$11.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$11.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Float");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$11.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AF(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$11.prototype.newArray__I__AF = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.F.getArrayOf(), [len])
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$11.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.F.getClassOf()
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$11 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$11: 0
}, false, "scala.reflect.ManifestFactory$$anon$11", {
  s_reflect_ManifestFactory$$anon$11: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$11.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$11;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$12 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$12.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$12.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$12;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$12 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$12.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$12.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$12.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Double");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$12.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AD(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$12.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.D.getClassOf()
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$12.prototype.newArray__I__AD = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.D.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$12 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$12: 0
}, false, "scala.reflect.ManifestFactory$$anon$12", {
  s_reflect_ManifestFactory$$anon$12: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$12.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$12;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$13 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$13.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$13.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$13;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$13 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$13.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$13.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$13.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Boolean");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$13.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AZ(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$13.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.Z.getClassOf()
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$13.prototype.newArray__I__AZ = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.Z.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$13 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$13: 0
}, false, "scala.reflect.ManifestFactory$$anon$13", {
  s_reflect_ManifestFactory$$anon$13: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$13.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$13;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$14 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$14.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$14.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$14;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$14 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$14.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$14.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$14.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Unit");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$14.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__Asr_BoxedUnit(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$14.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.V.getClassOf()
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$14.prototype.newArray__I__Asr_BoxedUnit = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.sr_BoxedUnit.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$14 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$14: 0
}, false, "scala.reflect.ManifestFactory$$anon$14", {
  s_reflect_ManifestFactory$$anon$14: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$14.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$14;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$6 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$6.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$6.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$6;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$6 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$6.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$6.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$6.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Byte");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$6.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AB(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$6.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.B.getClassOf()
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$6.prototype.newArray__I__AB = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.B.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$6 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$6: 0
}, false, "scala.reflect.ManifestFactory$$anon$6", {
  s_reflect_ManifestFactory$$anon$6: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$6.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$6;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$7 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$7.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$7.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$7;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$7 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$7.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$7.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$7.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Short");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$7.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AS(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$7.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.S.getClassOf()
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$7.prototype.newArray__I__AS = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.S.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$7 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$7: 0
}, false, "scala.reflect.ManifestFactory$$anon$7", {
  s_reflect_ManifestFactory$$anon$7: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$7.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$7;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$8 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$8.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$8.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$8;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$8 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$8.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$8.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$8.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Char");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$8.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AC(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$8.prototype.newArray__I__AC = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.C.getArrayOf(), [len])
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$8.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.C.getClassOf()
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$8 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$8: 0
}, false, "scala.reflect.ManifestFactory$$anon$8", {
  s_reflect_ManifestFactory$$anon$8: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$8.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$8;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$9 = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$9.prototype = new ScalaJS.h.s_reflect_AnyValManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$9.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$9;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$9 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$9.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$9.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$9.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_AnyValManifest.prototype.init___T.call(this, "Int");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$9.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AI(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$9.prototype.newArray__I__AI = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.I.getArrayOf(), [len])
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$9.prototype.runtimeClass__jl_Class = (function() {
  return ScalaJS.d.I.getClassOf()
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$9 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$9: 0
}, false, "scala.reflect.ManifestFactory$$anon$9", {
  s_reflect_ManifestFactory$$anon$9: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$9.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$9;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest.call(this);
  this.toString$2 = null;
  this.hashCode$2 = 0
});
ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype = new ScalaJS.h.s_reflect_ManifestFactory$ClassTypeManifest();
ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$PhantomManifest = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$PhantomManifest.prototype = ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype;
ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.toString__T = (function() {
  return this.toString$2
});
ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.hashCode__I = (function() {
  return this.hashCode$2
});
ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T = (function(_runtimeClass, toString) {
  this.toString$2 = toString;
  ScalaJS.c.s_reflect_ManifestFactory$ClassTypeManifest.prototype.init___s_Option__jl_Class__sci_List.call(this, ScalaJS.m.s_None$(), _runtimeClass, ScalaJS.m.sci_Nil$());
  this.hashCode$2 = ScalaJS.systemIdentityHashCode(this);
  return this
});
ScalaJS.is.sc_IterableLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IterableLike)))
});
ScalaJS.as.sc_IterableLike = (function(obj) {
  return ((ScalaJS.is.sc_IterableLike(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.IterableLike"))
});
ScalaJS.isArrayOf.sc_IterableLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IterableLike)))
});
ScalaJS.asArrayOf.sc_IterableLike = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_IterableLike(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.IterableLike;", depth))
});
/** @constructor */
ScalaJS.c.sci_List$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this);
  this.partialNotApplied$5 = null
});
ScalaJS.c.sci_List$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sci_List$.prototype.constructor = ScalaJS.c.sci_List$;
/** @constructor */
ScalaJS.h.sci_List$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_List$.prototype = ScalaJS.c.sci_List$.prototype;
ScalaJS.c.sci_List$.prototype.init___ = (function() {
  ScalaJS.c.scg_SeqFactory.prototype.init___.call(this);
  ScalaJS.n.sci_List$ = this;
  this.partialNotApplied$5 = new ScalaJS.c.sci_List$$anon$1().init___();
  return this
});
ScalaJS.c.sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sci_List$ = new ScalaJS.ClassTypeData({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_List$.prototype.$classData = ScalaJS.d.sci_List$;
ScalaJS.n.sci_List$ = (void 0);
ScalaJS.m.sci_List$ = (function() {
  if ((!ScalaJS.n.sci_List$)) {
    ScalaJS.n.sci_List$ = new ScalaJS.c.sci_List$().init___()
  };
  return ScalaJS.n.sci_List$
});
/** @constructor */
ScalaJS.c.sci_Stream$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.sci_Stream$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sci_Stream$.prototype.constructor = ScalaJS.c.sci_Stream$;
/** @constructor */
ScalaJS.h.sci_Stream$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$.prototype = ScalaJS.c.sci_Stream$.prototype;
ScalaJS.c.sci_Stream$.prototype.filteredTail__sci_Stream__F1__sci_Stream$Cons = (function(stream, p) {
  var hd = stream.head__O();
  var tl = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, stream$1, p$1) {
    return (function() {
      return ScalaJS.as.sci_Stream(stream$1.tail__O()).filter__F1__sci_Stream(p$1)
    })
  })(this, stream, p));
  return new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd, tl)
});
ScalaJS.c.sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.sci_Stream$StreamBuilder().init___()
});
ScalaJS.d.sci_Stream$ = new ScalaJS.ClassTypeData({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Stream$.prototype.$classData = ScalaJS.d.sci_Stream$;
ScalaJS.n.sci_Stream$ = (void 0);
ScalaJS.m.sci_Stream$ = (function() {
  if ((!ScalaJS.n.sci_Stream$)) {
    ScalaJS.n.sci_Stream$ = new ScalaJS.c.sci_Stream$().init___()
  };
  return ScalaJS.n.sci_Stream$
});
/** @constructor */
ScalaJS.c.scm_ArrayBuffer$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_ArrayBuffer$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_ArrayBuffer$.prototype.constructor = ScalaJS.c.scm_ArrayBuffer$;
/** @constructor */
ScalaJS.h.scm_ArrayBuffer$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ArrayBuffer$.prototype = ScalaJS.c.scm_ArrayBuffer$.prototype;
ScalaJS.c.scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ArrayBuffer().init___()
});
ScalaJS.d.scm_ArrayBuffer$ = new ScalaJS.ClassTypeData({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ArrayBuffer$.prototype.$classData = ScalaJS.d.scm_ArrayBuffer$;
ScalaJS.n.scm_ArrayBuffer$ = (void 0);
ScalaJS.m.scm_ArrayBuffer$ = (function() {
  if ((!ScalaJS.n.scm_ArrayBuffer$)) {
    ScalaJS.n.scm_ArrayBuffer$ = new ScalaJS.c.scm_ArrayBuffer$().init___()
  };
  return ScalaJS.n.scm_ArrayBuffer$
});
/** @constructor */
ScalaJS.c.scm_ArraySeq$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_ArraySeq$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_ArraySeq$.prototype.constructor = ScalaJS.c.scm_ArraySeq$;
/** @constructor */
ScalaJS.h.scm_ArraySeq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ArraySeq$.prototype = ScalaJS.c.scm_ArraySeq$.prototype;
ScalaJS.c.scm_ArraySeq$.prototype.newBuilder__scm_Builder = (function() {
  var this$1 = new ScalaJS.c.scm_ArrayBuffer().init___();
  var f = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(buf$2) {
      var buf = ScalaJS.as.scm_ArrayBuffer(buf$2);
      var result = new ScalaJS.c.scm_ArraySeq().init___I(buf.size0$6);
      var xs = result.array$5;
      ScalaJS.s.sc_TraversableOnce$class__copyToArray__sc_TraversableOnce__O__I__V(buf, xs, 0);
      return result
    })
  })(this));
  return new ScalaJS.c.scm_Builder$$anon$1().init___scm_Builder__F1(this$1, f)
});
ScalaJS.d.scm_ArraySeq$ = new ScalaJS.ClassTypeData({
  scm_ArraySeq$: 0
}, false, "scala.collection.mutable.ArraySeq$", {
  scm_ArraySeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ArraySeq$.prototype.$classData = ScalaJS.d.scm_ArraySeq$;
ScalaJS.n.scm_ArraySeq$ = (void 0);
ScalaJS.m.scm_ArraySeq$ = (function() {
  if ((!ScalaJS.n.scm_ArraySeq$)) {
    ScalaJS.n.scm_ArraySeq$ = new ScalaJS.c.scm_ArraySeq$().init___()
  };
  return ScalaJS.n.scm_ArraySeq$
});
/** @constructor */
ScalaJS.c.scm_ListBuffer$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_ListBuffer$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_ListBuffer$.prototype.constructor = ScalaJS.c.scm_ListBuffer$;
/** @constructor */
ScalaJS.h.scm_ListBuffer$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ListBuffer$.prototype = ScalaJS.c.scm_ListBuffer$.prototype;
ScalaJS.c.scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_GrowingBuilder().init___scg_Growable(new ScalaJS.c.scm_ListBuffer().init___())
});
ScalaJS.d.scm_ListBuffer$ = new ScalaJS.ClassTypeData({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ListBuffer$.prototype.$classData = ScalaJS.d.scm_ListBuffer$;
ScalaJS.n.scm_ListBuffer$ = (void 0);
ScalaJS.m.scm_ListBuffer$ = (function() {
  if ((!ScalaJS.n.scm_ListBuffer$)) {
    ScalaJS.n.scm_ListBuffer$ = new ScalaJS.c.scm_ListBuffer$().init___()
  };
  return ScalaJS.n.scm_ListBuffer$
});
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$1 = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$1.prototype = new ScalaJS.h.s_reflect_ManifestFactory$PhantomManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$1.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$1;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$1.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$1.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$1.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, ScalaJS.m.s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$ObjectTYPE$1, "Any");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$1.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AO(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$1.prototype.newArray__I__AO = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$1 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$1: 0
}, false, "scala.reflect.ManifestFactory$$anon$1", {
  s_reflect_ManifestFactory$$anon$1: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$1.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$1;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$2 = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$2.prototype = new ScalaJS.h.s_reflect_ManifestFactory$PhantomManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$2.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$2;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$2 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$2.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$2.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$2.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, ScalaJS.m.s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$ObjectTYPE$1, "Object");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$2.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AO(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$2.prototype.newArray__I__AO = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$2 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$2: 0
}, false, "scala.reflect.ManifestFactory$$anon$2", {
  s_reflect_ManifestFactory$$anon$2: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$2.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$2;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$3 = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$3.prototype = new ScalaJS.h.s_reflect_ManifestFactory$PhantomManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$3.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$3;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$3 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$3.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$3.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$3.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, ScalaJS.m.s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$ObjectTYPE$1, "AnyVal");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$3.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AO(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$3.prototype.newArray__I__AO = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$3 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$3: 0
}, false, "scala.reflect.ManifestFactory$$anon$3", {
  s_reflect_ManifestFactory$$anon$3: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$3.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$3;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$4 = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$4.prototype = new ScalaJS.h.s_reflect_ManifestFactory$PhantomManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$4.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$4;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$4 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$4.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$4.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$4.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, ScalaJS.m.s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$NullTYPE$1, "Null");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$4.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AO(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$4.prototype.newArray__I__AO = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$4 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$4: 0
}, false, "scala.reflect.ManifestFactory$$anon$4", {
  s_reflect_ManifestFactory$$anon$4: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$4.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$4;
/** @constructor */
ScalaJS.c.s_reflect_ManifestFactory$$anon$5 = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.call(this)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$5.prototype = new ScalaJS.h.s_reflect_ManifestFactory$PhantomManifest();
ScalaJS.c.s_reflect_ManifestFactory$$anon$5.prototype.constructor = ScalaJS.c.s_reflect_ManifestFactory$$anon$5;
/** @constructor */
ScalaJS.h.s_reflect_ManifestFactory$$anon$5 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_reflect_ManifestFactory$$anon$5.prototype = ScalaJS.c.s_reflect_ManifestFactory$$anon$5.prototype;
ScalaJS.c.s_reflect_ManifestFactory$$anon$5.prototype.init___ = (function() {
  ScalaJS.c.s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, ScalaJS.m.s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$NothingTYPE$1, "Nothing");
  return this
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$5.prototype.newArray__I__O = (function(len) {
  return this.newArray__I__AO(len)
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$5.prototype.newArray__I__AO = (function(len) {
  return ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [len])
});
ScalaJS.d.s_reflect_ManifestFactory$$anon$5 = new ScalaJS.ClassTypeData({
  s_reflect_ManifestFactory$$anon$5: 0
}, false, "scala.reflect.ManifestFactory$$anon$5", {
  s_reflect_ManifestFactory$$anon$5: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
ScalaJS.c.s_reflect_ManifestFactory$$anon$5.prototype.$classData = ScalaJS.d.s_reflect_ManifestFactory$$anon$5;
ScalaJS.is.sc_GenMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenMap)))
});
ScalaJS.as.sc_GenMap = (function(obj) {
  return ((ScalaJS.is.sc_GenMap(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenMap"))
});
ScalaJS.isArrayOf.sc_GenMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenMap)))
});
ScalaJS.asArrayOf.sc_GenMap = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenMap(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenMap;", depth))
});
ScalaJS.is.sc_GenSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
});
ScalaJS.as.sc_GenSeq = (function(obj) {
  return ((ScalaJS.is.sc_GenSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenSeq"))
});
ScalaJS.isArrayOf.sc_GenSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
});
ScalaJS.asArrayOf.sc_GenSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
});
/** @constructor */
ScalaJS.c.sci_Vector$ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.call(this);
  this.NIL$6 = null;
  this.Log2ConcatFaster$6 = 0;
  this.TinyAppendFaster$6 = 0
});
ScalaJS.c.sci_Vector$.prototype = new ScalaJS.h.scg_IndexedSeqFactory();
ScalaJS.c.sci_Vector$.prototype.constructor = ScalaJS.c.sci_Vector$;
/** @constructor */
ScalaJS.h.sci_Vector$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Vector$.prototype = ScalaJS.c.sci_Vector$.prototype;
ScalaJS.c.sci_Vector$.prototype.init___ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.prototype.init___.call(this);
  ScalaJS.n.sci_Vector$ = this;
  this.NIL$6 = new ScalaJS.c.sci_Vector().init___I__I__I(0, 0, 0);
  return this
});
ScalaJS.c.sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.sci_VectorBuilder().init___()
});
ScalaJS.d.sci_Vector$ = new ScalaJS.ClassTypeData({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Vector$.prototype.$classData = ScalaJS.d.sci_Vector$;
ScalaJS.n.sci_Vector$ = (void 0);
ScalaJS.m.sci_Vector$ = (function() {
  if ((!ScalaJS.n.sci_Vector$)) {
    ScalaJS.n.sci_Vector$ = new ScalaJS.c.sci_Vector$().init___()
  };
  return ScalaJS.n.sci_Vector$
});
/** @constructor */
ScalaJS.c.sc_AbstractTraversable = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_AbstractTraversable.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_AbstractTraversable.prototype.constructor = ScalaJS.c.sc_AbstractTraversable;
/** @constructor */
ScalaJS.h.sc_AbstractTraversable = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractTraversable.prototype = ScalaJS.c.sc_AbstractTraversable.prototype;
ScalaJS.c.sc_AbstractTraversable.prototype.toList__sci_List = (function() {
  var this$1 = ScalaJS.m.sci_List$();
  var cbf = this$1.ReusableCBFInstance$2;
  return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(this, cbf))
});
ScalaJS.c.sc_AbstractTraversable.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return ScalaJS.s.sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
});
ScalaJS.c.sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
ScalaJS.c.sc_AbstractTraversable.prototype.foldLeft__O__F2__O = (function(z, op) {
  return ScalaJS.s.sc_TraversableOnce$class__foldLeft__sc_TraversableOnce__O__F2__O(this, z, op)
});
ScalaJS.c.sc_AbstractTraversable.prototype.filter__F1__O = (function(p) {
  return ScalaJS.s.sc_TraversableLike$class__filterImpl__p0__sc_TraversableLike__F1__Z__O(this, p, false)
});
ScalaJS.c.sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.c.sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
ScalaJS.c.sc_AbstractTraversable.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return ScalaJS.s.sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
});
ScalaJS.c.sc_AbstractTraversable.prototype.newBuilder__scm_Builder = (function() {
  return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
ScalaJS.c.sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T(this)
});
ScalaJS.is.sc_GenSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSet)))
});
ScalaJS.as.sc_GenSet = (function(obj) {
  return ((ScalaJS.is.sc_GenSet(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenSet"))
});
ScalaJS.isArrayOf.sc_GenSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSet)))
});
ScalaJS.asArrayOf.sc_GenSet = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenSet(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenSet;", depth))
});
ScalaJS.is.sc_IndexedSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
});
ScalaJS.as.sc_IndexedSeqLike = (function(obj) {
  return ((ScalaJS.is.sc_IndexedSeqLike(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
});
ScalaJS.isArrayOf.sc_IndexedSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
});
ScalaJS.asArrayOf.sc_IndexedSeqLike = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
});
ScalaJS.is.sc_LinearSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
});
ScalaJS.as.sc_LinearSeqLike = (function(obj) {
  return ((ScalaJS.is.sc_LinearSeqLike(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.LinearSeqLike"))
});
ScalaJS.isArrayOf.sc_LinearSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
});
ScalaJS.asArrayOf.sc_LinearSeqLike = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_LinearSeqLike(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.LinearSeqLike;", depth))
});
ScalaJS.is.sc_LinearSeqOptimized = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
});
ScalaJS.as.sc_LinearSeqOptimized = (function(obj) {
  return ((ScalaJS.is.sc_LinearSeqOptimized(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.LinearSeqOptimized"))
});
ScalaJS.isArrayOf.sc_LinearSeqOptimized = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
});
ScalaJS.asArrayOf.sc_LinearSeqOptimized = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_LinearSeqOptimized(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.LinearSeqOptimized;", depth))
});
/** @constructor */
ScalaJS.c.sc_AbstractIterable = (function() {
  ScalaJS.c.sc_AbstractTraversable.call(this)
});
ScalaJS.c.sc_AbstractIterable.prototype = new ScalaJS.h.sc_AbstractTraversable();
ScalaJS.c.sc_AbstractIterable.prototype.constructor = ScalaJS.c.sc_AbstractIterable;
/** @constructor */
ScalaJS.h.sc_AbstractIterable = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractIterable.prototype = ScalaJS.c.sc_AbstractIterable.prototype;
ScalaJS.c.sc_AbstractIterable.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sc_AbstractIterable.prototype.exists__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return ScalaJS.s.sc_Iterator$class__exists__sc_Iterator__F1__Z(this$1, p)
});
ScalaJS.c.sc_AbstractIterable.prototype.forall__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return ScalaJS.s.sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, p)
});
ScalaJS.c.sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this$1, f)
});
ScalaJS.c.sc_AbstractIterable.prototype.take__I__O = (function(n) {
  return ScalaJS.s.sc_IterableLike$class__take__sc_IterableLike__I__O(this, n)
});
ScalaJS.c.sc_AbstractIterable.prototype.toStream__sci_Stream = (function() {
  return this.iterator__sc_Iterator().toStream__sci_Stream()
});
ScalaJS.c.sc_AbstractIterable.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V(this, xs, start, len)
});
ScalaJS.is.sci_Iterable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
});
ScalaJS.as.sci_Iterable = (function(obj) {
  return ((ScalaJS.is.sci_Iterable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.Iterable"))
});
ScalaJS.isArrayOf.sci_Iterable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
});
ScalaJS.asArrayOf.sci_Iterable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_Iterable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth))
});
ScalaJS.d.sci_Iterable = new ScalaJS.ClassTypeData({
  sci_Iterable: 0
}, true, "scala.collection.immutable.Iterable", {
  sci_Iterable: 1,
  sci_Traversable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  s_Immutable: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
/** @constructor */
ScalaJS.c.sci_StringOps = (function() {
  ScalaJS.c.O.call(this);
  this.repr$1 = null
});
ScalaJS.c.sci_StringOps.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_StringOps.prototype.constructor = ScalaJS.c.sci_StringOps;
/** @constructor */
ScalaJS.h.sci_StringOps = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_StringOps.prototype = ScalaJS.c.sci_StringOps.prototype;
ScalaJS.c.sci_StringOps.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new ScalaJS.c.sci_WrappedString().init___T($$this)
});
ScalaJS.c.sci_StringOps.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  var c = (65535 & ScalaJS.uI($$this["charCodeAt"](idx)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.sci_StringOps.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.sci_StringOps.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sci_StringOps.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__exists__sc_IndexedSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.sci_StringOps.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.sci_StringOps.prototype.toList__sci_List = (function() {
  var this$1 = ScalaJS.m.sci_List$();
  var cbf = this$1.ReusableCBFInstance$2;
  return ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(this, cbf))
});
ScalaJS.c.sci_StringOps.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new ScalaJS.c.sci_WrappedString().init___T($$this)
});
ScalaJS.c.sci_StringOps.prototype.equals__O__Z = (function(x$1) {
  return ScalaJS.m.sci_StringOps$().equals$extension__T__O__Z(this.repr$1, x$1)
});
ScalaJS.c.sci_StringOps.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
ScalaJS.c.sci_StringOps.prototype.toString__T = (function() {
  var $$this = this.repr$1;
  return $$this
});
ScalaJS.c.sci_StringOps.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.sci_StringOps.prototype.reverse__O = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
ScalaJS.c.sci_StringOps.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return ScalaJS.uI($$this["length"])
});
ScalaJS.c.sci_StringOps.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI($$this["length"]))
});
ScalaJS.c.sci_StringOps.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return ScalaJS.uI($$this["length"])
});
ScalaJS.c.sci_StringOps.prototype.take__I__O = (function(n) {
  return ScalaJS.m.sci_StringOps$().slice$extension__T__I__I__T(this.repr$1, 0, n)
});
ScalaJS.c.sci_StringOps.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$3 = new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI($$this["length"]));
  return ScalaJS.s.sc_Iterator$class__toStream__sc_Iterator__sci_Stream(this$3)
});
ScalaJS.c.sci_StringOps.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.c.sci_StringOps.prototype.repr__O = (function() {
  return this.repr$1
});
ScalaJS.c.sci_StringOps.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I($$this)
});
ScalaJS.c.sci_StringOps.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.sci_StringOps.prototype.init___T = (function(repr) {
  this.repr$1 = repr;
  return this
});
ScalaJS.c.sci_StringOps.prototype.toCollection__O__sc_Seq = (function(repr) {
  this.repr$1;
  var repr$1 = ScalaJS.as.T(repr);
  return new ScalaJS.c.sci_WrappedString().init___T(repr$1)
});
ScalaJS.c.sci_StringOps.prototype.newBuilder__scm_Builder = (function() {
  this.repr$1;
  return new ScalaJS.c.scm_StringBuilder().init___()
});
ScalaJS.c.sci_StringOps.prototype.stringPrefix__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T(this)
});
ScalaJS.is.sci_StringOps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_StringOps)))
});
ScalaJS.as.sci_StringOps = (function(obj) {
  return ((ScalaJS.is.sci_StringOps(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.StringOps"))
});
ScalaJS.isArrayOf.sci_StringOps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_StringOps)))
});
ScalaJS.asArrayOf.sci_StringOps = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_StringOps(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.StringOps;", depth))
});
ScalaJS.d.sci_StringOps = new ScalaJS.ClassTypeData({
  sci_StringOps: 0
}, false, "scala.collection.immutable.StringOps", {
  sci_StringOps: 1,
  O: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
ScalaJS.c.sci_StringOps.prototype.$classData = ScalaJS.d.sci_StringOps;
ScalaJS.is.sc_Seq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Seq)))
});
ScalaJS.as.sc_Seq = (function(obj) {
  return ((ScalaJS.is.sc_Seq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.Seq"))
});
ScalaJS.isArrayOf.sc_Seq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Seq)))
});
ScalaJS.asArrayOf.sc_Seq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_Seq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.Seq;", depth))
});
ScalaJS.is.sc_Set = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Set)))
});
ScalaJS.as.sc_Set = (function(obj) {
  return ((ScalaJS.is.sc_Set(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.Set"))
});
ScalaJS.isArrayOf.sc_Set = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Set)))
});
ScalaJS.asArrayOf.sc_Set = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_Set(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.Set;", depth))
});
/** @constructor */
ScalaJS.c.scm_AbstractIterable = (function() {
  ScalaJS.c.sc_AbstractIterable.call(this)
});
ScalaJS.c.scm_AbstractIterable.prototype = new ScalaJS.h.sc_AbstractIterable();
ScalaJS.c.scm_AbstractIterable.prototype.constructor = ScalaJS.c.scm_AbstractIterable;
/** @constructor */
ScalaJS.h.scm_AbstractIterable = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractIterable.prototype = ScalaJS.c.scm_AbstractIterable.prototype;
ScalaJS.is.sjs_js_ArrayOps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_ArrayOps)))
});
ScalaJS.as.sjs_js_ArrayOps = (function(obj) {
  return ((ScalaJS.is.sjs_js_ArrayOps(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.ArrayOps"))
});
ScalaJS.isArrayOf.sjs_js_ArrayOps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_ArrayOps)))
});
ScalaJS.asArrayOf.sjs_js_ArrayOps = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_ArrayOps(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.ArrayOps;", depth))
});
ScalaJS.is.sc_IndexedSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
});
ScalaJS.as.sc_IndexedSeq = (function(obj) {
  return ((ScalaJS.is.sc_IndexedSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.IndexedSeq"))
});
ScalaJS.isArrayOf.sc_IndexedSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
});
ScalaJS.asArrayOf.sc_IndexedSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
});
ScalaJS.is.sc_LinearSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
});
ScalaJS.as.sc_LinearSeq = (function(obj) {
  return ((ScalaJS.is.sc_LinearSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.LinearSeq"))
});
ScalaJS.isArrayOf.sc_LinearSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
});
ScalaJS.asArrayOf.sc_LinearSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_LinearSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
});
/** @constructor */
ScalaJS.c.sc_AbstractSeq = (function() {
  ScalaJS.c.sc_AbstractIterable.call(this)
});
ScalaJS.c.sc_AbstractSeq.prototype = new ScalaJS.h.sc_AbstractIterable();
ScalaJS.c.sc_AbstractSeq.prototype.constructor = ScalaJS.c.sc_AbstractSeq;
/** @constructor */
ScalaJS.h.sc_AbstractSeq = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractSeq.prototype = ScalaJS.c.sc_AbstractSeq.prototype;
ScalaJS.c.sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_SeqLike$class__isEmpty__sc_SeqLike__Z(this)
});
ScalaJS.c.sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
});
ScalaJS.c.sc_AbstractSeq.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.sc_AbstractSeq.prototype.reverse__O = (function() {
  return ScalaJS.s.sc_SeqLike$class__reverse__sc_SeqLike__O(this)
});
ScalaJS.c.sc_AbstractSeq.prototype.size__I = (function() {
  return this.length__I()
});
ScalaJS.c.sc_AbstractSeq.prototype.contains__O__Z = (function(elem) {
  return ScalaJS.s.sc_SeqLike$class__contains__sc_SeqLike__O__Z(this, elem)
});
ScalaJS.c.sc_AbstractSeq.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
});
ScalaJS.c.sc_AbstractSeq.prototype.toCollection__O__sc_Seq = (function(repr) {
  return ScalaJS.as.sc_Seq(repr)
});
/** @constructor */
ScalaJS.c.sc_AbstractMap = (function() {
  ScalaJS.c.sc_AbstractIterable.call(this)
});
ScalaJS.c.sc_AbstractMap.prototype = new ScalaJS.h.sc_AbstractIterable();
ScalaJS.c.sc_AbstractMap.prototype.constructor = ScalaJS.c.sc_AbstractMap;
/** @constructor */
ScalaJS.h.sc_AbstractMap = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractMap.prototype = ScalaJS.c.sc_AbstractMap.prototype;
ScalaJS.c.sc_AbstractMap.prototype.apply__O__O = (function(key) {
  return ScalaJS.s.sc_MapLike$class__apply__sc_MapLike__O__O(this, key)
});
ScalaJS.c.sc_AbstractMap.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_MapLike$class__isEmpty__sc_MapLike__Z(this)
});
ScalaJS.c.sc_AbstractMap.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.sc_GenMapLike$class__equals__sc_GenMapLike__O__Z(this, that)
});
ScalaJS.c.sc_AbstractMap.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.sc_AbstractMap.prototype.$default__O__O = (function(key) {
  return ScalaJS.s.sc_MapLike$class__$default__sc_MapLike__O__O(this, key)
});
ScalaJS.c.sc_AbstractMap.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_MapLike$class__addString__sc_MapLike__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.c.sc_AbstractMap.prototype.hashCode__I = (function() {
  var this$1 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  var xs = this.seq__sc_Map();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(xs, this$1.mapSeed$2)
});
ScalaJS.c.sc_AbstractMap.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_MapBuilder().init___sc_GenMap(this.empty__sc_Map())
});
ScalaJS.c.sc_AbstractMap.prototype.stringPrefix__T = (function() {
  return "Map"
});
/** @constructor */
ScalaJS.c.sc_AbstractSet = (function() {
  ScalaJS.c.sc_AbstractIterable.call(this)
});
ScalaJS.c.sc_AbstractSet.prototype = new ScalaJS.h.sc_AbstractIterable();
ScalaJS.c.sc_AbstractSet.prototype.constructor = ScalaJS.c.sc_AbstractSet;
/** @constructor */
ScalaJS.h.sc_AbstractSet = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractSet.prototype = ScalaJS.c.sc_AbstractSet.prototype;
ScalaJS.c.sc_AbstractSet.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_SetLike$class__isEmpty__sc_SetLike__Z(this)
});
ScalaJS.c.sc_AbstractSet.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.sc_GenSetLike$class__equals__sc_GenSetLike__O__Z(this, that)
});
ScalaJS.c.sc_AbstractSet.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.sc_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  return this.forall__F1__Z(that)
});
ScalaJS.c.sc_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
ScalaJS.c.sc_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_SetBuilder().init___sc_Set(this.empty__sc_Set())
});
ScalaJS.c.sc_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
ScalaJS.is.sci_Map = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Map)))
});
ScalaJS.as.sci_Map = (function(obj) {
  return ((ScalaJS.is.sci_Map(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.Map"))
});
ScalaJS.isArrayOf.sci_Map = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map)))
});
ScalaJS.asArrayOf.sci_Map = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_Map(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.Map;", depth))
});
/** @constructor */
ScalaJS.c.sc_Map$WithDefault = (function() {
  ScalaJS.c.sc_AbstractMap.call(this);
  this.underlying$4 = null;
  this.d$4 = null
});
ScalaJS.c.sc_Map$WithDefault.prototype = new ScalaJS.h.sc_AbstractMap();
ScalaJS.c.sc_Map$WithDefault.prototype.constructor = ScalaJS.c.sc_Map$WithDefault;
/** @constructor */
ScalaJS.h.sc_Map$WithDefault = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Map$WithDefault.prototype = ScalaJS.c.sc_Map$WithDefault.prototype;
ScalaJS.c.sc_Map$WithDefault.prototype.init___sc_Map__F1 = (function(underlying, d) {
  this.underlying$4 = underlying;
  this.d$4 = d;
  return this
});
ScalaJS.c.sc_Map$WithDefault.prototype.iterator__sc_Iterator = (function() {
  return this.underlying$4.iterator__sc_Iterator()
});
ScalaJS.c.sc_Map$WithDefault.prototype.size__I = (function() {
  return this.underlying$4.size__I()
});
ScalaJS.c.sc_Map$WithDefault.prototype.$default__O__O = (function(key) {
  return this.d$4.apply__O__O(key)
});
ScalaJS.c.sc_Map$WithDefault.prototype.get__O__s_Option = (function(key) {
  return this.underlying$4.get__O__s_Option(key)
});
/** @constructor */
ScalaJS.c.sci_AbstractMap = (function() {
  ScalaJS.c.sc_AbstractMap.call(this)
});
ScalaJS.c.sci_AbstractMap.prototype = new ScalaJS.h.sc_AbstractMap();
ScalaJS.c.sci_AbstractMap.prototype.constructor = ScalaJS.c.sci_AbstractMap;
/** @constructor */
ScalaJS.h.sci_AbstractMap = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_AbstractMap.prototype = ScalaJS.c.sci_AbstractMap.prototype;
ScalaJS.c.sci_AbstractMap.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_AbstractMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_AbstractMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_AbstractMap.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Iterable$()
});
ScalaJS.c.sci_AbstractMap.prototype.empty__sc_Map = (function() {
  return this.empty__sci_Map()
});
ScalaJS.c.sci_AbstractMap.prototype.withDefaultValue__O__sci_Map = (function(d) {
  return ScalaJS.s.sci_Map$class__withDefaultValue__sci_Map__O__sci_Map(this, d)
});
ScalaJS.c.sci_AbstractMap.prototype.empty__sci_Map = (function() {
  return ScalaJS.m.sci_Map$EmptyMap$()
});
ScalaJS.c.sci_AbstractMap.prototype.seq__sc_Map = (function() {
  return this
});
/** @constructor */
ScalaJS.c.sci_ListSet = (function() {
  ScalaJS.c.sc_AbstractSet.call(this)
});
ScalaJS.c.sci_ListSet.prototype = new ScalaJS.h.sc_AbstractSet();
ScalaJS.c.sci_ListSet.prototype.constructor = ScalaJS.c.sci_ListSet;
/** @constructor */
ScalaJS.h.sci_ListSet = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListSet.prototype = ScalaJS.c.sci_ListSet.prototype;
ScalaJS.c.sci_ListSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_ListSet.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_ListSet.prototype.head__O = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("Set has no elements")
});
ScalaJS.c.sci_ListSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
ScalaJS.c.sci_ListSet.prototype.isEmpty__Z = (function() {
  return true
});
ScalaJS.c.sci_ListSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_ListSet.prototype.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("Empty ListSet has no outer pointer")
});
ScalaJS.c.sci_ListSet.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_ListSet$()
});
ScalaJS.c.sci_ListSet.prototype.$$plus__O__sci_ListSet = (function(elem) {
  return new ScalaJS.c.sci_ListSet$Node().init___sci_ListSet__O(this, elem)
});
ScalaJS.c.sci_ListSet.prototype.size__I = (function() {
  return 0
});
ScalaJS.c.sci_ListSet.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sci_ListSet$$anon$1().init___sci_ListSet(this)
});
ScalaJS.c.sci_ListSet.prototype.empty__sc_Set = (function() {
  return ScalaJS.m.sci_ListSet$EmptyListSet$()
});
ScalaJS.c.sci_ListSet.prototype.contains__O__Z = (function(elem) {
  return false
});
ScalaJS.c.sci_ListSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
ScalaJS.c.sci_ListSet.prototype.tail__sci_ListSet = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("Next of an empty set")
});
ScalaJS.c.sci_ListSet.prototype.stringPrefix__T = (function() {
  return "ListSet"
});
ScalaJS.is.sci_ListSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListSet)))
});
ScalaJS.as.sci_ListSet = (function(obj) {
  return ((ScalaJS.is.sci_ListSet(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.ListSet"))
});
ScalaJS.isArrayOf.sci_ListSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListSet)))
});
ScalaJS.asArrayOf.sci_ListSet = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_ListSet(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.ListSet;", depth))
});
/** @constructor */
ScalaJS.c.sci_Set$EmptySet$ = (function() {
  ScalaJS.c.sc_AbstractSet.call(this)
});
ScalaJS.c.sci_Set$EmptySet$.prototype = new ScalaJS.h.sc_AbstractSet();
ScalaJS.c.sci_Set$EmptySet$.prototype.constructor = ScalaJS.c.sci_Set$EmptySet$;
/** @constructor */
ScalaJS.h.sci_Set$EmptySet$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Set$EmptySet$.prototype = ScalaJS.c.sci_Set$EmptySet$.prototype;
ScalaJS.c.sci_Set$EmptySet$.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Set$EmptySet$.prototype.init___ = (function() {
  ScalaJS.n.sci_Set$EmptySet$ = this;
  return this
});
ScalaJS.c.sci_Set$EmptySet$.prototype.apply__O__O = (function(v1) {
  return false
});
ScalaJS.c.sci_Set$EmptySet$.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Set$EmptySet$.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Set$()
});
ScalaJS.c.sci_Set$EmptySet$.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
ScalaJS.c.sci_Set$EmptySet$.prototype.size__I = (function() {
  return 0
});
ScalaJS.c.sci_Set$EmptySet$.prototype.iterator__sc_Iterator = (function() {
  return ScalaJS.m.sc_Iterator$().empty$1
});
ScalaJS.c.sci_Set$EmptySet$.prototype.empty__sc_Set = (function() {
  return ScalaJS.m.sci_Set$EmptySet$()
});
ScalaJS.c.sci_Set$EmptySet$.prototype.$$plus__O__sc_Set = (function(elem) {
  return new ScalaJS.c.sci_Set$Set1().init___O(elem)
});
ScalaJS.d.sci_Set$EmptySet$ = new ScalaJS.ClassTypeData({
  sci_Set$EmptySet$: 0
}, false, "scala.collection.immutable.Set$EmptySet$", {
  sci_Set$EmptySet$: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Set$EmptySet$.prototype.$classData = ScalaJS.d.sci_Set$EmptySet$;
ScalaJS.n.sci_Set$EmptySet$ = (void 0);
ScalaJS.m.sci_Set$EmptySet$ = (function() {
  if ((!ScalaJS.n.sci_Set$EmptySet$)) {
    ScalaJS.n.sci_Set$EmptySet$ = new ScalaJS.c.sci_Set$EmptySet$().init___()
  };
  return ScalaJS.n.sci_Set$EmptySet$
});
/** @constructor */
ScalaJS.c.sci_Set$Set1 = (function() {
  ScalaJS.c.sc_AbstractSet.call(this);
  this.elem1$4 = null
});
ScalaJS.c.sci_Set$Set1.prototype = new ScalaJS.h.sc_AbstractSet();
ScalaJS.c.sci_Set$Set1.prototype.constructor = ScalaJS.c.sci_Set$Set1;
/** @constructor */
ScalaJS.h.sci_Set$Set1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Set$Set1.prototype = ScalaJS.c.sci_Set$Set1.prototype;
ScalaJS.c.sci_Set$Set1.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Set$Set1.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
ScalaJS.c.sci_Set$Set1.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Set$Set1.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Set$()
});
ScalaJS.c.sci_Set$Set1.prototype.forall__F1__Z = (function(f) {
  return ScalaJS.uZ(f.apply__O__O(this.elem1$4))
});
ScalaJS.c.sci_Set$Set1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4)
});
ScalaJS.c.sci_Set$Set1.prototype.size__I = (function() {
  return 1
});
ScalaJS.c.sci_Set$Set1.prototype.init___O = (function(elem1) {
  this.elem1$4 = elem1;
  return this
});
ScalaJS.c.sci_Set$Set1.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_Set$Set1.prototype.empty__sc_Set = (function() {
  return ScalaJS.m.sci_Set$EmptySet$()
});
ScalaJS.c.sci_Set$Set1.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new ScalaJS.c.sci_Set$Set2().init___O__O(this.elem1$4, elem))
});
ScalaJS.c.sci_Set$Set1.prototype.contains__O__Z = (function(elem) {
  return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4)
});
ScalaJS.c.sci_Set$Set1.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
ScalaJS.d.sci_Set$Set1 = new ScalaJS.ClassTypeData({
  sci_Set$Set1: 0
}, false, "scala.collection.immutable.Set$Set1", {
  sci_Set$Set1: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Set$Set1.prototype.$classData = ScalaJS.d.sci_Set$Set1;
/** @constructor */
ScalaJS.c.sci_Set$Set2 = (function() {
  ScalaJS.c.sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null
});
ScalaJS.c.sci_Set$Set2.prototype = new ScalaJS.h.sc_AbstractSet();
ScalaJS.c.sci_Set$Set2.prototype.constructor = ScalaJS.c.sci_Set$Set2;
/** @constructor */
ScalaJS.h.sci_Set$Set2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Set$Set2.prototype = ScalaJS.c.sci_Set$Set2.prototype;
ScalaJS.c.sci_Set$Set2.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Set$Set2.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
ScalaJS.c.sci_Set$Set2.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Set$Set2.prototype.init___O__O = (function(elem1, elem2) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  return this
});
ScalaJS.c.sci_Set$Set2.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Set$()
});
ScalaJS.c.sci_Set$Set2.prototype.forall__F1__Z = (function(f) {
  return (ScalaJS.uZ(f.apply__O__O(this.elem1$4)) && ScalaJS.uZ(f.apply__O__O(this.elem2$4)))
});
ScalaJS.c.sci_Set$Set2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4)
});
ScalaJS.c.sci_Set$Set2.prototype.size__I = (function() {
  return 2
});
ScalaJS.c.sci_Set$Set2.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_Set$Set2.prototype.empty__sc_Set = (function() {
  return ScalaJS.m.sci_Set$EmptySet$()
});
ScalaJS.c.sci_Set$Set2.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new ScalaJS.c.sci_Set$Set3().init___O__O__O(this.elem1$4, this.elem2$4, elem))
});
ScalaJS.c.sci_Set$Set2.prototype.contains__O__Z = (function(elem) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4))
});
ScalaJS.c.sci_Set$Set2.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
ScalaJS.d.sci_Set$Set2 = new ScalaJS.ClassTypeData({
  sci_Set$Set2: 0
}, false, "scala.collection.immutable.Set$Set2", {
  sci_Set$Set2: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Set$Set2.prototype.$classData = ScalaJS.d.sci_Set$Set2;
/** @constructor */
ScalaJS.c.sci_Set$Set3 = (function() {
  ScalaJS.c.sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null
});
ScalaJS.c.sci_Set$Set3.prototype = new ScalaJS.h.sc_AbstractSet();
ScalaJS.c.sci_Set$Set3.prototype.constructor = ScalaJS.c.sci_Set$Set3;
/** @constructor */
ScalaJS.h.sci_Set$Set3 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Set$Set3.prototype = ScalaJS.c.sci_Set$Set3.prototype;
ScalaJS.c.sci_Set$Set3.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Set$Set3.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
ScalaJS.c.sci_Set$Set3.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Set$Set3.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Set$()
});
ScalaJS.c.sci_Set$Set3.prototype.forall__F1__Z = (function(f) {
  return ((ScalaJS.uZ(f.apply__O__O(this.elem1$4)) && ScalaJS.uZ(f.apply__O__O(this.elem2$4))) && ScalaJS.uZ(f.apply__O__O(this.elem3$4)))
});
ScalaJS.c.sci_Set$Set3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4)
});
ScalaJS.c.sci_Set$Set3.prototype.init___O__O__O = (function(elem1, elem2, elem3) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  return this
});
ScalaJS.c.sci_Set$Set3.prototype.size__I = (function() {
  return 3
});
ScalaJS.c.sci_Set$Set3.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_Set$Set3.prototype.empty__sc_Set = (function() {
  return ScalaJS.m.sci_Set$EmptySet$()
});
ScalaJS.c.sci_Set$Set3.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new ScalaJS.c.sci_Set$Set4().init___O__O__O__O(this.elem1$4, this.elem2$4, this.elem3$4, elem))
});
ScalaJS.c.sci_Set$Set3.prototype.contains__O__Z = (function(elem) {
  return ((ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4))
});
ScalaJS.c.sci_Set$Set3.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
ScalaJS.d.sci_Set$Set3 = new ScalaJS.ClassTypeData({
  sci_Set$Set3: 0
}, false, "scala.collection.immutable.Set$Set3", {
  sci_Set$Set3: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Set$Set3.prototype.$classData = ScalaJS.d.sci_Set$Set3;
/** @constructor */
ScalaJS.c.sci_Set$Set4 = (function() {
  ScalaJS.c.sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null;
  this.elem4$4 = null
});
ScalaJS.c.sci_Set$Set4.prototype = new ScalaJS.h.sc_AbstractSet();
ScalaJS.c.sci_Set$Set4.prototype.constructor = ScalaJS.c.sci_Set$Set4;
/** @constructor */
ScalaJS.h.sci_Set$Set4 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Set$Set4.prototype = ScalaJS.c.sci_Set$Set4.prototype;
ScalaJS.c.sci_Set$Set4.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Set$Set4.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
ScalaJS.c.sci_Set$Set4.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Set$Set4.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Set$()
});
ScalaJS.c.sci_Set$Set4.prototype.forall__F1__Z = (function(f) {
  return (((ScalaJS.uZ(f.apply__O__O(this.elem1$4)) && ScalaJS.uZ(f.apply__O__O(this.elem2$4))) && ScalaJS.uZ(f.apply__O__O(this.elem3$4))) && ScalaJS.uZ(f.apply__O__O(this.elem4$4)))
});
ScalaJS.c.sci_Set$Set4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4);
  f.apply__O__O(this.elem4$4)
});
ScalaJS.c.sci_Set$Set4.prototype.size__I = (function() {
  return 4
});
ScalaJS.c.sci_Set$Set4.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4, this.elem4$4]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_Set$Set4.prototype.empty__sc_Set = (function() {
  return ScalaJS.m.sci_Set$EmptySet$()
});
ScalaJS.c.sci_Set$Set4.prototype.$$plus__O__sci_Set = (function(elem) {
  if (this.contains__O__Z(elem)) {
    return this
  } else {
    var this$1 = new ScalaJS.c.sci_HashSet().init___();
    var elem1 = this.elem1$4;
    var elem2 = this.elem2$4;
    var array = [this.elem3$4, this.elem4$4, elem];
    var this$2 = this$1.$$plus__O__sci_HashSet(elem1).$$plus__O__sci_HashSet(elem2);
    var start = 0;
    var end = ScalaJS.uI(array["length"]);
    var z = this$2;
    x: {
      var jsx$1;
      _foldl: while (true) {
        if ((start === end)) {
          var jsx$1 = z;
          break x
        } else {
          var temp$start = ((1 + start) | 0);
          var arg1 = z;
          var index = start;
          var arg2 = array[index];
          var x$2 = ScalaJS.as.sc_Set(arg1);
          var temp$z = x$2.$$plus__O__sc_Set(arg2);
          start = temp$start;
          z = temp$z;
          continue _foldl
        }
      }
    };
    return ScalaJS.as.sci_HashSet(ScalaJS.as.sc_Set(jsx$1))
  }
});
ScalaJS.c.sci_Set$Set4.prototype.contains__O__Z = (function(elem) {
  return (((ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4)) || ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem4$4))
});
ScalaJS.c.sci_Set$Set4.prototype.init___O__O__O__O = (function(elem1, elem2, elem3, elem4) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  this.elem4$4 = elem4;
  return this
});
ScalaJS.c.sci_Set$Set4.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
ScalaJS.d.sci_Set$Set4 = new ScalaJS.ClassTypeData({
  sci_Set$Set4: 0
}, false, "scala.collection.immutable.Set$Set4", {
  sci_Set$Set4: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Set$Set4.prototype.$classData = ScalaJS.d.sci_Set$Set4;
ScalaJS.is.scm_IndexedSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_IndexedSeq)))
});
ScalaJS.as.scm_IndexedSeq = (function(obj) {
  return ((ScalaJS.is.scm_IndexedSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.IndexedSeq"))
});
ScalaJS.isArrayOf.scm_IndexedSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_IndexedSeq)))
});
ScalaJS.asArrayOf.scm_IndexedSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_IndexedSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.IndexedSeq;", depth))
});
/** @constructor */
ScalaJS.c.sci_HashSet = (function() {
  ScalaJS.c.sc_AbstractSet.call(this)
});
ScalaJS.c.sci_HashSet.prototype = new ScalaJS.h.sc_AbstractSet();
ScalaJS.c.sci_HashSet.prototype.constructor = ScalaJS.c.sci_HashSet;
/** @constructor */
ScalaJS.h.sci_HashSet = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashSet.prototype = ScalaJS.c.sci_HashSet.prototype;
ScalaJS.c.sci_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_HashSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return new ScalaJS.c.sci_HashSet$HashSet1().init___O__I(key, hash)
});
ScalaJS.c.sci_HashSet.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I(ScalaJS.m.sr_ScalaRunTime$().hash__O__I(key))
});
ScalaJS.c.sci_HashSet.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_HashSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
ScalaJS.c.sci_HashSet.prototype.$$plus__O__sci_HashSet = (function(e) {
  return this.updated0__O__I__I__sci_HashSet(e, this.computeHash__O__I(e), 0)
});
ScalaJS.c.sci_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_HashSet$()
});
ScalaJS.c.sci_HashSet.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
ScalaJS.c.sci_HashSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  if (ScalaJS.is.sci_HashSet(that)) {
    var x2 = ScalaJS.as.sci_HashSet(that);
    return this.subsetOf0__sci_HashSet__I__Z(x2, 0)
  } else {
    var this$1 = this.iterator__sc_Iterator();
    return ScalaJS.s.sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, that)
  }
});
ScalaJS.c.sci_HashSet.prototype.size__I = (function() {
  return 0
});
ScalaJS.c.sci_HashSet.prototype.iterator__sc_Iterator = (function() {
  return ScalaJS.m.sc_Iterator$().empty$1
});
ScalaJS.c.sci_HashSet.prototype.empty__sc_Set = (function() {
  return ScalaJS.m.sci_HashSet$EmptyHashSet$()
});
ScalaJS.c.sci_HashSet.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
ScalaJS.c.sci_HashSet.prototype.contains__O__Z = (function(e) {
  return this.get0__O__I__I__Z(e, this.computeHash__O__I(e), 0)
});
ScalaJS.c.sci_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_HashSet(elem)
});
ScalaJS.c.sci_HashSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return false
});
ScalaJS.c.sci_HashSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return true
});
ScalaJS.is.sci_HashSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet)))
});
ScalaJS.as.sci_HashSet = (function(obj) {
  return ((ScalaJS.is.sci_HashSet(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.HashSet"))
});
ScalaJS.isArrayOf.sci_HashSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet)))
});
ScalaJS.asArrayOf.sci_HashSet = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_HashSet(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.HashSet;", depth))
});
ScalaJS.d.sci_HashSet = new ScalaJS.ClassTypeData({
  sci_HashSet: 0
}, false, "scala.collection.immutable.HashSet", {
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_HashSet.prototype.$classData = ScalaJS.d.sci_HashSet;
/** @constructor */
ScalaJS.c.sci_ListSet$EmptyListSet$ = (function() {
  ScalaJS.c.sci_ListSet.call(this)
});
ScalaJS.c.sci_ListSet$EmptyListSet$.prototype = new ScalaJS.h.sci_ListSet();
ScalaJS.c.sci_ListSet$EmptyListSet$.prototype.constructor = ScalaJS.c.sci_ListSet$EmptyListSet$;
/** @constructor */
ScalaJS.h.sci_ListSet$EmptyListSet$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListSet$EmptyListSet$.prototype = ScalaJS.c.sci_ListSet$EmptyListSet$.prototype;
ScalaJS.d.sci_ListSet$EmptyListSet$ = new ScalaJS.ClassTypeData({
  sci_ListSet$EmptyListSet$: 0
}, false, "scala.collection.immutable.ListSet$EmptyListSet$", {
  sci_ListSet$EmptyListSet$: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_ListSet$EmptyListSet$.prototype.$classData = ScalaJS.d.sci_ListSet$EmptyListSet$;
ScalaJS.n.sci_ListSet$EmptyListSet$ = (void 0);
ScalaJS.m.sci_ListSet$EmptyListSet$ = (function() {
  if ((!ScalaJS.n.sci_ListSet$EmptyListSet$)) {
    ScalaJS.n.sci_ListSet$EmptyListSet$ = new ScalaJS.c.sci_ListSet$EmptyListSet$().init___()
  };
  return ScalaJS.n.sci_ListSet$EmptyListSet$
});
/** @constructor */
ScalaJS.c.sci_ListSet$Node = (function() {
  ScalaJS.c.sci_ListSet.call(this);
  this.head$5 = null;
  this.$$outer$f = null
});
ScalaJS.c.sci_ListSet$Node.prototype = new ScalaJS.h.sci_ListSet();
ScalaJS.c.sci_ListSet$Node.prototype.constructor = ScalaJS.c.sci_ListSet$Node;
/** @constructor */
ScalaJS.h.sci_ListSet$Node = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListSet$Node.prototype = ScalaJS.c.sci_ListSet$Node.prototype;
ScalaJS.c.sci_ListSet$Node.prototype.head__O = (function() {
  return this.head$5
});
ScalaJS.c.sci_ListSet$Node.prototype.isEmpty__Z = (function() {
  return false
});
ScalaJS.c.sci_ListSet$Node.prototype.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet = (function() {
  return this.$$outer$f
});
ScalaJS.c.sci_ListSet$Node.prototype.$$plus__O__sci_ListSet = (function(e) {
  return (this.containsInternal__p5__sci_ListSet__O__Z(this, e) ? this : new ScalaJS.c.sci_ListSet$Node().init___sci_ListSet__O(this, e))
});
ScalaJS.c.sci_ListSet$Node.prototype.sizeInternal__p5__sci_ListSet__I__I = (function(n, acc) {
  _sizeInternal: while (true) {
    if (n.isEmpty__Z()) {
      return acc
    } else {
      var temp$n = n.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet();
      var temp$acc = ((1 + acc) | 0);
      n = temp$n;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
ScalaJS.c.sci_ListSet$Node.prototype.size__I = (function() {
  return this.sizeInternal__p5__sci_ListSet__I__I(this, 0)
});
ScalaJS.c.sci_ListSet$Node.prototype.init___sci_ListSet__O = (function($$outer, head) {
  this.head$5 = head;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
ScalaJS.c.sci_ListSet$Node.prototype.contains__O__Z = (function(e) {
  return this.containsInternal__p5__sci_ListSet__O__Z(this, e)
});
ScalaJS.c.sci_ListSet$Node.prototype.containsInternal__p5__sci_ListSet__O__Z = (function(n, e) {
  _containsInternal: while (true) {
    if ((!n.isEmpty__Z())) {
      if (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(n.head__O(), e)) {
        return true
      } else {
        n = n.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
ScalaJS.c.sci_ListSet$Node.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
ScalaJS.c.sci_ListSet$Node.prototype.tail__sci_ListSet = (function() {
  return this.$$outer$f
});
ScalaJS.d.sci_ListSet$Node = new ScalaJS.ClassTypeData({
  sci_ListSet$Node: 0
}, false, "scala.collection.immutable.ListSet$Node", {
  sci_ListSet$Node: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_ListSet$Node.prototype.$classData = ScalaJS.d.sci_ListSet$Node;
/** @constructor */
ScalaJS.c.scm_AbstractSeq = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this)
});
ScalaJS.c.scm_AbstractSeq.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.scm_AbstractSeq.prototype.constructor = ScalaJS.c.scm_AbstractSeq;
/** @constructor */
ScalaJS.h.scm_AbstractSeq = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractSeq.prototype = ScalaJS.c.scm_AbstractSeq.prototype;
ScalaJS.c.scm_AbstractSeq.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__scm_Seq()
});
ScalaJS.c.scm_AbstractSeq.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.is.scm_Map = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Map)))
});
ScalaJS.as.scm_Map = (function(obj) {
  return ((ScalaJS.is.scm_Map(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.Map"))
});
ScalaJS.isArrayOf.scm_Map = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Map)))
});
ScalaJS.asArrayOf.scm_Map = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_Map(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.Map;", depth))
});
/** @constructor */
ScalaJS.c.sci_HashSet$EmptyHashSet$ = (function() {
  ScalaJS.c.sci_HashSet.call(this)
});
ScalaJS.c.sci_HashSet$EmptyHashSet$.prototype = new ScalaJS.h.sci_HashSet();
ScalaJS.c.sci_HashSet$EmptyHashSet$.prototype.constructor = ScalaJS.c.sci_HashSet$EmptyHashSet$;
/** @constructor */
ScalaJS.h.sci_HashSet$EmptyHashSet$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashSet$EmptyHashSet$.prototype = ScalaJS.c.sci_HashSet$EmptyHashSet$.prototype;
ScalaJS.d.sci_HashSet$EmptyHashSet$ = new ScalaJS.ClassTypeData({
  sci_HashSet$EmptyHashSet$: 0
}, false, "scala.collection.immutable.HashSet$EmptyHashSet$", {
  sci_HashSet$EmptyHashSet$: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_HashSet$EmptyHashSet$.prototype.$classData = ScalaJS.d.sci_HashSet$EmptyHashSet$;
ScalaJS.n.sci_HashSet$EmptyHashSet$ = (void 0);
ScalaJS.m.sci_HashSet$EmptyHashSet$ = (function() {
  if ((!ScalaJS.n.sci_HashSet$EmptyHashSet$)) {
    ScalaJS.n.sci_HashSet$EmptyHashSet$ = new ScalaJS.c.sci_HashSet$EmptyHashSet$().init___()
  };
  return ScalaJS.n.sci_HashSet$EmptyHashSet$
});
/** @constructor */
ScalaJS.c.sci_HashSet$HashTrieSet = (function() {
  ScalaJS.c.sci_HashSet.call(this);
  this.bitmap$5 = 0;
  this.elems$5 = null;
  this.size0$5 = 0
});
ScalaJS.c.sci_HashSet$HashTrieSet.prototype = new ScalaJS.h.sci_HashSet();
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.constructor = ScalaJS.c.sci_HashSet$HashTrieSet;
/** @constructor */
ScalaJS.h.sci_HashSet$HashTrieSet = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashSet$HashTrieSet.prototype = ScalaJS.c.sci_HashSet$HashTrieSet.prototype;
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = ScalaJS.m.jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
  if (((this.bitmap$5 & mask) !== 0)) {
    var sub = this.elems$5.u[offset];
    var subNew = sub.updated0__O__I__I__sci_HashSet(key, hash, ((5 + level) | 0));
    if ((sub === subNew)) {
      return this
    } else {
      var elemsNew = ScalaJS.newArrayObject(ScalaJS.d.sci_HashSet.getArrayOf(), [this.elems$5.u["length"]]);
      ScalaJS.m.s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew, 0, this.elems$5.u["length"]);
      elemsNew.u[offset] = subNew;
      return new ScalaJS.c.sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(this.bitmap$5, elemsNew, ((this.size0$5 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = ScalaJS.newArrayObject(ScalaJS.d.sci_HashSet.getArrayOf(), [((1 + this.elems$5.u["length"]) | 0)]);
    ScalaJS.m.s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew$2, 0, offset);
    elemsNew$2.u[offset] = new ScalaJS.c.sci_HashSet$HashSet1().init___O__I(key, hash);
    ScalaJS.m.s_Array$().copy__O__I__O__I__I__V(this.elems$5, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$5.u["length"] - offset) | 0));
    var bitmapNew = (this.bitmap$5 | mask);
    return new ScalaJS.c.sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmapNew, elemsNew$2, ((1 + this.size0$5) | 0))
  }
});
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$5.u["length"])) {
    this.elems$5.u[i].foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sci_HashSet$HashTrieSet$$anon$1().init___sci_HashSet$HashTrieSet(this)
});
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.size__I = (function() {
  return this.size0$5
});
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.init___I__Asci_HashSet__I = (function(bitmap, elems, size0) {
  this.bitmap$5 = bitmap;
  this.elems$5 = elems;
  this.size0$5 = size0;
  ScalaJS.m.s_Predef$().assert__Z__V((ScalaJS.m.jl_Integer$().bitCount__I__I(bitmap) === elems.u["length"]));
  return this
});
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$5 === (-1))) {
    return this.elems$5.u[(31 & index)].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$5 & mask) !== 0)) {
    var offset = ScalaJS.m.jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
    return this.elems$5.u[offset].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    return false
  }
});
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  if ((that === this)) {
    return true
  } else {
    if (ScalaJS.is.sci_HashSet$HashTrieSet(that)) {
      var x2 = ScalaJS.as.sci_HashSet$HashTrieSet(that);
      if ((this.size0$5 <= x2.size0$5)) {
        var abm = this.bitmap$5;
        var a = this.elems$5;
        var ai = 0;
        var b = x2.elems$5;
        var bbm = x2.bitmap$5;
        var bi = 0;
        if (((abm & bbm) === abm)) {
          while ((abm !== 0)) {
            var alsb = (abm ^ (abm & (((-1) + abm) | 0)));
            var blsb = (bbm ^ (bbm & (((-1) + bbm) | 0)));
            if ((alsb === blsb)) {
              if ((!a.u[ai].subsetOf0__sci_HashSet__I__Z(b.u[bi], ((5 + level) | 0)))) {
                return false
              };
              abm = (abm & (~alsb));
              ai = ((1 + ai) | 0)
            };
            bbm = (bbm & (~blsb));
            bi = ((1 + bi) | 0)
          };
          return true
        } else {
          return false
        }
      }
    };
    return false
  }
});
ScalaJS.is.sci_HashSet$HashTrieSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashTrieSet)))
});
ScalaJS.as.sci_HashSet$HashTrieSet = (function(obj) {
  return ((ScalaJS.is.sci_HashSet$HashTrieSet(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.HashSet$HashTrieSet"))
});
ScalaJS.isArrayOf.sci_HashSet$HashTrieSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashTrieSet)))
});
ScalaJS.asArrayOf.sci_HashSet$HashTrieSet = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_HashSet$HashTrieSet(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashTrieSet;", depth))
});
ScalaJS.d.sci_HashSet$HashTrieSet = new ScalaJS.ClassTypeData({
  sci_HashSet$HashTrieSet: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet", {
  sci_HashSet$HashTrieSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_HashSet$HashTrieSet.prototype.$classData = ScalaJS.d.sci_HashSet$HashTrieSet;
/** @constructor */
ScalaJS.c.sci_HashSet$LeafHashSet = (function() {
  ScalaJS.c.sci_HashSet.call(this)
});
ScalaJS.c.sci_HashSet$LeafHashSet.prototype = new ScalaJS.h.sci_HashSet();
ScalaJS.c.sci_HashSet$LeafHashSet.prototype.constructor = ScalaJS.c.sci_HashSet$LeafHashSet;
/** @constructor */
ScalaJS.h.sci_HashSet$LeafHashSet = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashSet$LeafHashSet.prototype = ScalaJS.c.sci_HashSet$LeafHashSet.prototype;
/** @constructor */
ScalaJS.c.sci_ListMap = (function() {
  ScalaJS.c.sci_AbstractMap.call(this)
});
ScalaJS.c.sci_ListMap.prototype = new ScalaJS.h.sci_AbstractMap();
ScalaJS.c.sci_ListMap.prototype.constructor = ScalaJS.c.sci_ListMap;
/** @constructor */
ScalaJS.h.sci_ListMap = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListMap.prototype = ScalaJS.c.sci_ListMap.prototype;
ScalaJS.c.sci_ListMap.prototype.value__O = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("empty map")
});
ScalaJS.c.sci_ListMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_ListMap.prototype.empty__sc_Map = (function() {
  return ScalaJS.m.sci_ListMap$EmptyListMap$()
});
ScalaJS.c.sci_ListMap.prototype.empty__sci_Map = (function() {
  return ScalaJS.m.sci_ListMap$EmptyListMap$()
});
ScalaJS.c.sci_ListMap.prototype.size__I = (function() {
  return 0
});
ScalaJS.c.sci_ListMap.prototype.seq__sc_Map = (function() {
  return this
});
ScalaJS.c.sci_ListMap.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new ScalaJS.c.sci_ListMap$$anon$1().init___sci_ListMap(this);
  var this$2 = ScalaJS.m.sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  var this$3 = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableOnce$class__to__sc_TraversableOnce__scg_CanBuildFrom__O(this$1, cbf));
  return ScalaJS.s.sc_SeqLike$class__reverseIterator__sc_SeqLike__sc_Iterator(this$3)
});
ScalaJS.c.sci_ListMap.prototype.key__O = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("empty map")
});
ScalaJS.c.sci_ListMap.prototype.updated__O__O__sci_Map = (function(key, value) {
  return this.updated__O__O__sci_ListMap(key, value)
});
ScalaJS.c.sci_ListMap.prototype.updated__O__O__sci_ListMap = (function(key, value) {
  return new ScalaJS.c.sci_ListMap$Node().init___sci_ListMap__O__O(this, key, value)
});
ScalaJS.c.sci_ListMap.prototype.get__O__s_Option = (function(key) {
  return ScalaJS.m.s_None$()
});
ScalaJS.c.sci_ListMap.prototype.next__sci_ListMap = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("empty map")
});
ScalaJS.c.sci_ListMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_ListMap(kv.$$und1$f, kv.$$und2$f)
});
ScalaJS.is.sci_ListMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListMap)))
});
ScalaJS.as.sci_ListMap = (function(obj) {
  return ((ScalaJS.is.sci_ListMap(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.ListMap"))
});
ScalaJS.isArrayOf.sci_ListMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListMap)))
});
ScalaJS.asArrayOf.sci_ListMap = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_ListMap(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.ListMap;", depth))
});
/** @constructor */
ScalaJS.c.sci_Map$EmptyMap$ = (function() {
  ScalaJS.c.sci_AbstractMap.call(this)
});
ScalaJS.c.sci_Map$EmptyMap$.prototype = new ScalaJS.h.sci_AbstractMap();
ScalaJS.c.sci_Map$EmptyMap$.prototype.constructor = ScalaJS.c.sci_Map$EmptyMap$;
/** @constructor */
ScalaJS.h.sci_Map$EmptyMap$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Map$EmptyMap$.prototype = ScalaJS.c.sci_Map$EmptyMap$.prototype;
ScalaJS.c.sci_Map$EmptyMap$.prototype.iterator__sc_Iterator = (function() {
  return ScalaJS.m.sc_Iterator$().empty$1
});
ScalaJS.c.sci_Map$EmptyMap$.prototype.size__I = (function() {
  return 0
});
ScalaJS.c.sci_Map$EmptyMap$.prototype.updated__O__O__sci_Map = (function(key, value) {
  return new ScalaJS.c.sci_Map$Map1().init___O__O(key, value)
});
ScalaJS.c.sci_Map$EmptyMap$.prototype.get__O__s_Option = (function(key) {
  return ScalaJS.m.s_None$()
});
ScalaJS.c.sci_Map$EmptyMap$.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  var key = kv.$$und1$f;
  var value = kv.$$und2$f;
  return new ScalaJS.c.sci_Map$Map1().init___O__O(key, value)
});
ScalaJS.d.sci_Map$EmptyMap$ = new ScalaJS.ClassTypeData({
  sci_Map$EmptyMap$: 0
}, false, "scala.collection.immutable.Map$EmptyMap$", {
  sci_Map$EmptyMap$: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Map$EmptyMap$.prototype.$classData = ScalaJS.d.sci_Map$EmptyMap$;
ScalaJS.n.sci_Map$EmptyMap$ = (void 0);
ScalaJS.m.sci_Map$EmptyMap$ = (function() {
  if ((!ScalaJS.n.sci_Map$EmptyMap$)) {
    ScalaJS.n.sci_Map$EmptyMap$ = new ScalaJS.c.sci_Map$EmptyMap$().init___()
  };
  return ScalaJS.n.sci_Map$EmptyMap$
});
/** @constructor */
ScalaJS.c.sci_Map$Map1 = (function() {
  ScalaJS.c.sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null
});
ScalaJS.c.sci_Map$Map1.prototype = new ScalaJS.h.sci_AbstractMap();
ScalaJS.c.sci_Map$Map1.prototype.constructor = ScalaJS.c.sci_Map$Map1;
/** @constructor */
ScalaJS.h.sci_Map$Map1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Map$Map1.prototype = ScalaJS.c.sci_Map$Map1.prototype;
ScalaJS.c.sci_Map$Map1.prototype.init___O__O = (function(key1, value1) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  return this
});
ScalaJS.c.sci_Map$Map1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5))
});
ScalaJS.c.sci_Map$Map1.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5)]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_Map$Map1.prototype.size__I = (function() {
  return 1
});
ScalaJS.c.sci_Map$Map1.prototype.updated__O__O__sci_Map = (function(key, value) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new ScalaJS.c.sci_Map$Map1().init___O__O(this.key1$5, value) : new ScalaJS.c.sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, key, value))
});
ScalaJS.c.sci_Map$Map1.prototype.get__O__s_Option = (function(key) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new ScalaJS.c.s_Some().init___O(this.value1$5) : ScalaJS.m.s_None$())
});
ScalaJS.c.sci_Map$Map1.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
ScalaJS.d.sci_Map$Map1 = new ScalaJS.ClassTypeData({
  sci_Map$Map1: 0
}, false, "scala.collection.immutable.Map$Map1", {
  sci_Map$Map1: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Map$Map1.prototype.$classData = ScalaJS.d.sci_Map$Map1;
/** @constructor */
ScalaJS.c.sci_Map$Map2 = (function() {
  ScalaJS.c.sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null
});
ScalaJS.c.sci_Map$Map2.prototype = new ScalaJS.h.sci_AbstractMap();
ScalaJS.c.sci_Map$Map2.prototype.constructor = ScalaJS.c.sci_Map$Map2;
/** @constructor */
ScalaJS.h.sci_Map$Map2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Map$Map2.prototype = ScalaJS.c.sci_Map$Map2.prototype;
ScalaJS.c.sci_Map$Map2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key2$5, this.value2$5))
});
ScalaJS.c.sci_Map$Map2.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5), new ScalaJS.c.T2().init___O__O(this.key2$5, this.value2$5)]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_Map$Map2.prototype.size__I = (function() {
  return 2
});
ScalaJS.c.sci_Map$Map2.prototype.updated__O__O__sci_Map = (function(key, value) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new ScalaJS.c.sci_Map$Map2().init___O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new ScalaJS.c.sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value) : new ScalaJS.c.sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, key, value)))
});
ScalaJS.c.sci_Map$Map2.prototype.get__O__s_Option = (function(key) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new ScalaJS.c.s_Some().init___O(this.value1$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new ScalaJS.c.s_Some().init___O(this.value2$5) : ScalaJS.m.s_None$()))
});
ScalaJS.c.sci_Map$Map2.prototype.init___O__O__O__O = (function(key1, value1, key2, value2) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  return this
});
ScalaJS.c.sci_Map$Map2.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
ScalaJS.d.sci_Map$Map2 = new ScalaJS.ClassTypeData({
  sci_Map$Map2: 0
}, false, "scala.collection.immutable.Map$Map2", {
  sci_Map$Map2: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Map$Map2.prototype.$classData = ScalaJS.d.sci_Map$Map2;
/** @constructor */
ScalaJS.c.sci_Map$Map3 = (function() {
  ScalaJS.c.sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null;
  this.key3$5 = null;
  this.value3$5 = null
});
ScalaJS.c.sci_Map$Map3.prototype = new ScalaJS.h.sci_AbstractMap();
ScalaJS.c.sci_Map$Map3.prototype.constructor = ScalaJS.c.sci_Map$Map3;
/** @constructor */
ScalaJS.h.sci_Map$Map3 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Map$Map3.prototype = ScalaJS.c.sci_Map$Map3.prototype;
ScalaJS.c.sci_Map$Map3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key2$5, this.value2$5));
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key3$5, this.value3$5))
});
ScalaJS.c.sci_Map$Map3.prototype.init___O__O__O__O__O__O = (function(key1, value1, key2, value2, key3, value3) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  this.key3$5 = key3;
  this.value3$5 = value3;
  return this
});
ScalaJS.c.sci_Map$Map3.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5), new ScalaJS.c.T2().init___O__O(this.key2$5, this.value2$5), new ScalaJS.c.T2().init___O__O(this.key3$5, this.value3$5)]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_Map$Map3.prototype.size__I = (function() {
  return 3
});
ScalaJS.c.sci_Map$Map3.prototype.updated__O__O__sci_Map = (function(key, value) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new ScalaJS.c.sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new ScalaJS.c.sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new ScalaJS.c.sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value) : new ScalaJS.c.sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, key, value))))
});
ScalaJS.c.sci_Map$Map3.prototype.get__O__s_Option = (function(key) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new ScalaJS.c.s_Some().init___O(this.value1$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new ScalaJS.c.s_Some().init___O(this.value2$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new ScalaJS.c.s_Some().init___O(this.value3$5) : ScalaJS.m.s_None$())))
});
ScalaJS.c.sci_Map$Map3.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
ScalaJS.d.sci_Map$Map3 = new ScalaJS.ClassTypeData({
  sci_Map$Map3: 0
}, false, "scala.collection.immutable.Map$Map3", {
  sci_Map$Map3: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Map$Map3.prototype.$classData = ScalaJS.d.sci_Map$Map3;
/** @constructor */
ScalaJS.c.sci_Map$Map4 = (function() {
  ScalaJS.c.sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null;
  this.key3$5 = null;
  this.value3$5 = null;
  this.key4$5 = null;
  this.value4$5 = null
});
ScalaJS.c.sci_Map$Map4.prototype = new ScalaJS.h.sci_AbstractMap();
ScalaJS.c.sci_Map$Map4.prototype.constructor = ScalaJS.c.sci_Map$Map4;
/** @constructor */
ScalaJS.h.sci_Map$Map4 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Map$Map4.prototype = ScalaJS.c.sci_Map$Map4.prototype;
ScalaJS.c.sci_Map$Map4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key2$5, this.value2$5));
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key3$5, this.value3$5));
  f.apply__O__O(new ScalaJS.c.T2().init___O__O(this.key4$5, this.value4$5))
});
ScalaJS.c.sci_Map$Map4.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5), new ScalaJS.c.T2().init___O__O(this.key2$5, this.value2$5), new ScalaJS.c.T2().init___O__O(this.key3$5, this.value3$5), new ScalaJS.c.T2().init___O__O(this.key4$5, this.value4$5)]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_Map$Map4.prototype.size__I = (function() {
  return 4
});
ScalaJS.c.sci_Map$Map4.prototype.init___O__O__O__O__O__O__O__O = (function(key1, value1, key2, value2, key3, value3, key4, value4) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  this.key3$5 = key3;
  this.value3$5 = value3;
  this.key4$5 = key4;
  this.value4$5 = value4;
  return this
});
ScalaJS.c.sci_Map$Map4.prototype.updated__O__O__sci_Map = (function(key, value) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new ScalaJS.c.sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new ScalaJS.c.sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new ScalaJS.c.sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value, this.key4$5, this.value4$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new ScalaJS.c.sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, value) : new ScalaJS.c.sci_HashMap().init___().$$plus__T2__T2__sc_Seq__sci_HashMap(new ScalaJS.c.T2().init___O__O(this.key1$5, this.value1$5), new ScalaJS.c.T2().init___O__O(this.key2$5, this.value2$5), new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([new ScalaJS.c.T2().init___O__O(this.key3$5, this.value3$5), new ScalaJS.c.T2().init___O__O(this.key4$5, this.value4$5), new ScalaJS.c.T2().init___O__O(key, value)]))))))
});
ScalaJS.c.sci_Map$Map4.prototype.get__O__s_Option = (function(key) {
  return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new ScalaJS.c.s_Some().init___O(this.value1$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new ScalaJS.c.s_Some().init___O(this.value2$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new ScalaJS.c.s_Some().init___O(this.value3$5) : (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new ScalaJS.c.s_Some().init___O(this.value4$5) : ScalaJS.m.s_None$()))))
});
ScalaJS.c.sci_Map$Map4.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
ScalaJS.d.sci_Map$Map4 = new ScalaJS.ClassTypeData({
  sci_Map$Map4: 0
}, false, "scala.collection.immutable.Map$Map4", {
  sci_Map$Map4: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Map$Map4.prototype.$classData = ScalaJS.d.sci_Map$Map4;
/** @constructor */
ScalaJS.c.sci_Map$WithDefault = (function() {
  ScalaJS.c.sc_Map$WithDefault.call(this);
  this.underlying$5 = null;
  this.d$5 = null
});
ScalaJS.c.sci_Map$WithDefault.prototype = new ScalaJS.h.sc_Map$WithDefault();
ScalaJS.c.sci_Map$WithDefault.prototype.constructor = ScalaJS.c.sci_Map$WithDefault;
/** @constructor */
ScalaJS.h.sci_Map$WithDefault = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Map$WithDefault.prototype = ScalaJS.c.sci_Map$WithDefault.prototype;
ScalaJS.c.sci_Map$WithDefault.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Map$WithDefault.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Map$WithDefault.prototype.init___sci_Map__F1 = (function(underlying, d) {
  this.underlying$5 = underlying;
  this.d$5 = d;
  ScalaJS.c.sc_Map$WithDefault.prototype.init___sc_Map__F1.call(this, underlying, d);
  return this
});
ScalaJS.c.sci_Map$WithDefault.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Iterable$()
});
ScalaJS.c.sci_Map$WithDefault.prototype.empty__sc_Map = (function() {
  return this.empty__sci_Map$WithDefault()
});
ScalaJS.c.sci_Map$WithDefault.prototype.withDefaultValue__O__sci_Map = (function(d) {
  return new ScalaJS.c.sci_Map$WithDefault().init___sci_Map__F1(this.underlying$5, new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, d$1) {
    return (function(x$2) {
      return d$1
    })
  })(this, d)))
});
ScalaJS.c.sci_Map$WithDefault.prototype.empty__sci_Map = (function() {
  return this.empty__sci_Map$WithDefault()
});
ScalaJS.c.sci_Map$WithDefault.prototype.seq__sc_Map = (function() {
  return this
});
ScalaJS.c.sci_Map$WithDefault.prototype.updated__O__O__sci_Map = (function(key, value) {
  return this.updated__O__O__sci_Map$WithDefault(key, value)
});
ScalaJS.c.sci_Map$WithDefault.prototype.empty__sci_Map$WithDefault = (function() {
  return new ScalaJS.c.sci_Map$WithDefault().init___sci_Map__F1(this.underlying$5.empty__sci_Map(), this.d$5)
});
ScalaJS.c.sci_Map$WithDefault.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map$WithDefault(kv.$$und1$f, kv.$$und2$f)
});
ScalaJS.c.sci_Map$WithDefault.prototype.updated__O__O__sci_Map$WithDefault = (function(key, value) {
  return new ScalaJS.c.sci_Map$WithDefault().init___sci_Map__F1(this.underlying$5.updated__O__O__sci_Map(key, value), this.d$5)
});
ScalaJS.d.sci_Map$WithDefault = new ScalaJS.ClassTypeData({
  sci_Map$WithDefault: 0
}, false, "scala.collection.immutable.Map$WithDefault", {
  sci_Map$WithDefault: 1,
  sc_Map$WithDefault: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1
});
ScalaJS.c.sci_Map$WithDefault.prototype.$classData = ScalaJS.d.sci_Map$WithDefault;
/** @constructor */
ScalaJS.c.sci_HashMap = (function() {
  ScalaJS.c.sci_AbstractMap.call(this)
});
ScalaJS.c.sci_HashMap.prototype = new ScalaJS.h.sci_AbstractMap();
ScalaJS.c.sci_HashMap.prototype.constructor = ScalaJS.c.sci_HashMap;
/** @constructor */
ScalaJS.h.sci_HashMap = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap.prototype = ScalaJS.c.sci_HashMap.prototype;
ScalaJS.c.sci_HashMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_HashMap.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I(ScalaJS.m.sr_ScalaRunTime$().hash__O__I(key))
});
ScalaJS.c.sci_HashMap.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_HashMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_HashMap.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  return new ScalaJS.c.sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv)
});
ScalaJS.c.sci_HashMap.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return ScalaJS.m.s_None$()
});
ScalaJS.c.sci_HashMap.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
ScalaJS.c.sci_HashMap.prototype.$$plus__T2__sci_HashMap = (function(kv) {
  return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(kv.$$und1$f, this.computeHash__O__I(kv.$$und1$f), 0, kv.$$und2$f, kv, null)
});
ScalaJS.c.sci_HashMap.prototype.empty__sc_Map = (function() {
  ScalaJS.m.sci_HashMap$();
  return ScalaJS.m.sci_HashMap$EmptyHashMap$()
});
ScalaJS.c.sci_HashMap.prototype.updated__O__O__sci_HashMap = (function(key, value) {
  return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, this.computeHash__O__I(key), 0, value, null, null)
});
ScalaJS.c.sci_HashMap.prototype.empty__sci_Map = (function() {
  ScalaJS.m.sci_HashMap$();
  return ScalaJS.m.sci_HashMap$EmptyHashMap$()
});
ScalaJS.c.sci_HashMap.prototype.seq__sc_Map = (function() {
  return this
});
ScalaJS.c.sci_HashMap.prototype.size__I = (function() {
  return 0
});
ScalaJS.c.sci_HashMap.prototype.iterator__sc_Iterator = (function() {
  return ScalaJS.m.sc_Iterator$().empty$1
});
ScalaJS.c.sci_HashMap.prototype.updated__O__O__sci_Map = (function(key, value) {
  return this.updated__O__O__sci_HashMap(key, value)
});
ScalaJS.c.sci_HashMap.prototype.get__O__s_Option = (function(key) {
  return this.get0__O__I__I__s_Option(key, this.computeHash__O__I(key), 0)
});
ScalaJS.c.sci_HashMap.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
ScalaJS.c.sci_HashMap.prototype.$$plus__T2__T2__sc_Seq__sci_HashMap = (function(elem1, elem2, elems) {
  var this$2 = this.$$plus__T2__sci_HashMap(elem1).$$plus__T2__sci_HashMap(elem2);
  var this$1 = ScalaJS.m.sci_HashMap$();
  var bf = new ScalaJS.c.scg_GenMapFactory$MapCanBuildFrom().init___scg_GenMapFactory(this$1);
  return ScalaJS.as.sci_HashMap(ScalaJS.s.sc_TraversableLike$class__$$plus$plus__sc_TraversableLike__sc_GenTraversableOnce__scg_CanBuildFrom__O(this$2, elems, bf))
});
ScalaJS.c.sci_HashMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.$$plus__T2__sci_HashMap(kv)
});
ScalaJS.is.sci_HashMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap)))
});
ScalaJS.as.sci_HashMap = (function(obj) {
  return ((ScalaJS.is.sci_HashMap(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.HashMap"))
});
ScalaJS.isArrayOf.sci_HashMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap)))
});
ScalaJS.asArrayOf.sci_HashMap = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_HashMap(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.HashMap;", depth))
});
ScalaJS.d.sci_HashMap = new ScalaJS.ClassTypeData({
  sci_HashMap: 0
}, false, "scala.collection.immutable.HashMap", {
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
ScalaJS.c.sci_HashMap.prototype.$classData = ScalaJS.d.sci_HashMap;
/** @constructor */
ScalaJS.c.sci_HashSet$HashSet1 = (function() {
  ScalaJS.c.sci_HashSet$LeafHashSet.call(this);
  this.key$6 = null;
  this.hash$6 = 0
});
ScalaJS.c.sci_HashSet$HashSet1.prototype = new ScalaJS.h.sci_HashSet$LeafHashSet();
ScalaJS.c.sci_HashSet$HashSet1.prototype.constructor = ScalaJS.c.sci_HashSet$HashSet1;
/** @constructor */
ScalaJS.h.sci_HashSet$HashSet1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashSet$HashSet1.prototype = ScalaJS.c.sci_HashSet$HashSet1.prototype;
ScalaJS.c.sci_HashSet$HashSet1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  if (((hash === this.hash$6) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    return this
  } else if ((hash !== this.hash$6)) {
    return ScalaJS.m.sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new ScalaJS.c.sci_HashSet$HashSet1().init___O__I(key, hash), level)
  } else {
    var this$2 = ScalaJS.m.sci_ListSet$EmptyListSet$();
    var elem = this.key$6;
    return new ScalaJS.c.sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, new ScalaJS.c.sci_ListSet$Node().init___sci_ListSet__O(this$2, elem).$$plus__O__sci_ListSet(key))
  }
});
ScalaJS.c.sci_HashSet$HashSet1.prototype.init___O__I = (function(key, hash) {
  this.key$6 = key;
  this.hash$6 = hash;
  return this
});
ScalaJS.c.sci_HashSet$HashSet1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.key$6)
});
ScalaJS.c.sci_HashSet$HashSet1.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.key$6]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_HashSet$HashSet1.prototype.size__I = (function() {
  return 1
});
ScalaJS.c.sci_HashSet$HashSet1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
ScalaJS.c.sci_HashSet$HashSet1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return that.get0__O__I__I__Z(this.key$6, this.hash$6, level)
});
ScalaJS.is.sci_HashSet$HashSet1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashSet1)))
});
ScalaJS.as.sci_HashSet$HashSet1 = (function(obj) {
  return ((ScalaJS.is.sci_HashSet$HashSet1(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.HashSet$HashSet1"))
});
ScalaJS.isArrayOf.sci_HashSet$HashSet1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashSet1)))
});
ScalaJS.asArrayOf.sci_HashSet$HashSet1 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_HashSet$HashSet1(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashSet1;", depth))
});
ScalaJS.d.sci_HashSet$HashSet1 = new ScalaJS.ClassTypeData({
  sci_HashSet$HashSet1: 0
}, false, "scala.collection.immutable.HashSet$HashSet1", {
  sci_HashSet$HashSet1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_HashSet$HashSet1.prototype.$classData = ScalaJS.d.sci_HashSet$HashSet1;
/** @constructor */
ScalaJS.c.sci_HashSet$HashSetCollision1 = (function() {
  ScalaJS.c.sci_HashSet$LeafHashSet.call(this);
  this.hash$6 = 0;
  this.ks$6 = null
});
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype = new ScalaJS.h.sci_HashSet$LeafHashSet();
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.constructor = ScalaJS.c.sci_HashSet$HashSetCollision1;
/** @constructor */
ScalaJS.h.sci_HashSet$HashSetCollision1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashSet$HashSetCollision1.prototype = ScalaJS.c.sci_HashSet$HashSetCollision1.prototype;
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return ((hash === this.hash$6) ? new ScalaJS.c.sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, this.ks$6.$$plus__O__sci_ListSet(key)) : ScalaJS.m.sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new ScalaJS.c.sci_HashSet$HashSet1().init___O__I(key, hash), level))
});
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.ks$6;
  var this$2 = new ScalaJS.c.sci_ListSet$$anon$1().init___sci_ListSet(this$1);
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this$2, f)
});
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.ks$6;
  return new ScalaJS.c.sci_ListSet$$anon$1().init___sci_ListSet(this$1)
});
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.size__I = (function() {
  return this.ks$6.size__I()
});
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.init___I__sci_ListSet = (function(hash, ks) {
  this.hash$6 = hash;
  this.ks$6 = ks;
  return this
});
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.ks$6.contains__O__Z(key))
});
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  var this$1 = this.ks$6;
  var this$2 = new ScalaJS.c.sci_ListSet$$anon$1().init___sci_ListSet(this$1);
  var res = true;
  while (true) {
    if (res) {
      var this$3 = this$2.that$2;
      var jsx$1 = ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$3)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var arg1 = this$2.next__O();
      res = that.get0__O__I__I__Z(arg1, this.hash$6, level)
    } else {
      break
    }
  };
  return res
});
ScalaJS.d.sci_HashSet$HashSetCollision1 = new ScalaJS.ClassTypeData({
  sci_HashSet$HashSetCollision1: 0
}, false, "scala.collection.immutable.HashSet$HashSetCollision1", {
  sci_HashSet$HashSetCollision1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_HashSet$HashSetCollision1.prototype.$classData = ScalaJS.d.sci_HashSet$HashSetCollision1;
/** @constructor */
ScalaJS.c.sci_List = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this)
});
ScalaJS.c.sci_List.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.sci_List.prototype.constructor = ScalaJS.c.sci_List;
/** @constructor */
ScalaJS.h.sci_List = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_List.prototype = ScalaJS.c.sci_List.prototype;
ScalaJS.c.sci_List.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
ScalaJS.c.sci_List.prototype.apply__O__O = (function(v1) {
  var n = ScalaJS.uI(v1);
  return ScalaJS.s.sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
ScalaJS.c.sci_List.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sci_List.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__exists__sc_LinearSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.sci_List.prototype.toList__sci_List = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ((bf === ScalaJS.m.sci_List$().ReusableCBFInstance$2)) {
    if ((this === ScalaJS.m.sci_Nil$())) {
      return ScalaJS.m.sci_Nil$()
    } else {
      var rest = this;
      var found = new ScalaJS.c.sr_BooleanRef().init___Z(false);
      var h = new ScalaJS.c.sr_ObjectRef().init___O(null);
      var t = new ScalaJS.c.sr_ObjectRef().init___O(null);
      while ((rest !== ScalaJS.m.sci_Nil$())) {
        ScalaJS.as.sc_GenTraversableOnce(f.apply__O__O(rest.head__O())).foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, found$1, h$1, t$1) {
          return (function(b$2) {
            if ((!found$1.elem$1)) {
              h$1.elem$1 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(b$2, ScalaJS.m.sci_Nil$());
              t$1.elem$1 = ScalaJS.as.sci_$colon$colon(h$1.elem$1);
              found$1.elem$1 = true
            } else {
              var nx = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(b$2, ScalaJS.m.sci_Nil$());
              ScalaJS.as.sci_$colon$colon(t$1.elem$1).tl$5 = nx;
              t$1.elem$1 = nx
            }
          })
        })(this, found, h, t)));
        var this$4 = rest;
        rest = this$4.tail__sci_List()
      };
      return ((!found.elem$1) ? ScalaJS.m.sci_Nil$() : ScalaJS.as.sci_$colon$colon(h.elem$1))
    }
  } else {
    return ScalaJS.s.sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
ScalaJS.c.sci_List.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_List(n)
});
ScalaJS.c.sci_List.prototype.take__I__sci_List = (function(n) {
  if ((this.isEmpty__Z() || (n <= 0))) {
    return ScalaJS.m.sci_Nil$()
  } else {
    var h = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(this.head__O(), ScalaJS.m.sci_Nil$());
    var t = h;
    var rest = this.tail__sci_List();
    var i = 1;
    while (true) {
      if (rest.isEmpty__Z()) {
        return this
      };
      if ((i < n)) {
        i = ((1 + i) | 0);
        var nx = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(rest.head__O(), ScalaJS.m.sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$1 = rest;
        rest = this$1.tail__sci_List()
      } else {
        break
      }
    };
    return h
  }
});
ScalaJS.c.sci_List.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_List$()
});
ScalaJS.c.sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$1 = these;
    these = this$1.tail__sci_List()
  }
});
ScalaJS.c.sci_List.prototype.foldLeft__O__F2__O = (function(z, f) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__foldLeft__sc_LinearSeqOptimized__O__F2__O(this, z, f)
});
ScalaJS.c.sci_List.prototype.$$colon$colon$colon__sci_List__sci_List = (function(prefix) {
  return (this.isEmpty__Z() ? prefix : (prefix.isEmpty__Z() ? this : new ScalaJS.c.scm_ListBuffer().init___().$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(prefix).prependToList__sci_List__sci_List(this)))
});
ScalaJS.c.sci_List.prototype.reverse__O = (function() {
  return this.reverse__sci_List()
});
ScalaJS.c.sci_List.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
});
ScalaJS.c.sci_List.prototype.drop__I__sci_List = (function(n) {
  var these = this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    var this$1 = these;
    these = this$1.tail__sci_List();
    count = (((-1) + count) | 0)
  };
  return these
});
ScalaJS.c.sci_List.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.length__I = (function() {
  return ScalaJS.s.sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I(this)
});
ScalaJS.c.sci_List.prototype.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O = (function(that, bf) {
  return ((bf === ScalaJS.m.sci_List$().ReusableCBFInstance$2) ? that.seq__sc_TraversableOnce().toList__sci_List().$$colon$colon$colon__sci_List__sci_List(this) : ScalaJS.s.sc_TraversableLike$class__$$plus$plus__sc_TraversableLike__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that, bf))
});
ScalaJS.c.sci_List.prototype.take__I__O = (function(n) {
  return this.take__I__sci_List(n)
});
ScalaJS.c.sci_List.prototype.toStream__sci_Stream = (function() {
  return (this.isEmpty__Z() ? ScalaJS.m.sci_Stream$Empty$() : new ScalaJS.c.sci_Stream$Cons().init___O__F0(this.head__O(), new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      return this$2.tail__sci_List().toStream__sci_Stream()
    })
  })(this))))
});
ScalaJS.c.sci_List.prototype.contains__O__Z = (function(elem) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__contains__sc_LinearSeqOptimized__O__Z(this, elem)
});
ScalaJS.c.sci_List.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sci_List.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ((bf === ScalaJS.m.sci_List$().ReusableCBFInstance$2)) {
    if ((this === ScalaJS.m.sci_Nil$())) {
      return ScalaJS.m.sci_Nil$()
    } else {
      var h = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(f.apply__O__O(this.head__O()), ScalaJS.m.sci_Nil$());
      var t = h;
      var rest = this.tail__sci_List();
      while ((rest !== ScalaJS.m.sci_Nil$())) {
        var nx = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(f.apply__O__O(rest.head__O()), ScalaJS.m.sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$1 = rest;
        rest = this$1.tail__sci_List()
      };
      return h
    }
  } else {
    return ScalaJS.s.sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
ScalaJS.c.sci_List.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = ScalaJS.as.sc_LinearSeqLike(repr);
  return ScalaJS.as.sc_LinearSeq(repr$1)
});
ScalaJS.c.sci_List.prototype.reverse__sci_List = (function() {
  var result = ScalaJS.m.sci_Nil$();
  var these = this;
  while ((!these.isEmpty__Z())) {
    var x$4 = these.head__O();
    var this$1 = result;
    result = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(x$4, this$1);
    var this$2 = these;
    these = this$2.tail__sci_List()
  };
  return result
});
ScalaJS.c.sci_List.prototype.stringPrefix__T = (function() {
  return "List"
});
ScalaJS.is.sci_List = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
});
ScalaJS.as.sci_List = (function(obj) {
  return ((ScalaJS.is.sci_List(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.List"))
});
ScalaJS.isArrayOf.sci_List = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
});
ScalaJS.asArrayOf.sci_List = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_List(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
});
/** @constructor */
ScalaJS.c.sci_ListMap$EmptyListMap$ = (function() {
  ScalaJS.c.sci_ListMap.call(this)
});
ScalaJS.c.sci_ListMap$EmptyListMap$.prototype = new ScalaJS.h.sci_ListMap();
ScalaJS.c.sci_ListMap$EmptyListMap$.prototype.constructor = ScalaJS.c.sci_ListMap$EmptyListMap$;
/** @constructor */
ScalaJS.h.sci_ListMap$EmptyListMap$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListMap$EmptyListMap$.prototype = ScalaJS.c.sci_ListMap$EmptyListMap$.prototype;
ScalaJS.d.sci_ListMap$EmptyListMap$ = new ScalaJS.ClassTypeData({
  sci_ListMap$EmptyListMap$: 0
}, false, "scala.collection.immutable.ListMap$EmptyListMap$", {
  sci_ListMap$EmptyListMap$: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_ListMap$EmptyListMap$.prototype.$classData = ScalaJS.d.sci_ListMap$EmptyListMap$;
ScalaJS.n.sci_ListMap$EmptyListMap$ = (void 0);
ScalaJS.m.sci_ListMap$EmptyListMap$ = (function() {
  if ((!ScalaJS.n.sci_ListMap$EmptyListMap$)) {
    ScalaJS.n.sci_ListMap$EmptyListMap$ = new ScalaJS.c.sci_ListMap$EmptyListMap$().init___()
  };
  return ScalaJS.n.sci_ListMap$EmptyListMap$
});
/** @constructor */
ScalaJS.c.sci_ListMap$Node = (function() {
  ScalaJS.c.sci_ListMap.call(this);
  this.key$6 = null;
  this.value$6 = null;
  this.$$outer$f = null
});
ScalaJS.c.sci_ListMap$Node.prototype = new ScalaJS.h.sci_ListMap();
ScalaJS.c.sci_ListMap$Node.prototype.constructor = ScalaJS.c.sci_ListMap$Node;
/** @constructor */
ScalaJS.h.sci_ListMap$Node = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_ListMap$Node.prototype = ScalaJS.c.sci_ListMap$Node.prototype;
ScalaJS.c.sci_ListMap$Node.prototype.value__O = (function() {
  return this.value$6
});
ScalaJS.c.sci_ListMap$Node.prototype.apply__O__O = (function(k) {
  return this.apply0__p6__sci_ListMap__O__O(this, k)
});
ScalaJS.c.sci_ListMap$Node.prototype.isEmpty__Z = (function() {
  return false
});
ScalaJS.c.sci_ListMap$Node.prototype.apply0__p6__sci_ListMap__O__O = (function(cur, k) {
  _apply0: while (true) {
    if (cur.isEmpty__Z()) {
      throw new ScalaJS.c.ju_NoSuchElementException().init___T(("key not found: " + k))
    } else if (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      return cur.value__O()
    } else {
      cur = cur.next__sci_ListMap();
      continue _apply0
    }
  }
});
ScalaJS.c.sci_ListMap$Node.prototype.size0__p6__sci_ListMap__I__I = (function(cur, acc) {
  _size0: while (true) {
    if (cur.isEmpty__Z()) {
      return acc
    } else {
      var temp$cur = cur.next__sci_ListMap();
      var temp$acc = ((1 + acc) | 0);
      cur = temp$cur;
      acc = temp$acc;
      continue _size0
    }
  }
});
ScalaJS.c.sci_ListMap$Node.prototype.size__I = (function() {
  return this.size0__p6__sci_ListMap__I__I(this, 0)
});
ScalaJS.c.sci_ListMap$Node.prototype.key__O = (function() {
  return this.key$6
});
ScalaJS.c.sci_ListMap$Node.prototype.updated__O__O__sci_Map = (function(key, value) {
  return this.updated__O__O__sci_ListMap(key, value)
});
ScalaJS.c.sci_ListMap$Node.prototype.updated__O__O__sci_ListMap = (function(k, v) {
  var m = this.remove0__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, ScalaJS.m.sci_Nil$());
  return new ScalaJS.c.sci_ListMap$Node().init___sci_ListMap__O__O(m, k, v)
});
ScalaJS.c.sci_ListMap$Node.prototype.get__O__s_Option = (function(k) {
  return this.get0__p6__sci_ListMap__O__s_Option(this, k)
});
ScalaJS.c.sci_ListMap$Node.prototype.get0__p6__sci_ListMap__O__s_Option = (function(cur, k) {
  _get0: while (true) {
    if (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      return new ScalaJS.c.s_Some().init___O(cur.value__O())
    } else {
      var this$1 = cur.next__sci_ListMap();
      if (ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
        cur = cur.next__sci_ListMap();
        continue _get0
      } else {
        return ScalaJS.m.s_None$()
      }
    }
  }
});
ScalaJS.c.sci_ListMap$Node.prototype.init___sci_ListMap__O__O = (function($$outer, key, value) {
  this.key$6 = key;
  this.value$6 = value;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
ScalaJS.c.sci_ListMap$Node.prototype.remove0__p6__O__sci_ListMap__sci_List__sci_ListMap = (function(k, cur, acc) {
  _remove0: while (true) {
    if (cur.isEmpty__Z()) {
      var this$1 = acc;
      return ScalaJS.as.sci_ListMap(ScalaJS.s.sc_LinearSeqOptimized$class__last__sc_LinearSeqOptimized__O(this$1))
    } else if (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      var x$4 = cur.next__sci_ListMap();
      var this$2 = acc;
      var acc$1 = x$4;
      var these = this$2;
      while ((!these.isEmpty__Z())) {
        var arg1 = acc$1;
        var arg2 = these.head__O();
        var x0$1 = ScalaJS.as.sci_ListMap(arg1);
        var x1$1 = ScalaJS.as.sci_ListMap(arg2);
        matchEnd3: {
          acc$1 = new ScalaJS.c.sci_ListMap$Node().init___sci_ListMap__O__O(x0$1, x1$1.key__O(), x1$1.value__O());
          break matchEnd3
        };
        these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
      };
      return ScalaJS.as.sci_ListMap(acc$1)
    } else {
      var temp$cur = cur.next__sci_ListMap();
      var x$5 = cur;
      var this$3 = acc;
      var temp$acc = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(x$5, this$3);
      cur = temp$cur;
      acc = temp$acc;
      continue _remove0
    }
  }
});
ScalaJS.c.sci_ListMap$Node.prototype.next__sci_ListMap = (function() {
  return this.$$outer$f
});
ScalaJS.d.sci_ListMap$Node = new ScalaJS.ClassTypeData({
  sci_ListMap$Node: 0
}, false, "scala.collection.immutable.ListMap$Node", {
  sci_ListMap$Node: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_ListMap$Node.prototype.$classData = ScalaJS.d.sci_ListMap$Node;
/** @constructor */
ScalaJS.c.sci_Stream = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this)
});
ScalaJS.c.sci_Stream.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.sci_Stream.prototype.constructor = ScalaJS.c.sci_Stream;
/** @constructor */
ScalaJS.h.sci_Stream = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream.prototype = ScalaJS.c.sci_Stream.prototype;
ScalaJS.c.sci_Stream.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.reverse__sci_Stream = (function() {
  var elem = ScalaJS.m.sci_Stream$Empty$();
  var result = new ScalaJS.c.sr_ObjectRef().init___O(elem);
  var these = this;
  while ((!these.isEmpty__Z())) {
    ScalaJS.m.sci_Stream$();
    var stream = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, result$1) {
      return (function() {
        return ScalaJS.as.sci_Stream(result$1.elem$1)
      })
    })(this, result));
    var r = new ScalaJS.c.sci_Stream$ConsWrapper().init___F0(stream).$$hash$colon$colon__O__sci_Stream(these.head__O());
    r.tail__O();
    result.elem$1 = r;
    these = ScalaJS.as.sci_Stream(these.tail__O())
  };
  return ScalaJS.as.sci_Stream(result.elem$1)
});
ScalaJS.c.sci_Stream.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
ScalaJS.c.sci_Stream.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = ScalaJS.uI(v1);
  return ScalaJS.s.sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
ScalaJS.c.sci_Stream.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__exists__sc_LinearSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.sci_Stream.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if (ScalaJS.is.sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = ScalaJS.m.sci_Stream$Empty$()
    } else {
      var nonEmptyPrefix = new ScalaJS.c.sr_ObjectRef().init___O(this);
      var prefix = ScalaJS.as.sc_GenTraversableOnce(f.apply__O__O(ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream();
      while (((!ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z()) && prefix.isEmpty__Z())) {
        nonEmptyPrefix.elem$1 = ScalaJS.as.sci_Stream(ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).tail__O());
        if ((!ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z())) {
          prefix = ScalaJS.as.sc_GenTraversableOnce(f.apply__O__O(ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream()
        }
      };
      var x$1 = (ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z() ? (ScalaJS.m.sci_Stream$(), ScalaJS.m.sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2$1, f$1, nonEmptyPrefix$1) {
        return (function() {
          var x = ScalaJS.as.sci_Stream(ScalaJS.as.sci_Stream(nonEmptyPrefix$1.elem$1).tail__O()).flatMap__F1__scg_CanBuildFrom__O(f$1, (ScalaJS.m.sci_Stream$(), new ScalaJS.c.sci_Stream$StreamCanBuildFrom().init___()));
          return ScalaJS.as.sci_Stream(x)
        })
      })(this, f, nonEmptyPrefix))))
    };
    return x$1
  } else {
    return ScalaJS.s.sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
ScalaJS.c.sci_Stream.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_Stream(n)
});
ScalaJS.c.sci_Stream.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  this.force__sci_Stream();
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
ScalaJS.c.sci_Stream.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Stream$()
});
ScalaJS.c.sci_Stream.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, ("Stream" + "("), ", ", ")")
});
ScalaJS.c.sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  x: {
    _foreach: while (true) {
      if ((!_$this.isEmpty__Z())) {
        f.apply__O__O(_$this.head__O());
        _$this = ScalaJS.as.sci_Stream(_$this.tail__O());
        continue _foreach
      };
      break x
    }
  }
});
ScalaJS.c.sci_Stream.prototype.foldLeft__O__F2__O = (function(z, op) {
  var _$this = this;
  _foldLeft: while (true) {
    if (_$this.isEmpty__Z()) {
      return z
    } else {
      var temp$_$this = ScalaJS.as.sci_Stream(_$this.tail__O());
      var temp$z = op.apply__O__O__O(z, _$this.head__O());
      _$this = temp$_$this;
      z = temp$z;
      continue _foldLeft
    }
  }
});
ScalaJS.c.sci_Stream.prototype.filter__F1__sci_Stream = (function(p) {
  var rest = this;
  while (((!rest.isEmpty__Z()) && (!ScalaJS.uZ(p.apply__O__O(rest.head__O()))))) {
    rest = ScalaJS.as.sci_Stream(rest.tail__O())
  };
  var this$1 = rest;
  if (ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
    return ScalaJS.m.sci_Stream$().filteredTail__sci_Stream__F1__sci_Stream$Cons(rest, p)
  } else {
    return ScalaJS.m.sci_Stream$Empty$()
  }
});
ScalaJS.c.sci_Stream.prototype.filter__F1__O = (function(p) {
  return this.filter__F1__sci_Stream(p)
});
ScalaJS.c.sci_Stream.prototype.reverse__O = (function() {
  return this.reverse__sci_Stream()
});
ScalaJS.c.sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sci_StreamIterator().init___sci_Stream(this)
});
ScalaJS.c.sci_Stream.prototype.length__I = (function() {
  var len = 0;
  var left = this;
  while ((!left.isEmpty__Z())) {
    len = ((1 + len) | 0);
    left = ScalaJS.as.sci_Stream(left.tail__O())
  };
  return len
});
ScalaJS.c.sci_Stream.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.take__I__O = (function(n) {
  return this.take__I__sci_Stream(n)
});
ScalaJS.c.sci_Stream.prototype.toStream__sci_Stream = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.drop__I__sci_Stream = (function(n) {
  var _$this = this;
  _drop: while (true) {
    if (((n <= 0) || _$this.isEmpty__Z())) {
      return _$this
    } else {
      var temp$_$this = ScalaJS.as.sci_Stream(_$this.tail__O());
      var temp$n = (((-1) + n) | 0);
      _$this = temp$_$this;
      n = temp$n;
      continue _drop
    }
  }
});
ScalaJS.c.sci_Stream.prototype.contains__O__Z = (function(elem) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__contains__sc_LinearSeqOptimized__O__Z(this, elem)
});
ScalaJS.c.sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  b.append__T__scm_StringBuilder(start);
  if ((!this.isEmpty__Z())) {
    b.append__O__scm_StringBuilder(this.head__O());
    var cursor = this;
    var n = 1;
    if (cursor.tailDefined__Z()) {
      var scout = ScalaJS.as.sci_Stream(this.tail__O());
      if (scout.isEmpty__Z()) {
        b.append__T__scm_StringBuilder(end);
        return b
      };
      if (((cursor !== scout) && scout.tailDefined__Z())) {
        cursor = scout;
        scout = ScalaJS.as.sci_Stream(scout.tail__O());
        while (((cursor !== scout) && scout.tailDefined__Z())) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = ScalaJS.as.sci_Stream(cursor.tail__O());
          scout = ScalaJS.as.sci_Stream(scout.tail__O());
          if (scout.tailDefined__Z()) {
            scout = ScalaJS.as.sci_Stream(scout.tail__O())
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = ScalaJS.as.sci_Stream(cursor.tail__O())
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = ScalaJS.as.sci_Stream(runner.tail__O());
          scout = ScalaJS.as.sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if (((cursor === scout) && (k > 0))) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = ScalaJS.as.sci_Stream(cursor.tail__O())
        };
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = ScalaJS.as.sci_Stream(cursor.tail__O())
        };
        n = ((n - k) | 0)
      }
    };
    if ((!cursor.isEmpty__Z())) {
      if ((!cursor.tailDefined__Z())) {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
      } else {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
      }
    }
  };
  b.append__T__scm_StringBuilder(end);
  return b
});
ScalaJS.c.sci_Stream.prototype.force__sci_Stream = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = ScalaJS.as.sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = ScalaJS.as.sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = ScalaJS.as.sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = ScalaJS.as.sci_Stream(those.tail__O())
  };
  return this
});
ScalaJS.c.sci_Stream.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sci_Stream.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if (ScalaJS.is.sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = ScalaJS.m.sci_Stream$Empty$()
    } else {
      var hd = f.apply__O__O(this.head__O());
      var tl = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, f$1) {
        return (function() {
          var x = ScalaJS.as.sci_Stream(this$2.tail__O()).map__F1__scg_CanBuildFrom__O(f$1, (ScalaJS.m.sci_Stream$(), new ScalaJS.c.sci_Stream$StreamCanBuildFrom().init___()));
          return ScalaJS.as.sci_Stream(x)
        })
      })(this, f));
      var x$1 = new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd, tl)
    };
    return x$1
  } else {
    return ScalaJS.s.sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
ScalaJS.c.sci_Stream.prototype.take__I__sci_Stream = (function(n) {
  if (((n <= 0) || this.isEmpty__Z())) {
    ScalaJS.m.sci_Stream$();
    return ScalaJS.m.sci_Stream$Empty$()
  } else if ((n === 1)) {
    var hd = this.head__O();
    var tl = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
      return (function() {
        ScalaJS.m.sci_Stream$();
        return ScalaJS.m.sci_Stream$Empty$()
      })
    })(this));
    return new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    var hd$1 = this.head__O();
    var tl$1 = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$3$1, n$1) {
      return (function() {
        return ScalaJS.as.sci_Stream(this$3$1.tail__O()).take__I__sci_Stream((((-1) + n$1) | 0))
      })
    })(this, n));
    return new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd$1, tl$1)
  }
});
ScalaJS.c.sci_Stream.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = ScalaJS.as.sc_LinearSeqLike(repr);
  return ScalaJS.as.sc_LinearSeq(repr$1)
});
ScalaJS.c.sci_Stream.prototype.append__F0__sci_Stream = (function(rest) {
  if (this.isEmpty__Z()) {
    return ScalaJS.as.sc_GenTraversableOnce(rest.apply__O()).toStream__sci_Stream()
  } else {
    var hd = this.head__O();
    var tl = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, rest$1) {
      return (function() {
        return ScalaJS.as.sci_Stream(this$2.tail__O()).append__F0__sci_Stream(rest$1)
      })
    })(this, rest));
    return new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd, tl)
  }
});
ScalaJS.c.sci_Stream.prototype.stringPrefix__T = (function() {
  return "Stream"
});
ScalaJS.is.sci_Stream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
});
ScalaJS.as.sci_Stream = (function(obj) {
  return ((ScalaJS.is.sci_Stream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.Stream"))
});
ScalaJS.isArrayOf.sci_Stream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
});
ScalaJS.asArrayOf.sci_Stream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_Stream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
});
/** @constructor */
ScalaJS.c.sci_HashMap$EmptyHashMap$ = (function() {
  ScalaJS.c.sci_HashMap.call(this)
});
ScalaJS.c.sci_HashMap$EmptyHashMap$.prototype = new ScalaJS.h.sci_HashMap();
ScalaJS.c.sci_HashMap$EmptyHashMap$.prototype.constructor = ScalaJS.c.sci_HashMap$EmptyHashMap$;
/** @constructor */
ScalaJS.h.sci_HashMap$EmptyHashMap$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$EmptyHashMap$.prototype = ScalaJS.c.sci_HashMap$EmptyHashMap$.prototype;
ScalaJS.d.sci_HashMap$EmptyHashMap$ = new ScalaJS.ClassTypeData({
  sci_HashMap$EmptyHashMap$: 0
}, false, "scala.collection.immutable.HashMap$EmptyHashMap$", {
  sci_HashMap$EmptyHashMap$: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
ScalaJS.c.sci_HashMap$EmptyHashMap$.prototype.$classData = ScalaJS.d.sci_HashMap$EmptyHashMap$;
ScalaJS.n.sci_HashMap$EmptyHashMap$ = (void 0);
ScalaJS.m.sci_HashMap$EmptyHashMap$ = (function() {
  if ((!ScalaJS.n.sci_HashMap$EmptyHashMap$)) {
    ScalaJS.n.sci_HashMap$EmptyHashMap$ = new ScalaJS.c.sci_HashMap$EmptyHashMap$().init___()
  };
  return ScalaJS.n.sci_HashMap$EmptyHashMap$
});
/** @constructor */
ScalaJS.c.sci_HashMap$HashMap1 = (function() {
  ScalaJS.c.sci_HashMap.call(this);
  this.key$6 = null;
  this.hash$6 = 0;
  this.value$6 = null;
  this.kv$6 = null
});
ScalaJS.c.sci_HashMap$HashMap1.prototype = new ScalaJS.h.sci_HashMap();
ScalaJS.c.sci_HashMap$HashMap1.prototype.constructor = ScalaJS.c.sci_HashMap$HashMap1;
/** @constructor */
ScalaJS.h.sci_HashMap$HashMap1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$HashMap1.prototype = ScalaJS.c.sci_HashMap$HashMap1.prototype;
ScalaJS.c.sci_HashMap$HashMap1.prototype.ensurePair__T2 = (function() {
  if ((this.kv$6 !== null)) {
    return this.kv$6
  } else {
    this.kv$6 = new ScalaJS.c.T2().init___O__O(this.key$6, this.value$6);
    return this.kv$6
  }
});
ScalaJS.c.sci_HashMap$HashMap1.prototype.init___O__I__O__T2 = (function(key, hash, value, kv) {
  this.key$6 = key;
  this.hash$6 = hash;
  this.value$6 = value;
  this.kv$6 = kv;
  return this
});
ScalaJS.c.sci_HashMap$HashMap1.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  if (((hash === this.hash$6) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    if ((merger === null)) {
      return ((this.value$6 === value) ? this : new ScalaJS.c.sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv))
    } else {
      var nkv = merger.apply__T2__T2__T2(this.kv$6, kv);
      return new ScalaJS.c.sci_HashMap$HashMap1().init___O__I__O__T2(nkv.$$und1$f, hash, nkv.$$und2$f, nkv)
    }
  } else if ((hash !== this.hash$6)) {
    var that = new ScalaJS.c.sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    return ScalaJS.m.sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, 2)
  } else {
    var this$2 = ScalaJS.m.sci_ListMap$EmptyListMap$();
    var key$1 = this.key$6;
    var value$1 = this.value$6;
    return new ScalaJS.c.sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, new ScalaJS.c.sci_ListMap$Node().init___sci_ListMap__O__O(this$2, key$1, value$1).updated__O__O__sci_ListMap(key, value))
  }
});
ScalaJS.c.sci_HashMap$HashMap1.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return (((hash === this.hash$6) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6)) ? new ScalaJS.c.s_Some().init___O(this.value$6) : ScalaJS.m.s_None$())
});
ScalaJS.c.sci_HashMap$HashMap1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.ensurePair__T2())
});
ScalaJS.c.sci_HashMap$HashMap1.prototype.iterator__sc_Iterator = (function() {
  ScalaJS.m.sc_Iterator$();
  var elems = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([this.ensurePair__T2()]);
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, ScalaJS.uI(elems.array$6["length"]))
});
ScalaJS.c.sci_HashMap$HashMap1.prototype.size__I = (function() {
  return 1
});
ScalaJS.is.sci_HashMap$HashMap1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashMap1)))
});
ScalaJS.as.sci_HashMap$HashMap1 = (function(obj) {
  return ((ScalaJS.is.sci_HashMap$HashMap1(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.HashMap$HashMap1"))
});
ScalaJS.isArrayOf.sci_HashMap$HashMap1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashMap1)))
});
ScalaJS.asArrayOf.sci_HashMap$HashMap1 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_HashMap$HashMap1(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashMap1;", depth))
});
ScalaJS.d.sci_HashMap$HashMap1 = new ScalaJS.ClassTypeData({
  sci_HashMap$HashMap1: 0
}, false, "scala.collection.immutable.HashMap$HashMap1", {
  sci_HashMap$HashMap1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
ScalaJS.c.sci_HashMap$HashMap1.prototype.$classData = ScalaJS.d.sci_HashMap$HashMap1;
/** @constructor */
ScalaJS.c.sci_HashMap$HashMapCollision1 = (function() {
  ScalaJS.c.sci_HashMap.call(this);
  this.hash$6 = 0;
  this.kvs$6 = null
});
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype = new ScalaJS.h.sci_HashMap();
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype.constructor = ScalaJS.c.sci_HashMap$HashMapCollision1;
/** @constructor */
ScalaJS.h.sci_HashMap$HashMapCollision1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$HashMapCollision1.prototype = ScalaJS.c.sci_HashMap$HashMapCollision1.prototype;
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  if ((hash === this.hash$6)) {
    if ((merger === null)) {
      var jsx$1 = true
    } else {
      var this$1 = this.kvs$6;
      var jsx$1 = (!ScalaJS.s.sc_MapLike$class__contains__sc_MapLike__O__Z(this$1, key))
    };
    if (jsx$1) {
      return new ScalaJS.c.sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this.kvs$6.updated__O__O__sci_ListMap(key, value))
    } else {
      var this$2 = this.kvs$6;
      var kv$1 = merger.apply__T2__T2__T2(new ScalaJS.c.T2().init___O__O(key, this.kvs$6.apply__O__O(key)), kv);
      return new ScalaJS.c.sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this$2.updated__O__O__sci_ListMap(kv$1.$$und1$f, kv$1.$$und2$f))
    }
  } else {
    var that = new ScalaJS.c.sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    return ScalaJS.m.sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, ((1 + this.kvs$6.size__I()) | 0))
  }
});
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return ((hash === this.hash$6) ? this.kvs$6.get__O__s_Option(key) : ScalaJS.m.s_None$())
});
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.kvs$6;
  var this$2 = this$1.iterator__sc_Iterator();
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this$2, f)
});
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype.iterator__sc_Iterator = (function() {
  return this.kvs$6.iterator__sc_Iterator()
});
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype.size__I = (function() {
  return this.kvs$6.size__I()
});
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype.init___I__sci_ListMap = (function(hash, kvs) {
  this.hash$6 = hash;
  this.kvs$6 = kvs;
  return this
});
ScalaJS.d.sci_HashMap$HashMapCollision1 = new ScalaJS.ClassTypeData({
  sci_HashMap$HashMapCollision1: 0
}, false, "scala.collection.immutable.HashMap$HashMapCollision1", {
  sci_HashMap$HashMapCollision1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
ScalaJS.c.sci_HashMap$HashMapCollision1.prototype.$classData = ScalaJS.d.sci_HashMap$HashMapCollision1;
/** @constructor */
ScalaJS.c.sci_HashMap$HashTrieMap = (function() {
  ScalaJS.c.sci_HashMap.call(this);
  this.bitmap$6 = 0;
  this.elems$6 = null;
  this.size0$6 = 0
});
ScalaJS.c.sci_HashMap$HashTrieMap.prototype = new ScalaJS.h.sci_HashMap();
ScalaJS.c.sci_HashMap$HashTrieMap.prototype.constructor = ScalaJS.c.sci_HashMap$HashTrieMap;
/** @constructor */
ScalaJS.h.sci_HashMap$HashTrieMap = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_HashMap$HashTrieMap.prototype = ScalaJS.c.sci_HashMap$HashTrieMap.prototype;
ScalaJS.c.sci_HashMap$HashTrieMap.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = ScalaJS.m.jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
  if (((this.bitmap$6 & mask) !== 0)) {
    var sub = this.elems$6.u[offset];
    var subNew = sub.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, ((5 + level) | 0), value, kv, merger);
    if ((subNew === sub)) {
      return this
    } else {
      var elemsNew = ScalaJS.newArrayObject(ScalaJS.d.sci_HashMap.getArrayOf(), [this.elems$6.u["length"]]);
      ScalaJS.m.s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew, 0, this.elems$6.u["length"]);
      elemsNew.u[offset] = subNew;
      return new ScalaJS.c.sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(this.bitmap$6, elemsNew, ((this.size0$6 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = ScalaJS.newArrayObject(ScalaJS.d.sci_HashMap.getArrayOf(), [((1 + this.elems$6.u["length"]) | 0)]);
    ScalaJS.m.s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew$2, 0, offset);
    elemsNew$2.u[offset] = new ScalaJS.c.sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    ScalaJS.m.s_Array$().copy__O__I__O__I__I__V(this.elems$6, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$6.u["length"] - offset) | 0));
    return new ScalaJS.c.sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I((this.bitmap$6 | mask), elemsNew$2, ((1 + this.size0$6) | 0))
  }
});
ScalaJS.c.sci_HashMap$HashTrieMap.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$6 === (-1))) {
    return this.elems$6.u[(31 & index)].get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$6 & mask) !== 0)) {
    var offset = ScalaJS.m.jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
    return this.elems$6.u[offset].get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
  } else {
    return ScalaJS.m.s_None$()
  }
});
ScalaJS.c.sci_HashMap$HashTrieMap.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$6.u["length"])) {
    this.elems$6.u[i].foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
ScalaJS.c.sci_HashMap$HashTrieMap.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sci_HashMap$HashTrieMap$$anon$1().init___sci_HashMap$HashTrieMap(this)
});
ScalaJS.c.sci_HashMap$HashTrieMap.prototype.size__I = (function() {
  return this.size0$6
});
ScalaJS.c.sci_HashMap$HashTrieMap.prototype.init___I__Asci_HashMap__I = (function(bitmap, elems, size0) {
  this.bitmap$6 = bitmap;
  this.elems$6 = elems;
  this.size0$6 = size0;
  return this
});
ScalaJS.is.sci_HashMap$HashTrieMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashTrieMap)))
});
ScalaJS.as.sci_HashMap$HashTrieMap = (function(obj) {
  return ((ScalaJS.is.sci_HashMap$HashTrieMap(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.HashMap$HashTrieMap"))
});
ScalaJS.isArrayOf.sci_HashMap$HashTrieMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashTrieMap)))
});
ScalaJS.asArrayOf.sci_HashMap$HashTrieMap = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_HashMap$HashTrieMap(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashTrieMap;", depth))
});
ScalaJS.d.sci_HashMap$HashTrieMap = new ScalaJS.ClassTypeData({
  sci_HashMap$HashTrieMap: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap", {
  sci_HashMap$HashTrieMap: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
ScalaJS.c.sci_HashMap$HashTrieMap.prototype.$classData = ScalaJS.d.sci_HashMap$HashTrieMap;
/** @constructor */
ScalaJS.c.sci_Stream$Cons = (function() {
  ScalaJS.c.sci_Stream.call(this);
  this.hd$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
});
ScalaJS.c.sci_Stream$Cons.prototype = new ScalaJS.h.sci_Stream();
ScalaJS.c.sci_Stream$Cons.prototype.constructor = ScalaJS.c.sci_Stream$Cons;
/** @constructor */
ScalaJS.h.sci_Stream$Cons = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$Cons.prototype = ScalaJS.c.sci_Stream$Cons.prototype;
ScalaJS.c.sci_Stream$Cons.prototype.head__O = (function() {
  return this.hd$5
});
ScalaJS.c.sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = ScalaJS.as.sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
ScalaJS.c.sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
ScalaJS.c.sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
ScalaJS.c.sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
ScalaJS.c.sci_Stream$Cons.prototype.init___O__F0 = (function(hd, tl) {
  this.hd$5 = hd;
  this.tlGen$5 = tl;
  return this
});
ScalaJS.d.sci_Stream$Cons = new ScalaJS.ClassTypeData({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Stream$Cons.prototype.$classData = ScalaJS.d.sci_Stream$Cons;
/** @constructor */
ScalaJS.c.sci_Stream$Empty$ = (function() {
  ScalaJS.c.sci_Stream.call(this)
});
ScalaJS.c.sci_Stream$Empty$.prototype = new ScalaJS.h.sci_Stream();
ScalaJS.c.sci_Stream$Empty$.prototype.constructor = ScalaJS.c.sci_Stream$Empty$;
/** @constructor */
ScalaJS.h.sci_Stream$Empty$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$Empty$.prototype = ScalaJS.c.sci_Stream$Empty$.prototype;
ScalaJS.c.sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
ScalaJS.c.sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
ScalaJS.c.sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
ScalaJS.c.sci_Stream$Empty$.prototype.tail__sr_Nothing$ = (function() {
  throw new ScalaJS.c.jl_UnsupportedOperationException().init___T("tail of empty stream")
});
ScalaJS.c.sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("head of empty stream")
});
ScalaJS.c.sci_Stream$Empty$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
ScalaJS.d.sci_Stream$Empty$ = new ScalaJS.ClassTypeData({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Stream$Empty$.prototype.$classData = ScalaJS.d.sci_Stream$Empty$;
ScalaJS.n.sci_Stream$Empty$ = (void 0);
ScalaJS.m.sci_Stream$Empty$ = (function() {
  if ((!ScalaJS.n.sci_Stream$Empty$)) {
    ScalaJS.n.sci_Stream$Empty$ = new ScalaJS.c.sci_Stream$Empty$().init___()
  };
  return ScalaJS.n.sci_Stream$Empty$
});
/** @constructor */
ScalaJS.c.sci_Vector = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this);
  this.startIndex$4 = 0;
  this.endIndex$4 = 0;
  this.focus$4 = 0;
  this.dirty$4 = false;
  this.depth$4 = 0;
  this.display0$4 = null;
  this.display1$4 = null;
  this.display2$4 = null;
  this.display3$4 = null;
  this.display4$4 = null;
  this.display5$4 = null
});
ScalaJS.c.sci_Vector.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.sci_Vector.prototype.constructor = ScalaJS.c.sci_Vector;
/** @constructor */
ScalaJS.h.sci_Vector = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Vector.prototype = ScalaJS.c.sci_Vector.prototype;
ScalaJS.c.sci_Vector.prototype.checkRangeConvert__p4__I__I = (function(index) {
  var idx = ((index + this.startIndex$4) | 0);
  if (((index >= 0) && (idx < this.endIndex$4))) {
    return idx
  } else {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + index))
  }
});
ScalaJS.c.sci_Vector.prototype.display3__AO = (function() {
  return this.display3$4
});
ScalaJS.c.sci_Vector.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Vector.prototype.gotoPosWritable__p4__I__I__I__V = (function(oldIndex, newIndex, xor) {
  if (this.dirty$4) {
    ScalaJS.s.sci_VectorPointer$class__gotoPosWritable1__sci_VectorPointer__I__I__I__V(this, oldIndex, newIndex, xor)
  } else {
    ScalaJS.s.sci_VectorPointer$class__gotoPosWritable0__sci_VectorPointer__I__I__V(this, newIndex, xor);
    this.dirty$4 = true
  }
});
ScalaJS.c.sci_Vector.prototype.apply__I__O = (function(index) {
  var idx = this.checkRangeConvert__p4__I__I(index);
  var xor = (idx ^ this.focus$4);
  return ScalaJS.s.sci_VectorPointer$class__getElem__sci_VectorPointer__I__I__O(this, idx, xor)
});
ScalaJS.c.sci_Vector.prototype.depth__I = (function() {
  return this.depth$4
});
ScalaJS.c.sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  return ((this.length__I() - len) | 0)
});
ScalaJS.c.sci_Vector.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O(ScalaJS.uI(v1))
});
ScalaJS.c.sci_Vector.prototype.take__I__sci_Vector = (function(n) {
  if ((n <= 0)) {
    var this$1 = ScalaJS.m.sci_Vector$();
    return this$1.NIL$6
  } else {
    return ((((this.startIndex$4 + n) | 0) < this.endIndex$4) ? this.dropBack0__p4__I__sci_Vector(((this.startIndex$4 + n) | 0)) : this)
  }
});
ScalaJS.c.sci_Vector.prototype.initIterator__sci_VectorIterator__V = (function(s) {
  var depth = this.depth$4;
  ScalaJS.s.sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  if (this.dirty$4) {
    var index = this.focus$4;
    ScalaJS.s.sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V(s, index)
  };
  if ((s.depth$2 > 1)) {
    var index$1 = this.startIndex$4;
    var xor = (this.startIndex$4 ^ this.focus$4);
    ScalaJS.s.sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V(s, index$1, xor)
  }
});
ScalaJS.c.sci_Vector.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Vector.prototype.init___I__I__I = (function(startIndex, endIndex, focus) {
  this.startIndex$4 = startIndex;
  this.endIndex$4 = endIndex;
  this.focus$4 = focus;
  this.dirty$4 = false;
  return this
});
ScalaJS.c.sci_Vector.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Vector$()
});
ScalaJS.c.sci_Vector.prototype.display0__AO = (function() {
  return this.display0$4
});
ScalaJS.c.sci_Vector.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.display4__AO = (function() {
  return this.display4$4
});
ScalaJS.c.sci_Vector.prototype.cleanRightEdge__p4__I__V = (function(cutIndex) {
  if ((cutIndex <= 32)) {
    this.zeroRight__p4__AO__I__V(this.display0$4, cutIndex)
  } else if ((cutIndex <= 1024)) {
    this.zeroRight__p4__AO__I__V(this.display0$4, ((1 + (31 & (((-1) + cutIndex) | 0))) | 0));
    this.display1$4 = this.copyLeft__p4__AO__I__AO(this.display1$4, ((cutIndex >>> 5) | 0))
  } else if ((cutIndex <= 32768)) {
    this.zeroRight__p4__AO__I__V(this.display0$4, ((1 + (31 & (((-1) + cutIndex) | 0))) | 0));
    this.display1$4 = this.copyLeft__p4__AO__I__AO(this.display1$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 5) | 0))) | 0));
    this.display2$4 = this.copyLeft__p4__AO__I__AO(this.display2$4, ((cutIndex >>> 10) | 0))
  } else if ((cutIndex <= 1048576)) {
    this.zeroRight__p4__AO__I__V(this.display0$4, ((1 + (31 & (((-1) + cutIndex) | 0))) | 0));
    this.display1$4 = this.copyLeft__p4__AO__I__AO(this.display1$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 5) | 0))) | 0));
    this.display2$4 = this.copyLeft__p4__AO__I__AO(this.display2$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 10) | 0))) | 0));
    this.display3$4 = this.copyLeft__p4__AO__I__AO(this.display3$4, ((cutIndex >>> 15) | 0))
  } else if ((cutIndex <= 33554432)) {
    this.zeroRight__p4__AO__I__V(this.display0$4, ((1 + (31 & (((-1) + cutIndex) | 0))) | 0));
    this.display1$4 = this.copyLeft__p4__AO__I__AO(this.display1$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 5) | 0))) | 0));
    this.display2$4 = this.copyLeft__p4__AO__I__AO(this.display2$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 10) | 0))) | 0));
    this.display3$4 = this.copyLeft__p4__AO__I__AO(this.display3$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 15) | 0))) | 0));
    this.display4$4 = this.copyLeft__p4__AO__I__AO(this.display4$4, ((cutIndex >>> 20) | 0))
  } else if ((cutIndex <= 1073741824)) {
    this.zeroRight__p4__AO__I__V(this.display0$4, ((1 + (31 & (((-1) + cutIndex) | 0))) | 0));
    this.display1$4 = this.copyLeft__p4__AO__I__AO(this.display1$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 5) | 0))) | 0));
    this.display2$4 = this.copyLeft__p4__AO__I__AO(this.display2$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 10) | 0))) | 0));
    this.display3$4 = this.copyLeft__p4__AO__I__AO(this.display3$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 15) | 0))) | 0));
    this.display4$4 = this.copyLeft__p4__AO__I__AO(this.display4$4, ((1 + (31 & (((((-1) + cutIndex) | 0) >>> 20) | 0))) | 0));
    this.display5$4 = this.copyLeft__p4__AO__I__AO(this.display5$4, ((cutIndex >>> 25) | 0))
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
ScalaJS.c.sci_Vector.prototype.preClean__p4__I__V = (function(depth) {
  this.depth$4 = depth;
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case 0:
      {
        this.display1$4 = null;
        this.display2$4 = null;
        this.display3$4 = null;
        this.display4$4 = null;
        this.display5$4 = null;
        break
      };
    case 1:
      {
        this.display2$4 = null;
        this.display3$4 = null;
        this.display4$4 = null;
        this.display5$4 = null;
        break
      };
    case 2:
      {
        this.display3$4 = null;
        this.display4$4 = null;
        this.display5$4 = null;
        break
      };
    case 3:
      {
        this.display4$4 = null;
        this.display5$4 = null;
        break
      };
    case 4:
      {
        this.display5$4 = null;
        break
      };
    case 5:
      break;
    default:
      throw new ScalaJS.c.s_MatchError().init___O(x1);
  }
});
ScalaJS.c.sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return this.iterator__sci_VectorIterator()
});
ScalaJS.c.sci_Vector.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.length__I = (function() {
  return ((this.endIndex$4 - this.startIndex$4) | 0)
});
ScalaJS.c.sci_Vector.prototype.zeroRight__p4__AO__I__V = (function(array, index) {
  var i = index;
  while ((i < array.u["length"])) {
    array.u[i] = null;
    i = ((1 + i) | 0)
  }
});
ScalaJS.c.sci_Vector.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sci_Vector.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.display1__AO = (function() {
  return this.display1$4
});
ScalaJS.c.sci_Vector.prototype.take__I__O = (function(n) {
  return this.take__I__sci_Vector(n)
});
ScalaJS.c.sci_Vector.prototype.display5__AO = (function() {
  return this.display5$4
});
ScalaJS.c.sci_Vector.prototype.iterator__sci_VectorIterator = (function() {
  var s = new ScalaJS.c.sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
  this.initIterator__sci_VectorIterator__V(s);
  return s
});
ScalaJS.c.sci_Vector.prototype.requiredDepth__p4__I__I = (function(xor) {
  if ((xor < 32)) {
    return 1
  } else if ((xor < 1024)) {
    return 2
  } else if ((xor < 32768)) {
    return 3
  } else if ((xor < 1048576)) {
    return 4
  } else if ((xor < 33554432)) {
    return 5
  } else if ((xor < 1073741824)) {
    return 6
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
ScalaJS.c.sci_Vector.prototype.dropBack0__p4__I__sci_Vector = (function(cutIndex) {
  var blockIndex = ((-32) & (((-1) + cutIndex) | 0));
  var xor = (this.startIndex$4 ^ (((-1) + cutIndex) | 0));
  var d = this.requiredDepth__p4__I__I(xor);
  var shift = (this.startIndex$4 & (~(((-1) + (1 << ScalaJS.imul(5, d))) | 0)));
  var s = new ScalaJS.c.sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((cutIndex - shift) | 0), ((blockIndex - shift) | 0));
  var depth = this.depth$4;
  ScalaJS.s.sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  s.dirty$4 = this.dirty$4;
  s.gotoPosWritable__p4__I__I__I__V(this.focus$4, blockIndex, (this.focus$4 ^ blockIndex));
  s.preClean__p4__I__V(d);
  s.cleanRightEdge__p4__I__V(((cutIndex - shift) | 0));
  return s
});
ScalaJS.c.sci_Vector.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sci_Vector.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.display2__AO = (function() {
  return this.display2$4
});
ScalaJS.c.sci_Vector.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.toCollection__O__sc_Seq = (function(repr) {
  return ScalaJS.as.sc_IndexedSeq(repr)
});
ScalaJS.c.sci_Vector.prototype.copyLeft__p4__AO__I__AO = (function(array, right) {
  var a2 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [array.u["length"]]);
  ScalaJS.systemArraycopy(array, 0, a2, 0, right);
  return a2
});
ScalaJS.c.sci_Vector.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$4 = x$1
});
ScalaJS.d.sci_Vector = new ScalaJS.ClassTypeData({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
ScalaJS.c.sci_Vector.prototype.$classData = ScalaJS.d.sci_Vector;
/** @constructor */
ScalaJS.c.sci_WrappedString = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this);
  this.self$4 = null
});
ScalaJS.c.sci_WrappedString.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.sci_WrappedString.prototype.constructor = ScalaJS.c.sci_WrappedString;
/** @constructor */
ScalaJS.h.sci_WrappedString = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_WrappedString.prototype = ScalaJS.c.sci_WrappedString.prototype;
ScalaJS.c.sci_WrappedString.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_WrappedString.prototype.apply__I__O = (function(idx) {
  var thiz = this.self$4;
  var c = (65535 & ScalaJS.uI(thiz["charCodeAt"](idx)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.sci_WrappedString.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.sci_WrappedString.prototype.apply__O__O = (function(v1) {
  var n = ScalaJS.uI(v1);
  var thiz = this.self$4;
  var c = (65535 & ScalaJS.uI(thiz["charCodeAt"](n)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.sci_WrappedString.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sci_WrappedString.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__exists__sc_IndexedSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.sci_WrappedString.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.sci_WrappedString.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_WrappedString.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_IndexedSeq$()
});
ScalaJS.c.sci_WrappedString.prototype.toString__T = (function() {
  return this.self$4
});
ScalaJS.c.sci_WrappedString.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.sci_WrappedString.prototype.foldLeft__O__F2__O = (function(z, op) {
  var thiz = this.self$4;
  return ScalaJS.s.sc_IndexedSeqOptimized$class__foldl__p0__sc_IndexedSeqOptimized__I__I__O__F2__O(this, 0, ScalaJS.uI(thiz["length"]), z, op)
});
ScalaJS.c.sci_WrappedString.prototype.reverse__O = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
ScalaJS.c.sci_WrappedString.prototype.iterator__sc_Iterator = (function() {
  var thiz = this.self$4;
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI(thiz["length"]))
});
ScalaJS.c.sci_WrappedString.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sci_WrappedString.prototype.length__I = (function() {
  var thiz = this.self$4;
  return ScalaJS.uI(thiz["length"])
});
ScalaJS.c.sci_WrappedString.prototype.take__I__O = (function(n) {
  return this.slice__I__I__sci_WrappedString(0, n)
});
ScalaJS.c.sci_WrappedString.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.sci_WrappedString.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sci_WrappedString.prototype.init___T = (function(self) {
  this.self$4 = self;
  return this
});
ScalaJS.c.sci_WrappedString.prototype.slice__I__I__sci_WrappedString = (function(from, until) {
  var start = ((from < 0) ? 0 : from);
  if ((until <= start)) {
    var jsx$1 = true
  } else {
    var thiz = this.self$4;
    var jsx$1 = (start >= ScalaJS.uI(thiz["length"]))
  };
  if (jsx$1) {
    return new ScalaJS.c.sci_WrappedString().init___T("")
  };
  var thiz$1 = this.self$4;
  if ((until > ScalaJS.uI(thiz$1["length"]))) {
    var thiz$2 = this.self$4;
    var end = ScalaJS.uI(thiz$2["length"])
  } else {
    var end = until
  };
  var thiz$3 = ScalaJS.m.s_Predef$().unwrapString__sci_WrappedString__T(this);
  return new ScalaJS.c.sci_WrappedString().init___T(ScalaJS.as.T(thiz$3["substring"](start, end)))
});
ScalaJS.c.sci_WrappedString.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = ScalaJS.as.sci_WrappedString(repr);
  return repr$1
});
ScalaJS.c.sci_WrappedString.prototype.newBuilder__scm_Builder = (function() {
  return ScalaJS.m.sci_WrappedString$().newBuilder__scm_Builder()
});
ScalaJS.is.sci_WrappedString = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_WrappedString)))
});
ScalaJS.as.sci_WrappedString = (function(obj) {
  return ((ScalaJS.is.sci_WrappedString(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.WrappedString"))
});
ScalaJS.isArrayOf.sci_WrappedString = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_WrappedString)))
});
ScalaJS.asArrayOf.sci_WrappedString = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_WrappedString(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.WrappedString;", depth))
});
ScalaJS.d.sci_WrappedString = new ScalaJS.ClassTypeData({
  sci_WrappedString: 0
}, false, "scala.collection.immutable.WrappedString", {
  sci_WrappedString: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
ScalaJS.c.sci_WrappedString.prototype.$classData = ScalaJS.d.sci_WrappedString;
/** @constructor */
ScalaJS.c.sci_$colon$colon = (function() {
  ScalaJS.c.sci_List.call(this);
  this.head$5 = null;
  this.tl$5 = null
});
ScalaJS.c.sci_$colon$colon.prototype = new ScalaJS.h.sci_List();
ScalaJS.c.sci_$colon$colon.prototype.constructor = ScalaJS.c.sci_$colon$colon;
/** @constructor */
ScalaJS.h.sci_$colon$colon = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_$colon$colon.prototype = ScalaJS.c.sci_$colon$colon.prototype;
ScalaJS.c.sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
ScalaJS.c.sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
ScalaJS.c.sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
ScalaJS.c.sci_$colon$colon.prototype.isEmpty__Z = (function() {
  return false
});
ScalaJS.c.sci_$colon$colon.prototype.tail__sci_List = (function() {
  return this.tl$5
});
ScalaJS.c.sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.head$5;
        break
      };
    case 1:
      {
        return this.tl$5;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.sci_$colon$colon.prototype.tail__O = (function() {
  return this.tl$5
});
ScalaJS.c.sci_$colon$colon.prototype.init___O__sci_List = (function(head, tl) {
  this.head$5 = head;
  this.tl$5 = tl;
  return this
});
ScalaJS.c.sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.sci_$colon$colon = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_$colon$colon)))
});
ScalaJS.as.sci_$colon$colon = (function(obj) {
  return ((ScalaJS.is.sci_$colon$colon(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.$colon$colon"))
});
ScalaJS.isArrayOf.sci_$colon$colon = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_$colon$colon)))
});
ScalaJS.asArrayOf.sci_$colon$colon = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_$colon$colon(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.$colon$colon;", depth))
});
ScalaJS.d.sci_$colon$colon = new ScalaJS.ClassTypeData({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1,
  s_Serializable: 1
});
ScalaJS.c.sci_$colon$colon.prototype.$classData = ScalaJS.d.sci_$colon$colon;
/** @constructor */
ScalaJS.c.sci_Nil$ = (function() {
  ScalaJS.c.sci_List.call(this)
});
ScalaJS.c.sci_Nil$.prototype = new ScalaJS.h.sci_List();
ScalaJS.c.sci_Nil$.prototype.constructor = ScalaJS.c.sci_Nil$;
/** @constructor */
ScalaJS.h.sci_Nil$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Nil$.prototype = ScalaJS.c.sci_Nil$.prototype;
ScalaJS.c.sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
ScalaJS.c.sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
ScalaJS.c.sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
ScalaJS.c.sci_Nil$.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.sc_GenSeq(that)) {
    var x2 = ScalaJS.as.sc_GenSeq(that);
    return x2.isEmpty__Z()
  } else {
    return false
  }
});
ScalaJS.c.sci_Nil$.prototype.tail__sci_List = (function() {
  throw new ScalaJS.c.jl_UnsupportedOperationException().init___T("tail of empty list")
});
ScalaJS.c.sci_Nil$.prototype.isEmpty__Z = (function() {
  return true
});
ScalaJS.c.sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  matchEnd3: {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1))
  }
});
ScalaJS.c.sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("head of empty list")
});
ScalaJS.c.sci_Nil$.prototype.tail__O = (function() {
  return this.tail__sci_List()
});
ScalaJS.c.sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.d.sci_Nil$ = new ScalaJS.ClassTypeData({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1,
  s_Serializable: 1
});
ScalaJS.c.sci_Nil$.prototype.$classData = ScalaJS.d.sci_Nil$;
ScalaJS.n.sci_Nil$ = (void 0);
ScalaJS.m.sci_Nil$ = (function() {
  if ((!ScalaJS.n.sci_Nil$)) {
    ScalaJS.n.sci_Nil$ = new ScalaJS.c.sci_Nil$().init___()
  };
  return ScalaJS.n.sci_Nil$
});
/** @constructor */
ScalaJS.c.scm_AbstractMap = (function() {
  ScalaJS.c.sc_AbstractMap.call(this)
});
ScalaJS.c.scm_AbstractMap.prototype = new ScalaJS.h.sc_AbstractMap();
ScalaJS.c.scm_AbstractMap.prototype.constructor = ScalaJS.c.scm_AbstractMap;
/** @constructor */
ScalaJS.h.scm_AbstractMap = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractMap.prototype = ScalaJS.c.scm_AbstractMap.prototype;
ScalaJS.c.scm_AbstractMap.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_Iterable$()
});
ScalaJS.c.scm_AbstractMap.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_AbstractMap.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_AbstractMap.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_HashMap().init___()
});
ScalaJS.c.scm_AbstractMap.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
ScalaJS.c.scm_AbstractSet = (function() {
  ScalaJS.c.scm_AbstractIterable.call(this)
});
ScalaJS.c.scm_AbstractSet.prototype = new ScalaJS.h.scm_AbstractIterable();
ScalaJS.c.scm_AbstractSet.prototype.constructor = ScalaJS.c.scm_AbstractSet;
/** @constructor */
ScalaJS.h.scm_AbstractSet = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractSet.prototype = ScalaJS.c.scm_AbstractSet.prototype;
ScalaJS.c.scm_AbstractSet.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_SetLike$class__isEmpty__sc_SetLike__Z(this)
});
ScalaJS.c.scm_AbstractSet.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.sc_GenSetLike$class__equals__sc_GenSetLike__O__Z(this, that)
});
ScalaJS.c.scm_AbstractSet.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.scm_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  var this$1 = new ScalaJS.c.scm_FlatHashTable$$anon$1().init___scm_FlatHashTable(this);
  return ScalaJS.s.sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, that)
});
ScalaJS.c.scm_AbstractSet.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
ScalaJS.c.scm_AbstractSet.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_HashSet().init___()
});
ScalaJS.c.scm_AbstractSet.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.c.scm_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
/** @constructor */
ScalaJS.c.scm_AbstractBuffer = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this)
});
ScalaJS.c.scm_AbstractBuffer.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_AbstractBuffer.prototype.constructor = ScalaJS.c.scm_AbstractBuffer;
/** @constructor */
ScalaJS.h.scm_AbstractBuffer = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractBuffer.prototype = ScalaJS.c.scm_AbstractBuffer.prototype;
ScalaJS.c.scm_AbstractBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
ScalaJS.c.scm_WrappedArray = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this)
});
ScalaJS.c.scm_WrappedArray.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_WrappedArray.prototype.constructor = ScalaJS.c.scm_WrappedArray;
/** @constructor */
ScalaJS.h.scm_WrappedArray = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray.prototype = ScalaJS.c.scm_WrappedArray.prototype;
ScalaJS.c.scm_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.scm_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.scm_WrappedArray.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__exists__sc_IndexedSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.scm_WrappedArray.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.scm_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_IndexedSeq$()
});
ScalaJS.c.scm_WrappedArray.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.scm_WrappedArray.prototype.foldLeft__O__F2__O = (function(z, op) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__foldl__p0__sc_IndexedSeqOptimized__I__I__O__F2__O(this, 0, this.length__I(), z, op)
});
ScalaJS.c.scm_WrappedArray.prototype.reverse__O = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
ScalaJS.c.scm_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.length__I())
});
ScalaJS.c.scm_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.scm_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_WrappedArray.prototype.take__I__O = (function(n) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__slice__sc_IndexedSeqOptimized__I__I__O(this, 0, n)
});
ScalaJS.c.scm_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.scm_WrappedArray.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_WrappedArray.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = ScalaJS.as.scm_WrappedArray(repr);
  return repr$1
});
ScalaJS.c.scm_WrappedArray.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_WrappedArrayBuilder().init___s_reflect_ClassTag(this.elemTag__s_reflect_ClassTag())
});
ScalaJS.c.scm_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
ScalaJS.is.scm_WrappedArray = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray)))
});
ScalaJS.as.scm_WrappedArray = (function(obj) {
  return ((ScalaJS.is.scm_WrappedArray(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.WrappedArray"))
});
ScalaJS.isArrayOf.scm_WrappedArray = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray)))
});
ScalaJS.asArrayOf.scm_WrappedArray = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_WrappedArray(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray;", depth))
});
/** @constructor */
ScalaJS.c.scm_ArraySeq = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this);
  this.length$5 = 0;
  this.array$5 = null
});
ScalaJS.c.scm_ArraySeq.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_ArraySeq.prototype.constructor = ScalaJS.c.scm_ArraySeq;
/** @constructor */
ScalaJS.h.scm_ArraySeq = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ArraySeq.prototype = ScalaJS.c.scm_ArraySeq.prototype;
ScalaJS.c.scm_ArraySeq.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_ArraySeq.prototype.apply__I__O = (function(idx) {
  if ((idx >= this.length$5)) {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return this.array$5.u[idx]
});
ScalaJS.c.scm_ArraySeq.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.scm_ArraySeq.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O(ScalaJS.uI(v1))
});
ScalaJS.c.scm_ArraySeq.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.scm_ArraySeq.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__exists__sc_IndexedSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.scm_ArraySeq.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.scm_ArraySeq.prototype.update__I__O__V = (function(idx, elem) {
  if ((idx >= this.length$5)) {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  this.array$5.u[idx] = elem
});
ScalaJS.c.scm_ArraySeq.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_ArraySeq.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_ArraySeq$()
});
ScalaJS.c.scm_ArraySeq.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.length$5)) {
    f.apply__O__O(this.array$5.u[i]);
    i = ((1 + i) | 0)
  }
});
ScalaJS.c.scm_ArraySeq.prototype.foldLeft__O__F2__O = (function(z, op) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__foldl__p0__sc_IndexedSeqOptimized__I__I__O__F2__O(this, 0, this.length$5, z, op)
});
ScalaJS.c.scm_ArraySeq.prototype.reverse__O = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
ScalaJS.c.scm_ArraySeq.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.scm_ArraySeq.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.length$5)
});
ScalaJS.c.scm_ArraySeq.prototype.init___I = (function(length) {
  this.length$5 = length;
  this.array$5 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [length]);
  return this
});
ScalaJS.c.scm_ArraySeq.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_ArraySeq.prototype.length__I = (function() {
  return this.length$5
});
ScalaJS.c.scm_ArraySeq.prototype.take__I__O = (function(n) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__slice__sc_IndexedSeqOptimized__I__I__O(this, 0, n)
});
ScalaJS.c.scm_ArraySeq.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_ArraySeq.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  var that = ((ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var $$this = ((len < that) ? len : that);
  var that$1 = this.length$5;
  var len1 = (($$this < that$1) ? $$this : that$1);
  ScalaJS.m.s_Array$().copy__O__I__O__I__I__V(this.array$5, 0, xs, start, len1)
});
ScalaJS.c.scm_ArraySeq.prototype.toCollection__O__sc_Seq = (function(repr) {
  return ScalaJS.as.scm_IndexedSeq(repr)
});
ScalaJS.d.scm_ArraySeq = new ScalaJS.ClassTypeData({
  scm_ArraySeq: 0
}, false, "scala.collection.mutable.ArraySeq", {
  scm_ArraySeq: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ArraySeq.prototype.$classData = ScalaJS.d.scm_ArraySeq;
/** @constructor */
ScalaJS.c.scm_HashMap = (function() {
  ScalaJS.c.scm_AbstractMap.call(this);
  this.$$undloadFactor$5 = 0;
  this.table$5 = null;
  this.tableSize$5 = 0;
  this.threshold$5 = 0;
  this.sizemap$5 = null;
  this.seedvalue$5 = 0
});
ScalaJS.c.scm_HashMap.prototype = new ScalaJS.h.scm_AbstractMap();
ScalaJS.c.scm_HashMap.prototype.constructor = ScalaJS.c.scm_HashMap;
/** @constructor */
ScalaJS.h.scm_HashMap = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_HashMap.prototype = ScalaJS.c.scm_HashMap.prototype;
ScalaJS.c.scm_HashMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_HashMap.prototype.put__O__O__s_Option = (function(key, value) {
  var e = ScalaJS.as.scm_DefaultEntry(ScalaJS.s.scm_HashTable$class__findOrAddEntry__scm_HashTable__O__O__scm_HashEntry(this, key, value));
  if ((e === null)) {
    return ScalaJS.m.s_None$()
  } else {
    var v = e.value$1;
    e.value$1 = value;
    return new ScalaJS.c.s_Some().init___O(v)
  }
});
ScalaJS.c.scm_HashMap.prototype.init___ = (function() {
  ScalaJS.c.scm_HashMap.prototype.init___scm_HashTable$Contents.call(this, null);
  return this
});
ScalaJS.c.scm_HashMap.prototype.apply__O__O = (function(key) {
  var result = ScalaJS.as.scm_DefaultEntry(ScalaJS.s.scm_HashTable$class__findEntry__scm_HashTable__O__scm_HashEntry(this, key));
  return ((result === null) ? ScalaJS.s.sc_MapLike$class__$default__sc_MapLike__O__O(this, key) : result.value$1)
});
ScalaJS.c.scm_HashMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_HashMap.prototype.$$plus$eq__T2__scm_HashMap = (function(kv) {
  var key = kv.$$und1$f;
  var value = kv.$$und2$f;
  var e = ScalaJS.as.scm_DefaultEntry(ScalaJS.s.scm_HashTable$class__findOrAddEntry__scm_HashTable__O__O__scm_HashEntry(this, key, value));
  if ((e !== null)) {
    e.value$1 = kv.$$und2$f
  };
  return this
});
ScalaJS.c.scm_HashMap.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__T2__scm_HashMap(ScalaJS.as.T2(elem))
});
ScalaJS.c.scm_HashMap.prototype.foreach__F1__V = (function(f) {
  var iterTable = this.table$5;
  var idx = ScalaJS.s.scm_HashTable$class__scala$collection$mutable$HashTable$$lastPopulatedIndex__scm_HashTable__I(this);
  var es = iterTable.u[idx];
  while ((es !== null)) {
    var arg1 = es;
    var e = ScalaJS.as.scm_DefaultEntry(arg1);
    f.apply__O__O(new ScalaJS.c.T2().init___O__O(e.key$1, e.value$1));
    es = ScalaJS.as.scm_HashEntry(es.next$1);
    while (((es === null) && (idx > 0))) {
      idx = (((-1) + idx) | 0);
      es = iterTable.u[idx]
    }
  }
});
ScalaJS.c.scm_HashMap.prototype.empty__sc_Map = (function() {
  return new ScalaJS.c.scm_HashMap().init___()
});
ScalaJS.c.scm_HashMap.prototype.size__I = (function() {
  return this.tableSize$5
});
ScalaJS.c.scm_HashMap.prototype.seq__sc_Map = (function() {
  return this
});
ScalaJS.c.scm_HashMap.prototype.result__O = (function() {
  return this
});
ScalaJS.c.scm_HashMap.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new ScalaJS.c.scm_HashTable$$anon$1().init___scm_HashTable(this);
  var f = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(e$2) {
      var e = ScalaJS.as.scm_DefaultEntry(e$2);
      return new ScalaJS.c.T2().init___O__O(e.key$1, e.value$1)
    })
  })(this));
  return new ScalaJS.c.sc_Iterator$$anon$11().init___sc_Iterator__F1(this$1, f)
});
ScalaJS.c.scm_HashMap.prototype.init___scm_HashTable$Contents = (function(contents) {
  ScalaJS.s.scm_HashTable$class__$$init$__scm_HashTable__V(this);
  ScalaJS.s.scm_HashTable$class__initWithContents__scm_HashTable__scm_HashTable$Contents__V(this, contents);
  return this
});
ScalaJS.c.scm_HashMap.prototype.get__O__s_Option = (function(key) {
  var e = ScalaJS.as.scm_DefaultEntry(ScalaJS.s.scm_HashTable$class__findEntry__scm_HashTable__O__scm_HashEntry(this, key));
  return ((e === null) ? ScalaJS.m.s_None$() : new ScalaJS.c.s_Some().init___O(e.value$1))
});
ScalaJS.c.scm_HashMap.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__T2__scm_HashMap(ScalaJS.as.T2(elem))
});
ScalaJS.c.scm_HashMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  var this$2 = new ScalaJS.c.scm_HashMap().init___();
  var this$3 = ScalaJS.as.scm_Map(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this$2, this));
  return this$3.$$plus$eq__T2__scm_HashMap(kv)
});
ScalaJS.d.scm_HashMap = new ScalaJS.ClassTypeData({
  scm_HashMap: 0
}, false, "scala.collection.mutable.HashMap", {
  scm_HashMap: 1,
  scm_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  scm_Map: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_MapLike: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_HashTable: 1,
  scm_HashTable$HashUtils: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_HashMap.prototype.$classData = ScalaJS.d.scm_HashMap;
/** @constructor */
ScalaJS.c.scm_HashSet = (function() {
  ScalaJS.c.scm_AbstractSet.call(this);
  this.$$undloadFactor$5 = 0;
  this.table$5 = null;
  this.tableSize$5 = 0;
  this.threshold$5 = 0;
  this.sizemap$5 = null;
  this.seedvalue$5 = 0
});
ScalaJS.c.scm_HashSet.prototype = new ScalaJS.h.scm_AbstractSet();
ScalaJS.c.scm_HashSet.prototype.constructor = ScalaJS.c.scm_HashSet;
/** @constructor */
ScalaJS.h.scm_HashSet = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_HashSet.prototype = ScalaJS.c.scm_HashSet.prototype;
ScalaJS.c.scm_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_HashSet.prototype.init___ = (function() {
  ScalaJS.c.scm_HashSet.prototype.init___scm_FlatHashTable$Contents.call(this, null);
  return this
});
ScalaJS.c.scm_HashSet.prototype.apply__O__O = (function(v1) {
  return ScalaJS.s.scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z(this, v1)
});
ScalaJS.c.scm_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_HashSet.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_HashSet(elem)
});
ScalaJS.c.scm_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_HashSet$()
});
ScalaJS.c.scm_HashSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  var len = this.table$5.u["length"];
  while ((i < len)) {
    var curEntry = this.table$5.u[i];
    if ((curEntry !== null)) {
      f.apply__O__O(ScalaJS.s.scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O(this, curEntry))
    };
    i = ((1 + i) | 0)
  }
});
ScalaJS.c.scm_HashSet.prototype.size__I = (function() {
  return this.tableSize$5
});
ScalaJS.c.scm_HashSet.prototype.result__O = (function() {
  return this
});
ScalaJS.c.scm_HashSet.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.scm_FlatHashTable$$anon$1().init___scm_FlatHashTable(this)
});
ScalaJS.c.scm_HashSet.prototype.init___scm_FlatHashTable$Contents = (function(contents) {
  ScalaJS.s.scm_FlatHashTable$class__$$init$__scm_FlatHashTable__V(this);
  ScalaJS.s.scm_FlatHashTable$class__initWithContents__scm_FlatHashTable__scm_FlatHashTable$Contents__V(this, contents);
  return this
});
ScalaJS.c.scm_HashSet.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_HashSet(elem)
});
ScalaJS.c.scm_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  var this$1 = new ScalaJS.c.scm_HashSet().init___();
  var this$2 = ScalaJS.as.scm_HashSet(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this$1, this));
  return this$2.$$plus$eq__O__scm_HashSet(elem)
});
ScalaJS.c.scm_HashSet.prototype.$$plus$eq__O__scm_HashSet = (function(elem) {
  ScalaJS.s.scm_FlatHashTable$class__addElem__scm_FlatHashTable__O__Z(this, elem);
  return this
});
ScalaJS.is.scm_HashSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_HashSet)))
});
ScalaJS.as.scm_HashSet = (function(obj) {
  return ((ScalaJS.is.scm_HashSet(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.HashSet"))
});
ScalaJS.isArrayOf.scm_HashSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_HashSet)))
});
ScalaJS.asArrayOf.scm_HashSet = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_HashSet(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.HashSet;", depth))
});
ScalaJS.d.scm_HashSet = new ScalaJS.ClassTypeData({
  scm_HashSet: 0
}, false, "scala.collection.mutable.HashSet", {
  scm_HashSet: 1,
  scm_AbstractSet: 1,
  scm_AbstractIterable: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_Set: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  scm_SetLike: 1,
  sc_script_Scriptable: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_FlatHashTable: 1,
  scm_FlatHashTable$HashUtils: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_HashSet.prototype.$classData = ScalaJS.d.scm_HashSet;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofBoolean = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofBoolean;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofBoolean = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofBoolean.prototype = ScalaJS.c.scm_WrappedArray$ofBoolean.prototype;
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.apply__I__O = (function(index) {
  return this.apply$mcZI$sp__I__Z(index)
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  return this.apply$mcZI$sp__I__Z(index)
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__Z__V(index, ScalaJS.uZ(elem))
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.apply$mcZI$sp__I__Z = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.update__I__Z__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Boolean$1
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.init___AZ = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.d.scm_WrappedArray$ofBoolean = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofBoolean: 0
}, false, "scala.collection.mutable.WrappedArray$ofBoolean", {
  scm_WrappedArray$ofBoolean: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofBoolean.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofBoolean;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofByte = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofByte.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofByte;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofByte = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofByte.prototype = ScalaJS.c.scm_WrappedArray$ofByte.prototype;
ScalaJS.c.scm_WrappedArray$ofByte.prototype.apply__I__O = (function(index) {
  return this.apply__I__B(index)
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.apply__O__O = (function(v1) {
  return this.apply__I__B(ScalaJS.uI(v1))
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__B__V(index, ScalaJS.uB(elem))
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.apply__I__B = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Byte$1
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.init___AB = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.update__I__B__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.d.scm_WrappedArray$ofByte = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofByte: 0
}, false, "scala.collection.mutable.WrappedArray$ofByte", {
  scm_WrappedArray$ofByte: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofByte.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofByte;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofChar = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofChar.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofChar;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofChar = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofChar.prototype = ScalaJS.c.scm_WrappedArray$ofChar.prototype;
ScalaJS.c.scm_WrappedArray$ofChar.prototype.apply__I__O = (function(index) {
  var c = this.apply__I__C(index);
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.apply__O__O = (function(v1) {
  var c = this.apply__I__C(ScalaJS.uI(v1));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.update__I__O__V = (function(index, elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = ScalaJS.as.jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  this.update__I__C__V(index, jsx$1)
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.apply__I__C = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.update__I__C__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.init___AC = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Char$1
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.d.scm_WrappedArray$ofChar = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofChar: 0
}, false, "scala.collection.mutable.WrappedArray$ofChar", {
  scm_WrappedArray$ofChar: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofChar.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofChar;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofDouble = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofDouble;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofDouble = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofDouble.prototype = ScalaJS.c.scm_WrappedArray$ofDouble.prototype;
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.apply__I__O = (function(index) {
  return this.apply$mcDI$sp__I__D(index)
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  return this.apply$mcDI$sp__I__D(index)
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__D__V(index, ScalaJS.uD(elem))
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.init___AD = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.update__I__D__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Double$1
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.apply$mcDI$sp__I__D = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.d.scm_WrappedArray$ofDouble = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofDouble: 0
}, false, "scala.collection.mutable.WrappedArray$ofDouble", {
  scm_WrappedArray$ofDouble: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofDouble.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofDouble;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofFloat = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofFloat;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofFloat = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofFloat.prototype = ScalaJS.c.scm_WrappedArray$ofFloat.prototype;
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.apply__I__O = (function(index) {
  return this.apply$mcFI$sp__I__F(index)
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  return this.apply$mcFI$sp__I__F(index)
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__F__V(index, ScalaJS.uF(elem))
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.init___AF = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.apply$mcFI$sp__I__F = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.update__I__F__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Float$1
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.d.scm_WrappedArray$ofFloat = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofFloat: 0
}, false, "scala.collection.mutable.WrappedArray$ofFloat", {
  scm_WrappedArray$ofFloat: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofFloat.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofFloat;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofInt = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofInt.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofInt;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofInt = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofInt.prototype = ScalaJS.c.scm_WrappedArray$ofInt.prototype;
ScalaJS.c.scm_WrappedArray$ofInt.prototype.apply__I__O = (function(index) {
  return this.apply$mcII$sp__I__I(index)
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  return this.apply$mcII$sp__I__I(index)
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__I__V(index, ScalaJS.uI(elem))
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.update__I__I__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.apply$mcII$sp__I__I = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.init___AI = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Int$1
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.d.scm_WrappedArray$ofInt = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofInt: 0
}, false, "scala.collection.mutable.WrappedArray$ofInt", {
  scm_WrappedArray$ofInt: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofInt.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofInt;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofLong = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofLong.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofLong;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofLong = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofLong.prototype = ScalaJS.c.scm_WrappedArray$ofLong.prototype;
ScalaJS.c.scm_WrappedArray$ofLong.prototype.apply__I__O = (function(index) {
  return this.apply$mcJI$sp__I__J(index)
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  return this.apply$mcJI$sp__I__J(index)
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.init___AJ = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__J__V(index, ScalaJS.uJ(elem))
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.update__I__J__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Long$1
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.apply$mcJI$sp__I__J = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.d.scm_WrappedArray$ofLong = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofLong: 0
}, false, "scala.collection.mutable.WrappedArray$ofLong", {
  scm_WrappedArray$ofLong: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofLong.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofLong;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofRef = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null;
  this.elemTag$6 = null;
  this.bitmap$0$6 = false
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofRef.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofRef;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofRef = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofRef.prototype = ScalaJS.c.scm_WrappedArray$ofRef.prototype;
ScalaJS.c.scm_WrappedArray$ofRef.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O(ScalaJS.uI(v1))
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype.apply__I__O = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype.update__I__O__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype.elemTag$lzycompute__p6__s_reflect_ClassTag = (function() {
  if ((!this.bitmap$0$6)) {
    this.elemTag$6 = ScalaJS.m.s_reflect_ClassTag$().apply__jl_Class__s_reflect_ClassTag(ScalaJS.m.sr_ScalaRunTime$().arrayElementClass__O__jl_Class(ScalaJS.objectGetClass(this.array$6)));
    this.bitmap$0$6 = true
  };
  return this.elemTag$6
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype.init___AO = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ((!this.bitmap$0$6) ? this.elemTag$lzycompute__p6__s_reflect_ClassTag() : this.elemTag$6)
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.d.scm_WrappedArray$ofRef = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofRef: 0
}, false, "scala.collection.mutable.WrappedArray$ofRef", {
  scm_WrappedArray$ofRef: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofRef.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofRef;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofShort = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofShort.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofShort;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofShort = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofShort.prototype = ScalaJS.c.scm_WrappedArray$ofShort.prototype;
ScalaJS.c.scm_WrappedArray$ofShort.prototype.apply__I__O = (function(index) {
  return this.apply__I__S(index)
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.apply__O__O = (function(v1) {
  return this.apply__I__S(ScalaJS.uI(v1))
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.init___AS = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__S__V(index, ScalaJS.uS(elem))
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.update__I__S__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Short$1
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.apply__I__S = (function(index) {
  return this.array$6.u[index]
});
ScalaJS.d.scm_WrappedArray$ofShort = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofShort: 0
}, false, "scala.collection.mutable.WrappedArray$ofShort", {
  scm_WrappedArray$ofShort: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofShort.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofShort;
/** @constructor */
ScalaJS.c.scm_WrappedArray$ofUnit = (function() {
  ScalaJS.c.scm_WrappedArray.call(this);
  this.array$6 = null
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype = new ScalaJS.h.scm_WrappedArray();
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.constructor = ScalaJS.c.scm_WrappedArray$ofUnit;
/** @constructor */
ScalaJS.h.scm_WrappedArray$ofUnit = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_WrappedArray$ofUnit.prototype = ScalaJS.c.scm_WrappedArray$ofUnit.prototype;
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.apply__I__O = (function(index) {
  this.apply$mcVI$sp__I__V(index)
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  this.apply$mcVI$sp__I__V(index)
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.apply$mcVI$sp__I__V = (function(index) {
  this.array$6.u[index]
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__sr_BoxedUnit__V(index, ScalaJS.asUnit(elem))
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.length__I = (function() {
  return this.array$6.u["length"]
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.init___Asr_BoxedUnit = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ScalaJS.m.s_reflect_ClassTag$().Unit$1
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.array__O = (function() {
  return this.array$6
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.update__I__sr_BoxedUnit__V = (function(index, elem) {
  this.array$6.u[index] = elem
});
ScalaJS.d.scm_WrappedArray$ofUnit = new ScalaJS.ClassTypeData({
  scm_WrappedArray$ofUnit: 0
}, false, "scala.collection.mutable.WrappedArray$ofUnit", {
  scm_WrappedArray$ofUnit: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_WrappedArray$ofUnit.prototype.$classData = ScalaJS.d.scm_WrappedArray$ofUnit;
/** @constructor */
ScalaJS.c.scm_ListBuffer = (function() {
  ScalaJS.c.scm_AbstractBuffer.call(this);
  this.scala$collection$mutable$ListBuffer$$start$6 = null;
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
ScalaJS.c.scm_ListBuffer.prototype = new ScalaJS.h.scm_AbstractBuffer();
ScalaJS.c.scm_ListBuffer.prototype.constructor = ScalaJS.c.scm_ListBuffer;
/** @constructor */
ScalaJS.h.scm_ListBuffer = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ListBuffer.prototype = ScalaJS.c.scm_ListBuffer.prototype;
ScalaJS.c.scm_ListBuffer.prototype.copy__p6__V = (function() {
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    return (void 0)
  };
  var cursor = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$1 = this.last0$6;
  var limit = this$1.tl$5;
  this.clear__V();
  while ((cursor !== limit)) {
    this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
    var this$2 = cursor;
    cursor = this$2.tail__sci_List()
  }
});
ScalaJS.c.scm_ListBuffer.prototype.init___ = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = ScalaJS.m.sci_Nil$();
  this.exported$6 = false;
  this.len$6 = 0;
  return this
});
ScalaJS.c.scm_ListBuffer.prototype.apply__I__O = (function(n) {
  if (((n < 0) || (n >= this.len$6))) {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n))
  } else {
    var this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
    return ScalaJS.s.sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this$2, n)
  }
});
ScalaJS.c.scm_ListBuffer.prototype.lengthCompare__I__I = (function(len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this$1, len)
});
ScalaJS.c.scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O(ScalaJS.uI(v1))
});
ScalaJS.c.scm_ListBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this$1, that)
});
ScalaJS.c.scm_ListBuffer.prototype.exists__F1__Z = (function(p) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_LinearSeqOptimized$class__exists__sc_LinearSeqOptimized__F1__Z(this$1, p)
});
ScalaJS.c.scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()
});
ScalaJS.c.scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.exported$6 = (!this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z());
  return this.scala$collection$mutable$ListBuffer$$start$6
});
ScalaJS.c.scm_ListBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_ListBuffer.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.scm_ListBuffer(that)) {
    var x2 = ScalaJS.as.scm_ListBuffer(that);
    return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
  } else {
    return ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
  }
});
ScalaJS.c.scm_ListBuffer.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, sep, end)
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
ScalaJS.c.scm_ListBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_ListBuffer$()
});
ScalaJS.c.scm_ListBuffer.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
ScalaJS.c.scm_ListBuffer.prototype.foldLeft__O__F2__O = (function(z, op) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_LinearSeqOptimized$class__foldLeft__sc_LinearSeqOptimized__O__F2__O(this$1, z, op)
});
ScalaJS.c.scm_ListBuffer.prototype.size__I = (function() {
  return this.len$6
});
ScalaJS.c.scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
ScalaJS.c.scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
});
ScalaJS.c.scm_ListBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_ListBuffer.prototype.length__I = (function() {
  return this.len$6
});
ScalaJS.c.scm_ListBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_ListBuffer.prototype.toStream__sci_Stream = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
});
ScalaJS.c.scm_ListBuffer.prototype.prependToList__sci_List__sci_List = (function(xs) {
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    return xs
  } else {
    if (this.exported$6) {
      this.copy__p6__V()
    };
    this.last0$6.tl$5 = xs;
    return this.toList__sci_List()
  }
});
ScalaJS.c.scm_ListBuffer.prototype.contains__O__Z = (function(elem) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_LinearSeqOptimized$class__contains__sc_LinearSeqOptimized__O__Z(this$1, elem)
});
ScalaJS.c.scm_ListBuffer.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$eq__O__scm_ListBuffer = (function(x) {
  if (this.exported$6) {
    this.copy__p6__V()
  };
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    this.last0$6 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(x, ScalaJS.m.sci_Nil$());
    this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
  } else {
    var last1 = this.last0$6;
    this.last0$6 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(x, ScalaJS.m.sci_Nil$());
    last1.tl$5 = this.last0$6
  };
  this.len$6 = ((1 + this.len$6) | 0);
  return this
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
ScalaJS.c.scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_ListBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  ScalaJS.s.sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V(this$1, xs, start, len)
});
ScalaJS.c.scm_ListBuffer.prototype.clear__V = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = ScalaJS.m.sci_Nil$();
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer = (function(xs) {
  _$plus$plus$eq: while (true) {
    var x1 = xs;
    if ((x1 !== null)) {
      if ((x1 === this)) {
        var n = this.len$6;
        xs = ScalaJS.as.sc_TraversableOnce(ScalaJS.s.sc_IterableLike$class__take__sc_IterableLike__I__O(this, n));
        continue _$plus$plus$eq
      }
    };
    return ScalaJS.as.scm_ListBuffer(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
});
ScalaJS.c.scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
ScalaJS.is.scm_ListBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
});
ScalaJS.as.scm_ListBuffer = (function(obj) {
  return ((ScalaJS.is.scm_ListBuffer(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
});
ScalaJS.isArrayOf.scm_ListBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
});
ScalaJS.asArrayOf.scm_ListBuffer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_ListBuffer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
});
ScalaJS.d.scm_ListBuffer = new ScalaJS.ClassTypeData({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ListBuffer.prototype.$classData = ScalaJS.d.scm_ListBuffer;
/** @constructor */
ScalaJS.c.scm_StringBuilder = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this);
  this.underlying$5 = null
});
ScalaJS.c.scm_StringBuilder.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_StringBuilder.prototype.constructor = ScalaJS.c.scm_StringBuilder;
/** @constructor */
ScalaJS.h.scm_StringBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_StringBuilder.prototype = ScalaJS.c.scm_StringBuilder.prototype;
ScalaJS.c.scm_StringBuilder.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.init___ = (function() {
  ScalaJS.c.scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & ScalaJS.uI(thiz["charCodeAt"](idx)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & ScalaJS.uI(thiz["charCodeAt"](index)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.scm_StringBuilder.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__exists__sc_IndexedSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return ScalaJS.as.T(thiz["substring"](start, end))
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = ScalaJS.as.jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
ScalaJS.c.scm_StringBuilder.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_IndexedSeq$()
});
ScalaJS.c.scm_StringBuilder.prototype.toString__T = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
ScalaJS.c.scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.scm_StringBuilder.prototype.foldLeft__O__F2__O = (function(z, op) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return ScalaJS.s.sc_IndexedSeqOptimized$class__foldl__p0__sc_IndexedSeqOptimized__I__I__O__F2__O(this, 0, ScalaJS.uI(thiz["length"]), z, op)
});
ScalaJS.c.scm_StringBuilder.prototype.reverse__O = (function() {
  return this.reverse__scm_StringBuilder()
});
ScalaJS.c.scm_StringBuilder.prototype.result__O = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
ScalaJS.c.scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  this.underlying$5.append__T__jl_StringBuilder(s);
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI(thiz["length"]))
});
ScalaJS.c.scm_StringBuilder.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  ScalaJS.c.scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, new ScalaJS.c.jl_StringBuilder().init___I(((ScalaJS.uI(initValue["length"]) + initCapacity) | 0)).append__T__jl_StringBuilder(initValue));
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.length__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return ScalaJS.uI(thiz["length"])
});
ScalaJS.c.scm_StringBuilder.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.take__I__O = (function(n) {
  return ScalaJS.s.sci_StringLike$class__slice__sci_StringLike__I__I__O(this, 0, n)
});
ScalaJS.c.scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  this.underlying$5.append__T__jl_StringBuilder(ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T(x));
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = ScalaJS.as.jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
ScalaJS.c.scm_StringBuilder.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_StringBuilder.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_StringBuilder.prototype.reverse__scm_StringBuilder = (function() {
  return new ScalaJS.c.scm_StringBuilder().init___jl_StringBuilder(new ScalaJS.c.jl_StringBuilder().init___jl_CharSequence(this.underlying$5).reverse__jl_StringBuilder())
});
ScalaJS.c.scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = ScalaJS.as.scm_StringBuilder(repr);
  return repr$1
});
ScalaJS.c.scm_StringBuilder.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_GrowingBuilder().init___scg_Growable(new ScalaJS.c.scm_StringBuilder().init___())
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.is.scm_StringBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_StringBuilder)))
});
ScalaJS.as.scm_StringBuilder = (function(obj) {
  return ((ScalaJS.is.scm_StringBuilder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.StringBuilder"))
});
ScalaJS.isArrayOf.scm_StringBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_StringBuilder)))
});
ScalaJS.asArrayOf.scm_StringBuilder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_StringBuilder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.StringBuilder;", depth))
});
ScalaJS.d.scm_StringBuilder = new ScalaJS.ClassTypeData({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_StringBuilder.prototype.$classData = ScalaJS.d.scm_StringBuilder;
/** @constructor */
ScalaJS.c.sjs_js_WrappedArray = (function() {
  ScalaJS.c.scm_AbstractBuffer.call(this);
  this.array$6 = null
});
ScalaJS.c.sjs_js_WrappedArray.prototype = new ScalaJS.h.scm_AbstractBuffer();
ScalaJS.c.sjs_js_WrappedArray.prototype.constructor = ScalaJS.c.sjs_js_WrappedArray;
/** @constructor */
ScalaJS.h.sjs_js_WrappedArray = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_WrappedArray.prototype = ScalaJS.c.sjs_js_WrappedArray.prototype;
ScalaJS.c.sjs_js_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.init___ = (function() {
  ScalaJS.c.sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
ScalaJS.c.sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  return this.array$6[index]
});
ScalaJS.c.sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__exists__sc_IndexedSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6["push"](elem);
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sjs_js_WrappedArray$()
});
ScalaJS.c.sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.foldLeft__O__F2__O = (function(z, op) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__foldl__p0__sc_IndexedSeqOptimized__I__I__O__F2__O(this, 0, ScalaJS.uI(this.array$6["length"]), z, op)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.reverse__O = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI(this.array$6["length"]))
});
ScalaJS.c.sjs_js_WrappedArray.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.length__I = (function() {
  return ScalaJS.uI(this.array$6["length"])
});
ScalaJS.c.sjs_js_WrappedArray.prototype.take__I__O = (function(n) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__slice__sc_IndexedSeqOptimized__I__I__O(this, 0, n)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.array$6["push"](elem);
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.toCollection__O__sc_Seq = (function(repr) {
  return ScalaJS.as.scm_IndexedSeq(repr)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
ScalaJS.is.sjs_js_WrappedArray = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedArray)))
});
ScalaJS.as.sjs_js_WrappedArray = (function(obj) {
  return ((ScalaJS.is.sjs_js_WrappedArray(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.WrappedArray"))
});
ScalaJS.isArrayOf.sjs_js_WrappedArray = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedArray)))
});
ScalaJS.asArrayOf.sjs_js_WrappedArray = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_WrappedArray(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.WrappedArray;", depth))
});
ScalaJS.d.sjs_js_WrappedArray = new ScalaJS.ClassTypeData({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
ScalaJS.c.sjs_js_WrappedArray.prototype.$classData = ScalaJS.d.sjs_js_WrappedArray;
/** @constructor */
ScalaJS.c.scm_ArrayBuffer = (function() {
  ScalaJS.c.scm_AbstractBuffer.call(this);
  this.initialSize$6 = 0;
  this.array$6 = null;
  this.size0$6 = 0
});
ScalaJS.c.scm_ArrayBuffer.prototype = new ScalaJS.h.scm_AbstractBuffer();
ScalaJS.c.scm_ArrayBuffer.prototype.constructor = ScalaJS.c.scm_ArrayBuffer;
/** @constructor */
ScalaJS.h.scm_ArrayBuffer = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ArrayBuffer.prototype = ScalaJS.c.scm_ArrayBuffer.prototype;
ScalaJS.c.scm_ArrayBuffer.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.init___ = (function() {
  ScalaJS.c.scm_ArrayBuffer.prototype.init___I.call(this, 16);
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$eq__O__scm_ArrayBuffer = (function(elem) {
  var n = ((1 + this.size0$6) | 0);
  ScalaJS.s.scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V(this, n);
  this.array$6.u[this.size0$6] = elem;
  this.size0$6 = ((1 + this.size0$6) | 0);
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.apply__I__O = (function(idx) {
  return ScalaJS.s.scm_ResizableArray$class__apply__scm_ResizableArray__I__O(this, idx)
});
ScalaJS.c.scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  var idx = ScalaJS.uI(v1);
  return ScalaJS.s.scm_ResizableArray$class__apply__scm_ResizableArray__I__O(this, idx)
});
ScalaJS.c.scm_ArrayBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.scm_ArrayBuffer.prototype.exists__F1__Z = (function(p) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__exists__sc_IndexedSeqOptimized__F1__Z(this, p)
});
ScalaJS.c.scm_ArrayBuffer.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.scm_ArrayBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
ScalaJS.c.scm_ArrayBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_ArrayBuffer$()
});
ScalaJS.c.scm_ArrayBuffer.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.scm_ResizableArray$class__foreach__scm_ResizableArray__F1__V(this, f)
});
ScalaJS.c.scm_ArrayBuffer.prototype.foldLeft__O__F2__O = (function(z, op) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__foldl__p0__sc_IndexedSeqOptimized__I__I__O__F2__O(this, 0, this.size0$6, z, op)
});
ScalaJS.c.scm_ArrayBuffer.prototype.reverse__O = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
ScalaJS.c.scm_ArrayBuffer.prototype.result__O = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
});
ScalaJS.c.scm_ArrayBuffer.prototype.init___I = (function(initialSize) {
  this.initialSize$6 = initialSize;
  ScalaJS.s.scm_ResizableArray$class__$$init$__scm_ResizableArray__V(this);
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_ArrayBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$6
});
ScalaJS.c.scm_ArrayBuffer.prototype.take__I__O = (function(n) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__slice__sc_IndexedSeqOptimized__I__I__O(this, 0, n)
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer = (function(xs) {
  if (ScalaJS.is.sc_IndexedSeqLike(xs)) {
    var x2 = ScalaJS.as.sc_IndexedSeqLike(xs);
    var n = x2.length__I();
    var n$1 = ((this.size0$6 + n) | 0);
    ScalaJS.s.scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V(this, n$1);
    x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
    this.size0$6 = ((this.size0$6 + n) | 0);
    return this
  } else {
    return ScalaJS.as.scm_ArrayBuffer(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
ScalaJS.c.scm_ArrayBuffer.prototype.sizeHint__I__V = (function(len) {
  if (((len > this.size0$6) && (len >= 1))) {
    var newarray = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [len]);
    var src = this.array$6;
    var length = this.size0$6;
    ScalaJS.systemArraycopy(src, 0, newarray, 0, length);
    this.array$6 = newarray
  }
});
ScalaJS.c.scm_ArrayBuffer.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_ArrayBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.scm_ResizableArray$class__copyToArray__scm_ResizableArray__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.scm_ArrayBuffer.prototype.toCollection__O__sc_Seq = (function(repr) {
  return ScalaJS.as.scm_IndexedSeq(repr)
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
});
ScalaJS.c.scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
ScalaJS.is.scm_ArrayBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
});
ScalaJS.as.scm_ArrayBuffer = (function(obj) {
  return ((ScalaJS.is.scm_ArrayBuffer(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
});
ScalaJS.isArrayOf.scm_ArrayBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
});
ScalaJS.asArrayOf.scm_ArrayBuffer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
});
ScalaJS.d.scm_ArrayBuffer = new ScalaJS.ClassTypeData({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ArrayBuffer.prototype.$classData = ScalaJS.d.scm_ArrayBuffer;
//# sourceMappingURL=scala-js-jovian-fastopt.js.map
