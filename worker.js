console.log("Worker loaded");
importScripts('extensions.js');
importScripts('geometry.js');
importScripts('entities.js');
importScripts('behavior.js?cb=22');
importScripts('zones.js');
importScripts('commands.js');
importScripts('./target/scala-2.11/scala-js-stuff-fastopt.js')
importScripts('collisions.js?cb=2');


var zone = new Zone("Z1", []);

//TODO serversdie hash of connections
var connectedUser = undefined;

onmessage = function(e) {
  	  //TODO in array for asynchronous processing in tick, so we don't miss a tick by overwriting the zone? (zone only written from one thread)
	  console.log("worker received message " + e.data);
	  if (e.data) {
		  	var command = JSON.parse(e.data);
		  console.log("worker parsed command to " + command);
		  if (command.cmd == "CONNECT") {  
		  	console.log("connection command");
		  	connectedUser = zone.id + "_USER_" + command.user;
		  	zone = zone.spawnMotile(Behaviors.Beast.spawner, new Point(Plane.Width / 2, 25), connectedUser); //TODO better spawn point?? Pick point/altitude, then zone??
		  } else if (command.cmd == "SET TARGET") {
		  	console.log("set target to: " + JSON.stringify(command.target));
		  	if (connectedUser) {
		  		var targ = Point.fromJSON(command.target);
		  		zone = zone.transformMotileById(connectedUser, function(m){ return m.lungeTowards(targ); });
		  	} //else tell them to reconnect
		  } else {
		  	console.log("unknown command to worker");
	  }
	}
}


function tick() {
	//this client-side worker is currently doing the world-simulation that the server will do
	//TODO move the world-simulation to the other side of the socket. This guy registers 
	//with the server, listens for ticks and passes them back to the view
	//console.log("tick " + JSON.stringify(zone) );		  
   
    zone = zone.step(); //time passes
    var scene = { "userId": connectedUser, "zone" : zone}; //TODO send the zones the user can see: 9 zones, viewport centered, view.width <= zone.width * 1.5

    postMessage(JSON.stringify(scene));
    setTimeout("tick()",50); //TODO perhaps the timeout actually just pushes a tick message onto the message queue, and another loop pulls
}

tick();
