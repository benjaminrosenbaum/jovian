//flocks.js

function Scene() {
	this.zone = new Zone("waiting", []); 
	this.userId = undefined;
	this.userName = parseUri(window.location.href).queryKey.user || "new-user"; 

    if (!!window.SharedWorker) {
		  this.worker = new Worker("worker.js?cb=33");
		  this.connectAs(this.userName);
		  this.worker.onmessage = function(e) {
		    if (!e.data) {
		    	this.end();
		    	throw "worker failing, returned empty message";
		    }
		    this.setScene(e.data); //TODO multiple zones

		    if (!this.userId) { //worker is up, but in some browsers we're not in the world yet, tell it about us
		    	this.connectAs(this.userName);
		    }
		    /**/console.log('Message received from worker: ' + e.data);
		  }.bind(this); 
    } else {
        console.log("Sorry! No Web Worker support.");
    }
}

Scene.prototype.setScene = function(json) {
	var received = JSON.parse(json);
	this.userId = received.userId;
	this.zone = Zone.fromJSON(received.zone);
}

Scene.prototype.setInspectedEntityId = function(id) {
	this.inspectedEntityId = id; //on hover, canvas sets -- inspector displays
}

Scene.prototype.getUserMotile = function() { 
	return this.userId && this.zone ? this.zone.getMotileById(this.userId) : undefined; 
}

Scene.prototype.end = function() {
    this.worker.terminate();
    this.worker = undefined;
}
Scene.prototype.connectAs = function(name) { this.send(new Commands.Connect(name)); }

Scene.prototype.send = function(cmd) { this.worker.postMessage(JSON.stringify(cmd)); }

Scene.prototype.getUserEnergy = function() {
	return this.getUserStats().energy;
}

Scene.prototype.getUserStats = function() {
	var motile = this.getUserMotile();
	
	function getStat(motile, name) {
		return motile ? Math.floor(motile[name]) : undefined;
	}	

	var stats = {};
	var exhaustion = 20; //TODO get from server? from motile type?
	stats.name = this.userName;
	stats.energy = getStat(motile, "energy");
    //display energy split up into "vigor" (motile force) and "health" (last reserves after exhaustion)
	stats.vigor = Math.max(0, stats.energy - exhaustion);
	stats.health = Math.min(exhaustion, stats.energy);
	stats.fertility = getStat(motile, "fertility");
	stats.score = getStat(motile, "score");
	return stats;
}


var Display = {}; //TODO superclass of View and UserDisplay
Display.frameFunc = function() { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame; }


function UserDisplay(readoutEl, scene) {
	this.el = readoutEl;
	this.scene = scene;
	this.fields = {};
	this.fields.    name = this.el.querySelector("#name");
	this.fields.   vigor = this.el.querySelector("#vigor");
	this.fields.   health = this.el.querySelector("#health");
	this.fields.fertility = this.el.querySelector("#fertility");
	this.fields.    score = this.el.querySelector("#score");
}
UserDisplay.prototype.start = function() {
	//TODO unify with View.start
	var frame = Display.frameFunc();
    var frameWrapper = function() {
    	var stats = this.scene.getUserStats();
    	for (var field in this.fields) {
    		this.fields[field].innerText = stats[field] || "--";
    	}	
        frame(frameWrapper);
    }.bind(this);
    frameWrapper();
}

function View (canvasEl, scene) {
    this.el = canvasEl;
    this.scene = scene;
    this.canvas = canvasEl.getContext('2d');
    this.canvas.lineWidth = 0.8;
    this.width = canvasEl.width;
    this.height = canvasEl.height;
    this.center = new Point(this.width, this.height).scaled(0.5);
    this.frameCount = 0;
    this.offset = Vector.NULL; 
   
    this.el.onclick = function(evt) {
        var pos = this.getClickLocation(evt, this.el);
        this.scene.send(new Commands.SetTarget(pos)); 
    }.bind(this);
}

// Begins the render loop.
View.prototype.start = function () {
    var frame = Display.frameFunc();
    var frameWrapper = function() {
    	this.render(this.scene.zone);    
        frame(frameWrapper);
        this.frameCount++;
    }.bind(this);
    frameWrapper();
};

View.prototype.render = function (zone) {
	this.restoreOffset();
	this.canvas.clearRect(-10, -10, this.width + 10, this.height + 10);
	this.paintBackground(); 
    this.setOffset(this.getPlayerOffset());
    
	if (zone) {
		var screenRect = new Rect(this.screenToWorld(Point.ORIGIN), this.screenToWorld(new Point(this.width, this.height)));
		var bufferedRect = screenRect.expand(70); // generously, about half the biggest creature size, so as not to clip anyone off

		for (var i = zone.motiles.length - 1; i >= 0; i--) {   //TODO foreach on motiles in zone
			var motile = zone.motiles[i];   
			if (bufferedRect.contains(motile.pos)) {
			    Renderers.getShape(motile, this).draw(this.canvas);
			}
		}
	}
};

View.prototype.paintBackground = function() {
    var d = this.offset.manhattanDist();
    var limit = Point.ORIGIN.to(Plane.extremity()).manhattanDist(); 
    var dusk = Color.animate(new Color(0, 60, 60, 0.6), new Color(120, 60, 10, 0.6), Plane.Limit, d);
    var dawn = Color.animate(new Color(120, 60, 60, 0.3), new Color(0, 60, 10, 0.3), Plane.Limit, d);

	var worldOrigin = this.worldToScreen(Point.ORIGIN);
	var worldEnd = this.worldToScreen(Plane.extremity());
	var left = Math.max(0, worldOrigin.x)
	var top = Math.max(0, worldOrigin.y);
	var right = Math.min(this.width, worldEnd.x);
	var bottom = Math.min(this.height, worldEnd.y);

	var background = new SimpleGradientFill(new Point(left, top), new Point(right, bottom), dawn, dusk);
	background.paint(this.canvas);
}

View.prototype.setOffset = function (pt) {
	this.offset = pt;
	//this.canvas.translate(pt.x, pt.y);
	//this.previousOffset = this.offset;
	this.canvas.setTransform(1,0,0,1,pt.x,pt.y);
}

View.prototype.restoreOffset = function () {
	this.canvas.setTransform(1,0,0,1,0,0);
	//this.canvas.translate(-this.previousOffset.x, -this.previousOffset.y);
	//this.offset = Point.ORIGIN;
}

View.prototype.getPlayerOffset = function() {
	var motile = this.scene.getUserMotile();
	 return motile ? motile.getPos().to(this.center) : this.offset;
}

View.prototype.screenToWorld = function(p) {
	return p.plus(this.offset.flip())
}

View.prototype.worldToScreen = function(p) {
	return p.plus(this.offset)
}

/**
 * Gets the click location within the modified canvas (as 0,0 is at the bottom left).
 */
View.prototype.getClickLocation = function (e) { 
    var pagePoint;
    if (e.pageX || e.pageY) { 
      pagePoint = new Point(e.pageX, e.pageY);
    } else { 
      pagePoint = new Point(
      		e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft, 
      		e.clientY + document.body.scrollTop + document.documentElement.scrollTop); 
    } 
    var canvRect = this.el.getBoundingClientRect();
    var canvPoint = pagePoint.plus(new Point(-canvRect.left, -canvRect.top));
    return this.screenToWorld(canvPoint);
    //return new Point(canvPoint.x - this.offset.x, canvPoint.y - this.offset.y);
};

function Renderer(typedesc){ 
	this.size = typedesc.size; 
}
Renderer.prototype.getShape = function(motile, view) { return Polygon.DEFAULT; }

var Renderers = Entities.Types.createRegistryOf(Renderer); //TODO create new registry
Renderers.for = function(motile) {
	return Renderers.getByType(motile.getType()) || Renderer.DEFAULT;
}
Renderers.getShape = function(motile, view) {
	var renderer = Renderers.for(motile);
	var shape = renderer.getShape(motile, view);
	return shape.scaled(renderer.size).rotated(motile.vel.theta()).at(motile.pos); // Rotated by direction, transposed to the position
}

if (Renderers.Beast)
Renderers.Beast.getShape = function(motile, view) {
		var tip = new Point(0, 0.6);
		var wing = new Point(0.5, -0.5);
		var mid = Point.animate(new Point(0.2, 0.2), new Point(0.28, 0.28), 400, view.frameCount);
		var tail = new Point(0, -mid.y);
		var fill = new SolidFill(Color.hsla(10, motile.energy, (100 - motile.energy), 1.0));
		var line = new LineStyle(Color.hsla(140, 100, 55, 0.5 + motile.fertility/180), motile.fertility/20);

		return new Polygon([tip, mid, wing, tail, wing.flipX(), mid.flipX()], fill, line);       
};

if (Renderers.Flutterbye)
Renderers.Flutterbye.getShape = function(motile) {
		return new Polygon([  
			new Point(-0.5, -0.5),
			new Point(0, -0.75),
			new Point(0.5, -0.5),
			new Point(0.5, 0.5),
			new Point(0, 0),
			new Point(-0.5, -0.5)],
			new SolidFill('#FFFF12'));
};

if (Renderers.Bumbler)
Renderers.Bumbler.getShape = function(motile) {
		var corner = new Point(-0.5, -0.5);
		var mid = new Point(0.2, 0.2);
		return new Polygon([ corner, corner.flipY(), mid, 
							 corner.flip(), corner.flipX(), mid.flipY(), 
							 Point.ORIGIN], 
							new SolidFill('#8ED6FF'));
};

if (Renderers.Willicker)
Renderers.Willicker.getShape = function(motile, view) {
		var frm = ((view.frameCount + motile.pos.y)% 400) / 40;
		var coeff = frm/3 - frm*frm/27; 
		var midV =  (0.8 * coeff);
		
		var top = new Point(0, midV);
		var side = new Point(-mid, 0);
		var mid = new Point(midV, midV);
		var SW = new Point(-0.5, -0.5);
		var SE = SW.flipX();
		var NE = SE.flipY();
		var c = motile.getPos().x / (1 + motile.getPos().y);
		var color = Color.hsla(360 * c, 80, 95, 1.0);
		
		return new Polygon([
			new QBeziPt(top, mid),
			new QBeziPt(top.flipY(), SW),
			new QBeziPt(mid.flipX(), NE),
			new QBeziPt(side, mid.flipY()),
			new QBeziPt(SE, mid.flip()),
			new QBeziPt(side.flipX(), top)],
			new SolidFill(color)	
         );       
};

if (Renderers.Viprish)
Renderers.Viprish.getShape = function(motile, view) {
	var anchor = Point.animate(new Point(-1.5, 0), new Point(-1.4, 0.2), 25, view.frameCount);
	var pg = new Polygon([new Point(0,1),
						 new QBeziPt(new Point(-0.8,-0.6), anchor),
						 new Point(-0.2, 1),
						 new QBeziPt(new Point(-0.8,-0.4), anchor)
						 ], new SolidFill('#CCDDEE'));
	return pg.hSymmetric();

};

if (Renderers.Ralava)
Renderers.Ralava.getShape = function(motile, view) {
	var color = Color.hsla(200, motile.energy + 20, 75, 0.8)
	return new MultiShape([ new FixedPolygon([ new Point(-.7, 0), new Point(-.7, 1), new Point(-.5, .7),
	    									 new Point(0, 1), new Point(.5, .7), new Point(.7, .7),
	    									 new Point(.7, 0), new Point(-.7, 0)],
	    									 new SolidFill(color),
	    									 new LineStyle(color, 1) ), 
						  new Circle(Point.ORIGIN, 0.7, new SolidFill("white"), new LineStyle(color, 2)),
						  new Circle(new Point(0, 0.4), 0.3, new SolidFill(color), new LineStyle("#AA66BB", 3)),
						  new Circle(new Point(0, 0.5), 0.12, new SolidFill(Color.hsla(120, 70, 20, 0.3)), new LineStyle(color, 0)),
						  new Circle(new Point(0.13, 0.32), 0.12, new SolidFill(Color.hsla(0, 70, 20, 0.3)), new LineStyle(color, 0)),
						  new Circle(new Point(-0.1, 0.32), 0.12, new SolidFill(Color.hsla(240, 70, 20, 0.3)), new LineStyle(color, 0))
						]);

}

if (Renderers.Frillist)
Renderers.Frillist.getShape = function(motile, view) {
	var e = (motile.energy * 3);
	var f = view.frameCount;
	
	var pg = new Polygon([ 
		new Point(0, -1), new QBeziPt(new Point(-.5, -.1), Point.animate(new Point(.5, 1), new Point(0, 0), 200, f)),
		Point.animate(new Point(-.9, .2), new Point(-1, 0), 50, f), 
		new QBeziPt(new Point(-.6, -.2), new Point(-.2, 0)), 
		new QBeziPt(Point.animate(new Point(-.7, .5), new Point(-.9, 0.3), 50, f), 
					Point.animate(new Point(-.3, -.3), new Point(-.5, -.1), 120, f)), //new Point(-.5, 0)), 50, f),
		new QBeziPt(new Point(-.2, .2), new Point(-.5, .1) ),
		Point.animate(new Point(-.5, .7), new Point(-.8, 0.5), 150, f), 
		Point.animate(new Point(-.4, .3), new Point(-.4, .2), 80, f),
		new QBeziPt( new Point(-.1, .3), new Point(-.4, .2) ),
		new QBeziPt( new Point(0, 1), new Point(-.1, .8) )
		], new SolidFill(Color.hsla(100, e + 40, 100 - e, 1.0)));
	return pg.hSymmetric().vSymmetric().rotated(Math.PI);
}

if (Renderers.Kledge)
Renderers.Kledge.getShape = function(motile, view) {
	var points = [];
	for (var x = 0.09; x < 0.75; x += 0.23)
		for (var y = 0.75; y > 0.4; y -= 0.18)
			for (var z = 0.01; z < 0.75; z += 0.25) {
				points.push(new Point(x, y));
				points.push(new Point(z, x));
				points.push(new QBeziPt(new Point(y,z), new Point(x, y)));
				points.push(new Point(y, z));
				points.push(new QBeziPt(new Point(x,y), new Point(z, x)));
			}
	var pg = new Polygon(points, new SolidFill(Color.hsla((motile.pos.x + motile.pos.y) % 360, 75, 40, 0.3)),
		new LineStyle(Color.hsla((motile.pos.x + motile.pos.y) % 360, 75, 20, 0.45), 0.25));
	return pg.hSymmetric().vSymmetric(); //TODO lighter lines
}

if (Renderers.Devastroph)
Renderers.Devastroph.getShape = function(motile, view) {
	var color = Color.animate(new Color(0, 100, 50, 0.9), new Color(359, 100, 50, 0.9), 360, view.frameCount);
	var pg = new Polygon([new Point(-0.5, 0), new Point(0, -1), new Point(0.5, 0), new Point(0, 0.5) ],
					 new SolidFill(color), new LineStyle("white"));
	return new MultiShape([ pg.scaled(0.25).at(new Point(-0.7, -0.7)),
		                    pg.scaled(0.2),
		                    pg.scaled(0.3).at(new Point(0.6, 0.6)),
		                    pg.scaled(0.25).at(new Point(0.8, 0.2)),
		                    pg.scaled(0.1).at(new Point(0.3, -0.6)),
		                    pg.scaled(0.2).at(new Point(-0.8, 0.4))]);

}

function initClient(canvasEl, readoutEl){
	var scene = new Scene();
    var view = new View (canvasEl, scene);
    var display = new UserDisplay(readoutEl, scene);
    view.start();
    display.start();
}



window.onbeforeunload = function(e) {
  return 'Do you really want to exit?';
};

