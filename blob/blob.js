function Blob(x, y, r) {
    this.pos = [x, y];
    this.r = r;

    this.show = function() {
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.ellipse(this.pos[0], this.pos[1], this.r*2, this.r*2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    this.update = function() {
        var vel = [mouse[0] - this.pos[0], mouse[1] - this.pos[1]];
        var mag = Math.sqrt(vel[0] ** 2 + vel[1] ** 2);
        if (mag > 2) {
            vel = [vel[0] / mag, vel[1] / mag];
            this.pos = [this.pos[0] + vel[0], this.pos[1] + vel[1]];
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blob.update();
    blob.show();
    for (var i = 0; i < blobs.length; i++) {
        blobs[i].show();
    }
}

var c = document.getElementById("canvas");
c.style.backgroundColor = "khaki";
ctx = c.getContext("2d");
var mouse = [c.width/2, c.height/2];
var rect = c.getBoundingClientRect();
c.onmousemove = function(e){ mouse = [e.clientX - rect.left, e.clientY - rect.top]; }

// create center blob
var blob = new Blob(c.width/2, c.height/2, 32);

// create other random blobs
var blobs = [];
for (var i = 0; i < 20; i ++) {
    blobs[i] = new Blob(Math.random() * c.width, Math.random() * c.height, Math.random() + 3);
}

setInterval(draw, 10)