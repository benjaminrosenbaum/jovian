//behavior.js

var Behaviors = Entities.Types.createRegistryOf(Behavior); 
Behaviors.motivate = function(motile, zone) {
	var behavior = Behaviors.getByType(motile.getType());
	return behavior.motivate(motile, zone); //TODO Living.motivated may return this... separate type for POV char?
}
Behaviors.spawning = function(zone) { 
	var counts = Entities.Types.getCounts(zone.motiles);
	return Behaviors.fold(zone, function(b, z){ return b.spawning(z, counts); })
} 

function Behavior(typedesc, type) { 
	this.type = type; 
	this.spawnCap = typedesc.spawnCap;
	this.spawnChance = typedesc.spawnChance;
	this.life = typedesc.life;

	var t = type;
	this.spawner = function (id, pos, vec) { 
		console.log("spawining motile " + id + "of type " + t + " at " + pos + " with " + vec); 
		return new Entities.Motile(new Entities.Entity(id, t), Vector.NULL, vec || Vector.NULL, pos, this.life.maxEnergy, 0, this.life);
	}.bind(this);
};

Behavior.prototype.spawning = function(zone, counts) { 	
	//TODO we can make this behavior general, via the type param already passed to fold, and control all spawning via spawnChance and spawnCap if we want
	//TODO avoid collisions, spawn in deterministic best place? or move nextPoint to zone?
	return this.canSpawn(counts) ? zone.spawnMotile(this.spawner, Plane.nextPoint()) : zone;
}
//TODO pass in RNG to avoid side effects & make testable; or use zone itself as RNG, "nextSpawnLuck, nextSpawnPoint"
Behavior.prototype.canSpawn = function(counts) { return this.spawnCap > counts[this.type] && this.spawnChance > Math.random(); }

