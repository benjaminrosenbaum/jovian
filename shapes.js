//shapes.js (client)

//Entity
var Shape = new Interface('Shape', ['at','rotated','draw']); 
var Fill = new Interface('Fill', ['paint']); 


function PointCollection() {}
PointCollection.prototype.rotated = function(cth, sth) { return this.applyToPoints(function(pt) { return pt.rotated(cth, sth); }); }
PointCollection.prototype.scaled = function(scale)     { return this.applyToPoints(function(pt) { return pt.scaled(scale); }); }
PointCollection.prototype.plus = function(p)           { return this.applyToPoints(function(pt) { return pt.plus(p); }); }
PointCollection.prototype.at = PointCollection.prototype.plus; 
PointCollection.prototype.flipX = function() { return this.applyToPoints(function(pt){ return pt.flipX(); } ); }
PointCollection.prototype.flipY = function() { return this.applyToPoints(function(pt){ return pt.flipY(); } ); }
PointCollection.prototype.flip = function()  { return this.applyToPoints(function(pt){ return pt.flip(); } ); }


//POLYGON
function Polygon(points, fill, line) {
	this.points = points;
	this.fill = fill;
	this.line = line;
//	this.checkInterfaces();
}
//implementsInterface(Polygon.prototype, Shape);
Polygon.prototype = Object.create(PointCollection.prototype);
Polygon.prototype.ctor = Polygon;

Polygon.prototype.addPoints = function(points) {
	return new this.ctor(this.points.concat(points), this.fill, this.line);
} 

Polygon.prototype.rotated = function(theta) { //TODO pull up to Shape
	var cth = Math.cos(theta);
	var sth = Math.sin(theta);
	return this.applyToPoints(function (p) { return p.rotated(cth,sth); } );
}

Polygon.prototype.applyToPoints = function(fn) {
	return new this.ctor(this.points.map(fn), this.fill, this.line);
}

Polygon.prototype.draw = function (canvas) {
	canvas.beginPath();       //TODO pull up to shape? 
	var path = this.points;
	this.movePenTo(canvas, path[0]);
    for (var i = 1; (i < path.length); i++) {
		this.lineTo(canvas, path[i]);
	}
	this.lineTo(canvas, path[0]);
	if (this.fill) { this.fill.paint(canvas); }  //TODO pull up to shape?
	if (this.line) { this.line.stroke(canvas); } else { canvas.stroke(); }       
};

Polygon.prototype.movePenTo = function (canvas, pt) { if (pt.movePenTo) { pt.movePenTo(canvas); } else { canvas.moveTo(pt.x, pt.y);} }
Polygon.prototype.lineTo = function (canvas, pt) { if (pt.lineTo) { pt.lineTo(canvas) } else { canvas.lineTo(pt.x, pt.y);} }

Polygon.prototype.mirrorOn = function(fn) { return this.addPoints(this.points.map(fn).reverse()); }
Polygon.prototype.hSymmetric = function() { return this.mirrorOn(function(p){ return p.flipX();});}
Polygon.prototype.vSymmetric = function() { return this.mirrorOn(function(p){ return p.flipY();});}

Polygon.DEFAULT = new Polygon([new Point(-1, -1), new Point(-1, 1), new Point(1, 1), new Point(1, -1)], new SolidFill("black"))

function FixedPolygon (points, fill, line) {
	Polygon.call(this, points, fill, line);
//	this.checkInterfaces();
}
//implementsInterface(Polygon.prototype, Shape);
FixedPolygon.prototype = Object.create(Polygon.prototype);
FixedPolygon.prototype.ctor = FixedPolygon;
FixedPolygon.prototype.rotated = function(theta) { return this; } //don't rotate

function MultiShape(shapes) {
	this.shapes = shapes;
}
MultiShape.prototype.ctor = MultiShape;
MultiShape.prototype.rotated = function(theta) { return new this.ctor(this.shapes.map(function(sh) { return sh.rotated(theta); })); }
MultiShape.prototype.scaled = function(scale)  { return new this.ctor(this.shapes.map(function(sh) { return sh.scaled(scale); })); }
MultiShape.prototype.at = function(p) { return new this.ctor(this.shapes.map(function(sh) { return sh.at(p); })); }
MultiShape.prototype.draw = function (canvas) {	this.shapes.forEach(function(pg){ pg.draw(canvas); });};

function Circle(center, radius, fill, line) {
	this.center = center;
	this.radius = radius;
	this.fill = fill;
	this.line = line;
}
Circle.prototype = Object.create(PointCollection.prototype);
Circle.prototype.ctor = Circle;
Circle.prototype.applyToPoints = function(fn) {	return new Circle(fn(this.center), this.radius, this.fill, this.line); }
Circle.prototype.scaled = function(scale){ return new Circle(this.center.scaled(scale), this.radius * scale, this.fill, this.line); }
Circle.prototype.rotated = function(theta) { //TODO pull up to Shape
	var cth = Math.cos(theta);
	var sth = Math.sin(theta);
	return this.applyToPoints(function (p) { return p.rotated(cth,sth); } );
}
Circle.prototype.draw = function(canvas) {
	  canvas.beginPath();
      canvas.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
	if (this.fill) { this.fill.paint(canvas); }  //TODO pull up to shape?
	if (this.line) { this.line.stroke(canvas); } else { canvas.stroke(); }       
}


function QBeziPt(dest, anchor) {
	this.dest = dest;
	this.anchor = anchor;
}
QBeziPt.prototype = Object.create(PointCollection.prototype);
QBeziPt.prototype.ctor = QBeziPt;

QBeziPt.prototype.applyToPoints = function(fn) {
	return new QBeziPt(fn(this.dest), fn(this.anchor));
}

QBeziPt.prototype.movePenTo = function (canvas) {
	canvas.moveTo(this.dest.x, this.dest.y);
}

QBeziPt.prototype.lineTo = function (canvas) {
	canvas.quadraticCurveTo(this.anchor.x, this.anchor.y, this.dest.x, this.dest.y);
}

function interpolate(v1, v2, interval, t) {
	var halfInterval = interval / 2;
	var step = halfInterval - Math.abs(halfInterval - (t % interval)); //how far there & back

	var w1 = step / halfInterval; //contribution of the first point
	var w2 = 1 - w1;		     //contribution of the second point
	return v1.scaled(w1).plus(v2.scaled(w2)); //aggregate point
}

Point.animate = function(p1, p2, interval, t) {	return interpolate(p1, p2, interval, t); }


function Color(hue, saturation, luminosity, alpha) {
	function constrain(v, max) { return Math.max(0, Math.min(max, v || 0)); }

	this.hue = constrain(hue, 360)
	this.saturation = constrain(saturation, 100);
	this.luminosity = constrain(luminosity, 100);
	this.alpha = constrain(alpha || 1.0, 1.0);
}
Color.prototype.scaled = function(scale) {
	return new Color(this.hue * scale, this.saturation * scale, this.luminosity * scale, this.alpha * scale);
}
Color.prototype.plus = function(c) {
	return new Color(this.hue + c.hue, this.saturation + c.saturation, this.luminosity + c.saturation, this.alpha + c.alpha);
}
Color.prototype.toString = function() {
	return "hsla(" + this.hue  + ", " + this.saturation + "%, " + this.luminosity + "%," + this.alpha + ")";
}
Color.hsla = function (hue, saturation, luminosity, alpha) {
	var c = new Color(hue, saturation, luminosity, alpha);
	return c.toString();
}
Color.animate = function(c1, c2, interval, t) {	return interpolate(c1, c2, interval, t); }

function SolidFill(color) {
	this.color = color;
//	this.checkInterfaces();
}
//implementsInterface(SolidFill.prototype, Fill);
SolidFill.prototype.paint = function(canvas) {
	canvas.save();
	canvas.fillStyle = this.color;
	canvas.fill();
	canvas.restore();
}

function SimpleGradientFill(startPt, endPt, startColor, endColor) {
	this.startPt = startPt;
	this.endPt = endPt;
	this.startColor = startColor;
	this.endColor = endColor;
}

SimpleGradientFill.prototype.paint = function(canvas) {
	canvas.save();
	var grd = canvas.createLinearGradient(this.startPt.x, this.startPt.y, this.endPt.x, this.endPt.y);
	grd.addColorStop(0, this.startColor);
	grd.addColorStop(1, this.endColor);
	canvas.fillStyle = grd;
	canvas.fillRect(this.startPt.x, this.startPt.y, this.endPt.x, this.endPt.y);
	canvas.restore();
}

function LineStyle(color, width) {
	this.color = color || "black";
	this.width = width || 1.0;
}
LineStyle.prototype.stroke = function(canvas) {
	  canvas.save();
	  canvas.lineWidth = this.width;
      canvas.strokeStyle = this.color;
      canvas.stroke();
      canvas.restore();
}






