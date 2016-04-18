//commands.js	

var Commands = {};

Commands.Connect = function(asUser) {
	this.cmd = "CONNECT";
	this.user = asUser;
}

Commands.SetTarget = function(point) {
	this.cmd = "SET TARGET";
	this.target = point;
}