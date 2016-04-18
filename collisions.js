//collisions.js
(function() {

var Collidable = com.benjaminrosenbaum.jovian.Collidable;
var CMotile = com.benjaminrosenbaum.jovian.Motile;
var CMotileFactory = com.benjaminrosenbaum.jovian.MotileFactory;
var Collision = com.benjaminrosenbaum.jovian.Collision;
var CollisionResolution = com.benjaminrosenbaum.jovian.CollisionResolution;
var TimeEngine = com.benjaminrosenbaum.jovian.TimeEngine;
var CSquare = com.benjaminrosenbaum.jovian.Square;
var CPoint = com.benjaminrosenbaum.jovian.Point;
var CVector = com.benjaminrosenbaum.jovian.Vector;


//TODO this thunking is inefficient, maybe a truly interoperable type (or just everything server side in Scala...)
//or else pass a link to the original object, mark it as unchanged, conversion can just pass it back if unchanged
//or just let Scala do all the movement, so we're not double-moving objects...
Point.prototype.asCollidablePoint = function() { return new CPoint(this.x, this.y); }  
Point.fromCollidablePoint = function(p) { return new Point(p.x, p.y); }
Vector.prototype.asCollidableVector = function() { return new CVector(this.x, this.y); }
Vector.fromCollidableVector = function(v) { return new Vector(v.x, v.y); }

Entities.Motile.prototype.asCollidable = function() {  //id: String, kind: String, acc: Vector, vel: Vector, rawPos: Point)
	return new CMotileFactory().create(this.getId(), this.getType(), this.acc.asCollidableVector(), 
									this.vel.asCollidableVector(), this.getPos().asCollidablePoint(), this.energy, this.fertility);
}

Entities.Motile.fromCollidable = function(cmotile) {
	return new Entities.Motile(new Entities.Entity(cmotile.id, cmotile.kind), 
							Vector.fromCollidableVector(cmotile.acc), Vector.fromCollidableVector(cmotile.vel), 
							Point.fromCollidablePoint(cmotile.pos), cmotile.energy, cmotile.fertility);
}

Zone.prototype.resolveEffects = function() {
	var cMotiles = TimeEngine().step(this.motiles.map(function(m){ return m.asCollidable(); } ), this.wind.asCollidableVector());
	//var colliders = CollisionResolution().resolve(this.motiles.map(function(m){ return m.asCollidable(); } ));
	return this.setMotiles(cMotiles.map(function(c) { return Entities.Motile.fromCollidable(c);} ));
}

})();