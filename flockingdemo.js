World.WIDTH = 600;
World.HEIGHT = 300;
World.SEP_MUL = 1;
World.ALI_MUL = 1;
World.COH_MUL = 1;
World.NUM_BURDS = 100;

// The world that houses the canvas and bird flock.
function World (canvasEl) {
    this.canvas = canvasEl.getContext('2d');
    this.canvas.lineWidth = 0.8;
    this.canvas.strokeStyle = "#333";

    this.width = canvasEl.width;
    this.height = canvasEl.height;

    // Flip the canvas such that (0,0) is at the bottom left.
    this.canvas.translate(0, this.canvas.canvas.height);
    this.canvas.scale(1, -1);
    this.populate(World.NUM_BURDS);

    var that = this;
    document.getElementById('separation').oninput = function() {
        World.SEP_MUL = this.value;
        that.flock.resetAll();
    };
    document.getElementById('alignment').oninput = function() {
        World.ALI_MUL = this.value;
        that.flock.resetAll();
    };
    document.getElementById('cohesion').oninput = function() {
        World.COH_MUL = this.value;
        that.flock.resetAll();
    };

    this.el = canvasEl;
    this.el.onclick = function(evt) {
        var pos = getCanvasClickLoc(evt, this.el);
        this.flock.birds.forEach(function(bird){
            var distance = dist(bird.pos, pos);
            if (distance < 100) {
                var diff = {
                    x: bird.pos.x - pos.x,
                    y: bird.pos.y - pos.y
                };
                diff.x /= distance;
                diff.y /= distance;

                bird.acc.x = diff.x * 4;
                bird.acc.y = diff.y * 4;
            }
        });
    }.bind(this);
}

// Populate the world with a number of birds, randomly dispersed.
World.prototype.populate = function(numBirds) {
    this.flock = new Flock();
    for (var i = 0; i < numBirds; i++) {
        var pos = {
            x: Math.random() * World.WIDTH,
            y: Math.random() * World.HEIGHT
        };
        this.flock.addBird(pos, 3, 0.015);
    }
};

// Begins the render loop.
World.prototype.start = function () {
    var frame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
    var frameWrapper = function(){
        this.render();
        frame(frameWrapper);
    }.bind(this);
    frameWrapper();
};

// Render loop.
World.prototype.render = function () {
    this.flock.update();
    this.canvas.clearRect(0, 0, this.width, this.height);
    this.draw(this.canvas);
};

// Rotates a point given cos(theta) and sin(theta). We don't pass in theta
// to avoid recomputation of cos and sin.
World.prototype.rotate = function (p, cth, sth) {
    var px = p.x;
    var py = p.y;

    p.x = cth * px - sth * py;
    p.y = sth * px + cth * py;
};

// Clears the world by purging the birds array.
World.prototype.clear = function () {
    this.flock.birds = [];
};

// Renders the birds onto the world.
World.prototype.draw = function () {
    this.flock.birds.forEach(function(bird) {
        this.canvas.beginPath();

        // Form the triangle with three points.
        var p1 = {x: 0, y: bird.size * 2};
        var p2 = {x: -bird.size, y: -bird.size * 2};
        var p3 = {x: bird.size, y: -bird.size * 2};

        // Rotate this triangle by the direction of the velocity vector.
        var theta = Math.atan2(bird.vel.y, bird.vel.x);
        theta -= Math.PI/2;
        var cth = Math.cos(theta);
        var sth = Math.sin(theta);
        this.rotate(p1, cth, sth);
        this.rotate(p2, cth, sth);
        this.rotate(p3, cth, sth);

        this.canvas.moveTo(bird.pos.x + p1.x, bird.pos.y + p1.y);
        this.canvas.lineTo(bird.pos.x + p2.x, bird.pos.y + p2.y);
        this.canvas.lineTo(bird.pos.x + p3.x, bird.pos.y + p3.y);
        this.canvas.lineTo(bird.pos.x + p1.x, bird.pos.y + p1.y);
        this.canvas.stroke();
    }.bind(this));
};

function Flock () {
    this.birds = [];
}

Flock.prototype.addBird = function(pos, maxSpeed, maxForce) {
    this.birds.push(new Bird(pos, maxSpeed, maxForce));
};

Flock.prototype.update = function () {
    this.birds.forEach(function(bird) {
        bird.compute(this.birds);
        bird.reposition();
        bird.reset();
    }.bind(this));
};

Flock.prototype.resetAll = function () {
    this.birds.forEach(function(bird) {
        bird.reset();
    });
};

function Bird (position, maxSpeed, maxForce) {
    this.pos = position;
    this.vel = {x: Math.random() - 0.5, y: Math.random() - 0.5};
    this.acc = {x: 0, y: 0};
    this.size = 3;

    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
}

Bird.prototype.compute = function(birds) {
    var sep = this.separation(birds);
    var ali = this.alignment(birds);
    var coh = this.cohesion(birds);

    this.acc.x += sep.x + World.ALI_MUL*ali.x + World.COH_MUL*coh.x;
    this.acc.y += sep.y + World.ALI_MUL*ali.y + World.COH_MUL*coh.y;
};

Bird.prototype.reposition = function() {
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;

    if (this.vel.x*this.vel.x + this.vel.y*this.vel.y > this.maxSpeed*this.maxSpeed) {
        normalize(this.vel);
        this.vel.x *= this.maxSpeed;
        this.vel.y *= this.maxSpeed;
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // Check canvas borders.
    if (this.pos.x < -this.size) this.pos.x = World.WIDTH + this.size;
    if (this.pos.y < -this.size) this.pos.y = World.HEIGHT + this.size;
    if (this.pos.x > World.WIDTH + this.size) this.pos.x = -this.size;
    if (this.pos.y > World.HEIGHT + this.size) this.pos.y = -this.size;
};

Bird.prototype.separation = function(birds) {
    var maxSeparation = 20 * World.SEP_MUL;
    var sep = {x: 0, y: 0};
    var num = 0;

    for (var i = 0; i < birds.length; i++) {
        var distance = dist(birds[i].pos, this.pos);
        if (distance > 0 && distance < maxSeparation) {
            num++;
            var difference = {
                x: this.pos.x - birds[i].pos.x,
                y: this.pos.y - birds[i].pos.y
            };
            normalize(difference);  //nearby birds push you away along the vector between you, inversely proportional to their distance

            difference.x /= distance;
            difference.y /= distance;
            sep.x += difference.x;
            sep.y += difference.y;
        }
    }

    if (num > 0) {
        sep.x /= num;    //averaged 
        sep.y /= num;
    }

    return sep;
};

Bird.prototype.alignment = function(birds) {
    var flockDistance = 100 * World.ALI_MUL;
    var ali = {x: 0, y: 0};
    var num = 0;

    for (var i = 0; i < birds.length; i++) {
        var distance = dist(birds[i].pos, this.pos);
        if (distance > 0 && distance < flockDistance) {
            num++;
            ali.x += birds[i].vel.x;
            ali.y += birds[i].vel.y;
        }
    }

    if (num > 0) {
        ali.x /= num;
        ali.y /= num;
    }

    if (ali.x*ali.x + ali.y*ali.y > this.maxForce*this.maxForce) {
        ali.x *= this.maxForce;
        ali.y *= this.maxForce;
    }
    return ali;
};

Bird.prototype.cohesion = function(birds) {
    var flockDistance = 50 * World.COH_MUL;
    var coh = {x: 0, y: 0};
    var num = 0;

    for (var i = 0; i < birds.length; i++) {
        var distance = dist(birds[i].pos, this.pos);
        if (distance > 0 && distance < flockDistance) {
            num++;
            coh.x += birds[i].pos.x;
            coh.y += birds[i].pos.y;
        }
    }

    if (num > 0) {
        coh.x /= num;
        coh.y /= num;
    }

    var move = {
        x: coh.x - this.pos.x,
        y: coh.y - this.pos.y
    };
    if (!(move.x == 0 && move.y == 0)) {
        normalize(move);
        move.x *= this.maxSpeed;
        move.y *= this.maxSpeed;
        var steer = {
            x: move.x - this.vel.x,
            y: move.y - this.vel.y
        };
        if (steer.x*steer.x + steer.y*steer.y > this.maxForce*this.maxForce) {
            normalize(steer);
            steer.x *= this.maxForce;
            steer.y *= this.maxForce;
        }
        return steer;
    }
    return {
        x: 0,
        y: 0
    };
};

Bird.prototype.reset = function() {
    this.acc.x = 0;
    this.acc.y = 0;
};

var dist = function(a, b) {
    if (a.x == b.x && a.y == b.y) return 0;
    var dx = a.x - b.x;
    var dy = a.y - b.y;

    return Math.sqrt(dx*dx + dy*dy);
};

var normalize = function(v) {
    var mag = Math.sqrt(v.x*v.x + v.y*v.y);
    v.x /= mag;
    v.y /= mag;
};

/**
 * Gets the click location within the modified canvas (as 0,0 is at the bottom left).
 */
var getCanvasClickLoc = function (e, el) {
    var x;
    var y;
    if (e.pageX || e.pageY) { 
      x = e.pageX;
      y = e.pageY;
    }
    else { 
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 
    x -= el.offsetLeft;
    y -= el.offsetTop;

    y = el.offsetHeight - y;
    return {x: x, y: y};
};