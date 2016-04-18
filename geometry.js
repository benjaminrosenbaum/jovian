//geometry.js

var Plane = { Width : 1500, Height : 1800, Buffer: 0};
Plane.extremity = function() { return new Point(Plane.Width, Plane.Height); }
Plane.nextPoint = function() {
	return new Point(Plane.Width * Math.random(), Plane.Height * Math.random() );
}
Plane.Limit = Plane.Width + Plane.Height;

function Coords (x, y) {
	this.x = x;
	this.y = y;
}
Coords.prototype.ctor = Coords;
Coords.prototype.magnitude = function() {
	return Math.sqrt(this.x* this.x + this.y*this.y);
}
Coords.prototype.scaled = function(factor) {
	return new this.ctor(this.x * factor, this.y * factor);
}
Coords.prototype.plus = function (coords) { //also works for adding a Vector to a Point
	return new this.ctor(this.x + coords.x, this.y + coords.y);
}
Coords.prototype.minus = function (coords) { //also works for adding a Vector to a Point
	return new this.ctor(this.x - coords.x, this.y - coords.y);
}
Coords.prototype.equals = function(coords) {
	var epsilon = 0.00001;
	return Math.abs(coords.x - this.x) + Math.abs(coords.y - this.y) < epsilon; //floating point
}
Coords.prototype.flipX = function() { return new this.ctor(-this.x, this.y); }
Coords.prototype.flipY = function() { return new this.ctor(this.x, -this.y); }
Coords.prototype.flip = function() { return new this.ctor(-this.x, -this.y); }

Coords.prototype.toString = function() {
	return "(" + this.x +"," + this.y +")";
}
Coords.averageOf = function(cs, initial) {  //zero length array will return initial; otherwise, return type is of objects in array
	var scale = (cs.length == 0) ? 1 : 1 / cs.length;
	return cs.reduce(function(acc, c){ return c.plus(acc); }, initial).scaled(scale);
}

//POINT
var Position = new Interface('Position', ['getPos']); 

function Point (x, y) {
	Coords.call(this, x, y);
	this.checkInterfaces();
}
//inherit 
Point.prototype = Object.create(Coords.prototype);
Point.prototype.ctor = Point;
implementsInterface(Point.prototype, Position);
Point.fromJSON = function(json) { return fromJSON(json, function(j) { return new Point(json.x, json.y);} ); } 
//duck interface Positioned
Point.prototype.getPos = function() { return this; } 
Point.getPoints = function(positions) { return positions.map(function(p) { return p.getPos(); }); }

// Rotates a point given cos(theta) and sin(theta). We don't pass in theta
// to avoid recomputation of cos and sin.
Point.prototype.rotated = function (cth, sth) {
	return new Point(cth * this.x - sth * this.y, sth * this.x + cth * this.y);
};
Point.prototype.to = function(position) {
	return new Vector(position.getPos().x-this.x, position.getPos().y-this.y);
}
Point.prototype.distanceTo = function(position) {
    if (this.equals(position.getPos())) return 0;
    return this.to(position.getPos()).magnitude();
};
//forced within vertical bounds, while horizontal bounds wrap. Not every point, just the center points of motiles.
Point.prototype.planified = function(plane) {
 	function wrapCoordinate(coord, bound) {
		if (coord < 0 ) return coord + bound;
		if (coord > bound) return coord - bound;
		return coord;
	}
	function limitCoordinate(coord, bound) {
		return Math.min(Math.max(coord, 0), bound);
	}
	return new Point(wrapCoordinate(this.x, plane.Width), limitCoordinate(this.y, plane.Height));
	//return new Point(limitCoordinate(this.x, plane.Width), limitCoordinate(this.y, plane.Height));
}
Point.prototype.allWithinManhattanDistanceOf = function(points, dist) { 
	var that = this; 
	return points.filter(function (p) {return that.to(p).manhattanDist() <= dist;}); 
}
Point.centerOf = function(positions) { return Coords.averageOf(positions.map(function(p){ return p.getPos(); }), Point.ORIGIN); }
Point.ORIGIN = new Point(0, 0);

/*Point.prototype.flipX = function() { return new Point(-this.x, this.y); }
Point.prototype.flipY = function() { return new Point(this.x, -this.y); }
Point.prototype.flip = function() { return new Point(-this.x, -this.y); }*/

//VECTOR  TODO extend Point?
function Vector (x, y) {
	Coords.call(this, x, y);
}
//inherit 
Vector.prototype = Object.create(Coords.prototype);
Vector.prototype.ctor = Vector;

Vector.prototype.theta = function () { return Math.atan2(this.y, this.x) - Math.PI/2; }
//vector between 0 and 1 in magnitude, for multiplying
Vector.prototype.normalized = function() {
    var mag = this.magnitude();
    return (mag == 0) ? Vector.NULL : this.scaled(1 / mag);
};
Vector.prototype.scaledTo = function(mag) { return this.normalized().scaled(mag);} //same direction, but scaled to given magnitude
Vector.prototype.capMagnitudeAt = function(mag) { return (this.magnitude() > mag) ? this.scaledTo(mag) : this;}
	  //TODO for performance, this could be redesigned to square the left instead of sqrt'ing the right
		  
Vector.prototype.manhattanDist = function() {	return Math.abs(this.x) + Math.abs(this.y);}
Vector.averageOf = function(vs) { return Coords.averageOf(vs, Vector.NULL); }
Vector.NULL = new Vector(0, 0);


function Rect(topLeft, bottomRight) {
	this.topLeft = topLeft;
	this.bottomRight = bottomRight;
	this.contains = function (p) {
		return p.x >= this.topLeft.x && p.x <= this.bottomRight.x 
		    && p.y >= this.topLeft.y && p.y <= this.bottomRight.y;
	}
	this.expand = function(s) {
		return new Rect(new Point(topLeft.x - s, topLeft.y - s), new Point(bottomRight.x + s, bottomRight.y + s));
	}
}



