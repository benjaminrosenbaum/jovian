//zone.js



//ctor and serialization needed in client
function Zone(id, motiles, lastEntityId, wind) {
	this.id = id;
	this.motiles = motiles || [];
	this.lastEntityId = lastEntityId || 0; 
	this.wind = wind || Zone.defaultWind;
}
Zone.fromJSON = function(json) { return fromJSON(json, function(j) { return new Zone(j.id, Entities.Motile.fromJSON(j.motiles), j.lastEntityId, j.wind); }); }
Zone.defaultWind = new Vector(0, 0.01);

//from here on, only server side
//tick phases
/*Zone.prototype.motivation = function() { 
	var that = this;
	return this.transformMotiles(function(m){ return Behaviors.motivate(m, that); }); 
}*/
//Zone.prototype.motion = function() { return this.transformMotiles(function(m){ return m.step();}); }
Zone.prototype.spawning = function() { return Behaviors.spawning(this);} //
//tick phase order 
Zone.prototype.step = function() { return this.spawning()/*.motivation().motion()*/.resolveEffects();}
//operations
Zone.prototype.setMotiles = function(motiles) { return new Zone(this.id, motiles, this.lastEntityId, this.wind); }
Zone.prototype.getMotilesOfType = function(type) { return this.motiles.filter(function (m) { return type == m.getType();} ); }
Zone.prototype.getMotilesOfTypes = function(types) { return types ? this.motiles.filter(function (m) { return contains(types, m.getType());} ) : []; }
Zone.prototype.transformMotiles = function(fn, filter) {
	function transformOnly(func, filt) { return function(m) { return filt(m) ? func(m) : m; } }
	return this.setMotiles(this.motiles.map(transformOnly(fn, filter || TRUTH)));
}
Zone.prototype.transformMotileById = function(id, fn) { return this.transformMotiles(fn, this.motileHasId(id)); }
Zone.prototype.getMotileById = function (id) { return this.motiles.find(this.motileHasId(id));}
Zone.prototype.motileHasId = function(id) {
	var find = id;
	return function(m) { return m.getId() == find;}
}
Zone.prototype.spawnMotile = function(spawner, pos, id) {
	if (id && this.getMotileById(id)) {
		console.log("motile " + id + " already exists, cannot be spawned"); //TODO global check, not just in zone
		return this;
	}
	var nextId = this.lastEntityId + (id ? 0 : 1); //advance last entity id if spawning new entity
	var spawnedId = id || this.id + "_" + nextId; 
	return new Zone(this.id, this.motiles.concat([spawner(spawnedId, pos, this.wind)]), nextId, this.wind);
}
/*Zone.prototype.munch = function(eater, eaten) { //TODO this is inefficient; later, aggregate collision effects into one pass
	var muncher = eater, munched = eaten; 
	function survives(m) { return m.getId() != munched.getId(); }
	function nourished(m) { return m.getId() == muncher.getId() ? m.addEnergy(munched.getNutrition()) : m; }
	return this.setMotiles(this.motiles.map(nourished).filter(survives)); //TODO generalize?
}
Zone.prototype.collide = function(bonker, bonked) { //TODO inefficient, resolve all collisions in parallel
	return bonker.canEat(bonked) ? this.munch(bonker, bonked) : this;
}*/

