
function TypeRegistry(raw) 
{
	this.types = [];
	for (type in raw) { 
		this.types.push(type);
		this[type] = raw[type];
	}
};
TypeRegistry.prototype.getByType = function(type) {
	if (this[type]) { return this[type] } else { throw "Unknown type " + type ; }
}
//fold on each type in registry by calling registry.fn(value, acc, key)
TypeRegistry.prototype.fold = function(arg, fn) {
	var that = this;
	return this.types.reduce(function(acc, type) { return fn.call(that, that[type], acc, type);}, arg);
}
TypeRegistry.prototype.getCounts = function(entities) {
	var counts = {};
	for (var i = 0; i < this.types.length; i++) {
		counts[this.types[i]] = 0;
	};
	return entities.reduce(function(acc, m){ acc[m.getType()]++; return acc; }, counts);
}


var Entities = 
	{
		Types : new TypeRegistry({ 
			"Beast" : {size : 22, maxSpeed: 5, maxForce: 3.5, spawnChance : 0.0, spawnCap: 0, friction: 0.2,  
				life: { healing: 0.02, maxEnergy : 100} },
			"Flutterbye" : {size : 8, maxSpeed: 1, maxForce: 1, spawnChance: 0.035, spawnCap: 55, friction: 0.013,
				life: {maxEnergy: 3, nutrition: 2}
			},
			"Bumbler" : {size : 16, maxSpeed: 3, maxForce: 0.5, spawnChance: 0.5, spawnCap: 8, friction: 0.3, //0.03
				life: {maxEnergy: 20, nutrition: 10}
			},
			"Willicker" : {size : 32, maxSpeed: 0.1, maxForce: 0.1, spawnChance: 0.005, spawnCap: 10, friction: 0.01, //0.03
				life: {maxEnergy: 20, nutrition: 100}
			}, 
			"Viprish" : {size : 25, maxSpeed: 2, maxForce: 3, spawnChance: 0.005, spawnCap: 2, friction: 0.3, //0.03
				life: {maxEnergy: 20, nutrition: 10}
			},
			"Ralava" : {size: 22, spawnChance: 0.05, spawnCap: 4, life: {maxEnergy: 40}},
			"Frillist" : {size: 20, spawnChance : 0.05, spawnCap : 5, life: {maxEnergy: 10}},
			"Kledge" : {size : 62, spawnChance: 0.05, spawnCap: 10, life: {maxEnergy: 200}},
			"Devastroph" : { size: 23, spawnChance: 0.01, spawnCap: 4, life: {maxEnergy: 70}}
		})
	};
Entities.Types.getSize = function(type) {
	return this.getByType(type).size;
}
Entities.Types.createRegistryOf = function(ctor) {
	return new TypeRegistry(Entities.Types.fold({}, function(typedesc, reg, type){ 
		reg[type] = new ctor(typedesc, type); return reg; 
	})); //TODO immutable hash
}


//Entity
var Identity = new Interface('Identity', ['getType','getId','getTypeDesc']); 

Entities.Entity = function(id, type) {
	this.id = id;
	this.type = type;
	this.checkInterfaces();
}
implementsInterface(Entities.Entity.prototype, Identity);
Entities.Entity.fromJSON = function(json) { return fromJSON(json, function(j) { return new Entities.Entity(j.id, j.type); }); }
Entities.Entity.prototype.getType = function() { return this.type; }
Entities.Entity.prototype.getId = function() { return this.id; }
Entities.Entity.prototype.getTypeDesc = function() { return Entities.Types.getByType(this.getType()); }

//Motile
Entities.Motile = function(identity, acc, vel, pos, energy, fertility, life) {

	//console.log("Created Javascript Motile " + identity.id + " with energy " + energy);

	this.identity = identity;
	this.acc = acc;
	this.vel = vel;
	this.pos = pos.planified(Plane);
	this.life = life || Entities.Life.fromJSON(this.getTypeDesc().life); //if none specified, default life for type 
	this.energy = energy || 0;
	this.fertility = fertility || 0;
	this.checkInterfaces();
}
Entities.Motile.prototype.ctor = Entities.Motile;
implementsInterface(Entities.Motile.prototype, Position);
implementsInterface(Entities.Motile.prototype, Identity);

Entities.Motile.prototype.getType = function() { return this.identity.getType(); }
Entities.Motile.prototype.getId = function() { return this.identity.getId(); }
Entities.Motile.prototype.getTypeDesc = function() { return this.identity.getTypeDesc(); }

Entities.Motile.prototype.getPos = function() { return this.pos;} //TODO stop using direct references to pos in motile
Entities.Motile.prototype.getSize = function() { return this.getTypeDesc().size; } 
Entities.Motile.prototype.getStrength = function() { return this.getSize(); } //for now, strength is just size
Entities.Motile.prototype.getMaxSpeed = function() { return this.getTypeDesc().maxSpeed; } 
Entities.Motile.prototype.getMaxForce = function() { return this.getTypeDesc().maxForce; } 

Entities.Motile.prototype.getEnergy = function() { return this.energy; } 
Entities.Motile.prototype.getMaxEnergy = function() { return this.lifeStat("maxEnergy") || 10000; } 
Entities.Motile.prototype.getHealing = function() { return this.lifeStat("healing"); } 
Entities.Motile.prototype.getNutrition = function() { return this.lifeStat("nutrition"); } 
Entities.Motile.prototype.lifeStat = function(prop) { return this.life ? this.life[prop] || 0 : 0;}

//strictly speaking these actions on the Motile are only needed server/worker side...
Entities.Motile.prototype.addEnergy = function(e) {
	return new this.ctor(this.identity, this.acc, this.vel, this.pos, Math.min(this.energy + e, this.getMaxEnergy()), this.fertility, this.life);
}
Entities.Motile.prototype.moveTo = function(p) {
	return new this.ctor(this.identity, this.acc, this.vel, p, this.energy, this.fertility, this.life);
}
Entities.Motile.prototype.setVelocity = function(v) {
	return new this.ctor(this.identity, this.acc, v.capMagnitudeAt(this.getMaxSpeed()), this.pos, this.energy, this.fertility, this.life);  
}
Entities.Motile.prototype.setAcceleration = function(a) {
	return new this.ctor(this.identity, a.capMagnitudeAt(this.getMaxForce()), this.vel, this.pos, this.energy, this.fertility, this.life);
}

//a one-time push to velocity, costing energy in proportion to the force used
Entities.Motile.prototype.lungeTowards = function(p) {
	var reserves = 20; //TODO generalize and make configurable; this is so you can't kill yourself by moving
	var force = Math.min(this.getMaxForce(), this.getEnergy() - reserves);
	var v = this.getPos().to(p).scaledTo(force);
	return this.setVelocity(v).addEnergy(-force);
}

//deserialization of a Motile or array thereof, mostly needed client side...
Entities.Motile.fromJSON = function(json) { 
	return fromJSON(json, function(j) {
		return new Entities.Motile(new Entities.Entity.fromJSON(j.identity), 
								   new Vector(j.acc.x, j.acc.y),
								   new Vector(j.vel.x, j.vel.y), 
								   new Point(j.pos.x, j.pos.y),
								   j.energy,
								   j.fertility,
								   new Entities.Life.fromJSON(j.life));
	});	
} 
Entities.Life = function(maxEnergy, healing, nutrition) {
	this.maxEnergy = maxEnergy;
	this.healing = healing;
	this.nutrition = nutrition;
}

Entities.Life.fromJSON = function(json) { 
	return fromJSON(json, function(j) { 
		return new Entities.Life(j.maxEnergy, j.healing, j.nutrition ); }); }





